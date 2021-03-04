import graphene
from graphene_django.types import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from django_filters import OrderingFilter, FilterSet
from graphene import relay
from graphql_relay import from_global_id
from decimal import Decimal
from .models import AmebaDepartment, \
                    SalesUnit, \
                    SalesCategory, \
                    CostItem, \
                    Employee, \
                    SalesByItem, \
                    SalesByCategory, \
                    Cost, \
                    WorkingHours
from django.conf import settings
from django.db import models
import datetime
import json


class NodeWithPhoto(DjangoObjectType):
    class Meta:
        abstract = True

    def resolve_photo(self, *_):
        if self.photo:
            return '{}{}'.format(settings.MEDIA_URL, self.photo)
        else:
            return ""


class DepartmentNode(DjangoObjectType):
    class Meta:
        model = AmebaDepartment
        filter_fields = {}
        interfaces = (relay.Node,)


class SalesUnitNode(NodeWithPhoto):
    class Meta:
        model = SalesUnit
        filter_fields = {
            "departments": ["exact"]
        }
        interfaces = (relay.Node,)


class SalesCategoryNode(NodeWithPhoto):
    class Meta:
        model = SalesCategory
        filter_fields = {}
        interfaces = (relay.Node,)


class CostItemNode(DjangoObjectType):
    class Meta:
        model = CostItem
        filter_fields = {}
        interfaces = (relay.Node,)


class EmployeeNode(NodeWithPhoto):
    class Meta:
        model = Employee
        filter_fields = {
            "department": ["exact"]
        }
        interfaces = (relay.Node,)
        # convert_choices_to_enum = False

    fullName = graphene.String()
    fullFurigana = graphene.String()

    def resolve_fullName(parent, info):
        return f"{parent.lastName} {parent.firstName}"

    def resolve_fullFurigana(parent, info):
        last = parent.furiganaLastName
        first = parent.furiganaFirstName
        last = last if last else ""
        first = first if first else ""
        return f"{last} {first}"


# class AmebaElementFilter(FilterSet):

#     class Meta:
#         abstract = True
#         fields = {
#             "date": ["exact", "lt", "gt"],
#             "department": ["exact"],
#         }

#     order_by = OrderingFilter(
#                     fields=(
#                         ("date", "date")
#                     )
#                 )


fields_date_department = {
    "date": ["exact", "lte", "gte"],
    "department": ["exact"],
}


class SalesByItemNode(DjangoObjectType):
    class Meta:
        model = SalesByItem
        filter_fields = fields_date_department
        interfaces = (relay.Node,)


class SalesByCategoryNode(DjangoObjectType):
    class Meta:
        model = SalesByCategory
        filter_fields = fields_date_department
        interfaces = (relay.Node,)


class CostNode(DjangoObjectType):
    class Meta:
        model = Cost
        filter_fields = fields_date_department
        interfaces = (relay.Node,)


class WorkingHoursNode(DjangoObjectType):
    class Meta:
        model = WorkingHours
        filter_fields = {
                "date": ["exact", "lte", "gte"],
                "employee__department": ["exact"],
            }
        interfaces = (relay.Node,)


# 汎用Mutationを作る
class MyCreateMutation(relay.ClientIDMutation):
    """汎用CreateMutation"""
    class Meta:
        abstract = True

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        cls.createdItem = cls.model()

        for key, value in input.items():

            if isinstance(
                getattr(cls.model, key),
                models.fields.related_descriptors.ForwardManyToOneDescriptor
            ):
                # keyがForeignKeyの場合は

                # 関連するクラスを取得
                # 例: department >> AmebaDepartmentクラス
                related_model = \
                    getattr(cls.model, key).get_queryset()[0].__class__

                setattr(cls.createdItem,
                        key,
                        related_model.objects.get(
                            id=from_global_id(value)[1]
                            )
                        )

            else:
                setattr(cls.createdItem, key, value)

        if hasattr(cls.model, "user"):
            cls.createdItem.user = info.context.user

    @classmethod
    def perform_save(cls):
        cls.createdItem.save()


