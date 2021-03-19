import os
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/


SECRET_KEY = os.environ.get('SECRET_KEY')

DEBUG = int(os.environ.get("DEBUG", default=0))

ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS").split(" ")

INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # 3rd party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'dj_rest_auth',
    'graphene_django',
    'imagekit',
    'storages',  # S3用

    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'dj_rest_auth.registration',

    'allauth.socialaccount',
    'allauth.socialaccount.providers.twitter',
    'allauth.socialaccount.providers.github',

    'django_filters',

    'django_cleanup',

    # Local
    'bookkeeping.apps.BookkeepingConfig',
    'ameba.apps.AmebaConfig',
    'users.apps.UsersConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    # 3rd
    'corsheaders.middleware.CorsMiddleware'
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',

            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': os.environ.get('DATABASE_ENGINE'),
        'NAME':  os.environ.get('DATABASE_DB'),
        'USER':  os.environ.get('DATABASE_USER'),
        'PASSWORD':  os.environ.get('DATABASE_PASSWORD'),
        'HOST':  os.environ.get('DATABASE_HOST'),
        'PORT':  os.environ.get('DATABASE_PORT'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# カスタムユーザーモデルを登録
AUTH_USER_MODEL = 'users.CustomUser'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        # 'rest_framework.authentication.TokenAuthentication',
        # 'dj_rest_auth.jwt_auth.JWTCookieAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',

    ],
}

SITE_ID = 1
REST_USE_JWT = True
# JWT_AUTH_COOKIE = 'jwt-auth'

SIMPLE_JWT = {
    'AUTH_HEADER_TYPES': ('JWT',),
    'ACCESS_TOKEN_LIFETIME': timedelta(days=3)
}

# all-auth / dj-rest-auth


AUTHENTICATION_BACKENDS = (
    "graphql_jwt.backends.JSONWebTokenBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
    "django.contrib.auth.backends.ModelBackend",

)

GRAPHENE = {'SCHEMA': 'config.schema.schema',
            'MIDDLEWARE': [
                'graphql_jwt.middleware.JSONWebTokenMiddleware',
                ],
            }


ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_EMAIL_VERIFICATION = 'none'

# all-auth ソーシャルログインでEmail認証をなくす
SOCIALACCOUNT_EMAIL_VERIFICATION = 'none'
SOCIALACCOUNT_EMAIL_REQUIRED = False
SOCIALACCOUNT_QUERY_EMAIL = True


# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/

LANGUAGE_CODE = 'ja'

TIME_ZONE = 'Asia/Tokyo'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/


USE_S3 = os.environ.get('USE_S3') == 'TRUE'

if USE_S3:
    # aws settings
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')

    # S3の設定で非公開にしている
    AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')

    # デフォルト（非公開）
    AWS_DEFAULT_ACL = None

    # 配信時にはS3の署名付きURLを使って、一定の有効期限内のみメディアファイルを参照できる

    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}

    ################
    # Static files #
    ################
    STATIC_LOCATION = 'static'
    STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{STATIC_LOCATION}/'
    # ↓collectstaticコマンドで、静的ファイルをS3 bucketに追加する設定
    STATICFILES_STORAGE = 'config.storage_backends.StaticStorage'

    ################
    # Media files #
    ################
    PRIVATE_MEDIA_LOCATION = 'media'
    PRIVATE_FILE_STORAGE = 'config.storage_backends.PrivateMediaStorage'
    MEDIA_DEFAULT_ACL = None

else:
    STATIC_URL = '/static/'
    STATIC_ROOT = os.path.join(BASE_DIR, 'static')

    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
    MEDIA_URL = '/media/'


PDF_UPLOAD_PATH = 'uploads/pdf'

# CORSの設定
CORS_ALLOWED_ORIGINS = [
    os.environ.get("FRONTEND_URL")
]

# http通信を強制的にhttpsにする
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

if DEBUG:
    def show_toolbar(request):
        return True

    INSTALLED_APPS += (
        'debug_toolbar',
    )
    MIDDLEWARE += (
        'debug_toolbar.middleware.DebugToolbarMiddleware',
    )
    DEBUG_TOOLBAR_CONFIG = {
        'SHOW_TOOLBAR_CALLBACK': show_toolbar,
    }
