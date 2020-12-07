from django.urls import reverse
from rest_framework.test import APITestCase
from datetime import date
from ..models import Transaction, TransactionGroup, Account, ExcludedAccount
from .data import user, transaction_group, transaction_cash, \
                  transaction_sales, department, tax, currency, \
                  transactions_base_params, sales, cash, assets, revenue
# from django.core.files.uploadedfile import SimpleUploadedFile
# from django.core.files import File
# from django.core.files.base import ContentFile
# coverage run --source=. manage.py test --settings config.local_settings
from django.test import override_settings
from freezegun import freeze_time
import copy
import tempfile
# import mock
# import os


ACCOUNT_VIEWSET_URL = reverse("bookkeeping:accounts-list")
ACCOUNT_ACTIVE_LIST_URL = ACCOUNT_VIEWSET_URL + "active-list/"
ACCOUNT_UPDATE_EXCLUSTION = ACCOUNT_VIEWSET_URL + "update-exclusion/"
TRANSACTION_GROUP_VIEWSET_URL = reverse("bookkeeping:transaction_group-list")
CURRENCY_VIEWSET_URL = reverse("bookkeeping:currencies-list")
SLIP_NUM_URL = reverse("bookkeeping:next_slip_num")
MEDIA_ROOT = tempfile.mkdtemp()


def get_account_detail_url(pk):
    return reverse(
        "bookkeeping:accounts-detail",
        kwargs={"pk": pk}
        )


def get_pdf_upload_url(pk):
    """PDFアップロード用のURLを返す"""
    return reverse(
        "bookkeeping:transaction_group-upload-pdf",
        kwargs={"pk": pk}
    )


