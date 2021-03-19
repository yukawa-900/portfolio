from ameba.models import AmebaDepartment, \
                    SalesUnit, \
                    CostItem, \
                    Employee, \
                    SalesByItem, \
                    SalesByCategory, \
                    Cost, \
                    WorkingHours, \
                    SalesCategory
from django.contrib.auth import get_user_model
import random
from PIL import Image
from django.core.files.base import ContentFile
from io import BytesIO
import pathlib
from datetime import date, timedelta
from django.db import transaction
from decimal import Decimal


print(pathlib.Path.cwd())

photo_base_path = "./initial_data/ameba/photos/"
dept_name_list = ["池袋店", "新宿店", "渋谷店"]
cost_item_name_list = ["食材費", "飲料費", "水道光熱費", "地代家賃", "減価償却費",
                       "広告宣伝費", "リース料", "車両費", "消耗品費"]
emp_info_list = [
        {
            "lastName": "鈴木",
            "firstName": "正人",
            "furiganaLastName": "すずき",
            "furiganaFirstName": "まさと",
            "photo": photo_base_path + "employees/man1.jpg"
        },
        {
            "lastName": "田中",
            "firstName": "亮一",
            "furiganaLastName": "たなか",
            "furiganaFirstName": "りょういち",
            "photo": photo_base_path + "employees/man2.jpg"
        },
        {
            "lastName": "松本",
            "firstName": "康幸",
            "furiganaLastName": "まつもと",
            "furiganaFirstName": "やすゆき",
            "photo": photo_base_path + "employees/man3.jpg"
        },
        {
            "lastName": "林",
            "firstName": "雄介",
            "furiganaLastName": "はやし",
            "furiganaFirstName": "ゆうすけ",
            "photo": photo_base_path + "employees/man4.jpg"
        },
        {
            "lastName": "竹内",
            "firstName": "浩平",
            "furiganaLastName": "たけうち",
            "furiganaFirstName": "こうへい",
            "photo": photo_base_path + "employees/man5.jpg"
        },
        {
            "lastName": "小笠原",
            "firstName": "渉",
            "furiganaLastName": "おがさわら",
            "furiganaFirstName": "わたる",
            "photo": photo_base_path + "employees/man6.jpg"
        },
        {
            "lastName": "石澤",
            "firstName": "龍彦",
            "furiganaLastName": "いしざわ",
            "furiganaFirstName": "たつひこ",
            "photo": photo_base_path + "employees/man7.jpg"
        },
        {
            "lastName": "西谷",
            "firstName": "彰悟",
            "furiganaLastName": "にしたに",
            "furiganaFirstName": "しょうご",
            "photo": photo_base_path + "employees/man8.jpg"
        },
        {
            "lastName": "古橋",
            "firstName": "国広",
            "furiganaLastName": "ふるはし",
            "furiganaFirstName": "くにひろ",
            "photo": photo_base_path + "employees/man9.jpg"
        },
        {
            "lastName": "長谷川",
            "firstName": "香",
            "furiganaLastName": "はせがわ",
            "furiganaFirstName": "かおり",
            "photo": photo_base_path + "employees/woman1.jpg"
        },
        {
            "lastName": "荻野",
            "firstName": "智子",
            "furiganaLastName": "おぎの",
            "furiganaFirstName": "ともこ",
            "photo": photo_base_path + "employees/woman2.jpg"
        },
        {
            "lastName": "高山",
            "firstName": "綾乃",
            "furiganaLastName": "たかやま",
            "furiganaFirstName": "あやの",
            "photo": photo_base_path + "employees/woman3.jpg"
        },
        {
            "lastName": "濱野",
            "firstName": "安希子",
            "furiganaLastName": "はまの",
            "furiganaFirstName": "あきこ",
            "photo": photo_base_path + "employees/woman4.jpg"
        },
        {
            "lastName": "角田",
            "firstName": "由里加",
            "furiganaLastName": "かくた",
            "furiganaFirstName": "ゆりか",
            "photo": photo_base_path + "employees/woman5.jpg"
        },
        {
            "lastName": "高取",
            "firstName": "ゆりあ",
            "furiganaLastName": "たかとり",
            "furiganaFirstName": "ゆりあ",
            "photo": photo_base_path + "employees/woman6.jpg"
        },
        {
            "lastName": "渡口",
            "firstName": "梨華子",
            "furiganaLastName": "とぐち",
            "furiganaFirstName": "りかこ",
            "photo": photo_base_path + "employees/woman7.jpg"
        },
        {
            "lastName": "金子",
            "firstName": "麻紀",
            "furiganaLastName": "かねこ",
            "furiganaFirstName": "まき",
            "photo": photo_base_path + "employees/woman8.jpg"
        },
        {
            "lastName": "小盛",
            "firstName": "ミラ",
            "furiganaLastName": "こもり",
            "furiganaFirstName": "みら",
            "photo": photo_base_path + "employees/woman9.jpg"
        },
]
position_payment_list = [
    {
        "position": 0,
        "payment": 2000,
    },
    {
        "position": 0,
        "payment": 1500,
    },
    {
        "position": 1,
        "payment": 1200,
    },
    {
        "position": 1,
        "payment": 1100,
    }
]

