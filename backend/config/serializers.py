from rest_framework import serializers


class TwitterRequestTokenSerializer(serializers.Serializer):
    oauth_token = serializers.CharField()
    oauth_token_secret = serializers.CharField()
    oauth_callback_confirmed = serializers.BooleanField()
    authenticate_endpoint = serializers.CharField()


class TwitterAccessTokenSerializer(serializers.Serializer):
    oauth_token = serializers.CharField()
    oauth_token_secret = serializers.CharField()
    user_id = serializers.CharField()
    screen_name = serializers.CharField()
