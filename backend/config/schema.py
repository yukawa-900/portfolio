import graphene
import ameba.queries
import ameba.mutations


class Query(ameba.queries.Query, graphene.ObjectType):
    pass


class Mutation(ameba.mutations.Mutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
