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
# from decimal import Decimal
from .queries_base import SalesUnitNode, \
                          SalesCategoryNode, \
                          CostItemNode
from functools import partial
from datetime import timedelta
from dateutil import relativedelta


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
    date = graphene.Date()


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


class AmebaTableDetailNode(graphene.ObjectType):
    name = graphene.String()
    theDay = graphene.Int()
    theDayBefore = graphene.Int()
    oneWeekBefore = graphene.Int()
    theMonth = graphene.Int()
    theMonthBefore = graphene.Int()
    twoMonthsBefore = graphene.Int()


class AmebaTableRowNode(graphene.ObjectType):
    name = graphene.String()
    theDay = graphene.Int()
    theDayBefore = graphene.Int()
    oneWeekBefore = graphene.Int()
    theMonth = graphene.Int()
    theMonthBefore = graphene.Int()
    twoMonthsBefore = graphene.Int()
    detail = graphene.List(AmebaTableDetailNode)


# class AmebaTableNode(graphene.ObjectType):
    # pass


def get_filter_kwargs_for_date_range(**kwargs):

    filter_kwargs = {
        "date__gte": kwargs.get("date_after"),
        "date__lte": kwargs.get("date_before"),
        "department": from_global_id(kwargs.get("department"))[1],
    }

    return filter_kwargs


def aggregate(model, group_by,
              filter_kwargs,
              related_model=None,
              sum_by=["money"],
              sort_by=None,
              ):
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


def aggregate_working_hours(filter_kwargs):

    filtered_objects = WorkingHours.objects.filter(**filter_kwargs)

    aggregated_objects = filtered_objects.values(
        "employee__position").annotate(hours=models.Sum("hours"))

    for object in aggregated_objects:
        object["position"] = object.pop("employee__position")

    return aggregated_objects


# def get_x_days_before(date, days):
#     """str型のdateと、int型のdaysを受け取り、days日前の日付をdate型で返す"""
#     # str > datetime object > date object
#     now = datetime.datetime.strptime(
#         date, "%Y-%m-%d").date() \
#         - datetime.timedelta(days=days-1)

#     return now


