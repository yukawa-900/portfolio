import graphene
import ameba.schema


class Query(ameba.schema.Query, graphene.ObjectType):
    pass


class Mutation(ameba.schema.Mutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