menu_info_list = [
    {
        "name": "ブルーベリースムージー",
        "unitPrice": "720",
        "photo": photo_base_path + "sales_units/bluberry-smothies.jpg",
        "category": "drink_cold"
    },
    {
        "name": "チョコレートケーキ",
        "unitPrice": "700",
        "photo": photo_base_path + "sales_units/cake.jpg",
        "category": "dessert"
    },
    {
        "name": "ドリップコーヒー",
        "unitPrice": "520",
        "photo": photo_base_path + "sales_units/coffee.jpg",
        "category": "drink_hot"
    },
    {
        "name": "ドーナツ",
        "unitPrice": "600",
        "photo": photo_base_path + "sales_units/donuts.jpg",
        "category": "dessert"
    },
    {
        "name": "グリーンスムージー",
        "unitPrice": "660",
        "photo": photo_base_path + "sales_units/green-smoothies.jpg",
        "category": "drink_cold",
    },
    {
        "name": "アイスクリーム",
        "unitPrice": "400",
        "photo": photo_base_path + "sales_units/icecream.jpg",
        "category": "dessert",
    },
    {
        "name": "カフェラテ",
        "unitPrice": "600",
        "photo": photo_base_path + "sales_units/latte.jpg",
        "category": "drink_hot",
    },
    {
        "name": "サラダ弁当",
        "unitPrice": "1020",
        "photo": photo_base_path + "sales_units/lunchbox.jpg",
        "category": "takeout",
    },
    {
        "name": "サンドウィッチ",
        "unitPrice": "840",
        "photo": photo_base_path + "sales_units/sandwitches.jpg",
        "category": "food",
    },
    {
        "name": "お持ち帰りスープ",
        "unitPrice": "600",
        "photo": photo_base_path + "sales_units/soup.jpg",
        "category": "takeout",
    },
    {
        "name": "紅茶",
        "unitPrice": "650",
        "photo": photo_base_path + "sales_units/tea.jpg",
        "category": "drink_hot",
    },
    {
        "name": "ストロベリー・スムージー",
        "unitPrice": "820",
        "photo": photo_base_path + "strawberry-smoothie.jpg",
        "category": "drink_cold"
    },
    {
        "name": "プリン",
        "unitPrice": "500",
        "photo": photo_base_path + "pudding.jpg",
        "category": "dessert"
    },
    {
        "name": "抹茶",
        "unitPrice": "600",
        "photo": photo_base_path + "green-tea.jpg",
        "category": "drink_hot"
    },
    {
        "name": "オレンジジュース",
        "unitPrice": "600",
        "photo": photo_base_path + "orange-juice.jpg",
        "category": "drink_cold"
    },
    {
        "name": "パンナコッタ",
        "unitPrice": "500",
        "photo": photo_base_path + "panna-cotta.jpg",
        "category": "dessert"
    },
    {
        "name": "お持ち帰りコーヒー",
        "unitPrice": "600",
        "photo": photo_base_path + "takeout-coffee.jpg",
        "category": "drink_hot"
    },
    {
        "name": "パン",
        "unitPrice": "420",
        "photo": photo_base_path + "bread.jpg",
        "category": "food"
    },
    {
        "name": "チョコレートジュース",
        "unitPrice": "720",
        "photo": photo_base_path + "chocolate-juice.jpg",
        "category": "drink_cold"
    },
]


def save_image(photo_path, photo_field):
    img = Image.open(photo_path)
    buffer = BytesIO()
    img.save(fp=buffer, format='JPEG')

    photo_field.save("サンプル", ContentFile(buffer.getvalue()))


