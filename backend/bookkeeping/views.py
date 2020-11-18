from rest_framework import generics
from rest_framework import mixins, viewsets
from .serializers import AccountSerializer,  \
                         TransactionSerializer
from .models import Account, Transaction
from rest_framework import status
from rest_framework.response import Response
from django.db import transaction
from django_filters import rest_framework as filters


class AccountListAPIView(generics.ListAPIView):

    serializer_class = AccountSerializer

    def get_queryset(self):
        return Account.objects.all().order_by('category__order')


class TransactionFilter(filters.FilterSet):
    """
    date_before, date_after, money_min, money_max等をクエリパラメータに指定して検索する
    max, min（以上・以下）どちらか片方だけでもOK / dateは一致検索もできる
    accountは、完全一致検索
    """

    # （注意）django-filter==2.0から、引数にはnameではなく、field_nameを使う。
    date = filters.DateFromToRangeFilter(field_name='date')
    account = filters.CharFilter(field_name='account', lookup_expr='exact')
    money = filters.RangeFilter(field_name='money')

    class Meta:
        model = Transaction
        fields = ['date',
                  'account',
                  'money']


class TransactionViewSet(mixins.ListModelMixin,
                         mixins.CreateModelMixin,
                         mixins.UpdateModelMixin,
                         viewsets.GenericViewSet):

    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = TransactionFilter

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
        """
            リクエストしてきたユーザーのデータだけを返す
            idsがあるのは、Updateの場合
        """

        if ids:
            return Transaction.objects\
                              .filter(user=self.request.user)\
                              .filter(id__in=ids)

        else:
            return Transaction.objects.filter(user=self.request.user)
            #   .order_by('-date', 'order', 'debitCredit')

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        # multiple object update　は通常ではサポートしていない。ListSerializerもカスタマイズする。
        # https://www.django-rest-framework.org/api-guide/serializers/#dealing-with-multiple-objects

        ids = [d["id"] for d in request.data]
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
