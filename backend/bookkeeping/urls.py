from django.urls import path, include
from rest_framework import routers
from .views import TransactionViewSet, AccountListAPIView

router = routers.SimpleRouter()
router.register('transactions', TransactionViewSet)

app_name = 'bookkeeping'
urlpatterns = [
    path('', include(router.urls), name='transactions'),
    path('accounts/', AccountListAPIView.as_view(), name='accounts'),
]
