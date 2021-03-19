import graphene
# from graphene_django.types import DjangoObjectType
# from graphene_django.filter import DjangoFilterConnectionField
from graphene import relay
from graphql_relay import from_global_id
from ..models import AmebaDepartment, \
                    SalesUnit, \
                    SalesCategory, \
                    CostItem, \
                    SalesByItem, \
                    SalesByCategory, \
                    Cost, \
                    WorkingHours
from django.db import models
import datetime
from django.db.models import F
from decimal import Decimal
from .queries_base import SalesUnitNode, \
                          SalesCategoryNode, \
                          CostItemNode
from functools import partial


class AmebaSalesByItemNode(graphene.ObjectType):
    class Meta:
        interfaces = (relay.Node,)

    num = graphene.Int()
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


class AggregationNode(graphene.ObjectType):
    class Meta:
        interfaces = (relay.Node,)

    date = graphene.String()

    profit_per_hour = graphene.String()
    total_sales_money = graphene.String()
    total_cost = graphene.String()
    total_hours = graphene.String()

    # salesByCategory = graphene.Field(AmebaSalesByCategoryNode)
    # salesByItem = graphene.Field(AmebaSalesByItemNode)
    # cost = graphene.Field(AmebaCostNode)
    # workingHours = graphene.Field(AmebaWorkingHoursNode)


class CostAggregationWithDateNode(graphene.ObjectType):

    date = graphene.String()
    aggregation = graphene.List(AmebaCostNode)


class SalesByItemAggregationWithDateNode(graphene.ObjectType):

    date = graphene.String()
    aggregation = graphene.List(AmebaSalesByItemNode)


class SalesByCategoryAggregationWithDateNode(graphene.ObjectType):

    date = graphene.String()
    aggregation = graphene.List(AmebaSalesByCategoryNode)


def get_filter_kwargs(kwargs):
    filter_kwargs = {
        "date__gte": kwargs.get("date_after"),
        "date__lte": kwargs.get("date_before"),
        "department": from_global_id(kwargs.get("department"))[1],
    }
    return filter_kwargs


def aggregate(model, group_by,
              related_model=None,
              sum_by=["money"],
              sort_by=None,
              **kwargs):

    filter_kwargs = get_filter_kwargs(kwargs)

    filtered_objects = model.objects.filter(**filter_kwargs)

    annotation_kwargs = {}
    for s in sum_by:
        annotation_kwargs[s] = models.Sum(s)

    aggregated_objects = filtered_objects.values(group_by).annotate(
        **annotation_kwargs)

    if related_model:
        # 例. "item" → SalesUnitオブジェクト に変換
        for object in aggregated_objects:
            try:
                object[group_by] = related_model.objects.get(
                                        id=object.pop(group_by))
            except Exception:
                # related_model.objects.getでエラーが発生したとき
                # つまり関連先がnullの時
                object[group_by] = None

    if not sort_by:
        return aggregated_objects
    else:
        # sum_by の値で並び替え → 逆順にする
        return sorted(aggregated_objects,
                      key=lambda x: x[sort_by],
                      reverse=True)


aggregate_sales_by_item = partial(
    aggregate,
    model=SalesByItem,
    related_model=SalesUnit,
    group_by="item",
    sum_by=["money", "num"],
    sort_by="money",
    )

aggregate_cost = partial(
    aggregate,
    model=Cost,
    related_model=CostItem,
    sort_by=None,
    group_by="item",
    sum_by=["money"],
    )


def get_x_days_before(date, days):
    """str型のdateと、int型のdaysを受け取り、days日前の日付をdate型で返す"""
    # str > datetime object > date object
    date_start = datetime.datetime.strptime(
        date, "%Y-%m-%d").date() \
        - datetime.timedelta(days=days-1)

    return date_start


def resolve_some_aggregation_by_day(
        date, days,
        aggregate_func):

    returned_list = []

    date_start = get_x_days_before(date=date, days=days)

    i = 0
    while i < days:
        date = date_start + datetime.timedelta(days=i)
        aggregation = aggregate_func(
                                date_after=date,
                                date_before=date,
                                )

        returned_list.append({
            "date": date,
            "aggregation": aggregation
        })

        i += 1

    return returned_list


