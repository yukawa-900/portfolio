from django.db import models
from django.conf import settings
from utils.model_utils import UUIDModel, user_kwargs, code_kwargs, \
                              furigana_kwargs, get_hashed_filename
from django.core import validators
from functools import partial
from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFill

EMPLOYEE_POSITION_CHOICES = (
    (0, "正社員"),
    (1, "アルバイト")
)


def get_image_path(instance, filename, folder_name="uncategorized"):
    filename = get_hashed_filename(filename)
    return f'images/ameba/{folder_name}/{instance.user.id}/{filename}'


image_kwargs = {
    "processors": [ResizeToFill(300, 300)],
    "format": "JPEG",
    "options": {"quality": 80},
    "blank": True,
    "null": True,
}


class AmebaDepartment(UUIDModel):
    name = models.CharField(blank=False, null=False,
                            unique=True, max_length=100)
    code = models.CharField(**code_kwargs)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)


class SalesCategory(UUIDModel):
    name = models.CharField(blank=False, null=False,
                            unique=True, max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)


class SalesUnit(UUIDModel):
    name = models.CharField(blank=False, null=False,
                            unique=True, max_length=100)
    unitPrice = models.DecimalField(
        verbose_name="販売単価", blank=False, null=False,
        max_digits=8, decimal_places=2,
        validators=[validators.MinValueValidator(0.00)]
    )

    photo = ProcessedImageField(**image_kwargs,
                                upload_to=partial(
                                    get_image_path,
                                    folder_name="sales_units")
                                )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)
    category = models.ForeignKey(SalesCategory, null=True, blank=True,
                                 on_delete=models.PROTECT)
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

    furigana = models.CharField(**furigana_kwargs)

    photo = ProcessedImageField(**image_kwargs,
                                upload_to=partial(
                                    get_image_path,
                                    folder_name="employees")
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
