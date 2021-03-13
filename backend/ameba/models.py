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
    return f'images/ameba/{folder_name}/{instance.id}-{filename}'


image_kwargs = {
    "processors": [ResizeToFill(500, 500)],
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

dept_set_null_kwargs = {
    "verbose_name": "部門",
    "blank": False,
    "null": True,
    "on_delete": models.SET_NULL,
}


# class NameUserUniqueTogetherModel(UUIDModel):
#     class Meta:
#         abstract = True
#         unique_together = ("user", "name")

#     name = models.CharField(blank=False, null=False,
#                             max_length=30)
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)

#     def __str__(self):
#         return self.name


class AmebaDepartment(UUIDModel):
    class Meta:
        unique_together = ("user", "name")

    name = models.CharField(blank=False, null=False,
                            max_length=30)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, **user_kwargs)

    def __str__(self):
        return self.name


class SettingsModel(UUIDModel):
    """
        NameUserUniqueTogetherModelを継承
        従業員、費用項目など、設定画面に関わる抽象モデル
    """
    class Meta:
        abstract = True

    name = models.CharField(blank=False, null=False,
                            max_length=30)

    departments = models.ManyToManyField(AmebaDepartment, verbose_name="部門",
                                         blank=False,)

    def __str__(self):
        return self.name


class AmebaInputModel(UUIDModel):
    """
        売上、費用、労働時間など、日々ユーザーからinputされるデータを扱う抽象モデル
    """
    class Meta:
        abstract = True
    date = models.DateField(**date_kwargs)
    department = models.ForeignKey(AmebaDepartment, **dept_cascade_kwargs)


class SalesCategory(SettingsModel):
    pass


class SalesUnit(SettingsModel):
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


class CostItem(SettingsModel):
    pass


class Employee(SettingsModel):

    # 同姓同名の可能性を考え、unique にはしない
    firstName = models.CharField(blank=False, null=False,
                                 max_length=30, verbose_name="名")

    lastName = models.CharField(blank=False, null=False,
                                max_length=30, verbose_name="姓")

    furiganaFirstName = models.CharField(verbose_name="ふりがな（名）",
                                         **furigana_kwargs)

    furiganaLastName = models.CharField(**furigana_kwargs,
                                        verbose_name="ふりがな（姓）")

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

    def __str__(self):
        return f"{self.lastName} {self.firstName}"


class SalesByItem(AmebaInputModel):
    date = models.DateField(**date_kwargs)
    item = models.ForeignKey(SalesUnit, verbose_name="売上項目",
                             on_delete=models.SET_NULL,
                             blank=False, null=True)
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

    def __str__(self):
        if self.item:
            return f'{self.date} {self.item.name}'
        else:
            return f'{self.date} Null'


class SalesByCategory(AmebaInputModel):
    date = models.DateField(**date_kwargs)
    category = models.ForeignKey(SalesCategory, verbose_name="売上カテゴリー",
                                 on_delete=models.SET_NULL,
                                 blank=False, null=True)

    money = models.DecimalField(verbose_name="金額", blank=False, null=False,
                                max_digits=10, decimal_places=2,
                                validators=[validators.MinValueValidator(0.01)]
                                )

    def __str__(self):
        if self.category:
            return f'{self.date} {self.category.name}'
        else:
            return f'{self.date} Null'


class Cost(AmebaInputModel):
    date = models.DateField(**date_kwargs)

    item = models.ForeignKey(CostItem, verbose_name="費用項目",
                             on_delete=models.SET_NULL,
                             blank=False, null=True)

    money = models.DecimalField(verbose_name="費用金額", blank=False, null=False,
                                max_digits=10, decimal_places=2,
                                validators=[validators.MinValueValidator(0)]
                                )

    def __str__(self):
        if self.item:
            return f'{self.date} {self.item.name}'
        else:
            return f'{self.date} Null'


class WorkingHours(AmebaInputModel):
    employee = models.ForeignKey(Employee, verbose_name="従業員",
                                 on_delete=models.SET_NULL,
                                 blank=False, null=True)
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

    def __str__(self):
        if self.employee:
            return f'{self.date} {self.employee.name}'
        else:
            return f'{self.date} Null'
