from bookkeeping.models import Account, Currency, Department, Tax, \
                               Transaction, TransactionGroup
import random
import copy
from django.db import transaction
from datetime import date, timedelta
from django.contrib.auth import get_user_model


def create_transactions(days):
    # 勘定科目をすべて英語にすると煩雑になると判断し、ここでは特別に日本語の変数名を利用した
    売掛金 = Account.objects.get(name="売掛金")
    買掛金 = Account.objects.get(name="買掛金")
    仕入 = Account.objects.get(name="仕入高")
    売上 = Account.objects.get(name="売上高")
    仮払消費税等 = Account.objects.get(name="仮払消費税等")
    現金 = Account.objects.get(name="現金")
    旅費交通費 = Account.objects.get(name="旅費交通費")
    仮払金 = Account.objects.get(name="仮払金")
    租税公課 = Account.objects.get(name="租税公課")
    貸倒引当金 = Account.objects.get(name="貸倒引当金")
    普通預金 = Account.objects.get(name="普通預金")
    当座預金 = Account.objects.get(name="当座預金")
    消耗品費 = Account.objects.get(name="消耗品費")
    貸倒損失 = Account.objects.get(name="貸倒損失")
    受取手形 = Account.objects.get(name="受取手形")
    差入保証金 = Account.objects.get(name="差入保証金")
    給料 = Account.objects.get(name="給料手当")
    立替金 = Account.objects.get(name="立替金")
    預り金 = Account.objects.get(name="預り金")
    前受金 = Account.objects.get(name="前受金")
    貯蔵品 = Account.objects.get(name="貯蔵品")
    通信費 = Account.objects.get(name="通信費")
    減価償却費 = Account.objects.get(name="減価償却費")
    減価償却累計額 = Account.objects.get(name="減価償却累計額")
    固定資産売却損 = Account.objects.get(name="固定資産売却損")
    未収入金 = Account.objects.get(name="未収入金")
    建物 = Account.objects.get(name="建物")
    # 損益 = Account.objects.get(name="損益")
    # 繰越利益剰余金 = Account.objects.get(name="繰越利益剰余金")
    車両運搬具 = Account.objects.get(name="車両運搬具")
    未払金 = Account.objects.get(name="未払金")
    仮受消費税等 = Account.objects.get(name="仮受消費税等")
    仮払消費税等 = Account.objects.get(name="仮払消費税等")
    未払消費税等 = Account.objects.get(name="未払消費税等")
    長期借入金 = Account.objects.get(name="長期借入金")
    支払利息 = Account.objects.get(name="支払利息")

    sales_dept = Department.objects.get(name="販売部門")
    manufacture_dept = Department.objects.get(name="製造部門")
    marketing_dept = Department.objects.get(name="マーティング部門")

    departments = [sales_dept, manufacture_dept, marketing_dept]

    tax_10 = Tax.objects.get(name="消費税(10%)")
    tax_8 = Tax.objects.get(name="消費税(8%)")
    tax_0 = Tax.objects.get(name="非課税")

    taxes = [tax_10, tax_8, tax_0, None]

    currency_and_rates = {
        'JPY': 1,
        'EUR': 1 / 130.56,
        'USD': 1 / 107.90,
        'CAD': 1 / 86.49
    }

    memo_data = ["サンプルです", ""]

    user = get_user_model().objects.get(email="sample@gmail.com")

    """サンプルのTransactions"""
    sample_data = [
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 3000,
                    "foreignMoney": None,
                    "account": 仕入
                },
                {
                    "order": 1,
                    "debitCredit": 1,
                    "money": 2500,
                    "foreignMoney": None,
                    "account": 買掛金
                },
                {
                    "order": 2,
                    "debitCredit": 1,
                    "money": 500,
                    "foreignMoney": None,
                    "account": 現金
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 4221875,
                    "foreignMoney": None,
                    "account": 仕入
                },
                {
                    "order": 1,
                    "debitCredit": 1,
                    "money": 337750,
                    "foreignMoney": None,
                    "account": 仮払消費税等
                },
                {
                    "order": 2,
                    "debitCredit": 1,
                    "money": 4559625,
                    "foreignMoney": None,
                    "account": 買掛金
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 4221875,
                    "foreignMoney": None,
                    "account": 仕入
                },
                {
                    "order": 1,
                    "debitCredit": 1,
                    "money": 337750,
                    "foreignMoney": None,
                    "account": 仮払消費税等
                },
                {
                    "order": 2,
                    "debitCredit": 1,
                    "money": 4559625,
                    "foreignMoney": None,
                    "account": 買掛金
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 6000,
                    "foreignMoney": None,
                    "account": 旅費交通費
                },
                {
                    "order": 1,
                    "debitCredit": 1,
                    "money": 5000,
                    "foreignMoney": None,
                    "account": 仮払金
                },
                {
                    "order": 2,
                    "debitCredit": 1,
                    "money": 1000,
                    "foreignMoney": None,
                    "account": 現金
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 6000,
                    "foreignMoney": None,
                    "account": 売上
                },
                {
                    "order": 1,
                    "debitCredit": 1,
                    "money": 6000,
                    "foreignMoney": None,
                    "account": 売掛金
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 20000,
                    "foreignMoney": None,
                    "account": 前受金
                },
                {
                    "order": 1,
                    "debitCredit": 0,
                    "money": 40000,
                    "foreignMoney": None,
                    "account": 売掛金
                },
                {
                    "order": 2,
                    "debitCredit": 1,
                    "money": 60000,
                    "foreignMoney": None,
                    "account": 売上
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 1000,
                    "foreignMoney": None,
                    "account": 租税公課
                },
                {
                    "order": 1,
                    "debitCredit": 1,
                    "money": 1000,
                    "foreignMoney": None,
                    "account": 普通預金
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 1000,
                    "foreignMoney": None,
                    "account": 消耗品費
                },
                {
                    "order": 1,
                    "debitCredit": 1,
                    "money": 1000,
                    "foreignMoney": None,
                    "account": 現金
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 1000,
                    "foreignMoney": None,
                    "account": 消耗品費
                },
                {
                    "order": 1,
                    "debitCredit": 1,
                    "money": 1000,
                    "foreignMoney": None,
                    "account": 現金
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 3700,
                    "foreignMoney": None,
                    "account": 貸倒引当金
                },
                {
                    "order": 1,
                    "debitCredit": 0,
                    "money": 300,
                    "foreignMoney": None,
                    "account": 貸倒損失
                },
                {
                    "order": 2,
                    "debitCredit": 1,
                    "money": 4000,
                    "foreignMoney": None,
                    "account": 売掛金
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 32000,
                    "foreignMoney": None,
                    "account": 受取手形
                },
                {
                    "order": 1,
                    "debitCredit": 1,
                    "money": 32000,
                    "foreignMoney": None,
                    "account": 売上
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 3000,
                    "foreignMoney": None,
                    "account": 差入保証金
                },
                {
                    "order": 1,
                    "debitCredit": 1,
                    "money": 3000,
                    "foreignMoney": None,
                    "account": 現金
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 80000,
                    "foreignMoney": None,
                    "account": 給料
                },
                {
                    "order": 1,
                    "debitCredit": 1,
                    "money": 5000,
                    "foreignMoney": None,
                    "account": 立替金
                },
                {
                    "order": 2,
                    "debitCredit": 1,
                    "money": 8000,
                    "foreignMoney": None,
                    "account": 預り金
                },
                {
                    "order": 3,
                    "debitCredit": 1,
                    "money": 67000,
                    "foreignMoney": None,
                    "account": 現金
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 4000,
                    "foreignMoney": None,
                    "account": 通信費
                },
                {
                    "order": 1,
                    "debitCredit": 0,
                    "money": 1500,
                    "foreignMoney": None,
                    "account": 租税公課
                },
                {
                    "order": 2,
                    "debitCredit": 1,
                    "money": 2500,
                    "foreignMoney": None,
                    "account": 貯蔵品
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 3000,
                    "foreignMoney": None,
                    "account": 当座預金
                },
                {
                    "order": 1,
                    "debitCredit": 1,
                    "money": 3000,
                    "foreignMoney": None,
                    "account": 現金
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 10000,
                    "foreignMoney": None,
                    "account": 減価償却費
                },
                {
                    "order": 1,
                    "debitCredit": 1,
                    "money": 10000,
                    "foreignMoney": None,
                    "account": 減価償却累計額
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 2400,
                    "foreignMoney": None,
                    "account": 減価償却累計額
                },
                {
                    "order": 1,
                    "debitCredit": 0,
                    "money": 5500,
                    "foreignMoney": None,
                    "account": 未収入金
                },
                {
                    "order": 2,
                    "debitCredit": 0,
                    "money": 100,
                    "foreignMoney": None,
                    "account": 固定資産売却損
                },
                {
                    "order": 3,
                    "debitCredit": 1,
                    "money": 8000,
                    "foreignMoney": None,
                    "account": 建物
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        # {
        #     "transactions": [
        #         {
        #             "order": 0,
        #             "debitCredit": 0,
        #             "money": 3000,
        #             "foreignMoney": None,
        #             "account": 損益
        #         },
        #         {
        #             "order": 1,
        #             "debitCredit": 1,
        #             "money": 3000,
        #             "foreignMoney": None,
        #             "account": 繰越利益剰余金
        #         },
        #     ],
        #     "currency": "JPY",
        #     "date": "2021-04-10",
        #     "memo": "",
        #     "pdf": None
        # },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 20000,
                    "foreignMoney": None,
                    "account": 車両運搬具
                },
                {
                    "order": 1,
                    "debitCredit": 1,
                    "money": 20000,
                    "foreignMoney": None,
                    "account": 未払金
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 32000,
                    "foreignMoney": None,
                    "account": 仮受消費税等
                },
                {
                    "order": 1,
                    "debitCredit": 1,
                    "money": 8000,
                    "foreignMoney": None,
                    "account": 仮払消費税等
                },
                {
                    "order": 2,
                    "debitCredit": 1,
                    "money": 24000,
                    "foreignMoney": None,
                    "account": 未払消費税等
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
        {
            "transactions": [
                {
                    "order": 0,
                    "debitCredit": 0,
                    "money": 30000,
                    "foreignMoney": None,
                    "account": 長期借入金
                },
                {
                    "order": 1,
                    "debitCredit": 0,
                    "money": 150,
                    "foreignMoney": None,
                    "account": 支払利息
                },
                {
                    "order": 2,
                    "debitCredit": 1,
                    "money": 30150,
                    "foreignMoney": None,
                    "account": 現金
                },
            ],
            "currency": "JPY",
            "date": "2021-04-10",
            "memo": "",
            "pdf": None
        },
    ]

    with transaction.atomic():
        half_days = int(days / 2)
        today = date.today()
        start_date = today - timedelta(days=half_days)
        end_date = today + timedelta(days=half_days)
        now = start_date
        while now < end_date:
            d = copy.deepcopy(random.choice(sample_data))
            currency = random.choice(list(currency_and_rates.keys()))
            d['user'] = user
            d["slipNum"] = 1
            d["currency"] = Currency.objects.get(code=currency)
            d["date"] = now
            d["memo"] = random.choice(memo_data)
            d["date"] = now.strftime('%Y-%m-%d')
            d["department"] = random.choice(departments)
            order = 0
            total_debit = 0
            total_credit = 0
            for transac in d["transactions"]:
                transac["tax"] = random.choice(taxes)
                if transac["debitCredit"] == 0:
                    total_debit += transac["money"]
                else:
                    total_credit += transac["money"]

                if currency != "JPY":
                    transac["foreignMoney"] = round(
                        transac["money"] * currency_and_rates[currency], 2
                        )

                transac["order"] = order

                order += 1

            assert total_credit == total_credit, "借方と貸方が一致しません"

            # データベースに登録
            transactions = d.pop("transactions")
            transac_group = TransactionGroup.objects.create(**d)
            for transac in transactions:
                Transaction.objects.create(group=transac_group, **transac)

            now += timedelta(days=1)
