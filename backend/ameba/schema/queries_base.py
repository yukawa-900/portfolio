import graphene
from graphene_django.types import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from graphene import relay
from graphql_relay import from_global_id
from ..models import AmebaDepartment, \
                    SalesUnit, \
                    SalesCategory, \
                    CostItem, \
                    Employee, \
                    SalesByItem, \
                    SalesByCategory, \
                    Cost, \
                    WorkingHours
from django.conf import settings
import boto3
import os


class NodeWithPhoto(DjangoObjectType):
    class Meta:
        abstract = True

    def resolve_photo(self, *_):
        if self.photo:
            objectpath = '{}{}'.format(settings.MEDIA_URL, self.photo)
            USE_S3 = os.environ.get('USE_S3') == 'TRUE'
            if USE_S3:
                client = boto3.client('s3')
                response = client.generate_presigned_url(
                    'get_object',
                    Params={
                        'Bucket': os.environ.get("AWS_STORAGE_BUCKET_NAME"),
                        'Key': objectpath[1:]  # 最初のスラッシュが邪魔になる
                    },
                    HttpMethod="GET",
                    ExpiresIn=3600)

                return response
            else:
                return os.environ.get("API_URL") + objectpath

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


def retrieve_by_id(model, info, **kwargs):
    id = kwargs.get("id")
    if id is not None:
        returnedItem = model.objects.get(
                            id=from_global_id(id)[1]
                        )

        return returnedItem


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
