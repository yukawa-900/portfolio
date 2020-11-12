from allauth.socialaccount.providers.twitter.views import TwitterOAuthAdapter
from dj_rest_auth.registration.views import SocialLoginView
from dj_rest_auth.social_serializers import TwitterLoginSerializer

from requests_oauthlib import OAuth1Session
from urllib.parse import parse_qsl
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import TwitterRequestTokenSerializer, \
                         TwitterAccessTokenSerializer
import environ
# from django.http.response import JsonResponse
# import json

BASE_DIR = environ.Path(__file__) - 2  # settings.pyの2階層上のディレクトリ

# environments
env = environ.Env()
env_file = str(BASE_DIR.path('.env'))
env.read_env(env_file)

base_url = 'https://api.twitter.com/'
request_token_url = base_url + 'oauth/request_token'
authenticate_url = base_url + 'oauth/authenticate'
access_token_url = base_url + 'oauth/access_token'
oauth_callback = "http://127.0.0.1:3000/socialauth-waiting"

consumer_key = env('TWITTER_CONSUMER_KEY')
consumer_secret = env('TWITTER_CONSUMER_SECRET')


class TwitterLogin(SocialLoginView):
    serializer_class = TwitterLoginSerializer
    adapter_class = TwitterOAuthAdapter


class TwitterRequestToken(views.APIView):
    permission_classes = (AllowAny,)

    def get(self, request, *args, **kwargs):
        # oauth_callback = request.args.get('oauth_callback')
        twitter = OAuth1Session(consumer_key, consumer_secret)
        response = twitter.post(
            request_token_url,
            params={'oauth_callback': oauth_callback}
        )

        request_token = dict(parse_qsl(response.content.decode("utf-8")))

        # リクエストトークンから認証画面のURLを生成
        authenticate_endpoint = f"{authenticate_url}?oauth_token={request_token['oauth_token']}"

        request_token.update({'authenticate_endpoint': authenticate_endpoint})

        serializer = TwitterRequestTokenSerializer(data=request_token)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.validated_data)


class TwitterAccessToken(views.APIView):

    permission_classes = (AllowAny,)

    def get(self, request, *args, **kwargs):
        oauth_token = request.GET['oauth_token']
        oauth_verifier = request.GET['oauth_verifier']

        twitter = OAuth1Session(
            consumer_key,
            consumer_secret,
            oauth_token,
            oauth_verifier,
        )

        response = twitter.post(
            access_token_url,
            params={'oauth_verifier': oauth_verifier}
        )

        access_tokens = dict(parse_qsl(response.content.decode("utf-8")))

        serializer = TwitterAccessTokenSerializer(data=access_tokens)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.validated_data)
