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
    2. from scraping import main
    3. main()
"""
import requests
from bs4 import BeautifulSoup
from bookkeeping.models import Account, Category


def scrape():
    url = 'https://www.sumoviva.jp/tools/account-title-dictionary/account/'
    res = requests.get(url)
    soup = BeautifulSoup(res.content, 'html.parser')
    table = soup.find(id='account_table')

    collected_data = dict()
    current_category = ''

    """collected_dataの形式
    {
        '現金預金': [{'name': '現金', 'furigana': 'げんきん', description: 説明}, ...],
        '売上債権': [{'name': '売掛金', 'furigana': 'うりかけきん', description: 説明}, ...],
    }
    """

    for row in table.find_all('tr'):

        category = row.get('class', [''])

        if category[0] == 'sub_cat':
            text = row.find('th').get_text(strip=True)
            current_category = text
            collected_data[current_category] = list()

        title = row.find(class_='title')
        description = row.find('p')

        if title and description:

            name = title.get_text(strip=True).split('（')[0]
            furigana = title.get_text(strip=True).split('（')[1][0:-1]
            description = description.get_text(strip=True)

            # {'name': '現金', description: 説明}
            inserted_data = {
                'name': name,
                'furigana': furigana,
                'description': description
            }

            # {'売上債権': [ ここにappendする ]}
            collected_data[current_category].append(inserted_data)

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

        Category.objects.create(name=category_name, order=category_order)
        category_order += 1

        for account in account_list:

            category = Category.objects.get(name=category_name)

            data = {
                'name': account['name'],
                'category': category,
                'furigana': account['furigana'],
                'description': account['description']
            }

            Account.objects.create(**data)


def main():
    collected_data = scrape()
    insert_data_into_db(collected_data)


if __name__ == '__main__':

    main()
