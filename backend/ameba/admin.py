from django.contrib import admin
from .models import AmebaDepartment, \
                    SalesUnit, \
                    CostItem, \
                    Employee, \
                    Sales, \
                    Cost, \
                    WorkingHours, \
                    SalesCategory
# Register your models here.

admin.site.register(AmebaDepartment)
admin.site.register(SalesUnit)
admin.site.register(SalesCategory)
admin.site.register(CostItem)
admin.site.register(Employee)
admin.site.register(Sales)
admin.site.register(Cost)
admin.site.register(WorkingHours)
