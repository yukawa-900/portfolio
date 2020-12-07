from django.contrib import admin
from django.urls import path, include
from . import settings
from . import views
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    path('dj-rest-auth/', include('dj_rest_auth.urls')),

    path('dj-rest-auth/registration/',
         include('dj_rest_auth.registration.urls')),

    path('dj-rest-auth/twitter/', views.TwitterLogin.as_view(),
         name='twitter_login'),

    path('twitter/request_token/', views.TwitterRequestToken.as_view(),
         name='twitter_request_token'),

    path('twitter/access_token/', views.TwitterAccessToken.as_view(),
         name='twitter_access_token'),

    path('api/v1/', include('bookkeeping.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls))] + urlpatterns
