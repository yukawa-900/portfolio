from django.test import TestCase
from ..models import Account, Transaction, Category
from ..serializers import TransactionSerializer, AccountSerializer
from django.contrib.auth import get_user_model
from .data import sample_user
from datetime import date
# coverage run --source=. manage.py test --settings config.local_settings


class TestAccountSerializer(TestCase):

    assets = ''  # 「資産」という名前のカテゴリー

    @classmethod
    def setUpTestData(cls):
        cls.assets = Category.objects.create(name='資産')

    def test_input_valid(self):
        """入力データのバリデーション（OK）"""

        input_data = {
            'name': '現金',
            'furigana': 'げんきん',
            'category': self.assets.id,
            'description': '',  # blank = True
            'order': 0,
        }

        serializer = AccountSerializer(data=input_data)

        self.assertEqual(serializer.is_valid(), True)

    def test_output_data(self):
        """出力データの内容を確認"""

        sample_account = Account.objects.create(
            name='売掛金',
            furigana='うりかけきん',
            category=self.assets,
            description='Hello Python!'
        )

        expected_data = {
            'id': str(sample_account.id),
            'name': sample_account.name,
            'furigana': sample_account.furigana,
            'categoryName': sample_account.category.name,
            'description': sample_account.description
        }

        serializer = AccountSerializer(instance=sample_account)

        self.assertDictEqual(serializer.data, expected_data)

    def test_input_invalid_blank(self):
        """バリデーションNG(nameが空文字)"""

        input_data = {
            'name': '',
            'furigana': 'げんきん',
            'category': self.assets.id,
            'description': 'Hello World!',
        }

        serializer = AccountSerializer(data=input_data)

        self.assertEqual(serializer.is_valid(), False)
        self.assertCountEqual(serializer.errors.keys(), ['name'])
        self.assertCountEqual(
            [x.code for x in serializer.errors['name']],
            ['blank'],
        )

    def test_input_invalid_character(self):
        """バリデーションNG(furiganaに平仮名以外が含まれる)"""

        input_data = {
            'name': '現金',
            'furigana': '薔薇',  # ふりがなに漢字が含まれている
            'category': self.assets.id,
            'description': 'Hello World!',
        }

        serializer = AccountSerializer(data=input_data)

        self.assertEqual(serializer.is_valid(), False)
        self.assertCountEqual(serializer.errors.keys(), ['furigana'])
        self.assertCountEqual(
            [x.code for x in serializer.errors['furigana']],
            ['invalid'],
        )

    def test_input_invalid_unique(self):
        """バリデーションNG(nameが被る)"""

        Account.objects.create(
            name='現金',
            furigana='げんきん',
            category=self.assets,
            description='Hello Python!'
        )

        input_data = {
            'name': '現金',
            'furigana': 'げんきん',
            'category': self.assets.id,
            'description': 'Hello World!',
        }

        serializer = AccountSerializer(data=input_data)

        self.assertEqual(serializer.is_valid(), False)
        self.assertCountEqual(serializer.errors.keys(), ['name', 'furigana'])
        self.assertCountEqual(
            [x.code for x in serializer.errors['name']],
            ['unique'],
        )
        self.assertCountEqual(
            [x.code for x in serializer.errors['furigana']],
            ['unique'],
        )


class TestTransactionSerializer(TestCase):
    assets = ''  # 「資産」という名前のカテゴリー
    cash = ''  # 「現金」という名前の勘定科目
    user = ''

    @classmethod
    def setUpTestData(cls):

        cls.user = get_user_model().objects.create_user(
            email=sample_user['email'],
            password=sample_user['password']
        )

        cls.assets = Category.objects.create(name='資産')

        cls.cash = Account.objects.create(
            name='現金',
            furigana='げんきん',
            category=cls.assets,
            description='Hello Python!'
        )

    def setUp(self):
        # ログイン
        self.client.login(email=sample_user['email'],
                          password=sample_user['password'])

    def test_input_valid(self):
        """入力データのバリデーションOKを確認"""

        input_data = {
            'user': str(self.user.id),
            'debitCredit': 0,
            'account': str(self.cash.id),
            'money': 2000,
            'date': date.today().strftime('%Y-%m-%d'),
            'order': 0,
            'memo': 'hey'
        }

        serializer = TransactionSerializer(data=input_data)
        self.assertEqual(serializer.is_valid(), True)

    def test_output_data(self):
        """出力データの内容検証"""

        sample_transaction = Transaction.objects.create(
            user=self.user,
            debitCredit=0,
            account=self.cash,
            money=1000,
            date=date.today(),
            order=0,
            memo='hey'
        )

        serializer = TransactionSerializer(instance=sample_transaction)

        expected_data = {
            'id': str(sample_transaction.id),
            'user': sample_transaction.user.id,
            'debitCredit': 0,
            'accountName': sample_transaction.account.name,
            'money': 1000,
            'date': date.today().strftime('%Y-%m-%d'),
            'order': 0,
            'memo': 'hey',
        }

        self.assertDictEqual(serializer.data, expected_data)

    def test_input_invalid_blank(self):
        """入力データのバリデーションNG（money=0)"""
        input_data = {
            'user': str(self.user.id),
            'debitCredit': 0,
            'account': str(self.cash.id),
            'money': 0,
            'date': date.today().strftime('%Y-%m-%d'),
            'order': 0,
            'memo': 'hey'
        }

        serializer = TransactionSerializer(data=input_data)
        self.assertEqual(serializer.is_valid(), False)
        self.assertCountEqual(serializer.errors.keys(), ['money'])
        self.assertCountEqual(
            [x.code for x in serializer.errors['money']],
            ['invalid']
        )

    def test_input_invalid_multiple_date(self):
        """入力データのバリデーションNG（複数の日付を、同時に編集・追加できない)"""
        input_data = [
            {
                'user': str(self.user.id),
                'debitCredit': 0,
                'account': str(self.cash.id),
                'money': 1000,
                'date': date.today().strftime('%Y-%m-%d'),
                'order': 0,
                'memo': 'hey'
            },
            {
                'user': str(self.user.id),
                'debitCredit': 0,
                'account': str(self.cash.id),
                'money': 1000,
                'date': "1999-09-09",
                'order': 0,
                'memo': 'hey'
            },
        ]

        serializer = TransactionSerializer(data=input_data)
        self.assertEqual(serializer.is_valid(), False)
        self.assertCountEqual(serializer.errors.keys(), ['non_field_errors'])
        self.assertCountEqual(
            [x.code for x in serializer.errors['non_field_errors']],
            ['invalid']
        )
