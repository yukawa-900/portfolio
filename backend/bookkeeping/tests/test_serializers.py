from django.test import TestCase
from ..models import Transaction
from ..serializers import TransactionGroupSerializer, AccountSerializer, \
                          TransactionSerializer
from .data import user, cash, sales, assets, revenue, transaction_group, \
                  transaction_cash, transaction_sales, tax, currency, \
                  department, transactions_base_params
from datetime import date, timedelta
import copy
# coverage run --source=. manage.py test --settings config.local_settings


def run_valid_test(self, patterns):
    """
       各TestCaseは、self.serializerを持ち、
       patternsはserializerに入れるdataのリスト
    """
    for data in patterns:
        with self.subTest(data):
            serializer = self.serializer(data=data)
            self.assertEqual(serializer.is_valid(), True)


def run_invalid_test(self, patterns):
    for pattern in patterns:
        """
           各TestCaseは、self.serializerを持ち、
           patternsは、data, field, codeのキーからなる辞書
           data: serializerに渡す辞書, field: エラーが発生するフィールド, code: エラーコード
        """
        with self.subTest(pattern):
            serializer = self.serializer(data=pattern["data"])
            self.assertEqual(serializer.is_valid(), False)
            self.assertCountEqual(serializer.errors.keys(),
                                  [pattern["field"]])
            self.assertCountEqual(
                [x.code for x in serializer.errors[pattern["field"]]],
                [pattern["code"]]
            )


