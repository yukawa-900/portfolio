from rest_framework import views, status, generics, mixins, viewsets
from .serializers import AccountCategorySerializer, \
                         AccountSerializer, \
                         TransactionGroupSerializer, \
                         CreatedOnSerializer, \
                         TransactionPDFSerializer, \
                         DepartmentSerializer, \
                         TaxSerializer, \
                         CurrencySerializer, \
                         ExcludedCurrencySerializer, \
                         ExcludedDepartmentSerializer, \
                         ExcludedTaxSerializer, \
                         ExcludedAccountSerializer

from .models import AccountCategory, Account,  TransactionGroup, \
                    Department, Tax, Currency, \
                    ExcludedAccount, ExcludedCurrency, \
                    ExcludedTax, ExcludedDepartment
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Q
from django_filters import rest_framework as filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
import hashlib


def get_slip_num(request_date):
    return TransactionGroup.objects.filter(date=request_date) \
                                   .count() + 1


class TransactionGroupFilter(filters.FilterSet):
    """
    date_before, date_after, money_min, money_max等をクエリパラメータに指定して検索する
    max, min（以上・以下）どちらか片方だけでもOK / dateは一致検索もできる
    """

    def get_hashed_pdf_url(self, queryset, name, value):
        queryset.get(pdf=hashlib.sha256(value.encode()).hexdigest)

    # （注意）django-filter==2.0から、引数にはnameではなく、field_nameを使う。
    date = filters.DateFromToRangeFilter(field_name='date')
    slipNum = filters.NumberFilter(field_name='slipNum')
    pdf = filters.CharFilter(lookup_expr='startswith', field_name='pdf',
                             method='get_hashed_pdf_url')
    # account, moneyでの検索は、需要がない気がするので、いったんコメントアウト
    # account = filters.CharFilter(field_name='account', lookup_expr='exact')
    # money = filters.RangeFilter(field_name='money')

    class Meta:
        model = TransactionGroup
        fields = ['date',
                  'pdf',
                  'slipNum']


class TransactionGroupPagination(PageNumberPagination):
    page_size = 6


class TransactionGroupViewSet(viewsets.ModelViewSet):

    queryset = TransactionGroup.objects.all()
    serializer_class = TransactionGroupSerializer

    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = TransactionGroupFilter

    pagination_class = TransactionGroupPagination

    def get_queryset(self):
        """
            リクエストしてきたユーザーのデータだけを閲覧・編集可能
        """

        return TransactionGroup.objects.filter(user=self.request.user) \
                                       .order_by('-date', '-slipNum')

    def get_serializer_class(self):
        if self.action == 'upload_pdf':
            return TransactionPDFSerializer
        elif self.action == 'destroy':
            return CreatedOnSerializer
        else:
            return super().get_serializer_class()

    # ap1/v1/pk/upload-pdf
    @action(methods=['POST'], detail=True, url_path='upload-pdf')
    def upload_pdf(self, request, pk=None):
        """
            PDFアップロード用のアクション
        """
        transaction_group = self.get_object()
        serializer = self.get_serializer(
            transaction_group,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer=serializer,
                            date=request.data['date'])  # オーバーライド
        headers = self.get_success_headers(serializer.data)

        return Response(serializer.data, status=status.HTTP_201_CREATED,
                        headers=headers)

    def perform_create(self, serializer, date):
        serializer.save(user=self.request.user, slipNum=get_slip_num(date))

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """
          「Patchメソッドは不可」にするため、partialをオーバーライド
           部分更新(Patch)を許容すると、「借方・貸方の一致」を検証できなくなる。
        """
        instance = self.get_object()
        CreatedOnSerializer(data={'id': instance.id}).is_valid()
        # 1日以上前の取引は編集できないことを確認

        serializer = self.get_serializer(instance, data=request.data,
                                         partial=False)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # 親クラスのif文を、そのままコピー
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """
            DELETEにもバリデーションが必要なため、オーバーライド
        """
        id = str(self.get_object().id)
        serializer = self.get_serializer(data={"id": id})
        # idを渡すのではなく、データ自体を渡せばいいかも。
        # → 別のserializerを作る必要はなくなり、コードは綺麗になる
        # ※ただし余計なバリデーションが行われてしまう（内部で毎回条件分岐するのも冗長かな）
        serializer.is_valid(raise_exception=True)
        return super().destroy(request, *args, **kwargs)


