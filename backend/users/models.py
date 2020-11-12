from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.utils.translation import ugettext_lazy as _
from django.db import models
import uuid


class CustomUserManager(BaseUserManager):
    """
    デフォルトのusernameを消去するために作成
    このモデルには、認証に関係するものだけを登録（email, password）
    その他はUserProfileモデルに登録する
    """
    def create_user(self, email, password):
        """
        Email と パスワード
        """
        if not email:
            raise ValueError(_('You must set an email address'))

        email = self.normalize_email(email)
        user = self.model(email=email)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password):
        """
        Email と パスワード
        """
        user = self.create_user(
            email,
            password=password,
        )
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)

        return user


class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True,  default=uuid.uuid4,
                          editable=False)
    username = None
    email = models.EmailField(_('email address'), unique=True, max_length=200)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email
