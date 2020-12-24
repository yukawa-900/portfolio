from django.contrib.auth import get_user_model
from ..models import Account, Transaction, TransactionGroup, \
                     AccountCategory, Tax, Department, Currency
from datetime import date


def user():
    return get_user_model().objects.create_user(
            email="sample@example.com",
            password="mysecretpassword"
         )


def another_user():
    return get_user_model().objects.create_user(
            email="another@example.com",
            password="anothersecretpassword"
         )


def cash(cls):
    return Account.objects.create(
            name='現金',
            furigana='げんきん',
            category=cls.assets,
            description='Hello Python!',
            code="S12",
            user=None
        )


def sales(cls):
    return Account.objects.create(
        name="売上", category=cls.revenue, user=None,
        furigana="うりあげ", code="2", description="")


def assets():
    return AccountCategory.objects.create(name='資産', order=0)


def revenue():
    return AccountCategory.objects.create(name="収益", order=1)


def transaction_group(self):
    return TransactionGroup.objects.create(
            user=self.user, date=date.today(),
            slipNum=1, pdf=None,
            memo="")


def transaction_cash(self):
    return Transaction.objects.create(
            debitCredit=0, tax=None,
            account=self.cash, money=2000.000000000000000,
            order=0, group=self.transaction_group)


def transaction_sales(self):
    return Transaction.objects.create(
            debitCredit=1, tax=None,
            account=self.sales, money=2000.000000000000000,
            order=1, group=self.transaction_group)


def department(self):
    return Department.objects.create(code="1", name="販売部門",
                                     user=self.user)


def tax():
    return Tax.objects.create(code="1", title="消費税（8%)", rate=8)


def currency():
    return Currency.objects.create(code="EUR", title="ユーロ")


def transactions_base_params(cls):
    return {
            "date": cls.today_str,
            "pdf": None,
            "memo": "hey",
            "department": None,
            "currency": None,
            "transactions": [
                {
                    "debitCredit": 0,
                    "account": str(cls.cash.id),
                    "money": 999,
                    "foreignMoney": None,
                    "order": 0,
                    "tax": None,
                },
                {
                    "debitCredit": 1,
                    "account": str(cls.sales.id),
                    "money": 999,
                    "foreignMoney": None,
                    "order": 1,
                    "tax": None
                }
            ]
        }