class Query(graphene.ObjectType):

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

    aggregation_by_day_kwargs = {
        "days": graphene.Int(required=True),
        "date": graphene.String(required=True),
        "department": graphene.ID(required=True)
    }

    all_aggregations_by_day = graphene.List(
        AggregationNode,
        **aggregation_by_day_kwargs
        )

    cost_aggregations_by_day = graphene.List(
        CostAggregationWithDateNode,
        **aggregation_by_day_kwargs
    )

    sales_by_item_aggregations_by_day = graphene.List(
        SalesByItemAggregationWithDateNode,
        **aggregation_by_day_kwargs
    )

    sales_by_category_aggregations_by_day = graphene.List(
        SalesByCategoryAggregationWithDateNode,
        **aggregation_by_day_kwargs
    )

    def resolve_sales_by_item_aggregation(parent, info, **kwargs):
        """入力された日付範囲で、販売単価ごとに金額と売上個数を合計"""
        return aggregate_sales_by_item(**kwargs)

    def resolve_sales_by_category_aggregation(parent, info, **kwargs):
        """入力された日付範囲で、売上カテゴリーごとに売上高を合計"""
        filter_kwargs = get_filter_kwargs(kwargs)

        filtered_sales_by_category = SalesByCategory.objects.filter(
            **filter_kwargs)
        filtered_sales_by_item = SalesByItem.objects.filter(
            **filter_kwargs)

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

        return sorted(aggregated_objects,
                      key=lambda x: x["money"],
                      reverse=True)

    def resolve_cost_aggregation(self, info, **kwargs):
        """入力された日付範囲で、費用項目ごとに費用（金額）を合計"""
        return aggregate_cost(**kwargs)

    def resolve_working_hours_aggregation(self, info, **kwargs):
        """入力された日付範囲で、従業員の労働区分ごとに労働時間を合計"""
        filter_kwargs = get_filter_kwargs(kwargs)

        filtered_objects = WorkingHours.objects.filter(**filter_kwargs)

        aggregated_objects = filtered_objects.values(
            "employee__position").annotate(hours=models.Sum("hours"))

        for object in aggregated_objects:
            object["position"] = object["employee__position"]

        return aggregated_objects

    def resolve_all_aggregations_by_day(
            self, info, date, department, days=14, **kwargs):
        """days日間の毎日の売上・費用・労働時間・時間当たり採算を計算する"""

        returned_list = []

        # str > datetime object > date object
        date_start = get_x_days_before(date=date, days=days)

        filter_kwargs = {
            "date": date_start,
            "department": AmebaDepartment.objects.get(
                id=from_global_id(department)[1]),
        }

        i = 0
        while i < days:
            filter_kwargs["date"] = \
                date_start + datetime.timedelta(days=i)

            # まず1日分のprofit per hourを計算
            cost = Cost.objects.filter(**filter_kwargs).aggregate(
                models.Sum("money"))["money__sum"] or 0

            sales_by_item = SalesByItem.objects.filter(
                **filter_kwargs).aggregate(
                    models.Sum("money"))["money__sum"] or 0

            sales_by_category = SalesByCategory.objects.filter(
                **filter_kwargs).aggregate(
                    models.Sum("money"))["money__sum"] or 0

            working_hours = WorkingHours.objects.filter(
                date=filter_kwargs["date"],
                department=filter_kwargs["department"]
                ).aggregate(models.Sum("hours"))["hours__sum"] or 0

            profit_per_hour = 0

            if working_hours == 0:
                profit_per_hour = 0

            else:
                profit_per_hour = (sales_by_item
                                   + sales_by_category
                                   - cost
                                   ) / working_hours

            returned_list.append({
                "date": filter_kwargs["date"],
                "profit_per_hour": round(profit_per_hour),
                "total_sales_money": round(sales_by_category + sales_by_item),
                "total_cost": round(cost),
                "total_hours": round(working_hours)
            })

            i += 1

        return returned_list

    def resolve_cost_aggregations_by_day(self, info, date, days, **kwargs):

        return resolve_some_aggregation_by_day(
            date=date,
            days=days,
            aggregate_func=partial(
                aggregate_cost,
                date_after=date,
                date_before=date,
                department=kwargs.get("department")
                )
        )

    def resolve_sales_by_item_aggregations_by_day(
                self, info, date, days, **kwargs):

        return resolve_some_aggregation_by_day(
            date=date,
            days=days,
            aggregate_func=partial(
                aggregate_sales_by_item,
                date_after=date,
                date_before=date,
                department=kwargs.get("department")
                )
        )

    def resolve_sales_by_category_aggregations_by_day(
                self, info, date, days, **kwargs):

        return resolve_some_aggregation_by_day(
            date=date,
            days=days,
            aggregate_func=partial(
                Query.resolve_sales_by_category_aggregation,
                parent=self,
                info=info,
                date_after=date,
                date_before=date,
                department=kwargs.get("department")
                )
        )
