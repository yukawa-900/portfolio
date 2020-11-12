from rest_framework import generics
from rest_framework import mixins, viewsets, filters
from .serializers import AccountSerializer,  \
                         TransactionSerializer
from .models import Account, Transaction
from rest_framework import status
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.db import transaction


class AccountListAPIView(generics.ListAPIView):

    queryset = Account.objects.all()
    serializer_class = AccountSerializer


class TransactionViewSet(mixins.CreateModelMixin,
                         mixins.ListModelMixin,
                         mixins.UpdateModelMixin,
                         viewsets.GenericViewSet):

    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['date']

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # 唯一の変更点: many=isinstance(request.data, list) を追加
        serializer = self.get_serializer(data=request.data,
                                         many=True)
        # 簿記アプリの場合、「1取引だけ(借方or貸方のみ)CREATE」はありえないため、many=Trueで良い。

        """
            対応するPOSTデータ
            1. many = Trueのみ(公式サイト)
                ・[{ object1 }]
                ・[{object1, object2}]

            2. many = isinstance(request.data, list)
                ・[{ object1 }]
                ・[{object1, object2}]
                ・{ object1 }
        """

        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED,
                        headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self, ids=None):

        if ids:
            return Transaction.objects \
                              .filter(user=self.request.user) \
                              .filter(id__in=ids)
        else:
            return Transaction.objects.filter(user=self.request.user)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        # multiple object update　は通常ではサポートしていない。ListSerializerもカスタマイズする。
        # https://www.django-rest-framework.org/api-guide/serializers/#dealing-with-multiple-objects

        ids = validate_id(request.data)
        instances = self.get_queryset(ids=ids)
        serializer = self.get_serializer(instances,  # 更新対象のモデルオブジェクト
                                         data=request.data,  # ユーザーからのデータ
                                         partial=False,  # Patchメソッドは不可
                                         many=True)  # 必ずリスト型でdataを渡す

        # 部分更新(Patch)を許容すると、「借方・貸方の一致」を検証できなくなる。

        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instances, '_prefetched_objects_cache', None):
            # if文：親クラスの記述を、そのままコピーした
            instances._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


def validate_id(data):

    if isinstance(data, list):
        id_list = [d["id"] for d in data]

        if len(id_list) != len(set(id_list)):
            raise ValidationError("1つの取引を同時に2回以上変更しようとしています。どれが正しいのか分かりません。")

        return id_list

    else:  # 更新対象が1つの場合
        return [data]


""" UPDATE用検証データ
[
    {
        "id": "9a85558d-8244-4110-a1d7-fd21779735ec",
        "debitCredit": 1,
        "account": "dc6e3c0c-2845-4841-beb0-5714e9b2cd01",
        "money": 2000,
        "date": "2020-11-12",
        "order": 0,
        "memo": null
    },
    {
        "id": "e613cfd8-2dea-4f8d-940d-b18bd6f172bc",
        "debitCredit": 0,
        "account": "dc6e3c0c-2845-4841-beb0-5714e9b2cd01",
        "money": 2000,
        "date": "2020-11-12",
        "order": 0,
        "memo": null,
    }
]
"""


""" POSTするサンプル（リストを使う点に注意！）
[
    {
        "debitCredit": 1,
        "account": "7d52fb22-8e8a-4cd9-b36a-e40019b95452",
        "money": 2000,
        "date": "2020-11-11",
        "order": 0,
        "memo": ""
    },
    {
        "debitCredit": 0,
        "account": "07808f82-42c4-40aa-800c-d5816ef26a66",
        "money": 2000,
        "date": "2020-11-11",
        "order": 0,
        "memo": ""
    }
]
"""
