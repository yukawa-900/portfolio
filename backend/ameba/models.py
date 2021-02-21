from django.db import models
from django.conf import settings
from utils.model_utils import UUIDModel, user_kwargs, code_kwargs
from django.core import validators

EMPLOYEE_POSITION_CHOICES = (
    (0, "正社員"),
    (1, "アルバイト")
)


class AmebaDepartment(UUIDModel):
    name = models.CharField(blank=False, null=False,
                            unique=True, max_length=100)
    code = models.CharField(**code_kwargs)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)


class SalesUnit(UUIDModel):
    name = models.CharField(blank=False, null=False,
                            unique=True, max_length=100)
    unitPrice = models.DecimalField(
        verbose_name="販売単価", blank=False, null=False,
        max_digits=8, decimal_places=2,
        validators=[validators.MinValueValidator(0.00)]
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)
    departments = models.ManyToManyField(AmebaDepartment, verbose_name="部門")


class CostItem(UUIDModel):
    name = models.CharField(blank=False, null=False,
                            unique=True, max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)


class Employee(UUIDModel):
    name = models.CharField(blank=False, null=False,
                            unique=True, max_length=100)
    payment = models.DecimalField(verbose_name="時給", blank=False, null=False,
                                  max_digits=5, decimal_places=0,
                                  validators=[validators.MinValueValidator(0)
                                              ]
                                  )

    position = models.IntegerField(verbose_name="労働区分",
                                   choices=EMPLOYEE_POSITION_CHOICES)

    department = models.ForeignKey(AmebaDepartment, verbose_name="部門",
                                   blank=False, null=False,
                                   on_delete=models.CASCADE,
                                   )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)


class Sales(UUIDModel):
    date = models.DateField(verbose_name='日付', blank=False, null=False)
    item = models.ForeignKey(SalesUnit, verbose_name="売上項目",
                             on_delete=models.PROTECT, blank=True, null=True,)
    num = models.DecimalField(verbose_name="売上個数",
                              blank=True,
                              null=True,
                              default=1,
                              max_digits=5, decimal_places=0,
                              validators=[validators.MinValueValidator(0)]
                              )

    money = models.DecimalField(verbose_name="売上高", blank=False, null=False,
                                max_digits=9, decimal_places=2,
                                validators=[validators.MinValueValidator(0.00)]
                                )

    department = models.ForeignKey(AmebaDepartment, verbose_name="部門",
                                   on_delete=models.CASCADE,
                                   )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)


class Cost(UUIDModel):
    date = models.DateField(verbose_name='日付', blank=False, null=False)

    item = models.ForeignKey(CostItem, verbose_name="費用項目",
                             on_delete=models.PROTECT)

    money = models.DecimalField(verbose_name="費用金額", blank=False, null=False,
                                max_digits=8, decimal_places=2,
                                validators=[validators.MinValueValidator(0)]
                                )

    department = models.ForeignKey(AmebaDepartment, verbose_name="部門",
                                   on_delete=models.CASCADE,
                                   )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)


class WorkingHours(UUIDModel):
    date = models.DateField(verbose_name='日付', blank=False, null=False)
    employee = models.ForeignKey(Employee, verbose_name="費用項目",
                                 on_delete=models.PROTECT)
    hours = models.DecimalField(verbose_name="労働時間", blank=False, null=False,
                                max_digits=3, decimal_places=1,
                                validators=[validators.MinValueValidator(0.1),
                                            validators.MaxValueValidator(24)
                                            ]
                                )
    laborCost = models.DecimalField(verbose_name="人件費",
                                    blank=False,
                                    null=False,
                                    max_digits=7,
                                    decimal_places=2,
                                    validators=[
                                         validators.MinValueValidator(0.01)
                                        ]
                                    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)
