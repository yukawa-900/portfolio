# from django.urls import reverse
from rest_framework.test import APITestCase
import json
import os
import initial_data.ameba.main
from graphene_django.utils.testing import GraphQLTestCase
from django.contrib.auth import get_user_model
from datetime import date, timedelta

LOGIN_URL = os.environ.get("API_URL") + "/dj-rest-auth/login/"
USER_EMAIL = "test@gmail.com"
USER_PASSWORD = "test_password"


class TestQueries(GraphQLTestCase, APITestCase):
    GRAPHQL_URL = "/api/v1/ameba/"

    @classmethod
    def setUpTestData(cls):
        initial_data.ameba.main.main(
            user_email=USER_EMAIL,
            user_password=USER_PASSWORD,
            days=4
        )

        cls.user = get_user_model().objects.get(
            email=USER_EMAIL
        )

        today = date.today()
        yesterday = today - timedelta(days=1)
        tomorrow = today + timedelta(days=1)

        cls.date_before = tomorrow.strftime("%Y-%m-%d")
        cls.date_after = yesterday.strftime("%Y-%m-%d")

    def setUp(self):
        response = self.client.post(
            LOGIN_URL,
            {
                "email": USER_EMAIL,
                "password": USER_PASSWORD
            }
        )

        token = json.loads(response.content)["access_token"]
        self.headers = {'HTTP_AUTHORIZATION': f'JWT {token}'}

        response = self.query(
            '''
            query AllDeptQuery {
                allDepartments {
                    edges {
                        node {
                            id
                            name
                        }
                    }
                }
            }
            ''',
            headers=self.headers
        )

        content = json.loads(response.content)
        self.dept_id = \
            content["data"]["allDepartments"]["edges"][0]["node"]["id"]

    def test_success_get_single_and_all_departments(self):
        response_all = self.query(
            '''
            query AllDeptQuery {
                allDepartments {
                    edges {
                        node {
                            id
                            name
                        }
                    }
                }
            }
            ''',
            headers=self.headers
        )

        self.assertResponseNoErrors(response_all)

        response_single = self.query(
            '''
            query getSingleDepartment($id: ID!) {
                department(id: $id) {
                    id
                    name
                }
            }
            ''',
            headers=self.headers,
            variables={"id": self.dept_id}
        )

        self.assertResponseNoErrors(response_single)

    def test_success_get_single_and_all_employees(self):
        response_all = self.query(
            '''
            query AllEmployeeQuery($departments: [ID]) {
                allEmployees(departments: $departments) {
                    edges {
                        node {
                        id
                        fullName
                        fullFurigana
                        position
                        photo
                        }
                    }
                }
            }
            ''',
            headers=self.headers
        )

        content = json.loads(response_all.content)
        sample_id = content["data"]["allEmployees"]["edges"][0]["node"]["id"]
        self.assertResponseNoErrors(response_all)

        response_single = self.query(
            '''
            query getSingleEmployee($id: ID!) {
                employee(id: $id) {
                    id
                    lastName
                    firstName
                    furiganaLastName
                    furiganaFirstName
                    photo
                    position
                    payment
                    departments {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
            }
            ''',
            headers=self.headers,
            variables={"id": sample_id}
        )

        self.assertResponseNoErrors(response_single)

    def test_success_get_single_and_all_cost_items(self):
        response_all = self.query(
            '''
            query AllCostItemsQuery($departments: [ID]) {
                allCostItems(departments: $departments) {
                edges {
                    node {
                    id
                    name
                    }
                }
                }
            }
            ''',
            headers=self.headers,
            variables={"departments": [self.dept_id]}
        )

        content = json.loads(response_all.content)
        sample_id = content["data"]["allCostItems"]["edges"][0]["node"]["id"]
        self.assertResponseNoErrors(response_all)

        response_single = self.query(
            '''
             query getSingleCostItem($id: ID!) {
                costItem(id: $id) {
                name
                id
                departments {
                    edges {
                            node {
                                id
                            }
                        }
                    }
                }
            }
            ''',
            headers=self.headers,
            variables={"id": sample_id}
        )

        self.assertResponseNoErrors(response_single)

    def test_success_get_single_and_all_sales_categories(self):
        response_all = self.query(
            '''
            query AllSalesCategoriesQuery($departments: [ID]) {
                allSalesCategories(departments: $departments) {
                edges {
                    node {
                    id
                    name
                    }
                }
                }
            }
            ''',
            headers=self.headers,
            variables={"departments": [self.dept_id]}
        )

        content = json.loads(response_all.content)
        sample_id = \
            content["data"]["allSalesCategories"]["edges"][0]["node"]["id"]
        self.assertResponseNoErrors(response_all)

        response_single = self.query(
            '''
             query getSingleSalesCategory($id: ID!) {
                salesCategory(id: $id) {
                id
                name
                departments {
                    edges {
                    node {
                        id
                    }
                    }
                }
                }
            }
            ''',
            headers=self.headers,
            variables={"id": sample_id}
        )

        self.assertResponseNoErrors(response_single)

    def test_success_get_single_and_all_sales_units(self):
        response_all = self.query(
            '''
            query AllSalesUnits($departments: [ID]) {
                allSalesUnits(departments: $departments) {
                edges {
                    node {
                    id
                    name
                    unitPrice
                    photo
                    }
                }
                }
            }
            ''',
            headers=self.headers,
            variables={"departments": [self.dept_id]}
        )

        content = json.loads(response_all.content)
        sample_id = content["data"]["allSalesUnits"]["edges"][0]["node"]["id"]
        self.assertResponseNoErrors(response_all)

        response_single = self.query(
            '''
            query getSingleSalesUnit($id: ID!) {
                salesUnit(id: $id) {
                    id
                    name
                    photo
                    unitPrice
                    category {
                        id
                    }
                    departments {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
            }
            ''',
            headers=self.headers,
            variables={"id": sample_id}
        )

        self.assertResponseNoErrors(response_single)

    def test_success_get_single_and_all_sales_by_item(self):
        response_all = self.query(
            '''
            query getAllSalesByItem(
                $dateBefore: Date,
                $dateAfter: Date,
                $department: ID
                ) {
                allSalesByItem(
                    date_Lte: $dateBefore
                    date_Gte: $dateAfter
                    department: $department
                ) {
                    edges {
                        node {
                        id
                        date
                        money
                        num
                        item {
                                id
                                name
                                unitPrice
                            }
                        }
                    }
                }
                }
            ''',
            headers=self.headers,
            variables={
                "department": self.dept_id,
                "dateBefore": self.date_before,
                "dateAfter": self.date_after,
                }
        )

        content = json.loads(response_all.content)
        sample_id = content["data"]["allSalesByItem"]["edges"][0]["node"]["id"]
        self.assertResponseNoErrors(response_all)

        response_single = self.query(
            '''
            query getSingleSalesByItem($id: ID!) {
                salesByItem(id: $id) {
                id
                date
                item {
                    id
                }
                num
                department {
                    id
                }
                }
            }
            ''',
            headers=self.headers,
            variables={"id": sample_id}
        )

        self.assertResponseNoErrors(response_single)

    def test_success_get_single_and_all_sales_by_category(self):
        response_all = self.query(
            '''
            query getAllSalesByCategory(
                $dateBefore: Date,
                $dateAfter: Date,
                $department: ID
                ) {
                allSalesByCategory(
                    date_Lte: $dateBefore
                    date_Gte: $dateAfter
                    department: $department
                ) {
                edges {
                    node {
                        id
                        date
                        money
                        category {
                            id
                            name
                        }
                    }
                }
                }
            }
            ''',
            headers=self.headers,
            variables={
                "department": self.dept_id,
                "dateBefore": self.date_before,
                "dateAfter": self.date_after,
                }
        )

        content = json.loads(response_all.content)
        sample_id = \
            content["data"]["allSalesByCategory"]["edges"][0]["node"]["id"]
        self.assertResponseNoErrors(response_all)

        response_single = self.query(
            '''
            query getSingleSalesByCategory($id: ID!) {
                salesByCategory(id: $id) {
                    id
                    date
                    category {
                        id
                    }
                    money
                    department {
                        id
                    }
                }
            }
            ''',
            headers=self.headers,
            variables={"id": sample_id}
        )

        self.assertResponseNoErrors(response_single)

    def test_success_get_single_and_all_cost(self):
        response_all = self.query(
            '''
            query getAllCost(
                $dateBefore: Date,
                $dateAfter: Date,
                $department: ID
                ) {
                allCost(
                    date_Lte: $dateBefore
                    date_Gte: $dateAfter
                    department: $department
                ) {
                edges {
                    node {
                    id
                    date
                    money
                    item {
                        id
                        name
                    }
                    }
                }
                }
            }
            ''',
            headers=self.headers,
            variables={
                "department": self.dept_id,
                "dateBefore": self.date_before,
                "dateAfter": self.date_after,
                }
        )

        content = json.loads(response_all.content)
        sample_id = content["data"]["allCost"]["edges"][0]["node"]["id"]
        self.assertResponseNoErrors(response_all)

        response_single = self.query(
            '''
            query getSingleCost($id: ID!) {
                cost(id: $id) {
                    id
                    date
                    item {
                        id
                    }
                    money
                    department {
                        id
                    }
                }
            }
            ''',
            headers=self.headers,
            variables={"id": sample_id}
        )

        self.assertResponseNoErrors(response_single)

    def test_success_get_single_and_all_working_hours(self):
        response_all = self.query(
            '''
            query getWorkingHours(
                $dateBefore: Date,
                $dateAfter: Date,
                $department: ID
                ) {
                allWorkingHours(
                    date_Lte: $dateBefore
                    date_Gte: $dateAfter
                    department: $department
                ) {
                    edges {
                        node {
                        id
                        date
                        hours
                        employee {
                            fullName
                            position
                            }
                        }
                    }
                }
            }
            ''',
            headers=self.headers,
            variables={
                "department": self.dept_id,
                "dateBefore": self.date_before,
                "dateAfter": self.date_after,
                }
        )

        content = json.loads(response_all.content)
        sample_id = \
            content["data"]["allWorkingHours"]["edges"][0]["node"]["id"]
        self.assertResponseNoErrors(response_all)

        response_single = self.query(
            '''
            query getSingleWorkingHours($id: ID!) {
                workingHours(id: $id) {
                    id
                    date
                    hours
                    employee {
                        id
                    }
                    department {
                        id
                    }
                }
            }
            ''',
            headers=self.headers,
            variables={"id": sample_id}
        )

        self.assertResponseNoErrors(response_single)

    def test_success_aggregations(self):
        """
        (正常系)salesByCategory, SalesByItem, cost,
        workingHoursのaggregationをまとめてテスト
        """

        response = self.query(
           '''
            query getAggregations(
                $dateAfter: Date!
                $dateBefore: Date!
                $department: ID!
            ) {
                costAggregation(
                    dateAfter: $dateAfter
                    dateBefore: $dateBefore
                    department: $department
                ) {
                    money
                    item {
                        id
                        name
                    }
                }
                salesByCategoryAggregation(
                    dateAfter: $dateAfter
                    dateBefore: $dateBefore
                    department: $department
                ) {
                    money
                    category {
                        id
                        name
                    }
                }
                salesByItemAggregation(
                    dateAfter: $dateAfter
                    dateBefore: $dateBefore
                    department: $department
                ) {
                    num
                    money
                    item {
                        id
                        name
                        photo
                    }
                }
                workingHoursAggregation(
                    dateAfter: $dateAfter
                    dateBefore: $dateBefore
                    department: $department
                ) {
                    hours
                    position
                }
            }
           ''',
           headers=self.headers,
           variables={
               "department": self.dept_id,
               "dateAfter": self.date_after,
               "dateBefore": self.date_before
           }
        )

        self.assertResponseNoErrors(response)

    def test_success_aggregations_by_day(self):
        """
        （正常系）日毎の集計をテスト
        """

        all_query = '''
          query allAggregationsByDay(
                $delta: Int!
                $isMonth: Boolean
                $date: Date!
                $department: ID!
            ) {
                allAggregationsByDay(
                delta: $delta
                isMonth: $isMonth
                date: $date
                department: $department
                ) {
                profitPerHour
                totalCost
                totalSalesMoney
                totalHours
                date
                }
            }
        '''

        cost_query = '''
            query costAggregationsByDay(
                $delta: Int!
                $isMonth: Boolean
                $date: Date!
                $department: ID!
            ) {
                costAggregationsByDay(
                delta: $delta
                isMonth: $isMonth
                date: $date
                department: $department
                ) {
                date
                aggregation {
                    money
                    item {
                    id
                    name
                    }
                }
                }
            }
        '''

        sales_by_category_query = '''
          query salesByCategoryAggregationsByDay(
                $delta: Int!
                $date: Date!
                $department: ID!
                $isMonth: Boolean
            ) {
                salesByCategoryAggregationsByDay(
                delta: $delta
                date: $date
                department: $department
                isMonth: $isMonth
                ) {
                date
                aggregation {
                    money
                    category {
                    id
                    name
                    }
                }
                }
            }
        '''

        sales_by_item_query = '''
            query salesByItemAggregationsByDay(
                $delta: Int!
                $date: Date!
                $department: ID!
                $isMonth: Boolean
            ) {
                salesByItemAggregationsByDay(
                delta: $delta
                date: $date
                department: $department
                isMonth: $isMonth
                ) {
                date
                aggregation {
                    money
                    num
                    item {
                    id
                    name
                    }
                }
                }
            }
        '''

        queries = [
            all_query,
            cost_query,
            sales_by_category_query,
            sales_by_item_query
        ]

        variables = {
            "department": self.dept_id,
            "delta": 14,
            "date": self.date_after,
            "isMonth": True,
        }

        patterns = []

        for boolean in (True, False):
            variables["isMonth"] = boolean
            for query in queries:
                patterns.append(
                    {
                        "query": query,
                        "variables": variables
                    }
                )

        for pattern in patterns:
            with self.subTest(pattern):
                response = self.query(
                    pattern["query"],
                    headers=self.headers,
                    variables=pattern["variables"]
                    )
                self.assertResponseNoErrors(response)

    def test_success_table_query(self):
        """（正常系）採算表用のqueryをテスト"""

        query = '''
            query Table($date: Date, $department: ID, $isMonth: Boolean) {
                table(
                    date: $date,
                    department: $department,
                    isMonth: $isMonth
                ) {
                    name
                    theDay
                    theDayBefore
                    oneWeekBefore
                    theMonth
                    theMonthBefore
                    twoMonthsBefore
                    detail {
                        name
                        theDay
                        theDayBefore
                        oneWeekBefore
                        theMonth
                        theMonthBefore
                        twoMonthsBefore
                    }
                }
            }
        '''

        variables = {
            "date": self.date_after,
            "department": self.dept_id,
            "isMonth": True,
        }

        for boolean in (True, False):
            variables["isMonth"] = boolean
            response = self.query(
                    query,
                    headers=self.headers,
                    variables=variables,
                )

            self.assertResponseNoErrors(response)
