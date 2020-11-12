from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext as _
from users import models


class UserAdmin(BaseUserAdmin):
    ordering = ['id']
    list_display = ['email', 'id']

    """ユーザー編集画面"""
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (
            _('Permissions'),
            {'fields': ('is_active', 'is_staff', 'is_superuser')}
        ),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    """新規ユーザー追加画面"""
    add_fieldsets = (
        (None, {
            'fields': ('email', 'password1', 'password2')
        }),
    )


admin.site.register(models.CustomUser, UserAdmin)
