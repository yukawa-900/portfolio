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

CREATE_DEPT_QUERY = '''
              mutation CreateDepartmentMutation(
                  $input: DeptCreateMutationInput!
                ) {
                    createDept(input: $input) {
                        department {
                            id
                        }
                }
            }
        '''


class TestMutations(GraphQLTestCase, APITestCase):
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

    def test_success_create_dept(self):
        """
        （正常系）department作成をテスト。nameフィールドのみ。
        """

        patterns = [
            "恵比寿店",
            "新宿店新宿店新宿店新宿店新宿店新宿店新宿店新宿店新宿店新宿店",
        ]

        for pattern in patterns:
            with self.subTest(pattern):
                response = self.query(
                    CREATE_DEPT_QUERY,
                    headers=self.headers,
                    input_data={
                        "name": pattern
                    }
                )
                self.assertResponseNoErrors(response)

    # def test_failed_create_dept(self):
    #     """
    #     （異常系）department作成をテスト。nameフィールドのみ。
    #     """

    #     patterns = [
    #         "新宿店",  # 被り
    #         "池袋店",  # 被り
    #         # "新宿店新宿店新宿店新宿店新宿店新宿店新宿店新宿店新宿店新宿店新宿店新宿店",  # 文字制限
    #     ]

    #     for pattern in patterns:
    #         with self.subTest(pattern):
    #             response = self.query(
    #                 CREATE_DEPT_QUERY,
    #                 headers=self.headers,
    #                 input_data={
    #                     "name": pattern
    #                 }
    #             )

    #             content = json.loads(response.content)
    #             self.assertEqual(None, content["data"]["createDept"])

    def test_success_update_department(self):
        response = self.query(
                    '''
                    mutation UpdateDepartmentMutation(
                        $input: DeptUpdateMutationInput!
                    ) {
                        updateDept(input: $input) {
                            department {
                                id
                            }
                        }
                    }
                    ''',
                    headers=self.headers,
                    input_data={
                        "name": "香川店",
                        "id": self.dept_id
                    }
                )
        self.assertResponseNoErrors(response)

    def test_success_delete_department(self):
        response = self.query(
            '''
            mutation DeleteDepartmentMutation(
                $input: DeptDeleteMutationInput!
            ) {
                deleteDept(input: $input) {
                    department {
                        id
                    }
                }
            }
            ''',
            headers=self.headers,
            input_data={
                "id": self.dept_id
            }
        )

        self.assertResponseNoErrors(response)
