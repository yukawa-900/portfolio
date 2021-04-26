"""
    robots.txtの確認(https://www.sumoviva.jp/robots.txt)
    ※2020-11-14の情報

    User-agent: *
    Disallow: /mt/
    Disallow: /assets_c/
    Disallow: /plugins/feedback.php
    Disallow: /*mt-preview*.html$
    ============================================
    データベースに挿入する手順
    1. python manage.py shell
    2. from scraping.accounts import main
    3. main()
"""
import requests
from bs4 import BeautifulSoup
from bookkeeping.models import Account, AccountCategory


def scrape():
    url = 'https://www.sumoviva.jp/tools/account-title-dictionary/account/'
    res = requests.get(url)
    soup = BeautifulSoup(res.content, 'html.parser')
    table = soup.find(class_='account')

    collected_data = dict()
    category = ""

    """collected_dataの形式
    {
        '現金預金': [{'name': '現金', 'furigana': 'げんきん', description: 説明}, ...],
        '売上債権': [{'name': '売掛金', 'furigana': 'うりかけきん', description: 説明}, ...],
    }
    """

    code = 1

    tbody = table.find("tbody")
    for row in tbody.find_all('tr'):

        if row.find("th"):
            category = row.find("th").get_text(strip=True)
            # print("カテゴリー", category)
        elif row.find("td"):
            table_data = row.find_all("td")
            text = table_data[0].get_text().split("（")
            title = text[0].strip()
            furigana = text[1].split("）")[0]
            # print("タイトル", title)
            # print("ふりがな", furigana)

            description = table_data[1].find_all("p")[1].get_text(strip=True)

            # print("説明", description)

            # {'name': '現金', description: 説明}
            inserted_data = {
                'name': title,
                'furigana': furigana,
                'code': 'DEFAULT' + str(code),
                'description': description
            }

            if not collected_data.get(category):
                collected_data[category] = []

            # {'売上債権': [ ここにappendする ]}
            collected_data[category].append(inserted_data)

            code += 1

    print(collected_data)
    return collected_data


def insert_data_into_db(collected_data):
    """collected_dataの形式
    {
        '現金預金': [{'name': '現金', 'furigana': 'げんきん', description: 説明}, ...],
        '売上債権': [{'name': '売掛金', 'furigana': 'うりかけきん', description: 説明}, ...],
    }
    """

    category_order = 0

    for category_name, account_list in collected_data.items():

        AccountCategory.objects.create(name=category_name, order=category_order)
        category_order += 1

        for account in account_list:

            category = AccountCategory.objects.get(name=category_name)

            data = {
                'name': account['name'],
                'category': category,
                'furigana': account['furigana'],
                'code': account['code'],
                'description': account['description']
            }

            Account.objects.create(**data)


def main():
    collected_data = scrape()
    insert_data_into_db(collected_data)


if __name__ == '__main__':

    main()
