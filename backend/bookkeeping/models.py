import os
from django.db import models
from django.conf import settings
from utils.model_utils import UUIDModel, user_kwargs, code_kwargs, \
                              furigana_kwargs, get_hashed_filename

DEBIT_CREDIT_CHOICES = ((0, '借方'), (1, '貸方'))


def pdf_file_path(instance, filename):
    """PDFファイルのパスを作成"""
    filename = get_hashed_filename(filename)

    return os.path.join(settings.PDF_UPLOAD_PATH, filename)


class ExcludedItem(UUIDModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)
    # 継承先で、itemフィールドを作る

    class Meta:
        abstract = True
        unique_together = ['user', 'item']


class AccountCategory(UUIDModel):

    class Meta:
        db_table = 'name'

    name = models.CharField(verbose_name='カテゴリー名', max_length=30, unique=True)

    order = models.IntegerField(verbose_name='順番')

    def __str__(self):
        return self.name


class Account(UUIDModel):

    class Meta:
        db_table = 'account'
        ordering = ['category', 'code']

    name = models.CharField(verbose_name='勘定科目', max_length=40, unique=True)

    # 勘定科目コード
    code = models.CharField(**code_kwargs)

    furigana = models.CharField(verbose_name="ふりがな", **furigana_kwargs)

    category = models.ForeignKey(AccountCategory, verbose_name='カテゴリー',
                                 on_delete=models.PROTECT)

    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs,
                             null=True, blank=True)
    # ユーザーがnullとなるのは、デフォルト値のとき

    description = models.CharField(verbose_name='説明', max_length=500,
                                   null=True, blank=True)

    def __str__(self):
        return self.name


class ExcludedAccount(ExcludedItem):
    item = models.ForeignKey(Account, on_delete=models.CASCADE)


class Department(UUIDModel):
    code = models.CharField(**code_kwargs)
    name = models.CharField(verbose_name='部門名', max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)

    def __str__(self):
        return str(self.id)


class ExcludedDepartment(ExcludedItem):
    item = models.ForeignKey(Department, on_delete=models.CASCADE)


class Currency(models.Model):
    """
        言語コードや、通貨コードについては、下記リンクを参照
        https://www.w3schools.com/jsref/jsref_tolocalestring_number.asp
        コアロケール https://docs.oracle.com/cd/E56342_01/html/E53856/glmcr.html
        ISO 通貨コード https://www.iban.jp/currency-codes
    """
    name = models.CharField(verbose_name='タイトル', max_length=100)
    code = models.CharField(verbose_name='ISO 4217 通貨コード',
                            primary_key=True,
                            max_length=3)

    def __str__(self):
        return self.name


class ExcludedCurrency(ExcludedItem):
    item = models.ForeignKey(Currency, on_delete=models.CASCADE)


class Tax(UUIDModel):
    code = models.CharField(**code_kwargs)
    name = models.CharField(verbose_name='タイトル', max_length=50)
    rate = models.IntegerField(verbose_name='税率')

    def __str__(self):
        return self.name


class ExcludedTax(ExcludedItem):
    item = models.ForeignKey(Tax, on_delete=models.CASCADE)


class TransactionGroup(UUIDModel):
    class Meta:
        db_table = 'transaction_group'
        ordering = ['-date', '-slipNum']
        unique_together = ['date', 'slipNum', 'user']

    slipNum = models.IntegerField(verbose_name='伝票番号')

    date = models.DateField(verbose_name='転記日付')

    createdOn = models.DateField(verbose_name="入力日付",
                                 auto_now_add=True,
                                 auto_now=False)

    department = models.ForeignKey(Department, on_delete=models.PROTECT,
                                   blank=True, null=True)
    currency = models.ForeignKey(Currency, on_delete=models.PROTECT,
                                 blank=False, null=False, default="JPY")

    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)

    memo = models.CharField(verbose_name='備考', max_length=200,
                            null=True, blank=True)

    pdf = models.FileField(null=True, blank=True,
                           upload_to=pdf_file_path)

    def __str__(self):
        return f'日付:{self.date} 伝票番号:{self.slipNum}'


class Transaction(UUIDModel):
    class Meta:
        db_table = 'transaction'
        ordering = ['-group', 'debitCredit', 'order']

    order = models.IntegerField(verbose_name="順番")
    # 0から始まる。フォーム上で、上から0, 1, 2, 3・・・

    debitCredit = models.IntegerField(verbose_name='借方(0)貸方(1)',
                                      choices=DEBIT_CREDIT_CHOICES)

    account = models.ForeignKey(Account, verbose_name='勘定科目',
                                on_delete=models.PROTECT)

    money = models.DecimalField(verbose_name='金額（日本円）',
                                max_digits=31,  # 千億円まで
                                decimal_places=15  # 外国通貨 → 日本円に変換した際の小数点以下を記録
                                )

    foreignMoney = models.DecimalField(verbose_name='金額（海外通貨）',
                                       max_digits=13,
                                       decimal_places=2,
                                       blank=True, null=True)

    tax = models.ForeignKey(Tax, verbose_name='税金', on_delete=models.PROTECT,
                            blank=True, null=True)

    group = models.ForeignKey(TransactionGroup, verbose_name='伝票',
                              on_delete=models.CASCADE,
                              related_name='transactions'
                              )

    def __str__(self):
        str_debit_credit = '借' if self.debitCredit == 0 else '貸'
        return f'({str_debit_credit})  {self.account} \
                 {self.money}円   {self.order}番'