class Settings():

    def __init__(self):
        self.user = ""
        self.dept_instance_list = []
        self.cost_item_instance_list = []
        self.emp_instance_list = []
        self.sales_category_instance_list = []
        self.sales_unit_instance_list = []

    def create_all(self, user_email, user_password):
        with transaction.atomic():
            self.create_user(user_email, user_password)
            self.create_departments()
            self.create_cost_items()
            self.create_employees()
            self.create_sales_categories()
            self.create_sales_units()

    def create_user(self, user_email, user_password):

        self.user = get_user_model().objects.create_user(
            email=user_email,
            password=user_password
        )

        self.user.save()

    # try:
    def create_departments(self):
        """部門を作成"""
        for name in dept_name_list:
            dept_obj = AmebaDepartment.objects.create(
                name=name,
                user=self.user
            )
            self.dept_instance_list.append(dept_obj)

    def create_cost_items(self):
        """費用項目を作成"""
        for name in cost_item_name_list:
            item_instance = CostItem(name=name)
            item_instance.save()
            item_instance.departments.add(*self.dept_instance_list)
            self.cost_item_instance_list.append(item_instance)

    def create_employees(self):
        """従業員を作成"""

        for emp_info in random.sample(emp_info_list, len(emp_info_list)):

            photo_path = emp_info.pop("photo", "")
            emp_instance = Employee(
                **emp_info,
                **random.choice(position_payment_list)
            )

            if photo_path:
                save_image(photo_path, emp_instance.photo)

            emp_instance.save()
            self.emp_instance_list.append(emp_instance)

        for i, emp in enumerate(self.emp_instance_list):
            if i in range(0, 6):
                emp.departments.add(self.dept_instance_list[0])

            elif i in range(6, 12):
                emp.departments.add(self.dept_instance_list[1])

            elif i in range(12, 18):
                emp.departments.add(self.dept_instance_list[2])

    def create_sales_categories(self):
        """売上カテゴリーを作成"""
        self.category_drik_hot_instance = SalesCategory.objects.create(
            name="ホットドリンク売上"
        )
        self.category_drik_cold_instance = SalesCategory.objects.create(
            name="コールドドリンク売上"
        )
        self.category_food_instance = SalesCategory.objects.create(
            name="料理売上"
        )
        self.category_dessert_instance = SalesCategory.objects.create(
            name="デザート売上"
        )
        self.category_takeout_instance = SalesCategory.objects.create(
            name="テイクアウト売上"
        )

        self.sales_category_instance_list = [
            self.category_drik_hot_instance, self.category_drik_cold_instance,
            self.category_food_instance, self.category_dessert_instance,
            self.category_takeout_instance]

        for category in self.sales_category_instance_list:
            category.departments.add(*self.dept_instance_list)

    def create_sales_units(self):
        """販売単位（メニュー）を登録"""
        for menu_info in menu_info_list:
            photo_path = menu_info.pop("photo", "")

            category_name_instance_mapping = {
                "drink_hot": self.category_drik_hot_instance,
                "drink_cold": self.category_drik_cold_instance,
                "food": self.category_food_instance,
                "dessert": self.category_dessert_instance,
                "takeout": self.category_takeout_instance
            }

            str_category = menu_info["category"]
            menu_info["category"] = category_name_instance_mapping[
                str_category]  # KeyErrorを発生させたいので、.get()は使わない

            menu_instance = SalesUnit(
                **menu_info,
            )

            if photo_path:
                save_image(photo_path, menu_instance.photo)

            menu_instance.save()
            depts_num = random.choice([1, 2, 3])
            menu_instance.departments.add(
                *random.sample(self.dept_instance_list, depts_num))
            self.sales_unit_instance_list.append(menu_instance)


class InputData:

    def __init__(self):
        # self.settings = Settings()
        pass

    def create_settings(self, user_email, user_password):
        settings = Settings()
        settings.create_all(user_email, user_password)
        self.settings = settings

    def create_all_data(self, days=60):

        half_days = int(days / 2)
        today = date.today()
        start_date = today - timedelta(days=half_days)
        end_date = today + timedelta(days=half_days)

        with transaction.atomic():

            d = start_date

            while d < end_date:

                # 処理
                self.create_costs(d)
                self.create_sales_by_category(d)
                self.create_sales_by_item(d)
                self.create_working_hours(d)

                print(d)
                d += timedelta(days=1)

    def create_costs(self, date):

        length = len(self.settings.cost_item_instance_list) - 1  # 5
        for costItem in random.sample(
                self.settings.cost_item_instance_list, length):  # ランダムに5個選ぶ

            for department in costItem.departments.all():
                Cost.objects.create(
                    department=department,
                    date=date,
                    item=costItem,
                    money=str(random.randrange(30000, 60000))
                )

    def create_sales_by_category(self, date):
        for category in self.settings.sales_category_instance_list:

            for sales_category in self.settings.sales_category_instance_list:

                for department in sales_category.departments.all():
                    SalesByCategory.objects.create(
                        department=department,
                        date=date,
                        category=sales_category,
                        money=str(random.randrange(5000, 20000))
                    )

    def create_sales_by_item(self, date):

        for salesUnit in self.settings.sales_unit_instance_list:

            for department in salesUnit.departments.all():
                instance = SalesByItem(
                    department=department,
                    date=date,
                    item=salesUnit,
                    num=Decimal(str(random.randrange(5, 50)))
                )

                instance.money = instance.num * \
                    Decimal(instance.item.unitPrice)
                instance.save()

    def create_working_hours(self, date):

        length = len(self.settings.emp_instance_list) - 2

        for emp in random.sample(
            self.settings.emp_instance_list,
            length
        ):

            for department in emp.departments.all():
                instance = WorkingHours(
                    date=date,
                    department=department,
                    employee=emp,
                    hours=Decimal(str(random.randrange(4, 9)))
                )

                instance.laborCost = Decimal(instance.employee.payment) \
                    * instance.hours
                instance.save()


def main(days=60,
         user_email="sample@gmail.com",
         user_password="sample_password"):

    inputData = InputData()
    with transaction.atomic():
        inputData.create_settings(user_email, user_password)
        inputData.create_all_data(days=days)
