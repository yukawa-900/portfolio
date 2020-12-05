from django.contrib import admin
from .models import Account, \
                    AccountCategory, \
                    Transaction, \
                    TransactionGroup, \
                    Tax, \
                    Department, \
                    Currency, \
                    ExcludedAccount, \
                    ExcludedCurrency, \
                    ExcludedDepartment, \
                    ExcludedTax

admin.site.register(Account)
admin.site.register(AccountCategory)
admin.site.register(Transaction)
admin.site.register(TransactionGroup)
admin.site.register(Tax)
admin.site.register(Department)
admin.site.register(Currency)
admin.site.register(ExcludedAccount)
admin.site.register(ExcludedCurrency)
admin.site.register(ExcludedDepartment)
admin.site.register(ExcludedTax)
