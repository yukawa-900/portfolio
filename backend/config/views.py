from allauth.socialaccount.providers.twitter.views import TwitterOAuthAdapter
from dj_rest_auth.registration.views import SocialLoginView
from dj_rest_auth.social_serializers import TwitterLoginSerializer
from django.conf import settings
from requests_oauthlib import OAuth1Session
from urllib.parse import parse_qsl
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import TwitterRequestTokenSerializer, \
                         TwitterAccessTokenSerializer
# from django.http.response import JsonResponse
# import json
import rest_framework
# from graphene_django.views import GraphQLView
from rest_framework.decorators import api_view
from rest_framework.decorators import authentication_classes
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.settings import api_settings
from graphene_file_upload.django import FileUploadGraphQLView
import os

base_url = 'https://api.twitter.com/'
request_token_url = base_url + 'oauth/request_token'
authenticate_url = base_url + 'oauth/authenticate'
access_token_url = base_url + 'oauth/access_token'
oauth_callback = os.environ.get("FRONTEND_URL") + "/socialauth-waiting"

consumer_key = os.environ.get('TWITTER_CONSUMER_KEY')
consumer_secret = os.environ.get('TWITTER_CONSUMER_SECRET')


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
        authenticate_endpoint = \
            f"{authenticate_url}?oauth_token={request_token['oauth_token']}"

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


class DRFAuthenticatedGraphQLView(FileUploadGraphQLView):
    """
        GraphQLで、rest frameworkの認証を使うために、GraphQLViewをオーバーライド
        参照元: https://github.com/graphql-python/graphene/issues/249

        継承関係: GraphQLView ← FileUploadGraphQLView ← DRFAuthenticatedGrqphQLView
        FileUploadGraphQLViewで、parse_bodyがオーバーライドされ、fileを受け取れるようになっている
    """

    @classmethod
    def as_view(cls, *args, **kwargs):
        view = super().as_view(*args, **kwargs)
        # if settings.DEBUG is False:
        #     view = permission_classes((IsAuthenticated,))(view)
        # else:
        #     view = permission_classes((AllowAny,))(view)

        view = permission_classes((IsAuthenticated,))(view)
        view = authentication_classes(
            api_settings.DEFAULT_AUTHENTICATION_CLASSES)(view)
        view = api_view(["GET", "POST"])(view)

        return view

    def parse_body(self, request):
        if settings.DEBUG and \
                   isinstance(request, rest_framework.request.Request):
            return request.data

        return super(DRFAuthenticatedGraphQLView, self).parse_body(request)
