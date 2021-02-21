import uuid
from django.db import models
from django.core.validators import RegexValidator

uuid_kwargs = {
    'primary_key': True,
    'default': uuid.uuid4,
    'editable': False
}

code_kwargs = {
    'verbose_name': 'コード',
    'max_length': 30,
    'unique': True,
    'validators': [RegexValidator(
        regex=r'^[0-9A-Z]+$',
        message='半角数字・または半角大文字アルファベットで入力してください。例: AZ123'
    )]
}


user_kwargs = {
    'verbose_name': '作成ユーザー',
    'on_delete': models.CASCADE,
}


class UUIDModel(models.Model):
    id = models.UUIDField(**uuid_kwargs)

    class Meta:
        abstract = True
