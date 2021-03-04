from django.db import models
from django.conf import settings
from utils.model_utils import UUIDModel, user_kwargs,  \
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

date_kwargs = {
    "verbose_name": "日付",
    "blank": False,
    "null": False
}

dept_cascade_kwargs = {
    "verbose_name": "部門",
    "blank": False,
    "null": False,
    "on_delete": models.CASCADE,
}


class UserModel(UUIDModel):
    class Meta:
        abstract = True

    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)


class NameUserUniqueTogetherModel(UserModel):
    class Meta:
        abstract = True
        unique_together = ("user", "name")

    name = models.CharField(blank=False, null=False,
                            max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)


class AmebaDepartment(NameUserUniqueTogetherModel):
    pass


class SalesCategory(NameUserUniqueTogetherModel):
    pass


class SalesUnit(NameUserUniqueTogetherModel):
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

    category = models.ForeignKey(SalesCategory, null=True, blank=True,
                                 on_delete=models.PROTECT)
    departments = models.ManyToManyField(AmebaDepartment, verbose_name="部門")


class CostItem(NameUserUniqueTogetherModel):
    pass


class Employee(UserModel):

    # 同姓同名の可能性を考え、unique にはしない
    firstName = models.CharField(blank=False, null=False,
                                 max_length=30, verbose_name="名")

    lastName = models.CharField(blank=False, null=False,
                                max_length=30, verbose_name="姓")

    furiganaFirstName = models.CharField(verbose_name="ふりがな（名）",
                                         **furigana_kwargs)

    furiganaLastName = models.CharField(**furigana_kwargs,
                                        verbose_name="ふりがな（姓）")

    firstName = models.CharField(blank=False, null=False,
                                 max_length=100)

    payment = models.DecimalField(verbose_name="時給", blank=False, null=False,
                                  max_digits=5, decimal_places=0,
                                  validators=[validators.MinValueValidator(0)
                                              ]
                                  )

    photo = ProcessedImageField(**image_kwargs,
                                verbose_name="写真",
                                upload_to=partial(
                                    get_image_path,
                                    folder_name="employees")
                                )

    position = models.IntegerField(verbose_name="労働区分",
                                   choices=EMPLOYEE_POSITION_CHOICES)

    department = models.ForeignKey(AmebaDepartment, **dept_cascade_kwargs)


class SalesByItem(UserModel):
    date = models.DateField(**date_kwargs)
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
                                max_digits=10, decimal_places=2,
                                validators=[validators.MinValueValidator(0.01)]
                                )

    department = models.ForeignKey(AmebaDepartment, **dept_cascade_kwargs)


class SalesByCategory(UserModel):
    date = models.DateField(**date_kwargs)
    category = models.ForeignKey(SalesCategory, verbose_name="売上カテゴリー",
                                 on_delete=models.PROTECT, blank=True,
                                 null=True)

    money = models.DecimalField(verbose_name="金額", blank=False, null=False,
                                max_digits=10, decimal_places=2,
                                validators=[validators.MinValueValidator(0.01)]
                                )

    department = models.ForeignKey(AmebaDepartment, **dept_cascade_kwargs)


class Cost(UserModel):
    date = models.DateField(**date_kwargs)

    item = models.ForeignKey(CostItem, verbose_name="費用項目",
                             on_delete=models.PROTECT)

    money = models.DecimalField(verbose_name="費用金額", blank=False, null=False,
                                max_digits=10, decimal_places=2,
                                validators=[validators.MinValueValidator(0)]
                                )

    department = models.ForeignKey(AmebaDepartment, **dept_cascade_kwargs)


class WorkingHours(UserModel):
    date = models.DateField(**date_kwargs)
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