class AccountCategoryListAPIView(generics.ListAPIView):

    serializer_class = AccountCategorySerializer

    def get_queryset(self):
        return AccountCategory.objects.all().order_by('order')


class AccountViewSetPagination(PageNumberPagination):
    page_size = 20


class SettingsUpdateListAPIView(viewsets.GenericViewSet,
                                mixins.ListModelMixin):
    """
        Currency, Tax に継承させる
        SettingsModelViewSetに継承させる
    """

    class Meta:
        abstract = True

    def get_queryset(self, items=None):
        assert self.excluded_model is not None, (
            'self.excluded_modelがviewsetに設定されていません。\
             ※これは開発者が後から加えたクラス変数であり、Djangoに組み込まれているものではありません。'
        )

        if self.action == 'update_excluded':

            return self.excluded_model.objects.filter(user=self.request.user) \
                                              .filter(item__in=items)

        user_or_none = Q(user=self.request.user) | Q(user=None)
        res = super().get_queryset()
        res_list = super().get_queryset()
        # ユーザーが存在しないもの(Tax, Currency)は、編集・追加できないようになっている

        if hasattr(self.queryset[0], 'user'):
            res_list = res.filter(user_or_none)
            res = res.filter(user=self.request.user)

        if self.action == 'list_active':
            """ユーザーが有効化している物だけ返す（取引画面用）"""
            lowercase_model_name = self.excluded_model.__name__.lower()
            key = lowercase_model_name + '__user'
            queryset_kwargs_for_exclude = {key: self.request.user}
            # 例 .exclude(taxexcluded_set__user=self.request.user)

            return res_list.exclude(**queryset_kwargs_for_exclude)

        if self.action == 'list':
            """アクティブではない物も含めて、返す（設定画面用）"""
            return res_list

        if self.action in ['update', 'retrieve', 'destroy']:
            return res

    def get_serializer_class(self):
        if self.action == 'update_excluded':
            assert self.excluded_serializer_class is not None, (
                'self.is_active_serializer_classがviewsetに設定されていません。\
                 ※これは開発者が後から加えたクラス変数であり、Djangoに組み込まれているものではありません。'
            )
            return self.excluded_serializer_class
        else:
            return super().get_serializer_class()

    # ap1/v1/active-list
    @action(methods=['GET'], detail=False, url_path='active-list')
    def list_active(self, request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    @action(methods=['PATCH'], detail=False, url_path='update-excluded')
    def update_excluded(self, request):
        items = [d["item"] for d in request.data]
        instances = self.get_queryset(items=items)
        serializer = self.get_serializer(
            instances,
            data=request.data,
            partial=True,
            many=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            status=status.HTTP_200_OK
        )

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)


class SettingsModelViewSet(SettingsUpdateListAPIView,
                           mixins.DestroyModelMixin,
                           mixins.RetrieveModelMixin,
                           mixins.CreateModelMixin,
                           mixins.UpdateModelMixin,):
    """
        Account, Departmentに継承させる
    """
    class Meta:
        abstract = True

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """
            デフォルトの項目を消去できないようにするため、シリアライザーを通す
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        return super().destroy(request, *args, **kwargs)


class TaxViewSet(SettingsUpdateListAPIView):
    """ExcludedのUpdateと、Listのみ"""
    queryset = Tax.objects.all()
    excluded_model = ExcludedTax
    serializer_class = TaxSerializer
    excluded_serializer_class = ExcludedTaxSerializer


class CurrencyViewSet(SettingsUpdateListAPIView):
    """ExcludedのUpdateと、Listのみ"""
    queryset = Currency.objects.all()
    excluded_model = ExcludedCurrency
    serializer_class = CurrencySerializer
    excluded_serializer_class = ExcludedCurrencySerializer


class AccountViewSet(SettingsModelViewSet):
    queryset = Account.objects.all()
    excluded_model = ExcludedAccount
    serializer_class = AccountSerializer
    excluded_serializer_class = ExcludedAccountSerializer
    pagination_class = AccountViewSetPagination

    def get_queryset(self, items=None):
        return super().get_queryset().order_by('category__order')


class DepartmentViewSet(SettingsModelViewSet):
    queryset = Department.objects.all()
    excluded_model = ExcludedDepartment
    excluded_serializer_class = ExcludedDepartmentSerializer
    serializer_class = DepartmentSerializer


class NextSlipNumAPIView(views.APIView):

    def get(self, request, request_date, *args, **kwargs):
        return Response({"nextSlipNum": get_slip_num(request_date)},
                        status.HTTP_200_OK)
