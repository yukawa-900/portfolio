from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from datetime import date
from ..models import Transaction, Account, Category
from .data import sample_user

ACCOUNT_LIST_URL = reverse('bookkeeping:accounts')
TRANSACTION_VIEWSET_LIST_URL = reverse('bookkeeping:transaction-list')


def setup_categories_accounts():
    assets = Category.objects.create(name='資産')
    revenue = Category.objects.create(name='収益')

    Account.objects.create(name='現金', category=assets,
                           description='')

    Account.objects.create(name='売上', category=revenue,
                           description='')

    # Account.objects.create(name='普通預金', category=assets,
    #                        description='')

    # Account.objects.create(name='受取利息', category=revenue,
    #                        description='')


class TestAccountListView(APITestCase):
    """"AccountListViewのテスト"""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        cls.user = get_user_model().objects.create_user(
            email=sample_user['email'],
            password=sample_user['password']
        )

    @classmethod
    def setUpTestData(cls):
        setup_categories_accounts()

    def test_list_success(self):
        """アカウント一覧APIへのGETリクエスト"""
        # ログイン
        self.client.login(email=sample_user['email'],
                          password=sample_user['password'])
        response = self.client.get(ACCOUNT_LIST_URL)

        cash = Account.objects.get(name='現金')
        sales = Account.objects.get(name='売上')
        # deposit = Account.objects.get(name='普通預金')
        # interest = Account.objects.get(name='受取利息')

        expected_json_list = [
            {
                'id': str(cash.id),
                'name': cash.name,
                'categoryName': cash.category.name
            },
            {
                'id': str(sales.id),
                'name': sales.name,
                'categoryName': sales.category.name
            },
        ]

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, expected_json_list)

    def test_login_required(self):
        """ログインしていないユーザーが、アクセスできないことをテストする"""
        response = self.client.get(ACCOUNT_LIST_URL)
        self.assertEqual(response.status_code, 403)