class TestPrivateAccountViewSet(APITestCase):
    """"AccountListViewのテスト"""

    maxDiff = None

    @classmethod
    def setUpTestData(cls):
        cls.user = user()

        cls.assets = assets()
        cls.revenue = revenue()

        cls.sales = sales(cls)
        cls.cash = cash(cls)

        cls.base_create_params = {
            "name": "売上-中古",
            "code": "A123",
            "furigana": "うりあげちゅうこ",
            "description": "これはサンプルです",
            "category": str(cls.revenue.id)
        }

        cls.my_account = Account.objects.create(name="おにぎりせんべい",
                                                code="ORIGINAL",
                                                furigana="てすと",
                                                description="てすと",
                                                category=cls.assets,
                                                user=cls.user)

        cls.expected_json_list = [
            {
                "id": str(cls.my_account.id),
                "categoryName": cls.my_account.category.name,
                "name": cls.my_account.name,
                "code": cls.my_account.code,
                "furigana": cls.my_account.furigana,
                "description": cls.my_account.description,
                "category": str(cls.my_account.category.id),
                "user": str(cls.my_account.user.id)
            },
            {
                "id": str(cls.cash.id),
                "categoryName": cls.cash.category.name,
                "name": cls.cash.name,
                "code": cls.cash.code,
                "furigana": cls.cash.furigana,
                "description": cls.cash.description,
                "category": str(cls.cash.category.id),
                "user": None
            },
            {
                "id": str(cls.sales.id),
                "categoryName": cls.sales.category.name,
                "name": cls.sales.name,
                "code": cls.sales.code,
                "furigana": cls.sales.furigana,
                "description": cls.sales.description,
                "category": str(cls.sales.category.id),
                "user": None
            }
        ]

    def setUp(self):
        # ログイン
        self.client.force_authenticate(self.user)

    def exclude_item(self, item):
        ExcludedAccount.objects.create(user=self.user, item=item)

    def test_list_success(self):
        """アカウント一覧APIへのGETリクエスト"""
        response = self.client.get(ACCOUNT_VIEWSET_URL)

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, self.expected_json_list)

    def test_active_list_success(self):
        """勘定科目(正常系):active-listのテスト。ExcludedAccountが含まれないことを確認"""

        # my_accountを除外
        self.exclude_item(self.my_account)
        expected_json_list = copy.deepcopy(self.expected_json_list)

        for json in expected_json_list:
            if json["id"] == str(self.my_account.id):
                # 予想されるレスポンスからも、現金を除外
                expected_json_list.remove(json)

        response = self.client.get(ACCOUNT_ACTIVE_LIST_URL)
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, expected_json_list)

    def test_create_new_excluded_item(self):
        """勘定科目:update-exclusion(正常系) - 無効化"""
        params = [{
            "item": str(self.cash.id),
            "isActive": False
        }]

        # 現金を無効化
        response = self.client.patch(ACCOUNT_UPDATE_EXCLUSTION,
                                     params,
                                     format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(ExcludedAccount.objects.count(), 1)
        self.assertTrue(ExcludedAccount.objects.get(item=self.cash.id))

    def test_update_multiple_exlusion(self):
        """update-exclusion（正常系) 複数アイテムを更新"""
        self.exclude_item(self.my_account)  # my_accountを無効化
        self.exclude_item(self.cash)  # cashを無効化

        params = [
            {
                "item": str(self.cash.id),  # cashを有効化
                "isActive": True
            },
            {
                "item": str(self.my_account.id),  # my_accountを無効 → 無効（現状維持)
                "isActive": False
            },
            {
                "item": str(self.sales.id),
                "isActive": False
            }
        ]

        # 現金を有効化
        response = self.client.patch(ACCOUNT_UPDATE_EXCLUSTION,
                                     params,
                                     format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(ExcludedAccount.objects.count(), 2)
        self.assertFalse(ExcludedAccount.objects.filter(item=self.cash.id))

    def test_update_exclusion_failed(self):
        """update-exclusion(異常系): 同じ項目を同時に2度変更"""

        params = [
            {
                "item": str(self.cash.id),
                "isActive": False
            },
            {
                "item": str(self.cash.id),
                "isActive": True
            }
        ]

        response = self.client.patch(ACCOUNT_UPDATE_EXCLUSTION,
                                     params,
                                     format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(ExcludedAccount.objects.count(), 0)

    def test_create_success(self):
        """勘定科目ViewSet: POST（正常系)"""

        response = self.client.post(ACCOUNT_VIEWSET_URL,
                                    self.base_create_params,
                                    format="json")

        created_account = Account.objects.get(code="A123")
        expected_json = copy.deepcopy(self.base_create_params)
        expected_json["id"] = str(created_account.id)
        expected_json["user"] = str(created_account.user.id)
        expected_json["categoryName"] = created_account.category.name

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Account.objects.count(), 4)
        self.assertJSONEqual(response.content, expected_json)

    def test_create_failed(self):

        """勘定科目ViewSet: POST（異常系)"""
        params = copy.deepcopy(self.base_create_params)

        invalid_code_duplicate = copy.deepcopy(params)  # codeの重複
        invalid_code_duplicate["code"] = self.cash.code

        invalid_code_character = copy.deepcopy(params)
        invalid_code_character["code"] = "漢字はNG"

        invalid_blank_category = copy.deepcopy(params)
        invalid_blank_category["category"] = ""

        patterns = [
            invalid_code_duplicate,
            invalid_code_character,
            invalid_blank_category
        ]

        for params in patterns:
            with self.subTest(params):

                response = self.client.post(ACCOUNT_VIEWSET_URL,
                                            params,
                                            format="json")
                self.assertEqual(response.status_code, 400)
                self.assertEqual(Account.objects.count(), 3)

    def test_update_success(self):
        """勘定科目: PUT（正常系) """

        params = {
            "id": str(self.my_account.id),
            "name": "現金過不足",  # 変更
            "code": "DEFAULT5",  # 変更
            "furigana": "げんきんかぶそく",  # 変更
            "description": "帳簿と実際の有高の不一致を解消するときに使う",  # 変更
            "category": str(self.revenue.id)  # 変更
        }

        url = get_account_detail_url(str(self.my_account.id))
        response = self.client.put(url,
                                   params,
                                   format="json")

        expected_json = copy.deepcopy(params)
        expected_json["user"] = str(self.user.id)
        expected_json["categoryName"] = self.revenue.name

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Account.objects.count(), 3)
        self.assertJSONEqual(response.content, expected_json)

    def test_update_failed(self):
        """勘定科目: PUT（異常系）user = nullのAccountを更新できないことをテスト"""

        params = {
            "id": str(self.sales.id),
            "name": self.sales.name,
            "code": self.sales.code,
            "furigana": self.sales.furigana,
            "category": str(self.sales.category.id),
            "description": "これはサンプルの説明です"  # 変更
        }

        url = get_account_detail_url(params["id"])
        response = self.client.put(url,
                                   params,
                                   format="json")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(Account.objects.count(), 3)

    def test_delete_success(self):
        """勘定科目:DELETE（正常系）"""
        url = get_account_detail_url(str(self.my_account.id))
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Account.objects.count(), 2)

    def test_delete_failed(self):
        """勘定科目:DELETE（異常系）"""
        url = get_account_detail_url(str(self.sales.id))
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Account.objects.count(), 3)


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class TestPrivateTransactionGroupViewset(APITestCase):
    """ログイン済ユーザーへのTransactionViewsetをテストする"""

    maxDiff = None

    def upload_pdf(self, filename):
        url = get_pdf_upload_url(pk=str(self.transaction_group.id))
        with open(f'bookkeeping/tests/files/{filename}', 'rb') as pdf_file:
            return self.client.post(url, {"pdf": pdf_file}, format="multipart")

    @classmethod
    def setUpTestData(cls):

        cls.user = user()
        cls.assets = assets()
        cls.revenue = revenue()

        # 勘定科目を取り出す
        cls.cash = cash(cls)
        cls.sales = sales(cls)
        cls.today_str = date.today().strftime("%Y-%m-%d")
        cls.currency = currency()
        cls.tax = tax()

        cls.transaction_group = transaction_group(cls)

        # 取引を用意
        cls.transaction_cash = transaction_cash(cls)
        cls.transaction_sales = transaction_sales(cls)
        cls.department = department(cls)
        cls.base_post_params = transactions_base_params(cls)

        # PUT/DELETE用のURLを用意
        cls.TRANSACTION_VIEWSET_DETAIL_URL = reverse(
            "bookkeeping:transaction_group-detail",
            kwargs={"pk": str(cls.transaction_group.id)}
            )

        cls.base_output_json = {
                "id": str(cls.transaction_group.id),
                "date": cls.transaction_group.date.strftime("%Y-%m-%d"),
                "slipNum": cls.transaction_group.slipNum,
                "pdf": None,
                "memo": cls.transaction_group.memo,
                "createdOn": cls.transaction_group.createdOn
                .strftime("%Y-%m-%d"),
                "currency": None,
                "department": None,
                "transactions": [
                    {
                        "debitCredit": cls.transaction_cash.debitCredit,
                        "account": str(cls.transaction_cash.account.id),
                        "accountName": cls.transaction_cash.account.name,
                        "money": str(cls.transaction_cash.money),
                        "order": cls.transaction_cash.order,
                        "tax": None
                    },
                    {
                        "debitCredit": cls.transaction_sales.debitCredit,
                        "account": str(cls.transaction_sales.account.id),
                        "accountName": cls.transaction_sales.account.name,
                        "money": str(cls.transaction_sales.money),
                        "order": cls.transaction_sales.order,
                        "tax": None
                    }
                ]
            }

        cls.base_input_json = copy.deepcopy(cls.base_output_json)
        for transac in cls.base_input_json["transactions"]:
            transac["money"] = int(transac["money"])

    def setUp(self):
        # ログイン
        self.client.force_authenticate(self.user)

        # 基本となるJSONデータを作成

    def test_list_success(self):
        """GETのテスト（正常系）"""

        response = self.client.get(
            f"{TRANSACTION_GROUP_VIEWSET_URL}?date_after={self.today_str}"
            )

        expected_json = {
            "count": 1,
            "next": None,
            "previous": None,

            "results": [
                self.base_output_json
            ]
        }

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, expected_json)

    def test_create_success(self):

        """Transaction登録APIへのPOSTリクエスト（正常系）"""

        # departmentあり
        valid_department = copy.deepcopy(self.base_post_params)
        valid_department["department"] = str(self.department.id)

        # currencyあり
        valid_currency = copy.deepcopy(self.base_post_params)
        valid_currency["code"] = str(self.currency.code)

        # taxあり
        valid_tax = copy.deepcopy(self.base_post_params)
        valid_tax["transactions"][0]["tax"] = str(self.tax.id)

        # メモがnull
        valid_memo = copy.deepcopy(self.base_post_params)
        valid_memo["memo"] = None

        test_patterns = [
            self.base_post_params,
            valid_department,
            valid_currency,
            valid_tax,
            valid_memo,
        ]

        count = 2
        for params in test_patterns:
            with self.subTest(params):
                response = self.client.post(TRANSACTION_GROUP_VIEWSET_URL,
                                            params,
                                            format="json")

                self.assertEqual(response.status_code, 201)
                # データベースの状態 POSTした分＋setUp分
                self.assertEqual(TransactionGroup.objects.count(), count)

                created_transaction_group = TransactionGroup.objects.get(
                                                slipNum=count,
                                                date=date.today()
                                                )
                count += 1

                created_transaction_cash = \
                    Transaction.objects.get(group=created_transaction_group,
                                            account=self.cash)

                created_transaction_sales = \
                    Transaction.objects.get(group=created_transaction_group,
                                            account=self.sales)

                expected_json = {
                    "id": str(created_transaction_group.id),
                    "date": created_transaction_group.date
                    .strftime("%Y-%m-%d"),
                    "slipNum": created_transaction_group.slipNum,
                    "pdf": None,
                    "memo": created_transaction_group.memo,
                    "createdOn": created_transaction_group.createdOn
                    .strftime("%Y-%m-%d"),

                    "department": str(created_transaction_group.department.id)
                    if created_transaction_group.department else None,

                    "currency": str(created_transaction_group.currency.id)
                    if created_transaction_group.currency else None,

                    "transactions": [
                        {
                            "debitCredit": created_transaction_cash
                            .debitCredit,

                            "account": str(self.cash.id),
                            "accountName":
                                created_transaction_cash.account.name,
                            "money": str(created_transaction_cash.money),
                            "order": created_transaction_cash.order,
                            "tax": str(created_transaction_cash.tax.id)
                            if created_transaction_cash.tax else None,
                        },
                        {
                            "debitCredit": created_transaction_sales
                            .debitCredit,

                            "account": str(self.sales.id),
                            "accountName":
                                created_transaction_sales.account.name,
                            "money": str(created_transaction_sales.money),
                            "order": created_transaction_sales.order,
                            "tax": str(created_transaction_sales.tax.id)
                            if created_transaction_sales.tax else None,
                        }
                    ]
                }

                self.assertJSONEqual(response.content, expected_json)

    def test_create_failed(self):
        """ POST（異常系) """

        few_transactions = copy.deepcopy(self.base_post_params)
        few_transactions["transactions"].pop()

        invalid_debit_credit = copy.deepcopy(self.base_post_params)  # 借方・貸方不一致
        invalid_debit_credit["transactions"].append({
                    "debitCredit": 0,
                    "account": str(self.cash.id),
                    "money": 1,
                    "order": 3
                },)

        # orderが順番になっていない
        invalid_order_1 = copy.deepcopy(self.base_post_params)
        invalid_order_1["transactions"][1]["order"] = 100

        # orderが順番になっていない
        invalid_order_2 = copy.deepcopy(self.base_post_params)
        invalid_order_2["transactions"][0]["order"] = 2

        # 金額が負の値
        invalid_negative_money = copy.deepcopy(self.base_post_params)
        invalid_negative_money["transactions"][0]["money"] = -1000

        test_patterns = [
            few_transactions,
            invalid_debit_credit,
            invalid_order_1,
            invalid_order_2,
            invalid_negative_money
        ]

        for params in test_patterns:
            with self.subTest(params):
                response = self.client.post(TRANSACTION_GROUP_VIEWSET_URL,
                                            params,
                                            format="json")
                self.assertEqual(Transaction.objects.count(), 2)
                self.assertEqual(TransactionGroup.objects.count(), 1)
                self.assertEqual(response.status_code, 400)

    def test_delete_success(self):
        """ DELETE（正常系）"""
        response = self.client.delete(self.TRANSACTION_VIEWSET_DETAIL_URL)
        self.assertEqual(Transaction.objects.count(), 0)
        self.assertEqual(TransactionGroup.objects.count(), 0)
        self.assertEqual(response.status_code, 204)

    @freeze_time("2016-01-01")
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
        params = copy.deepcopy(self.base_input_json)
        message = "更新しました"
        params["memo"] = message

        output_json = copy.deepcopy(self.base_output_json)
        output_json["memo"] = message

        response = self.client.put(self.TRANSACTION_VIEWSET_DETAIL_URL,
                                   params,
                                   format="json")

        self.assertEqual(Transaction.objects.count(), 2)
        self.assertEqual(TransactionGroup.objects.count(), 1)
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, output_json)

    def test_update_failed(self):
        """更新（異常系）"""

        params = copy.deepcopy(self.base_input_json)

        invalid_money_1 = copy.deepcopy(params)
        invalid_money_1["transactions"][0]["money"] = 9

        invalid_money_2 = copy.deepcopy(params)
        invalid_money_2["transactions"][0]["money"] = 100000000000000

        invalid_order = copy.deepcopy(params)
        invalid_order["transactions"][0]["order"] = 99

        test_patterns = [
            invalid_money_1,
            invalid_money_2,
            invalid_order
        ]

        for params in test_patterns:
            with self.subTest(params):
                response = self.client.post(TRANSACTION_GROUP_VIEWSET_URL,
                                            params,
                                            format="json")
                self.assertEqual(Transaction.objects.count(), 2)
                self.assertEqual(TransactionGroup.objects.count(), 1)
                self.assertEqual(response.status_code, 400)

    @freeze_time("2016-01-01")
    def test_update_failed_created_on(self):
        """更新（異常系）更新できるのは記入した当日分のみ"""

        params = copy.deepcopy(self.base_input_json)
        message = "更新しました"
        params["memo"] = message

        response = self.client.put(self.TRANSACTION_VIEWSET_DETAIL_URL,
                                   params,
                                   format="json")

        self.assertEqual(Transaction.objects.count(), 2)
        self.assertEqual(TransactionGroup.objects.count(), 1)
        self.assertEqual(response.status_code, 400)

    def test_upload_pdf_success(self):
        """PDFアップロードのテスト(正常系):299KBのファイル"""

        response = self.upload_pdf("sample.pdf")
        self.assertEqual(response.status_code, 200)

    def test_upload_pdf_invalid_suffix(self):
        """PDFアップロードのテスト(異常系) - 拡張子 / サイズ"""
        patterns = ["sample.csv", "large_size.pdf"]

        for file_name in patterns:
            response = self.upload_pdf(file_name)
            self.assertEqual(response.status_code, 400)

    def test_filter_by_pdf(self):
        """PDFの名前で検索できることを確認"""

        file_name = "sample.pdf"
        self.upload_pdf(file_name)  # self.transaction_group に対し、pdfを追加
        print(TRANSACTION_GROUP_VIEWSET_URL + f"?pdf={file_name}")
        response = self.client.get(
            TRANSACTION_GROUP_VIEWSET_URL + f"?pdf={file_name}"
            )

        self.assertEqual(response.status_code, 200)


class TestNetxSlipNumAPIView(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.today_str = date.today().strftime("%Y-%m-%d")
        cls.user = user()

    def setUp(self):
        self.client.force_authenticate(self.user)

    def test_first_slipNum(self):
        response = self.client.get(SLIP_NUM_URL)
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, {"nextSlipNum": 1})

    def test_second_slipNum(self):
        transaction_group(self)
        response = self.client.get(SLIP_NUM_URL)
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, {"nextSlipNum": 2})


class TestCurrencyAPIView(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.currency = currency()
        cls.user = user()

    def setUp(self):
        self.client.force_authenticate(self.user)

    def test_list_success(self):
        """通貨一覧（正常系）"""
        response = self.client.get(CURRENCY_VIEWSET_URL)

        expected_json = [{
            "code": self.currency.code,
            "title": self.currency.title
        }]

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, expected_json)


class TestPublicAPIView(APITestCase):

    def test_public_view(self):

        patterns = [
            TRANSACTION_GROUP_VIEWSET_URL,
            ACCOUNT_VIEWSET_URL,
            CURRENCY_VIEWSET_URL
        ]

        for url in patterns:
            with self.subTest(url):
                response = self.client.get(url)
                self.assertEqual(response.status_code, 403)
