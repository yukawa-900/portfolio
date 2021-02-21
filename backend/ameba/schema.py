import graphene
from graphene_django.types import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from graphene import relay
from graphql_relay import from_global_id
from decimal import Decimal
from .models import AmebaDepartment, \
                    SalesUnit, \
                    CostItem, \
                    Employee, \
                    Sales, \
                    Cost, \
                    WorkingHours
from django.db import models


class DepartmentNode(DjangoObjectType):
    class Meta:
        model = AmebaDepartment
        filter_fields = {}
        interfaces = (relay.Node,)


class SalesUnitNode(DjangoObjectType):
    class Meta:
        model = SalesUnit
        filter_fields = {}
        interfaces = (relay.Node,)


class CostItemNode(DjangoObjectType):
    class Meta:
        model = CostItem
        filter_fields = {}
        interfaces = (relay.Node,)


class EmployeeNode(DjangoObjectType):
    class Meta:
        model = Employee
        filter_fields = {}
        interfaces = (relay.Node,)
        # convert_choices_to_enum = False


class SalesNode(DjangoObjectType):
    class Meta:
        model = Sales
        filter_fields = {
            "date": ["exact"]
        }
        interfaces = (relay.Node,)


class CostNode(DjangoObjectType):
    class Meta:
        model = Cost
        filter_fields = {
            "date": ["exact"]
        }
        interfaces = (relay.Node,)


class WorkingHoursNode(DjangoObjectType):
    class Meta:
        model = WorkingHours
        filter_fields = {
            "date": ["exact"]
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
                    cls.model.department.get_queryset()[0].__class__

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
        code = graphene.String(required=True)

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
        code = graphene.String(required=False)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return DeptUpdateMutation(department=cls.updatedItem)


class DeptDeleteMutation(MyDeleteMutation):

    model = AmebaDepartment
    department = graphene.Field(DepartmentNode)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        return DeptDeleteMutation(department=None)


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


class SalesCreateMutation(MyCreateMutation):

    model = Sales
    sales = graphene.Field(SalesNode)

    class Input:
        date = graphene.Date(required=True)
        item = graphene.ID(required=False)
        num = graphene.String(required=False)
        money = graphene.String(required=False)
        department = graphene.ID(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):

        super().mutate_and_get_payload(root, info, **input)

        if not input.get("money"):
            cls.createdItem.money = \
                cls.createdItem.item.unitPrice * Decimal(cls.createdItem.num)

        cls.perform_save()

        return SalesCreateMutation(sales=cls.createdItem)


class SalesUpdateMutation(MyUpdateMutation):

    model = Sales
    sales = graphene.Field(SalesNode)

    class Input:
        id = graphene.ID(required=True)
        date = graphene.Date(required=False)
        item = graphene.ID(required=False)
        num = graphene.String(required=False)
        money = graphene.String(required=False)
        department = graphene.ID(required=False)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):

        super().mutate_and_get_payload(root, info, **input)

        if not input.get("money"):

            cls.updatedItem.money = \
                cls.updatedItem.item.unitPrice * Decimal(cls.updatedItem.num)

        cls.perform_save()

        return SalesUpdateMutation(sales=cls.updatedItem)


class SalesDeleteMutation(MyDeleteMutation):

    model = Sales
    sales = graphene.Field(SalesNode)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        return SalesDeleteMutation(sales=None)


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


class AmebaSalesNode(graphene.ObjectType):
    class Meta:
        filter_fields = {}
        interfaces = (relay.Node,)

    money = graphene.String()
    item = graphene.Field(SalesUnitNode)


class AmebaCostNode(graphene.ObjectType):
    class Meta:
        filter_fields = {}
        interfaces = (relay.Node,)

    money = graphene.String()
    item = graphene.Field(CostItemNode)


class AmebaWorkingHoursNode(graphene.ObjectType):
    class Meta:
        filter_fields = {}
        interfaces = (relay.Node,)

    hours = graphene.String()
    position = graphene.Int()


def create_ameba_aggregation_kwargs(**kwargs):
    filter_kwargs = {
        "date__gte": kwargs.get("date_after"),
        "date__lte": kwargs.get("date_before"),
        "department": from_global_id(kwargs.get("department"))[1]
    }

    return filter_kwargs


