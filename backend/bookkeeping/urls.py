from django.urls import path, include
from rest_framework import routers
from .views import TransactionGroupViewSet, \
                   NextSlipNumAPIView, \
                   DepartmentViewSet, \
                   TaxViewSet, \
                   AccountViewSet, \
                   CurrencyViewSet, \
                   AccountCategoryAPIView
from django.conf.urls.static import static
from django.conf import settings

router = routers.SimpleRouter()
router.register('transactions', TransactionGroupViewSet, 'transaction_group')
router.register('accounts', AccountViewSet, 'accounts')
router.register('taxes', TaxViewSet, 'taxes')
router.register('departments', DepartmentViewSet, 'departments')
router.register('currencies', CurrencyViewSet, 'currencies')

app_name = 'bookkeeping'

urlpatterns = [
    path('', include(router.urls)),
    path('next_slip_num/',
         NextSlipNumAPIView.as_view(), name='next_slip_num'),
    path('account-categories/', AccountCategoryAPIView.as_view())
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