class TestAccountSerializer(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.serializer = AccountSerializer
        cls.assets = assets()
        cls.revenue = revenue()
        cls.user = user()

        cls.base_input_data = {
            'name': '現金',
            'furigana': 'げんきん',
            'category': str(cls.assets.id),
            'description': 'hello',  # blank = True
            'code': "SAMPLE"
        }

        cls.sales = sales(cls)

    def test_output_data(self):
        """AccountSerializer:出力データの内容を確認"""

        expected_data = {
            "id": str(self.sales.id),
            "name": self.sales.name,
            "furigana": self.sales.furigana,
            "categoryName": self.sales.category.name,
            "category": self.sales.category.id,
            "description": self.sales.description,
            "code": self.sales.code,
            "user": self.sales.user.id if self.sales.user else None
        }

        serializer = AccountSerializer(instance=self.sales)

        self.assertDictEqual(serializer.data, expected_data)

    def test_input_valid(self):
        """AccountSerializer:入力データのバリデーション（OK）"""

        data = copy.deepcopy(self.base_input_data)

        blank_description = copy.deepcopy(data)
        blank_description["description"] = ""

        number_code = copy.deepcopy(data)
        number_code["code"] = "1234"

        mixed_code = copy.deepcopy(data)
        mixed_code["code"] = "1A1A"

        patterns = [
            data,
            blank_description,
            number_code,
            mixed_code
        ]

        run_valid_test(self, patterns)

    def test_input_invalid(self):
        """AccountSerializer:入力データのバリデーションNG"""

        data = copy.deepcopy(self.base_input_data)

        blank_name = copy.deepcopy(data)
        blank_name["name"] = ""

        blank_code = copy.deepcopy(data)
        blank_code["code"] = ""

        null_category = copy.deepcopy(data)
        null_category["category"] = None

        invalid_category = copy.deepcopy(data)
        invalid_category["category"] = "123"

        invalid_furigana = copy.deepcopy(data)
        invalid_furigana["furigana"] = "abc"

        same_name = copy.deepcopy(data)  # nameの被り
        same_name["name"] = "売上"

        patterns = [
            {"data": blank_name, "field": "name", "code": "blank"},
            {"data": null_category, "field": "category", "code": "null"},
            {"data": blank_code, "field": "code", "code": "blank"},
            {"data": invalid_category, "field": "category", "code": "invalid"},
            {"data": invalid_furigana, "field": "furigana", "code": "invalid"},
            {"data": same_name, "field": "name", "code": "unique"},
        ]

        run_invalid_test(self, patterns)


class TestTransactionSerializer(TestCase):
    """
        TransactionSerializerのテストケース
        exclude=('id', 'group')としているので、これらはinput/outputに含まれない
    """
    @classmethod
    def setUpTestData(cls):
        cls.serializer = TransactionSerializer
        cls.user = user()

        cls.assets = assets()
        cls.cash = cash(cls)

        cls.tax = tax()

        cls.transaction_group = transaction_group(cls)
        cls.transaction_cash = transaction_cash(cls)

        cls.base_input_data = {
            "debitCredit": 0,
            "account": str(cls.cash.id),
            "money": 2000,
            "order": 0,
            "tax": str(cls.tax.id)
        }

    def test_output_data(self):
        """出力データの内容検証"""

        sample_transaction = Transaction.objects.create(
            debitCredit=0,
            account=self.cash,
            money=1000.000000000000000,
            order=0,
            tax=self.tax,
            group=self.transaction_group
        )

        serializer = TransactionSerializer(instance=sample_transaction)

        expected_data = {
            "debitCredit": sample_transaction.debitCredit,
            "account": sample_transaction.account.id,
            "accountName": sample_transaction.account.name,
            "money": '{:.15f}'.format(sample_transaction.money),
            "foreignMoney": sample_transaction.foreignMoney,
            "order": sample_transaction.order,
            "tax": sample_transaction.tax.id
        }

        self.assertDictEqual(serializer.data, expected_data)

    def test_input_valid(self):
        """Transaction(正常系) 入力データのバリデーションOKを確認"""

        data = copy.deepcopy(self.base_input_data)

        null_tax = copy.deepcopy(data)
        null_tax["tax"] = None

        blank_memo = copy.deepcopy(data)
        blank_memo["memo"] = ""

        patterns = [
            data,
            null_tax,
            blank_memo
        ]

        run_valid_test(self, patterns)

    def test_input_invalid(self):
        """Transaction(異常系) 入力データのバリデーションNGを確認"""
        data = copy.deepcopy(self.base_input_data)

        invalid_money = copy.deepcopy(data)
        invalid_money["money"] = 0

        null_money = copy.deepcopy(data)
        null_money["money"] = None

        invalid_account = copy.deepcopy(data)
        invalid_account["account"] = "123"

        invalid_debitCredit = copy.deepcopy(data)
        invalid_debitCredit["debitCredit"] = 99

        patterns = [
            {"data": invalid_money, "field": "money", "code": "invalid"},
            {"data": null_money, "field": "money", "code": "null"},
            {"data": invalid_account, "field": "account", "code": "invalid"},
            {"data": invalid_debitCredit, "field": "debitCredit",
                                          "code": "invalid_choice"},
        ]

        run_invalid_test(self, patterns)


class TestTransactionGroupSerializer(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.serializer = TransactionGroupSerializer
        cls.user = user()
        cls.today_str = date.today().strftime("%Y-%m-%d")
        cls.tax = tax()
        cls.assets = assets()
        cls.revenue = revenue()
        cls.cash = cash(cls)
        cls.sales = sales(cls)
        cls.transaction_group = transaction_group(cls)
        cls.transaction_cash = transaction_cash(cls)
        cls.transaction_sales = transaction_sales(cls)
        cls.currency = currency()
        cls.department = department(cls)

        cls.base_input_data = transactions_base_params(cls)

    def test_input_valid(self):
        """TransactionGroupSerializer(正常系): インプットのバリデーションOKを検証"""
        data = copy.deepcopy(self.base_input_data)

        date_364_before = copy.deepcopy(data)
        date_364_before["date"] = \
            (date.today() - timedelta(days=364)).strftime("%Y-%m-%d")

        valid_department = copy.deepcopy(data)
        valid_department["department"] = str(self.department.id)

        valid_currency = copy.deepcopy(data)
        valid_currency["currency"] = str(self.currency.code)

        patterns = [
            data,
            date_364_before,
            valid_department,
            valid_currency
        ]

        run_valid_test(self, patterns)

    def test_input_invalid(self):
        """TransactionGroupSerializer(正常系): インプットのバリデーションNGを検証"""

        data = copy.deepcopy(self.base_input_data)

        null_date = copy.deepcopy(data)
        null_date["date"] = None

        date_365_before = copy.deepcopy(data)
        date_365_before["date"] = \
            (date.today() - timedelta(days=365)).strftime("%Y-%m-%d")

        date_400_before = copy.deepcopy(data)
        date_400_before["date"] = \
            (date.today() - timedelta(days=400)).strftime("%Y-%m-%d")

        invalid_department = copy.deepcopy(data)
        invalid_department["department"] = "INVALID"

        invalid_currency = copy.deepcopy(data)
        invalid_currency["currency"] = "DDD"

        invalid_transactions = copy.deepcopy(data)
        invalid_transactions["transactions"].pop()

        patterns = [
            {"data": null_date, "field": "date", "code": "null"},
            {"data": date_365_before, "field": "date", "code": "invalid"},
            {"data": date_400_before, "field": "date", "code": "invalid"},
            {"data": invalid_department, "field": "department",
             "code": "invalid"},
            {"data": invalid_currency, "field": "currency",
             "code": "does_not_exist"},
            {"data": invalid_transactions, "field": "transactions",
             "code": "invalid"}
        ]

        run_invalid_test(self, patterns)
