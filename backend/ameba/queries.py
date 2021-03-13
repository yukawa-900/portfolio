import graphene
from graphene_django.types import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
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
from django.db.models import F


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
        filter_fields = {
            "departments": ["exact"]
        }
        interfaces = (relay.Node,)


class CostItemNode(DjangoObjectType):
    class Meta:
        model = CostItem
        filter_fields = {
            "departments": ["exact"]
        }
        interfaces = (relay.Node,)


class EmployeeNode(NodeWithPhoto):
    class Meta:
        model = Employee
        filter_fields = {
            "departments": ["exact"]
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
        filter_fields = fields_date_department
        interfaces = (relay.Node,)


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

        return returnedItem


def aggregate(info, model, group_by, related_model=None, **kwargs):

    filter_kwargs = {
        "date__gte": kwargs.get("date_after"),
        "date__lte": kwargs.get("date_before"),
        "department": from_global_id(kwargs.get("department"))[1],
    }

    filtered_objects = model.objects.filter(**filter_kwargs)

    aggregated_objects = filtered_objects.values(group_by).annotate(
        money=models.Sum("money"))

    if related_model:
        for object in aggregated_objects:
            try:
                object[group_by] = related_model.objects.get(
                                        id=object.pop(group_by))
            except Exception:
                # related_model.objects.getでエラーが発生したとき
                # つまり関連先がnullの時
                object[group_by] = None

    return aggregated_objects


class Query(graphene.ObjectType):

    department = graphene.Field(DepartmentNode,
                                id=graphene.NonNull(graphene.ID))

    sales_unit = graphene.Field(SalesUnitNode,
                                id=graphene.NonNull(graphene.ID))

    sales_category = graphene.Field(SalesCategoryNode,
                                    id=graphene.NonNull(graphene.ID))

    cost_item = graphene.Field(CostItemNode,
                               id=graphene.NonNull(graphene.ID))

    employee = graphene.Field(EmployeeNode,
                              id=graphene.NonNull(graphene.ID))

    sales_by_item = graphene.Field(SalesByItemNode,
                                   id=graphene.NonNull(graphene.ID))
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

    def resolve_department(parent, info, **kwargs):
        return retrieve_by_id(AmebaDepartment, info, **kwargs)

    def resolve_sales_unit(parent, info, **kwargs):
        return retrieve_by_id(SalesUnit, info, **kwargs)

    def resolve_sales_category(parent, info, **kwargs):
        return retrieve_by_id(SalesCategory, info, **kwargs)

    def resolve_cost_item(parent, info, **kwargs):
        return retrieve_by_id(CostItem, info, **kwargs)

    def resolve_employee(parent, info, **kwargs):
        return retrieve_by_id(Employee, info, **kwargs)

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
        filter_kwargs = {
            "date__gte": kwargs.get("date_after"),
            "date__lte": kwargs.get("date_before"),
            "department": from_global_id(kwargs.get("department"))[1],
        }

        filtered_sales_by_category = SalesByCategory.objects.filter(**filter_kwargs)
        filtered_sales_by_item = SalesByItem.objects.filter(**filter_kwargs)

        aggregated_sales_by_category = filtered_sales_by_category.values(
            "category").annotate(
            money=models.Sum("money"))

        aggregated_sales_by_item = filtered_sales_by_item.annotate(
            category=F("item__category")).values("category").annotate(
                money=models.Sum("money"))

        aggregated_objects = []
        for category_obj in aggregated_sales_by_category:
            for item_obj in aggregated_sales_by_item:
                if item_obj["category"] == category_obj["category"]:
                    obj = {
                        "category": item_obj["category"],
                        "money": item_obj["money"] + category_obj["money"]
                    }
                    aggregated_objects.append(obj)

        for object in aggregated_objects:
            try:

                object["category"] = SalesCategory.objects.get(
                                        id=object.pop("category"))
            except Exception:
                # related_model.objects.getでエラーが発生したとき
                # つまり関連先がnullの時
                object["category"] = None

        return aggregated_objects

    def resolve_cost_aggregation(self, info, **kwargs):
        return aggregate(info, model=Cost, related_model=CostItem,
                         group_by="item", **kwargs)

    def resolve_working_hours_aggregation(self, info, **kwargs):

        filter_kwargs = {
            "date__gte": kwargs.get("date_after"),
            "date__lte": kwargs.get("date_before"),
            "department": from_global_id(kwargs.get("department"))[1],
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
                department=filter_kwargs["department"]
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
        return SalesCategory.objects.filter(
            departments__user=info.context.user)

    def resolve_all_sales_units(self, info, **kwargs):
        return SalesUnit.objects.filter(departments__user=info.context.user)

    def resolve_all_cost_items(self, info, **kwargs):
        return CostItem.objects.filter(
            departments__user=info.context.user)

    def resolve_all_employees(self, info, **kwargs):
        return Employee.objects.filter(
            departments__user=info.context.user)

    # ↓ department"s"ではなく、departmentに注意
    def resolve_all_sales_by_item(self, info, **kwargs):
        return SalesByItem.objects.filter(
            department__user=info.context.user).order_by("date")

    def resolve_all_sales_by_category(self, info, **kwargs):
        return SalesByCategory.objects.filter(
            department__user=info.context.user).order_by("date")

    def resolve_all_cost(self, info, **kwargs):
        return Cost.objects.filter(
            department__user=info.context.user).order_by("date")

    def resolve_all_working_hours(self, info, **kwargs):
        return WorkingHours.objects.filter(
            department__user=info.context.user).order_by("date")
