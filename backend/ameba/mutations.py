import graphene
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
from django.db import models
from .queries import DepartmentNode, \
                     SalesUnitNode, \
                     SalesCategoryNode, \
                     CostItemNode, \
                     EmployeeNode, \
                     SalesByItemNode, \
                     SalesByCategoryNode, \
                     CostNode, \
                     WorkingHoursNode
from .validators import validate_photo
from graphene_file_upload.scalars import Upload
from django.db import transaction

# 汎用Mutationを作る

def assert_user(item, context_user):
    """
        万が一の事故に備える
        （フロントエンドから選択できるのは自分が作った項目だけだが）
    """

    message = "選択・編集・消去できるのは、自分が作った項目だけです。"
    user_who_created_item = context_user

    if hasattr(item, "user"):
        # AmebaDepartmentの場合
        user_who_created_item = item.user

    if hasattr(item, "department"):
        # 費用、売上、労働時間の場合
        user_who_created_item = item.department.user

    if (hasattr(item, "departments")):
        # 費用項目、売上項目、従業員の場合
        user_who_created_item = item.departments.all()[0].user

    assert user_who_created_item == context_user, message


def assert_dept_in_related_model_departments(input, related_object):
    """選択されたdepartmentが、関連先モデルが持っているdepartments一覧に含まれることを保証"""

    input_dept = input.get("department")

    if input_dept and hasattr(related_object, "departments"):
        # 設定項目の場合(EmployeeやCostItemなど)

        depts = related_object.departments.all()
        dept = AmebaDepartment.objects.get(id=from_global_id(input_dept)[1])
        # 例: related_object >> Employeeオブジェクト
        print(dept)
        print(depts)
        assert dept in depts, \
            "入力された部門はあなたの他の入力（従業員、売上カテゴリーなどの選択）と矛盾します"


class MyCreateMutation(relay.ClientIDMutation):
    """汎用CreateMutation"""
    class Meta:
        abstract = True

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        cls.createdItem = cls.model()

        for key, value in input.items():

            if key == "photo":
                validate_photo(value)
                setattr(cls.createdItem, key, value)

            elif isinstance(
                getattr(cls.model, key),
                models.fields.related_descriptors.ForwardManyToOneDescriptor
            ):
                # keyがForeignKeyの場合は

                # 関連するクラスを取得
                # 例: department >> AmebaDepartmentクラス、employee >> Employeeクラス
                related_model = \
                    getattr(cls.model, key).get_queryset()[0].__class__

                related_object = related_model.objects.get(
                                    id=from_global_id(value)[1]
                                    )

                assert_dept_in_related_model_departments(input, related_object)

                setattr(cls.createdItem,
                        key,
                        related_object
                        )

            elif key == "departments":
                # many to many の場合
                with transaction.atomic():

                    uuid_departments = []  # uuidに変換
                    for dept in input.get("departments"):
                        uuid_departments.append(from_global_id(dept)[1])

                    # createの場合は、いったんセーブしないと、M2Mフィールドを更新できない
                    cls.createdItem.save()

                    # departmentsを登録
                    cls.createdItem.departments.add(*uuid_departments)

            else:
                setattr(cls.createdItem, key, value)

        if hasattr(cls.model, "user"):
            # AmebaDepartmentの場合
            cls.createdItem.user = info.context.user

        assert_user(item=cls.createdItem, context_user=info.context.user)

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

        assert_user(context_user=info.context.user, item=cls.updatedItem)

        for key, value in input.items():
            if key == "photo":

                validate_photo(value)
                setattr(cls.updatedItem, key, value)

            elif isinstance(
                getattr(cls.model, key),
                models.fields.related_descriptors.ForwardManyToOneDescriptor
            ):
                # keyがForeignKeyの場合は

                # 関連するクラスを取得
                # 例: department >> AmebaDepartmentクラス
                related_model = \
                    getattr(cls.model, key).get_queryset()[0].__class__

                related_object = related_model.objects.get(
                                        id=from_global_id(value)[1]
                                        )

                assert_dept_in_related_model_departments(input, related_object)

                setattr(cls.updatedItem,
                        key,
                        related_object
                        )

            elif key == "departments":
                # many to many の場合

                uuid_departments = []
                for dept in value:
                    # inputされたdepartmentsを、uuidに変換
                    uuid_departments.append(from_global_id(dept)[1])

                for existedDept in cls.updatedItem.departments.all():
                    if str(existedDept.id) not in uuid_departments:
                        # 既存のDepartmentが、inputされたDepartmentの中に無かったら
                        # → ユーザーはそのDepartmentを消去したい
                        cls.updatedItem.departments.remove(existedDept)

                cls.updatedItem.departments.add(*uuid_departments)

            else:
                setattr(cls.updatedItem, key, value)

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

        assert_user(context_user=info.context.user, item=item)

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
        name = graphene.String(required=True)

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