class TestPrivateTransactionViewset(APITestCase):
    """ログイン済ユーザーへのTransactionViewsetをテストする"""

    cash = ''
    sales = ''
    transaction_cash = ''
    transaction_sales = ''

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        cls.user = get_user_model().objects.create_user(
            email=sample_user['email'],
            password=sample_user['password']
        )

    @classmethod
    def setUpTestData(cls):

        # カテゴリーと勘定科目を用意
        setup_categories_accounts()

        # 勘定科目を取り出す
        cls.cash = Account.objects.get(name='現金')
        cls.sales = Account.objects.get(name='売上')

    def setUp(self):
        # ログイン
        self.client.login(email=sample_user['email'],
                          password=sample_user['password'])

        # 取引を用意
        Transaction.objects.create(user=self.user, debitCredit=0,
                                   account=self.cash, money=2000,
                                   order=0, date=date.today(), memo='')

        Transaction.objects.create(user=self.user, debitCredit=1,
                                   account=self.sales, money=2000,
                                   order=0, date=date.today(), memo='')

        self.transaction_cash = Transaction.objects.get(account=self.cash)
        self.transaction_sales = Transaction.objects.get(account=self.sales)

    def test_list_success(self):
        """GETのテスト（正常系）"""

        response = self.client.get(TRANSACTION_VIEWSET_LIST_URL)

        expected_json_list = [
            {
                'id': str(self.transaction_cash.id),
                'user': str(self.transaction_cash.user.id),
                'debitCredit': self.transaction_cash.debitCredit,
                'accountName': self.transaction_cash.account.name,
                'money': self.transaction_cash.money,
                'date': self.transaction_cash.date.strftime('%Y-%m-%d'),
                'order': self.transaction_cash.order,
                'memo': self.transaction_cash.memo
            },
            {
                'id': str(self.transaction_sales.id),
                'user': str(self.transaction_sales.user.id),
                'debitCredit': self.transaction_sales.debitCredit,
                'accountName': self.transaction_sales.account.name,
                'money': self.transaction_sales.money,
                'date': self.transaction_sales.date.strftime('%Y-%m-%d'),
                'order': self.transaction_sales.order,
                'memo': self.transaction_sales.memo
            }
        ]

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, expected_json_list)

    def test_create_success(self):
        """Transaction登録APIへのPOSTリクエスト（正常系）"""

        params = [
            {
                'user': str(self.user.id),
                'debitCredit': 0,
                'account': str(self.cash.id),
                'money': 999,
                'date': '2010-11-11',
                'order': 0,
                'memo': ''
            },
            {
                'user': str(self.user.id),
                'debitCredit': 1,
                'account': str(self.sales.id),
                'money': 999,
                'date': '2010-11-11',
                'order': 0,
                'memo': ''
            }
        ]

        response = self.client.post(TRANSACTION_VIEWSET_LIST_URL, params,
                                    format='json')

        transaction_cash = Transaction.objects.get(account=self.cash,
                                                   money=999)
        transaction_sales = Transaction.objects.get(account=self.sales,
                                                    money=999)

        expected_json_list = [
            {
                'id': str(transaction_cash.id),
                'user': str(transaction_cash.user.id),
                'debitCredit': transaction_cash.debitCredit,
                'accountName': transaction_cash.account.name,
                'money': transaction_cash.money,
                'date': transaction_cash.date.strftime('%Y-%m-%d'),
                'order': transaction_cash.order,
                'memo': transaction_cash.memo
            },
            {
                'id': str(transaction_sales.id),
                'user': str(transaction_sales.user.id),
                'debitCredit': transaction_sales.debitCredit,
                'accountName': transaction_sales.account.name,
                'money': transaction_sales.money,
                'date': transaction_sales.date.strftime('%Y-%m-%d'),
                'order': transaction_sales.order,
                'memo': transaction_sales.memo
            }
        ]

        # データベースの状態 POSTした分＋setUp分 = 4
        self.assertEqual(Transaction.objects.count(), 4)
        self.assertEqual(response.status_code, 201)
        self.assertJSONEqual(response.content, expected_json_list)

    def test_create_400_debit_credit(self):
        """（異常系）借方・貸方が一致する必要があることをテスト"""
        params = [
            {
                'user': str(self.user.id),
                'debitCredit': 1,
                'account': str(self.cash.id),
                'money': 999,
                'date': '2010-11-11',
                'order': 0,
                'memo': ''
            },
            {
                'user': str(self.user.id),
                'debitCredit': 1,
                'account': str(self.sales.id),
                'money': 999,
                'date': '2010-11-11',
                'order': 0,
                'memo': ''
            }
        ]

        response = self.client.post(TRANSACTION_VIEWSET_LIST_URL, params,
                                    format='json')

        self.assertEqual(Transaction.objects.count(), 2)
        self.assertEqual(response.status_code, 400)

    def test_create_400_multiple_date(self):
        """（異常系）異なる日付を同時に編集できないことをテスト"""
        params = [
            {
                'user': str(self.user.id),
                'debitCredit': 1,
                'account': str(self.cash.id),
                'money': 999,
                'date': '2005-04-05',
                'order': 0,
                'memo': ''
            },
            {
                'user': str(self.user.id),
                'debitCredit': 1,
                'account': str(self.sales.id),
                'money': 999,
                'date': '2010-11-11',
                'order': 0,
                'memo': ''
            }
        ]

        response = self.client.post(TRANSACTION_VIEWSET_LIST_URL, params,
                                    format='json')

        self.assertEqual(Transaction.objects.count(), 2)
        self.assertEqual(response.status_code, 400)

    def test_create_400_order_must_start_with_0(self):
        """orderは、貸・借共に0から始まることをテスト"""
        params = [
            {
                'user': str(self.user.id),
                'debitCredit': 1,
                'account': str(self.cash.id),
                'money': 999,
                'date': '2005-04-05',
                'order': 0,
                'memo': ''
            },
            {
                'user': str(self.user.id),
                'debitCredit': 1,
                'account': str(self.sales.id),
                'money': 999,
                'date': '2010-11-11',
                'order': 1,
                'memo': ''
            }
        ]

        response = self.client.post(TRANSACTION_VIEWSET_LIST_URL, params,
                                    format='json')

        self.assertEqual(Transaction.objects.count(), 2)
        self.assertEqual(response.status_code, 400)

    def test_create_400_order_must_be_successive(self):
        params = [
            {
                'user': str(self.user.id),
                'debitCredit': 1,
                'account': str(self.cash.id),
                'money': 999,
                'date': '2005-04-05',
                'order': 0,
                'memo': ''
            },
            {
                'user': str(self.user.id),
                'debitCredit': 1,
                'account': str(self.sales.id),
                'money': 999,
                'date': '2010-11-11',
                'order': 1,
                'memo': ''
            }
        ]

        response = self.client.post(TRANSACTION_VIEWSET_LIST_URL, params,
                                    format='json')

        self.assertEqual(Transaction.objects.count(), 2)
        self.assertEqual(response.status_code, 400)

    def test_update_success(self):
        """Transaction更新APIへのPUTリクエスト"""

        params = [
            {
                # 編集する
                'id': str(self.transaction_sales.id),
                'debitCredit': 0,  # 変更
                'account': self.transaction_cash.account.id,  # 売上 → 現金に変更
                'money': 60,  # 変更
                'date': '1998-09-08',  # 変更
                'order': 0,
                'memo': 'これはメモです'  # 変更
            },
            {
                # 追加する
                'id': '727eb573-e4b2-4ae4-a874-8ccc115dcfca',  # 架空のID
                'debitCredit': 0,
                'account': self.transaction_cash.account.id,
                'money': 60,
                'date': '1998-09-08',
                'order': 1,
                'memo': 'これはメモです'
            },
            {   # 追加 & 既存のレコードを消去する
                'id': '3fe6e029-81f3-481f-a800-2045a0bf884b',  # 架空のID
                'debitCredit': 1,  # 変更
                'account': self.transaction_sales.account.id,  # 現金 → 売上に変更
                'money': 120,  # 変更
                'date': '1998-09-08',  # 変更
                'order': 0,
                'memo': self.transaction_cash.memo
            }
        ]

        TRANSACTION_VIEWSET_DETAIL_URL = reverse(
            'bookkeeping:transaction-detail',
            kwargs={'pk': str(self.transaction_cash.id)}
            )

        response = self.client.put(
            TRANSACTION_VIEWSET_DETAIL_URL,
            params, format='json')

        res_transaction_cash = Transaction.objects.filter(account=self.cash,
                                                          money=60)
        res_transaction_sales = Transaction.objects.filter(account=self.sales,
                                                           money=120)

        expected_json_list = [
            {
                'id': str(res_transaction_cash[0].id),
                'user': str(res_transaction_cash[0].user.id),
                'debitCredit': res_transaction_cash[0].debitCredit,
                'accountName': res_transaction_cash[0].account.name,
                'money': res_transaction_cash[0].money,
                'date': res_transaction_cash[0].date.strftime('%Y-%m-%d'),
                'order': res_transaction_cash[0].order,
                'memo': res_transaction_cash[0].memo
            },
            {
                'id': str(res_transaction_cash[1].id),
                'user': str(res_transaction_cash[1].user.id),
                'debitCredit': res_transaction_cash[1].debitCredit,
                'accountName': res_transaction_cash[1].account.name,
                'money': res_transaction_cash[1].money,
                'date': res_transaction_cash[1].date.strftime('%Y-%m-%d'),
                'order': res_transaction_cash[1].order,
                'memo': res_transaction_cash[1].memo
            },
            {
                'id': str(res_transaction_sales[0].id),
                'user': str(res_transaction_sales[0].user.id),
                'debitCredit': res_transaction_sales[0].debitCredit,
                'accountName': res_transaction_sales[0].account.name,
                'money': res_transaction_sales[0].money,
                'date': res_transaction_sales[0].date.strftime('%Y-%m-%d'),
                'order': res_transaction_sales[0].order,
                'memo': res_transaction_sales[0].memo
            }
        ]

        # List検証用に使った2つと、新たに更新した3つ
        self.assertEqual(Transaction.objects.count(), 5)
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, expected_json_list)

    # Updateの異常系テストは、Createと同じバリデーションを内部で用いているため、省略した。


class TestPublicTransactionViewset(APITestCase):

    def test_list_403(self):
        response = self.client.get(ACCOUNT_LIST_URL)
        self.assertEqual(response.status_code, 403)

    # create, updateも、同じViewSetなので、テストは省略する。
