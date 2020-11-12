from django.contrib import admin
from .models import Account, Category, Transaction

admin.site.register(Account)
admin.site.register(Category)
admin.site.register(Transaction)