class SalesCategoryCreateMutation(MyCreateMutation):

    model = SalesCategory
    sales_category = graphene.Field(SalesCategoryNode)

    class Input:
        name = graphene.String(required=True)
        departments = graphene.List(graphene.NonNull(
            graphene.ID), required=True)

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
        name = graphene.String(required=True)
        departments = graphene.List(graphene.NonNull(
            graphene.ID), required=True)

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


class SalesUnitCreateMutation(MyCreateMutation):

    model = SalesUnit
    salesUnit = graphene.Field(SalesUnitNode)
    photo = Upload(required=False)

    class Input:
        name = graphene.String(required=True)
        unitPrice = graphene.String(required=True)
        category = graphene.ID(required=True)
        departments = graphene.List(graphene.NonNull(
            graphene.ID), required=True)
        photo = Upload(required=False)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return SalesUnitCreateMutation(salesUnit=cls.createdItem)


class SalesUnitUpdateMutation(MyUpdateMutation):

    model = SalesUnit
    salesUnit = graphene.Field(SalesUnitNode)
    photo = Upload(required=False)

    class Input:
        id = graphene.ID(required=True)
        name = graphene.String(required=False)
        unitPrice = graphene.String(required=False)
        category = graphene.ID(required=False)
        departments = graphene.List(
            graphene.NonNull(graphene.ID), required=False)
        photo = Upload(required=False)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return SalesUnitUpdateMutation(salesUnit=cls.updatedItem)


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
        departments = graphene.List(graphene.NonNull(
            graphene.ID), required=True)

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
        name = graphene.String(required=True)
        departments = graphene.List(graphene.NonNull(
            graphene.ID), required=True)

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
    photo = Upload(required=False)

    class Input:
        firstName = graphene.String(required=True)
        lastName = graphene.String(required=True)
        furiganaFirstName = graphene.String(required=True)
        furiganaLastName = graphene.String(required=True)
        payment = graphene.String(required=True)
        position = graphene.Int(required=True)
        departments = graphene.List(graphene.NonNull(
            graphene.ID), required=True)
        photo = Upload(required=False)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):

        super().mutate_and_get_payload(root, info, **input)
        cls.perform_save()
        return EmployeeCreateMutation(employee=cls.createdItem)


class EmployeeUpdateMutation(MyUpdateMutation):

    model = Employee
    employee = graphene.Field(EmployeeNode)
    photo = Upload(required=False)

    class Input:
        id = graphene.ID(required=True)
        firstName = graphene.String(required=True)
        lastName = graphene.String(required=True)
        furiganaFirstName = graphene.String(required=False)
        furiganaLastName = graphene.String(required=False)
        payment = graphene.String(required=True)
        position = graphene.Int(required=True)
        departments = graphene.List(graphene.NonNull(
            graphene.ID), required=True)
        photo = Upload(required=False)

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
        date = graphene.Date(required=True)
        item = graphene.ID(required=True)
        num = graphene.String(required=True)
        department = graphene.ID(required=True)

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
        date = graphene.Date(required=True)
        category = graphene.ID(required=True)
        money = graphene.String(required=True)
        department = graphene.ID(required=True)

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
        date = graphene.Date(required=True)
        item = graphene.ID(required=True)
        money = graphene.String(required=True)
        department = graphene.ID(required=True)

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
        department = graphene.ID(required=True)

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
    department = graphene.ID(required=True)

    class Input:
        id = graphene.ID(required=True)
        date = graphene.Date(required=True)
        employee = graphene.ID(required=True)
        hours = graphene.String(required=True)

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