class Query(graphene.ObjectType):
    all_departments = DjangoFilterConnectionField(DepartmentNode)
    all_sales_units = DjangoFilterConnectionField(SalesUnitNode)
    all_cost_items = DjangoFilterConnectionField(CostItemNode)
    all_employees = DjangoFilterConnectionField(EmployeeNode)
    all_sales = DjangoFilterConnectionField(SalesNode)
    all_cost = DjangoFilterConnectionField(CostNode)
    all_working_hours = DjangoFilterConnectionField(WorkingHoursNode)

    aggregation_kwargs = {
        "date_before": graphene.Date(),
        "date_after": graphene.Date(),
        "department": graphene.ID(),
    }

    sales_aggregation = graphene.List(AmebaSalesNode, **aggregation_kwargs)

    cost_aggregation = graphene.List(AmebaCostNode, **aggregation_kwargs)

    working_hours_aggregation = graphene.List(AmebaWorkingHoursNode,
                                              **aggregation_kwargs)

    def resolve_sales_aggregation(parent, info, **kwargs):

        filter_kwargs = create_ameba_aggregation_kwargs(**kwargs)

        filtered_sales = Sales.objects.filter(**filter_kwargs)
        aggregated_sales = filtered_sales.values("item").annotate(
            money=models.Sum("money"))

        for sales in aggregated_sales:
            if (sales.get("item")):
                # item は null の場合もある
                sales["item"] = SalesUnit.objects.get(id=sales.pop("item"))
        return aggregated_sales

    def resolve_cost_aggregation(self, info, **kwargs):

        filter_kwargs = self.create_ameba_aggregation_kwargs(**kwargs)

        filtered_cost = Cost.objects.filter(**filter_kwargs)
        aggregated_cost = filtered_cost.values("item").annotate(
            money=models.Sum("money"))

        for cost in aggregated_cost:
            cost["item"] = CostItem.objects.get(id=cost.pop("item"))
        return aggregated_cost

    def resolve_working_hours_aggregation(self, info, **kwargs):

        filter_kwargs = self.create_ameba_aggregation_kwargs(**kwargs)

        filtered_hours = WorkingHours.objects.filter(**filter_kwargs)
        aggregated_hours = filtered_hours.values("employee__position"). \
            annotate(hours=models.Sum("hours"))

        for hours in aggregated_hours:
            hours["position"] = hours.pop("employee__position")
        return aggregated_hours

    # department = graphene.Field(DepartmentNode,
    #                             id=graphene.NonNull(graphene.ID))

    # def resolve_department(self, info, **kwargs):
    #     id = kwargs.get("id")
    #     if id is not None:
    #         returnedItem = AmebaDepartment.objects.get(
    #                             id=from_global_id(id)[1]
    #                         )

    #         assert returnedItem.user == info.context.user, \
    #             "これはあなたが作成した項目ではありません。"

    #         return returnedItem

    def resolve_all_departments(self, info, **kwargs):
        return AmebaDepartment.objects.filter(user=info.context.user)

    def resolve_all_sales_units(self, info, **kwargs):
        return SalesUnit.objects.filter(user=info.context.user)

    def resolve_all_cost_items(self, info, **kwargs):
        return CostItem.objects.filter(user=info.context.user)

    def resolve_all_employees(self, info, **kwargs):
        return Employee.objects.filter(user=info.context.user)

    def resolve_all_sales(self, info, **kwargs):
        return Sales.objects.filter(user=info.context.user)

    def resolve_all_cost(self, info, **kwargs):
        return Cost.objects.filter(user=info.context.user)

    def resolve_all_working_hours(self, info, **kwargs):
        return WorkingHours.objects.filter(user=info.context.user)


class Mutation(graphene.AbstractType):
    create_dept = DeptCreateMutation.Field()
    delete_dept = DeptDeleteMutation.Field()
    update_dept = DeptUpdateMutation.Field()

    create_sales_unit = SalesUnitCreateMutation.Field()
    delete_sales_unit = SalesUnitDeleteMutation.Field()
    update_sales_unit = SalesUnitUpdateMutation.Field()

    create_cost_item = CostItemCreateMutation.Field()
    delete_cost_item = CostItemDeleteMutation.Field()
    update_cost_item = CostItemUpdateMutation.Field()

    create_employee = EmployeeCreateMutation.Field()
    delete_employee = EmployeeDeleteMutation.Field()
    update_employee = EmployeeUpdateMutation.Field()

    create_sales = SalesCreateMutation.Field()
    delete_sales = SalesDeleteMutation.Field()
    update_sales = SalesUpdateMutation.Field()

    create_cost = CostCreateMutation.Field()
    delete_cost = CostDeleteMutation.Field()
    update_cost = CostUpdateMutation.Field()

    create_working_hours = WorkingHoursCreateMutation.Field()
    delete_working_hours = WorkingHoursDeleteMutation.Field()
    update_working_hours = WorkingHoursUpdateMutation.Field()
