import uuid
import os
import hashlib
from django.db import models
from django.conf import settings
from django.core.validators import RegexValidator

DEBIT_CREDIT_CHOICES = ((0, '借方'), (1, '貸方'))


uuid_kwargs = {
    'primary_key': True,
    'default': uuid.uuid4,
    'editable': False
}

code_kwargs = {
    'verbose_name': 'コード',
    'max_length': 30,
    'unique': True,
    'validators': [RegexValidator(
        regex=r'^[0-9A-Z]+$',
        message='半角数字・または半角大文字アルファベットで入力してください。例: AZ123'
    )]
}


user_kwargs = {
    'verbose_name': '作成ユーザー',
    'on_delete': models.CASCADE,
}


def pdf_file_path(instance, filename):
    """PDFファイルのパスを作成"""
    ext = filename.split('.')[-1]
    sha256 = hashlib.sha256(filename.encode()).hexdigest()
    filename = f'{sha256}.{ext}'

    return os.path.join(settings.PDF_UPLOAD_PATH, filename)


class ExcludedItem(models.Model):
    id = models.UUIDField(**uuid_kwargs)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)
    # 継承先で、itemフィールドを作る

    class Meta:
        abstract = True
        unique_together = ['user', 'item']


class AccountCategory(models.Model):

    class Meta:
        db_table = 'name'

    id = models.UUIDField(**uuid_kwargs)
    name = models.CharField(verbose_name='カテゴリー名', max_length=30, unique=True)

    order = models.IntegerField(verbose_name='順番')

    def __str__(self):
        return self.name


class Account(models.Model):

    class Meta:
        db_table = 'account'
        ordering = ['category', '-name']

    id = models.UUIDField(**uuid_kwargs)

    name = models.CharField(verbose_name='勘定科目', max_length=40, unique=True)

    # 勘定科目コード
    code = models.CharField(**code_kwargs)

    furigana = models.CharField(verbose_name='ふりがな', max_length=30,
                                null=True, blank=True)

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


class Department(models.Model):
    id = models.UUIDField(**uuid_kwargs)
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
    title = models.CharField(verbose_name='タイトル', max_length=100)
    currency = models.CharField(verbose_name='ISO 4217 通貨コード',
                                primary_key=True,
                                max_length=3)

    def __str__(self):
        return self.title


class ExcludedCurrency(ExcludedItem):
    item = models.ForeignKey(Currency, on_delete=models.CASCADE)


class Tax(models.Model):
    id = models.UUIDField(**uuid_kwargs)
    code = models.CharField(**code_kwargs)
    title = models.CharField(verbose_name='タイトル', max_length=50)
    rate = models.IntegerField(verbose_name='税率')

    def __str__(self):
        return self.title


class ExcludedTax(ExcludedItem):
    item = models.ForeignKey(Tax, on_delete=models.CASCADE)


class TransactionGroup(models.Model):
    class Meta:
        db_table = 'transaction_group'
        ordering = ['-date', '-slipNum']
        unique_together = ['date', 'slipNum']

    id = models.UUIDField(**uuid_kwargs)

    slipNum = models.IntegerField(verbose_name='伝票番号')

    date = models.DateField(verbose_name='転記日付')

    createdOn = models.DateField(verbose_name="入力日付",
                                 auto_now_add=True,
                                 auto_now=False)

    department = models.ForeignKey(Department, on_delete=models.PROTECT,
                                   blank=True, null=True)
    currency = models.ForeignKey(Currency, on_delete=models.PROTECT,
                                 blank=True, null=True)
    # currencyがnullの場合は、「日本円」と判断する

    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)

    memo = models.CharField(verbose_name='備考', max_length=200,
                            null=True, blank=True)

    pdf = models.FileField(null=True, blank=True, unique=True,
                           upload_to=pdf_file_path)

    def __str__(self):
        return f'日付:{self.date} 伝票番号:{self.slipNum}'


class Transaction(models.Model):
    class Meta:
        db_table = 'transaction'
        ordering = ['-group', 'order']

    id = models.UUIDField(**uuid_kwargs)

    order = models.IntegerField(verbose_name="順番")
    # 0から始まる。フォーム上で、上から0, 1, 2, 3・・・

    debitCredit = models.IntegerField(verbose_name='借方(0)貸方(1)',
                                      choices=DEBIT_CREDIT_CHOICES)

    account = models.ForeignKey(Account, verbose_name='勘定科目',
                                on_delete=models.PROTECT)

    money = models.DecimalField(verbose_name='',
                                max_digits=11,  # 千億円まで
                                decimal_places=0)

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
