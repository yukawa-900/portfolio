from django.contrib import admin
from .models import AmebaDepartment, \
                    SalesUnit, \
                    CostItem, \
                    Employee, \
                    SalesByItem, \
                    SalesByCategory, \
                    Cost, \
                    WorkingHours, \
                    SalesCategory
# Register your models here.


class EmployeeAdmin(admin.ModelAdmin):
    fields = (
              "lastName", "furiganaLastName",
              "firstName", "furiganaFirstName",
              "position", "payment",
              "department", "photo", "user"
              )


admin.site.register(AmebaDepartment)
admin.site.register(SalesUnit)
admin.site.register(SalesCategory)
admin.site.register(CostItem)
admin.site.register(Employee, EmployeeAdmin)
admin.site.register(SalesByItem)
admin.site.register(SalesByCategory)
admin.site.register(Cost)
admin.site.register(WorkingHours)