class MyUpdateMutation(relay.ClientIDMutation):
    """汎用UpdateMutation"""
    class Meta:
        abstract = True

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        cls.updatedItem = cls.model.objects.get(
                        id=from_global_id(input.pop('id'))[1])

        if hasattr(cls.model, "user"):
            assert cls.updatedItem.user == info.context.user, \
                                    "編集できるのは、自分が作った項目だけです。"

        for key, value in input.items():
            if isinstance(
                getattr(cls.model, key),
                models.fields.related_descriptors.ForwardManyToOneDescriptor
            ):
                # keyがForeignKeyの場合は

                # 関連するクラスを取得
                # 例: department >> AmebaDepartmentクラス
                related_model = \
                    getattr(cls.model, key).get_queryset()[0].__class__

                setattr(cls.updatedItem,
                        key,
                        related_model.objects.get(
                            id=from_global_id(value)[1]
                            )
                        )

            else:
                setattr(cls.updatedItem, key, value)

        # 継承先で return する

    @classmethod
    def perform_save(cls):
        cls.updatedItem.save()


class MyDeleteMutation(relay.ClientIDMutation):
    """汎用DeleteMutation"""

    class Meta:
        abstract = True

    class Input:
        id = graphene.ID(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        item = cls.model.objects.get(
            id=from_global_id(input.get("id"))[1]
        )
        assert item.user == info.context.user, "消去できるのは、自分が作った項目だけです。"
        item.delete()


########################


class DeptCreateMutation(MyCreateMutation):

    model = AmebaDepartment
    department = graphene.Field(DepartmentNode)

    class Input:
        name = graphene.String(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return DeptCreateMutation(department=cls.createdItem)


class DeptUpdateMutation(MyUpdateMutation):

    model = AmebaDepartment
    department = graphene.Field(DepartmentNode)

    class Input:
        id = graphene.ID(required=True)
        name = graphene.String(required=False)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return DeptUpdateMutation(department=cls.updatedItem)


class DeptDeleteMutation(MyDeleteMutation):

    model = SalesCategory
    department = graphene.Field(DepartmentNode)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        return DeptDeleteMutation(department=None)


class SalesCategoryCreateMutation(MyCreateMutation):

    model = SalesCategory
    sales_category = graphene.Field(SalesCategoryNode)

    class Input:
        name = graphene.String(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return SalesCategoryCreateMutation(sales_category=cls.createdItem)


class SalesCategoryUpdateMutation(MyUpdateMutation):

    model = SalesCategory
    sales_category = graphene.Field(SalesCategoryNode)

    class Input:
        id = graphene.ID(required=True)
        name = graphene.String(required=False)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return SalesCategoryUpdateMutation(sales_category=cls.updatedItem)


class SalesCategoryDeleteMutation(MyDeleteMutation):

    model = SalesCategory
    sales_category = graphene.Field(SalesCategoryNode)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        return SalesCategoryDeleteMutation(sales_category=None)


class SalesUnitCreateMutation(relay.ClientIDMutation):

    salesUnit = graphene.Field(SalesUnitNode)

    class Input:
        name = graphene.String(required=True)
        unitPrice = graphene.String(required=True)
        departments = graphene.List(graphene.NonNull(graphene.ID))

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        salesUnit = SalesUnit(
            name=input.get("name"),
            unitPrice=input.get("unitPrice"),
            user=info.context.user
        )
        salesUnit.save()

        # uuidに変換
        uuid_departments = []
        for dept in input.get("departments"):
            uuid_departments.append(from_global_id(dept)[1])

        # departmentsを登録
        salesUnit.departments.add(*uuid_departments)

        return SalesUnitCreateMutation(salesUnit=salesUnit)


class SalesUnitUpdateMutation(MyUpdateMutation):

    model = SalesUnit
    salesUnit = graphene.Field(SalesUnitNode)

    class Input:
        id = graphene.ID(required=True)
        name = graphene.String(required=False)
        unitPrice = graphene.String(required=False)
        departments = graphene.List(graphene.ID)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):

        salesUnit = SalesUnit.objects.get(
            id=from_global_id(input.get("id"))[1]
            )

        assert salesUnit.user == info.context.user, \
            "編集できるのは、自分が作った項目だけです。"

        salesUnit.name = input.get("name")
        salesUnit.unitPrice = input.get("unitPrice")

        uuid_departments = []
        for dept in input.get("departments"):
            uuid_departments.append(from_global_id(dept)[1])

        salesUnit.departments.add(*uuid_departments)

        salesUnit.save()

        return SalesUnitUpdateMutation(salesUnit=salesUnit)


class SalesUnitDeleteMutation(MyDeleteMutation):

    model = SalesUnit
    salesUnit = graphene.Field(SalesUnitNode)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        return SalesUnitDeleteMutation(salesUnit=None)


class CostItemCreateMutation(MyCreateMutation):

    model = CostItem
    costItem = graphene.Field(CostItemNode)

    class Input:
        name = graphene.String(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return CostItemCreateMutation(costItem=cls.createdItem)


class CostItemUpdateMutation(MyUpdateMutation):

    model = CostItem
    costItem = graphene.Field(CostItemNode)

    class Input:
        id = graphene.ID(required=True)
        name = graphene.String(required=False)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return CostItemUpdateMutation(costItem=cls.updatedItem)


class CostItemDeleteMutation(MyDeleteMutation):

    model = CostItem
    costItem = graphene.Field(CostItemNode)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        return CostItemDeleteMutation(costItem=None)


class EmployeeCreateMutation(MyCreateMutation):

    model = Employee
    employee = graphene.Field(EmployeeNode)

    class Input:
        name = graphene.String(required=True)
        payment = graphene.String(required=True)
        position = graphene.Int(required=True)
        department = graphene.ID(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):

        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return EmployeeCreateMutation(employee=cls.createdItem)


class EmployeeUpdateMutation(MyUpdateMutation):

    model = Employee
    employee = graphene.Field(EmployeeNode)

    class Input:
        id = graphene.ID(required=True)
        name = graphene.String(required=False)
        payment = graphene.String(required=False)
        position = graphene.Int(required=False)
        department = graphene.ID(required=False)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return EmployeeUpdateMutation(employee=cls.updatedItem)


class EmployeeDeleteMutation(MyDeleteMutation):

    model = Employee
    employee = graphene.Field(EmployeeNode)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        return EmployeeDeleteMutation(employee=None)


class SalesByItemCreateMutation(MyCreateMutation):

    model = SalesByItem
    salesByItem = graphene.Field(SalesByItemNode)

    class Input:
        date = graphene.Date(required=True)
        item = graphene.ID(required=False)
        num = graphene.String(required=False)
        department = graphene.ID(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):

        super().mutate_and_get_payload(root, info, **input)

        if not input.get("money"):
            cls.createdItem.money = \
                cls.createdItem.item.unitPrice * Decimal(cls.createdItem.num)

        cls.perform_save()

        return SalesByItemCreateMutation(salesByItem=cls.createdItem)


class SalesByItemUpdateMutation(MyUpdateMutation):

    model = SalesByItem
    salesByItem = graphene.Field(SalesByItemNode)

    class Input:
        id = graphene.ID(required=True)
        date = graphene.Date(required=False)
        item = graphene.ID(required=False)
        num = graphene.String(required=False)
        department = graphene.ID(required=False)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):

        super().mutate_and_get_payload(root, info, **input)

        if not input.get("money"):

            cls.updatedItem.money = \
                cls.updatedItem.item.unitPrice * Decimal(cls.updatedItem.num)

        cls.perform_save()

        return SalesByItemUpdateMutation(salesByItem=cls.updatedItem)


class SalesByItemDeleteMutation(MyDeleteMutation):

    model = SalesByItem
    salesByItem = graphene.Field(SalesByItemNode)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        return SalesByItemDeleteMutation(salesByItem=None)


class SalesByCategoryCreateMutation(MyCreateMutation):

    model = SalesByCategory
    salesByCategory = graphene.Field(SalesByCategoryNode)

    class Input:
        date = graphene.Date(required=True)
        category = graphene.ID(required=True)
        money = graphene.String(required=True)
        department = graphene.ID(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return SalesByCategoryCreateMutation(salesByCategory=cls.createdItem)


class SalesByCategoryUpdateMutation(MyUpdateMutation):

    model = SalesByCategory
    salesByCategory = graphene.Field(SalesByCategoryNode)

    class Input:
        id = graphene.ID(required=True)
        date = graphene.Date(required=False)
        category = graphene.ID(required=False)
        money = graphene.String(required=False)
        department = graphene.ID(required=False)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return SalesByCategoryUpdateMutation(salesByCategory=cls.updatedItem)


class SalesByCategoryDeleteMutation(MyDeleteMutation):

    model = SalesByCategory
    salesByCategory = graphene.Field(SalesByCategoryNode)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        return SalesByCategoryDeleteMutation(salesByCategory=None)


class CostCreateMutation(MyCreateMutation):

    model = Cost
    cost = graphene.Field(CostNode)

    class Input:
        date = graphene.Date(required=True)
        item = graphene.ID(required=True)
        money = graphene.String(required=True)
        department = graphene.ID(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return CostCreateMutation(cost=cls.createdItem)


class CostUpdateMutation(MyUpdateMutation):

    model = Cost
    cost = graphene.Field(CostNode)

    class Input:
        id = graphene.ID(required=True)
        date = graphene.Date(required=False)
        item = graphene.ID(required=False)
        money = graphene.String(required=False)
        department = graphene.ID(required=False)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return CostUpdateMutation(cost=cls.updatedItem)


class CostDeleteMutation(MyDeleteMutation):

    model = Cost
    cost = graphene.Field(CostNode)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        return CostDeleteMutation(cost=None)


class WorkingHoursCreateMutation(MyCreateMutation):

    model = WorkingHours
    working_hours = graphene.Field(WorkingHoursNode)

    class Input:
        date = graphene.Date(required=True)
        employee = graphene.ID(required=True)
        hours = graphene.String(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):

        super().mutate_and_get_payload(root, info, **input)

        cls.createdItem.laborCost = \
            cls.createdItem.employee.payment * Decimal(cls.createdItem.hours)

        cls.perform_save()

        return WorkingHoursCreateMutation(working_hours=cls.createdItem)


class WorkingHoursUpdateMutation(MyUpdateMutation):

    model = WorkingHours
    working_hours = graphene.Field(WorkingHoursNode)

    class Input:
        id = graphene.ID(required=True)
        date = graphene.Date(required=False)
        employee = graphene.ID(required=False)
        hours = graphene.String(required=False)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):

        super().mutate_and_get_payload(root, info, **input)

        cls.updatedItem.laborCost = \
            cls.updatedItem.employee.payment * Decimal(cls.updatedItem.hours)

        cls.perform_save()

        return WorkingHoursUpdateMutation(working_hours=cls.updatedItem)


class WorkingHoursDeleteMutation(MyDeleteMutation):

    model = WorkingHours
    working_hours = graphene.Field(WorkingHoursNode)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        return WorkingHoursDeleteMutation(working_hours=None)


class AmebaSalesByItemNode(graphene.ObjectType):
    class Meta:
        interfaces = (relay.Node,)

    money = graphene.String()
    item = graphene.Field(SalesUnitNode)


class AmebaSalesByCategoryNode(graphene.ObjectType):
    class Meta:
        interfaces = (relay.Node,)

    money = graphene.String()
    category = graphene.Field(SalesCategoryNode)


class AmebaCostNode(graphene.ObjectType):
    class Meta:
        interfaces = (relay.Node,)

    money = graphene.String()
    item = graphene.Field(CostItemNode)


class AmebaWorkingHoursNode(graphene.ObjectType):
    class Meta:
        interfaces = (relay.Node,)

    hours = graphene.String()
    position = graphene.Int()


class ProfitPerHourNode(graphene.ObjectType):
    class Meta:
        interfaces = (relay.Node,)

    profit_per_hour = graphene.String()
    date = graphene.String()


def retrieve_by_id(model, info, **kwargs):
    id = kwargs.get("id")
    if id is not None:
        returnedItem = model.objects.get(
                            id=from_global_id(id)[1]
                        )

        assert returnedItem.user == info.context.user, \
            "これはあなたが作成した項目ではありません。"

        return returnedItem


def aggregate(info, model, group_by, related_model=None, **kwargs):

    filter_kwargs = {
        "date__gte": kwargs.get("date_after"),
        "date__lte": kwargs.get("date_before"),
        "department": from_global_id(kwargs.get("department"))[1],
        "user": info.context.user
    }

    filtered_objects = model.objects.filter(**filter_kwargs)

    aggregated_objects = filtered_objects.values(group_by).annotate(
        money=models.Sum("money"))

    if related_model:
        for object in aggregated_objects:
            object[group_by] = related_model.objects.get(
                                    id=object.pop(group_by))

    return aggregated_objects


class Query(graphene.ObjectType):

    sales_by_item = graphene.Field(SalesByItemNode,
                                   id=graphene.NonNull(graphene.ID))
    sales_by_category = graphene.Field(SalesByCategoryNode,
                                       id=graphene.NonNull(graphene.ID))
    cost = graphene.Field(CostNode, id=graphene.NonNull(graphene.ID))

    working_hours = graphene.Field(WorkingHoursNode,
                                   id=graphene.NonNull(graphene.ID))

    all_departments = DjangoFilterConnectionField(DepartmentNode)
    all_sales_units = DjangoFilterConnectionField(SalesUnitNode)
    all_sales_categories = DjangoFilterConnectionField(SalesCategoryNode)
    all_cost_items = DjangoFilterConnectionField(CostItemNode)
    all_employees = DjangoFilterConnectionField(EmployeeNode)
    all_sales_by_item = DjangoFilterConnectionField(SalesByItemNode)
    all_sales_by_category = DjangoFilterConnectionField(SalesByCategoryNode)
    all_cost = DjangoFilterConnectionField(CostNode)
    all_working_hours = DjangoFilterConnectionField(WorkingHoursNode)

    aggregation_kwargs = {
        "date_before": graphene.Date(required=True),
        "date_after": graphene.Date(required=True),
        "department": graphene.ID(required=True),
    }

    sales_by_category_aggregation = graphene.List(AmebaSalesByCategoryNode,
                                                  **aggregation_kwargs)

    sales_by_item_aggregation = graphene.List(AmebaSalesByItemNode,
                                              **aggregation_kwargs)

    cost_aggregation = graphene.List(AmebaCostNode, **aggregation_kwargs)

    working_hours_aggregation = graphene.List(AmebaWorkingHoursNode,
                                              **aggregation_kwargs)

    profit_per_hour_by_day = graphene.List(
        ProfitPerHourNode,
        days=graphene.Int(required=True),
        date=graphene.String(required=True),
        department=graphene.ID(required=True)
        )

    def resolve_cost(parent, info, **kwargs):
        return retrieve_by_id(Cost, info, **kwargs)

    def resolve_sales_by_item(parent, info, **kwargs):
        return retrieve_by_id(SalesByItem, info, **kwargs)

    def resolve_sales_by_category(parent, info, **kwargs):
        return retrieve_by_id(SalesByCategory, info, **kwargs)

    def resolve_working_hours(parent, info, **kwargs):
        return retrieve_by_id(WorkingHours, info, **kwargs)

    def resolve_sales_by_item_aggregation(parent, info, **kwargs):
        return aggregate(info, model=SalesByItem, related_model=SalesUnit,
                         group_by="item", **kwargs)

    def resolve_sales_by_category_aggregation(parent, info, **kwargs):
        return aggregate(info, model=SalesByCategory,
                         related_model=SalesCategory,
                         group_by="category", **kwargs)

    def resolve_cost_aggregation(self, info, **kwargs):
        return aggregate(info, model=Cost, related_model=CostItem,
                         group_by="item", **kwargs)

    def resolve_working_hours_aggregation(self, info, **kwargs):

        filter_kwargs = {
            "date__gte": kwargs.get("date_after"),
            "date__lte": kwargs.get("date_before"),
            "employee__department": from_global_id(
                kwargs.get("department"))[1],
            "user": info.context.user
        }

        filtered_objects = WorkingHours.objects.filter(**filter_kwargs)

        aggregated_objects = filtered_objects.values(
            "employee__position").annotate(hours=models.Sum("hours"))

        for object in aggregated_objects:
            object["position"] = object["employee__position"]

        return aggregated_objects

    def resolve_profit_per_hour_by_day(self, info, **kwargs):
        """14日間分の時間当たり採算を計算する"""

        returned_list = []
        days = kwargs.get("days")

        # str > datetime object > date object
        date_start = datetime.datetime.strptime(
            kwargs.get("date"), "%Y-%m-%d").date() \
            - datetime.timedelta(days=days-1)

        filter_kwargs = {
            "date": date_start,
            "department": AmebaDepartment.objects.get(
                id=from_global_id(kwargs.get("department"))[1]),
            "user": info.context.user
        }

        i = 0
        while i < days:
            filter_kwargs["date"] = \
                date_start + datetime.timedelta(days=i)

            # まず1日分のprofit per hourを計算
            cost = Cost.objects.filter(**filter_kwargs).aggregate(
                models.Sum("money"))["money__sum"]

            sales_by_item = SalesByItem.objects.filter(
                **filter_kwargs).aggregate(models.Sum("money"))["money__sum"]

            sales_by_category = SalesByCategory.objects.filter(
                **filter_kwargs).aggregate(models.Sum("money"))["money__sum"]

            working_hours = WorkingHours.objects.filter(
                date=filter_kwargs["date"],
                employee__department=filter_kwargs["department"]
                ).aggregate(models.Sum("hours"))["hours__sum"]

            profit_per_hour = 0

            if working_hours is None:
                profit_per_hour = Decimal(0)

            else:
                if sales_by_item is None:
                    sales_by_item = Decimal(0)

                if sales_by_category is None:
                    sales_by_category = Decimal(0)

                if cost is None:
                    cost = Decimal(0)

                profit_per_hour = (sales_by_item
                                   + sales_by_category
                                   - cost
                                   ) / working_hours

            returned_list.append({
                "profit_per_hour": str(round(profit_per_hour, 2)),
                "date": filter_kwargs["date"]
            })

            i += 1

        return returned_list

        # return [str(profit_per_hour)]
        # ループできるようにする（dateのメソッドを利用）

    def resolve_all_departments(self, info, **kwargs):
        return AmebaDepartment.objects.filter(user=info.context.user)

    def resolve_all_sales_categories(self, info, **kwargs):
        return SalesCategory.objects.filter(user=info.context.user)

    def resolve_all_sales_units(self, info, **kwargs):
        return SalesUnit.objects.filter(user=info.context.user)

    def resolve_all_cost_items(self, info, **kwargs):
        return CostItem.objects.filter(user=info.context.user)

    def resolve_all_employees(self, info, **kwargs):
        return Employee.objects.filter(user=info.context.user)

    def resolve_all_sales_by_item(self, info, **kwargs):
        return SalesByItem.objects.filter(
            user=info.context.user).order_by("date")

    def resolve_all_sales_by_category(self, info, **kwargs):
        return SalesByCategory.objects.filter(
            user=info.context.user).order_by("date")

    def resolve_all_cost(self, info, **kwargs):
        return Cost.objects.filter(
            user=info.context.user).order_by("date")

    def resolve_all_working_hours(self, info, **kwargs):
        return WorkingHours.objects.filter(
            user=info.context.user).order_by("date")


class Mutation(graphene.AbstractType):
    create_dept = DeptCreateMutation.Field()
    delete_dept = DeptDeleteMutation.Field()
    update_dept = DeptUpdateMutation.Field()

    create_sales_unit = SalesUnitCreateMutation.Field()
    delete_sales_unit = SalesUnitDeleteMutation.Field()
    update_sales_unit = SalesUnitUpdateMutation.Field()

    create_sales_category = SalesCategoryCreateMutation.Field()
    delete_sales_category = SalesCategoryDeleteMutation.Field()
    update_sales_category = SalesCategoryUpdateMutation.Field()

    create_cost_item = CostItemCreateMutation.Field()
    delete_cost_item = CostItemDeleteMutation.Field()
    update_cost_item = CostItemUpdateMutation.Field()

    create_employee = EmployeeCreateMutation.Field()
    delete_employee = EmployeeDeleteMutation.Field()
    update_employee = EmployeeUpdateMutation.Field()

    create_sales_by_item = SalesByItemCreateMutation.Field()
    delete_sales_by_item = SalesByItemDeleteMutation.Field()
    update_sales_by_item = SalesByItemUpdateMutation.Field()

    create_sales_by_category = SalesByCategoryCreateMutation.Field()
    delete_sales_by_category = SalesByCategoryDeleteMutation.Field()
    update_sales_by_category = SalesByCategoryUpdateMutation.Field()

    create_cost = CostCreateMutation.Field()
    delete_cost = CostDeleteMutation.Field()
    update_cost = CostUpdateMutation.Field()

    create_working_hours = WorkingHoursCreateMutation.Field()
    delete_working_hours = WorkingHoursDeleteMutation.Field()
    update_working_hours = WorkingHoursUpdateMutation.Field()