def resolve_some_aggregation_by_day(
        date, delta, department,
        aggregate_func, isMonth=False):

    returned_list = []

    filter_kwargs = {
        "department": AmebaDepartment.objects.get(
            id=from_global_id(department)[1]),
    }

    if isMonth:
        now = date - relativedelta.relativedelta(months=delta)
        filter_kwargs["date__month"] = now.month
        filter_kwargs["date__year"] = now.year

    else:
        now = date - timedelta(days=delta)
        filter_kwargs["date"] = now

    i = 0
    while i < delta:
        if isMonth:
            now += relativedelta.relativedelta(months=1)
            filter_kwargs["date__month"] = now.month
            filter_kwargs["date__year"] = now.year
            aggregation = aggregate_func(
                filter_kwargs=filter_kwargs
            )
        else:
            filter_kwargs["date"] += datetime.timedelta(days=1)
            aggregation = aggregate_func(filter_kwargs={
                "department": filter_kwargs["department"],
                "date__gte": filter_kwargs.get("date"),
                "date__lte": filter_kwargs.get("date")
            }
            )

        returned_list.append({
            "date": filter_kwargs["date"]
            if not isMonth else f"{now.year}年 {now.month}月",
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
        "delta": graphene.Int(required=True),
        "isMonth": graphene.Boolean(required=False),
        "date": graphene.Date(required=True),
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

    table = graphene.List(AmebaTableRowNode,
                          date=graphene.Date(),
                          isMonth=graphene.Boolean(),
                          department=graphene.ID())

    def resolve_sales_by_item_aggregation(parent, info, **kwargs):
        """入力された日付範囲で、販売単価ごとに金額と売上個数を合計"""
        return aggregate_sales_by_item(
            filter_kwargs=get_filter_kwargs_for_date_range(**kwargs))

    def resolve_sales_by_category_aggregation(parent, info,
                                              filter_kwargs=None, **kwargs):
        """入力された日付範囲で、売上カテゴリーごとに売上高を合計"""

        if not filter_kwargs:
            filter_kwargs = get_filter_kwargs_for_date_range(**kwargs)

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

        # money_sum = 0
        # for s in aggregated_sales_by_category:
        #     money_sum += s["money"]
        # for s in aggregated_sales_by_item:
        #     money_sum += s["money"]
        # print("total", money_sum)

        aggregated_objects = []

        categories_of_aggregated_sales_by_item = \
            list(
                set([s["category"] for s in aggregated_sales_by_item])
            )

        for category_obj in aggregated_sales_by_category:
            if category_obj["category"] \
                    in categories_of_aggregated_sales_by_item:
                """カテゴリー入力＋そのカテゴリーに属するメニューが個数入力されている時"""
                for item_obj in aggregated_sales_by_item:
                    if item_obj["category"] == category_obj["category"]:
                        obj = {
                            "category": item_obj["category"],
                            "money": item_obj["money"] + category_obj["money"]
                        }
                        aggregated_objects.append(obj)
            else:
                """カテゴリー入力のみされている時"""
                obj = {
                    "category": category_obj["category"],
                    "money": category_obj["money"]
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

        aggregated_objects = aggregate_cost(
            filter_kwargs=get_filter_kwargs_for_date_range(**kwargs)
        )
        return sorted(aggregated_objects,
                      key=lambda x: x["money"],
                      reverse=True)

    def resolve_working_hours_aggregation(self, info, **kwargs):
        """入力された日付範囲で、従業員の労働区分ごとに労働時間を合計"""
        return aggregate_working_hours(
            filter_kwargs=get_filter_kwargs_for_date_range(**kwargs)
        )

    def resolve_all_aggregations_by_day(
            self, info, date, department, isMonth=False, delta=14, **kwargs):
        """days日間の毎日の売上・費用・労働時間・時間当たり採算を計算する"""

        returned_list = []

        filter_kwargs = {
            "department": AmebaDepartment.objects.get(
                id=from_global_id(department)[1]),
        }

        if isMonth:
            now = date - relativedelta.relativedelta(months=delta)
            filter_kwargs["date__year"] = now.year
            filter_kwargs["date__month"] = now.month

        else:
            now = date - timedelta(days=delta)
            filter_kwargs["date"] = now

        i = 0
        while i < delta:

            if isMonth:
                now += relativedelta.relativedelta(months=1)
                filter_kwargs["date__year"] = now.year
                filter_kwargs["date__month"] = now.month

            else:
                now += datetime.timedelta(days=1)
                filter_kwargs["date"] = now

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
                **filter_kwargs
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
                "date": f"{now.year}年 {now.month}月"
                if isMonth else filter_kwargs["date"],
                "profit_per_hour": round(profit_per_hour),
                "total_sales_money": round(sales_by_category + sales_by_item),
                "total_cost": round(cost),
                "total_hours": round(working_hours)
            })

            # 更新
            i += 1

        return returned_list

    def resolve_cost_aggregations_by_day(
            self, info, date, delta, department, isMonth=False, **kwargs):

        return resolve_some_aggregation_by_day(
            date=date,
            delta=delta,
            isMonth=isMonth,
            department=department,
            aggregate_func=aggregate_cost,
        )

    def resolve_sales_by_item_aggregations_by_day(
                self, info, date, delta, department, isMonth=False, **kwargs):

        return resolve_some_aggregation_by_day(
            date=date,
            delta=delta,
            isMonth=isMonth,
            department=department,
            aggregate_func=aggregate_sales_by_item,
        )

    def resolve_sales_by_category_aggregations_by_day(
                self, info, date, delta, department, isMonth=False, **kwargs):

        return resolve_some_aggregation_by_day(
            date=date,
            delta=delta,
            department=department,
            isMonth=isMonth,
            aggregate_func=partial(
                Query.resolve_sales_by_category_aggregation,
                parent=self,
                info=info,
                )
        )

    def resolve_table(self, info, date, department, isMonth):
        returned = {
            "売上": {"detail": []},
            "費用": {"detail": []},
            "労働時間": {"detail": []},
        }

        print(isMonth)

        dateDict = {
            "theMonth": date,
            "theMonthBefore": date - relativedelta.relativedelta(months=1),
            "twoMonthsBefore": date - relativedelta.relativedelta(months=2)
        } if isMonth else {
            "theDay": date,
            "theDayBefore": date - timedelta(days=1),
            "oneWeekBefore": date - timedelta(days=7)
        }

        arguments = {
            "売上": {
                "aggregate_func": partial(
                    Query.resolve_sales_by_category_aggregation,
                    parent=self,
                    info=info,
                    ),
                "related": "category",
                "sum_of": "money"
            },
            "費用": {
                "aggregate_func": aggregate_cost,
                "related": "item",
                "sum_of": "money"
            },
            "労働時間": {
                "aggregate_func": aggregate_working_hours,
                "related": "position",
                "sum_of": "hours"
            },
        }

        for arg_key, arg_value in arguments.items():
            for index, key in enumerate(dateDict.keys()):
                aggregation = resolve_some_aggregation_by_day(
                    date=dateDict[key],
                    isMonth=isMonth,
                    delta=1,
                    department=department,
                    aggregate_func=arg_value["aggregate_func"]
                )

                def get_name(item_info):
                    if arg_key == "労働時間":
                        return str(item_info[arg_value["related"]])
                    else:
                        return item_info[arg_value["related"]].name

                if index == 0:
                    sum = 0

                    for item_info in aggregation[0]["aggregation"]:

                        returned[arg_key]["detail"].append(
                            {
                                "name": str(get_name(item_info)),
                                key: item_info[arg_value["sum_of"]]
                            }
                        )
                        sum += item_info[arg_value["sum_of"]]

                    returned[arg_key][key] = sum

                else:
                    sum = 0
                    for item_info in aggregation[0]["aggregation"]:

                        existing_detail = returned[arg_key]["detail"]
                        sum += item_info[arg_value["sum_of"]]
                        for i, detail in enumerate(existing_detail):
                            if get_name(item_info) == detail["name"]:
                                # returenedの中に同じ名前のものがあった場合は、その辞書内に追加
                                # 例えば、{"name": "料理売上", "theDay": 3000} に
                                # "theDayBefore":2000を追加
                                returned[arg_key]["detail"][i][key] = \
                                    item_info[arg_value["sum_of"]]
                                break  # 内側のループを中断
                            elif len(existing_detail) == i:
                                # ループを最後まで終了して抜けた場合（同じ名前のものがなかった場合）
                                returned[arg_key]["detail"].append(
                                    {
                                        "name": get_name(item_info),
                                        "key": item_info[arg_value["sum_of"]]
                                    }
                                )
                    returned[arg_key][key] = sum

        returned_list = []
        for key, value in returned.items():
            returned_list.append({
                "name": key,
                **value
            })

        return returned_list
