from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from datetime import date
from ..models import Transaction, TransactionGroup, Account, Category
from .data import sample_user
from django.core.files.uploadedfile import SimpleUploadedFile
# coverage run --source=. manage.py test --settings config.local_settings
import shutil
from django.test import override_settings
from freezegun import freeze_time
import copy
import tempfile


ACCOUNT_LIST_URL = reverse('bookkeeping:accounts')
TRANSACTION_GROUP_VIEWSET = reverse('bookkeeping:transaction_group-list')
MEDIA_ROOT = tempfile.mkdtemp()


def setup_categories_accounts():
    assets = Category.objects.create(name='資産', order=0)
    revenue = Category.objects.create(name='収益', order=1)

    Account.objects.create(name='現金', category=assets,
                           furigana='げんきん', code='1', description='')

    Account.objects.create(name='売上', category=revenue,
                           furigana='うりあげ', code='2', description='')


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

        sales = Account.objects.get(name='売上')
        cash = Account.objects.get(name='現金')

        expected_json_list = [
            {
                'id': str(cash.id),
                'name': cash.name,
                'furigana': cash.furigana,
                'categoryName': cash.category.name,
                'description': cash.description
            },
            {
                'id': str(sales.id),
                'name': sales.name,
                'furigana': sales.furigana,
                'categoryName': sales.category.name,
                'description': sales.description
            }
        ]

        """
            テストする度に、なぜかリスト内の順番が入れ替わり、assertJSONEqualがまれにFAILEDとなる
            ・これはTransactionの方では起きない問題である
            ・get_querysetにorder_byをつけても解決できなかった
            ・(Browsable APIでは、この問題は生じていない)
            → 時間をかけて解決すべき問題ではないと判断し、JSONのチェックはスキップした
        """

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, expected_json_list)

    def test_login_required(self):
        """ログインしていないユーザーが、アクセスできないことをテストする"""
        response = self.client.get(ACCOUNT_LIST_URL)
        self.assertEqual(response.status_code, 403)


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class TestPrivateTransactionGroupViewset(APITestCase):
    """ログイン済ユーザーへのTransactionViewsetをテストする"""

    maxDiff = None

    today_str = ''
    cash = ''
    sales = ''
    transaction_group = ''
    transaction_cash = ''
    transaction_sales = ''
    base_expected_json = ''

    @classmethod
    def tearDownClass(cls):
        """
            作成したPDF等のファイルを、テスト後に消去する
        """
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)
        super().tearDownClass()

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        cls.today_str = date.today().strftime('%Y-%m-%d')

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

        with open('bookkeeping/tests/sample.pdf', 'rb') as f:
            upload_file = SimpleUploadedFile(
               f.name,
               f.read(),
               content_type='multipart/form-data',
               )
            self.transaction_group = TransactionGroup.objects.create(
                                            user=self.user,
                                            date=date.today(),
                                            slipNum=1,
                                            pdf=upload_file,
                                            memo='')

            # 取引を用意
            self.transaction_cash = Transaction.objects.create(
                                    debitCredit=0,
                                    account=self.cash, money=2000,
                                    order=0, group=self.transaction_group)

            self.transaction_sales = Transaction.objects.create(
                                    debitCredit=1,
                                    account=self.sales, money=2000,
                                    order=1, group=self.transaction_group)

        self.base_params = {
            "id": str(self.transaction_group.id),
            "date": self.today_str,
            "pdf": None,
            "memo": "hey",
            "transactions": [
                {
                    "debitCredit": 0,
                    "account": str(self.cash.id),
                    "money": 999,
                    "order": 0
                },
                {
                    "debitCredit": 1,
                    "account": str(self.sales.id),
                    "money": 999,
                    "order": 1
                }
            ]
        }

        # PUT/DELETE用のURLを用意
        self.TRANSACTION_VIEWSET_DETAIL_URL = reverse(
            'bookkeeping:transaction_group-detail',
            kwargs={'pk': str(self.transaction_group.id)}
            )

        # 基本となるJSONデータを作成
        self.base_expected_json = {
            "count": 1,
            "next": None,
            "previous": None,

            "results": [
                {
                    "id": str(self.transaction_group.id),
                    "date": self.transaction_group.date.strftime('%Y-%m-%d'),
                    "slipNum": self.transaction_group.slipNum,
                    "pdf": 'http://testserver/media/' +
                           str(self.transaction_group.pdf),
                    "memo": self.transaction_group.memo,
                    "createdOn": self.transaction_group.createdOn
                    .strftime('%Y-%m-%d'),

                    "transactions": [
                        {
                            "debitCredit": self.transaction_cash.debitCredit,
                            "account": str(self.cash.id),
                            "accountName": "現金",
                            "money": self.transaction_cash.money,
                            "order": self.transaction_cash.order
                        },
                        {
                            "debitCredit": self.transaction_sales.debitCredit,
                            "account": str(self.sales.id),
                            "accountName": "売上",
                            "money": self.transaction_sales.money,
                            "order": self.transaction_sales.order
                        },
                    ]
                }
            ]
        }

    def test_list_success(self):
        """GETのテスト（正常系）"""

        response = self.client.get(
            f'{TRANSACTION_GROUP_VIEWSET}?date_after={self.today_str}'
            )

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, self.base_expected_json)

    def test_create_success(self):

        """Transaction登録APIへのPOSTリクエスト（正常系）"""

        response = self.client.post(TRANSACTION_GROUP_VIEWSET,
                                    self.base_params,
                                    content_type='json')

        self.assertEqual(response.status_code, 201)
        # データベースの状態 POSTした分＋setUp分 = 2
        self.assertEqual(TransactionGroup.objects.count(), 2)

        created_transaction_group = TransactionGroup.objects.get(
                                        slipNum=2,
                                        date=date.today()
                                        )
        created_transaction_cash = Transaction.objects.get(account=self.cash,
                                                           money=999)
        created_transaction_sales = Transaction.objects.get(account=self.sales,
                                                            money=999)

        expected_json = {
                "id": str(created_transaction_group.id),
                "date": created_transaction_group.date.strftime('%Y-%m-%d'),
                "slipNum": created_transaction_group.slipNum,
                "pdf": None,
                "memo": created_transaction_group.memo,
                "createdOn": created_transaction_group.createdOn
                .strftime('%Y-%m-%d'),

                "transactions": [
                    {
                        "debitCredit": created_transaction_cash.debitCredit,
                        "account": str(self.cash.id),
                        "accountName": "現金",
                        "money": created_transaction_cash.money,
                        "order": created_transaction_cash.order
                    },
                    {
                        "debitCredit": created_transaction_sales.debitCredit,
                        "account": str(self.sales.id),
                        "accountName": "売上",
                        "money": created_transaction_sales.money,
                        "order": created_transaction_sales.order
                    },
                ]
            }

        self.assertJSONEqual(response.content, expected_json)

    def test_create_failed(self):
        """ POST（異常系) """

        few_transactions = copy.deepcopy(self.base_params)
        few_transactions['transactions'].pop()

        invalid_debit_credit = copy.deepcopy(self.base_params)  # 借方・貸方不一致
        invalid_debit_credit['transactions'].append({
                    "debitCredit": 0,
                    "account": str(self.cash.id),
                    "money": 1,
                    "order": 3
                },)

        invalid_order_1 = copy.deepcopy(self.base_params)  # orderが順番になっていない
        invalid_order_1['transactions'][1]['order'] = 100

        invalid_order_2 = copy.deepcopy(self.base_params)  # orderが0から始まらない
        invalid_order_2['transactions'][0]['order'] = 2

        invalid_negative_money = copy.deepcopy(self.base_params)  # 金額が負の値
        invalid_negative_money['transactions'][0]['money'] = -1000

        test_patterns = [
            few_transactions,
            invalid_debit_credit,
            invalid_order_1,
            invalid_order_2,
            invalid_negative_money
        ]

        for params in test_patterns:
            with self.subTest(params):
                response = self.client.post(TRANSACTION_GROUP_VIEWSET,
                                            params,
                                            format='json')
                self.assertEqual(Transaction.objects.count(), 2)
                self.assertEqual(TransactionGroup.objects.count(), 1)
                self.assertEqual(response.status_code, 400)

    def test_delete_success(self):
        """ DELETE（正常系）"""
        response = self.client.delete(self.TRANSACTION_VIEWSET_DETAIL_URL)
        self.assertEqual(Transaction.objects.count(), 0)
        self.assertEqual(TransactionGroup.objects.count(), 0)
        self.assertEqual(response.status_code, 204)

    @freeze_time('2016-01-01')
    def test_delete_failed(self):
        """
        その日に作成した分しか、消去できないことをテスト
        """
        response = self.client.delete(self.TRANSACTION_VIEWSET_DETAIL_URL)
        self.assertEqual(Transaction.objects.count(), 2)
        self.assertEqual(TransactionGroup.objects.count(), 1)
        self.assertEqual(response.status_code, 400)

    def test_update_success(self):
        """ 更新（正常系）"""
        response = self.client.put(self.TRANSACTION_VIEWSET_DETAIL_URL,
                                   self.base_params,
                                   format='json')
        # print(response.data)
        self.assertEqual(Transaction.objects.count(), 2)
        self.assertEqual(TransactionGroup.objects.count(), 1)
        self.assertEqual(response.status_code, 200)
