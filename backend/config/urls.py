from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from . import views
from django.conf.urls.static import static
from . import schema
from django.views.decorators.csrf import csrf_exempt
from .views import DRFAuthenticatedGraphQLView
from dj_rest_auth.registration.views import VerifyEmailView, ConfirmEmailView
from dj_rest_auth.views import PasswordResetConfirmView

urlpatterns = [
    path('admin/', admin.site.urls),

    path('dj-rest-auth/', include('dj_rest_auth.urls')),

    path(
        'dj-rest-auth/registration/account-confirm-email/<str:key>/',
        ConfirmEmailView.as_view(),
    ),  # /registration/の前に書く必要あり

    path(
        'rest-auth/password/reset/confirm/<slug:uidb64>/<slug:token>/',
        PasswordResetConfirmView.as_view(), name='password_reset_confirm'
    ),

    path('dj-rest-auth/registration/',
         include('dj_rest_auth.registration.urls')),

    path('dj-rest-auth/account-confirm-email/',
         VerifyEmailView.as_view(),
         name='account_email_verification_sent'),

    path('dj-rest-auth/twitter/', views.TwitterLogin.as_view(),
         name='twitter_login'),

    path('twitter/request_token/', views.TwitterRequestToken.as_view(),
         name='twitter_request_token'),

    path('twitter/access_token/', views.TwitterAccessToken.as_view(),
         name='twitter_access_token'),

    path('api/v1/bookkeeping/', include('bookkeeping.urls')),

    path('api/v1/ameba/',
         csrf_exempt(DRFAuthenticatedGraphQLView.as_view(
             graphiql=True, schema=schema.schema))),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls))] + urlpatterns
