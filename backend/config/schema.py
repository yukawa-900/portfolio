import graphene
import ameba.schema.queries_base
import ameba.schema.queries_analysis
import ameba.schema.mutations


class Query(ameba.schema.queries_base.Query,
            ameba.schema.queries_analysis.Query,
            graphene.ObjectType):
    pass


class Mutation(ameba.schema.mutations.Mutation,
               graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
