import uuid
from django.db import models
from django.conf import settings

DEBIT_CREDIT_CHOICES = ((0, '借方'), (1, '貸方'))


class Category(models.Model):

    class Meta:
        db_table = 'name'

    id = models.UUIDField(primary_key=True,  default=uuid.uuid4,
                          editable=False)
    name = models.CharField(verbose_name='カテゴリー名', max_length=30, unique=True)

    def __str__(self):
        return self.name


class Account(models.Model):

    class Meta:
        db_table = 'account'
        ordering = ['category', '-name']

    id = models.UUIDField(primary_key=True,  default=uuid.uuid4,
                          editable=False)

    name = models.CharField(verbose_name='勘定科目', max_length=40, unique=True)

    furigana = models.CharField(verbose_name='ふりがな', max_length=30,
                                unique=True, null=True, blank=True)

    category = models.ForeignKey(Category, verbose_name='カテゴリー',
                                 on_delete=models.PROTECT,
                                 related_name='category')

    description = models.CharField(verbose_name='説明', max_length=500,
                                   null=True, blank=True)

    def __str__(self):
        return self.name


class Transaction(models.Model):
    class Meta:
        db_table = 'transaction'
        ordering = ['-date', 'order', 'debitCredit']

    id = models.UUIDField(primary_key=True,  default=uuid.uuid4,
                          editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Djangoのベストプラクティス
        on_delete=models.CASCADE,
    )

    order = models.IntegerField(verbose_name="順番")
    # 0から始まる。フォーム上で、上から0, 1, 2, 3・・・

    debitCredit = models.IntegerField(verbose_name='借方(0)貸方(1)',
                                      choices=DEBIT_CREDIT_CHOICES)

    account = models.ForeignKey(Account, verbose_name='勘定科目',
                                on_delete=models.PROTECT,
                                related_name='account')

    money = models.IntegerField(verbose_name='金額')
    date = models.DateField(verbose_name='日付', auto_now=False)
    memo = models.CharField(verbose_name='備考', max_length=200,
                            null=True, blank=True)

    def __str__(self):
        str_debit_credit = '借' if self.debitCredit == 0 else '貸'
        return f'{self.date}　 ({str_debit_credit}) 　{self.account}　\
                 {self.money}円 　 {self.order}番'
        # str()を付けないと、no-string Errorになる。
