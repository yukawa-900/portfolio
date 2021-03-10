from bookkeeping.models import Currency, Department, Tax


def create_currency_objects():
    currencies = [
        {'name': '日本円', 'code': 'JPY'},
        {'name': 'カナダ・ドル', 'code': 'CAD'},
        {'name': '香港ドル', 'code': 'HKD'},
        {'name': 'アイスランド・クローナ', 'code': 'ISK'},
        {'name': 'フィリピン・ペソ', 'code': 'PHP'},
        {'name': 'デンマーク・クローネ', 'code': 'DKK'},
        {'name': 'ハンガリー・フォリント', 'code': 'HUF'},
        {'name': 'チェコ・コルナ', 'code': 'CZK'},
        {'name': 'オーストラリア・ドル', 'code': 'AUD'},
        {'name': 'ルーマニア・レウ', 'code': 'RON'},
        {'name': 'スウェーデン・クローナ', 'code': 'SEK'},
        {'name': 'インドネシア・ルピア', 'code': 'IDR'},
        {'name': 'インド・ルピー', 'code': 'INR'},
        {'name': 'ブラジル・レアル', 'code': 'BRL'},
        {'name': 'ロシア・ルーブル', 'code': 'RUB'},
        {'name': 'クロアチア・クーナ', 'code': 'HRK'},
        {'name': 'タイ・バーツ', 'code': 'THB'},
        {'name': 'スイス・フラン ', 'code': 'CHF'},
        {'name': 'シンガポール・ドル', 'code': 'SGD'},
        {'name': 'ポーランド・ズウォティ', 'code': 'PLN'},
        {'name': 'ブルガリア・レフ', 'code': 'BGN'},
        {'name': 'トルコ・リラ', 'code': 'TRY'},
        {'name': '中国人民元', 'code': 'CNY'},
        {'name': 'ノルウェー・クローネ', 'code': 'NOK'},
        {'name': 'ニュージーランド・ドル', 'code': 'NZD'},
        {'name': '南アフリカ・ランド', 'code': 'ZAR'},
        {'name': '米国・ドル', 'code': 'USD'},
        {'name': 'メキシコ・ペソ', 'code': 'MXN'},
        {'name': 'イスラエル・シェケル', 'code': 'ILS'},
        {'name': '英国ポンド', 'code': 'GBP'},
        {'name': '韓国ウォン', 'code': 'KRW'},
        {'name': 'マレーシア・リンギット', 'code': 'MYR'},
        {'name': 'ユーロ', 'code': 'EUR'},
    ]

    for currency in currencies:
        Currency.objects.create(**currency)


def create_tax_objects():
    taxes = [
        {'name': '消費税(8%)', 'rate': 8},
        {'name': '消費税(10%)', 'rate': 10},
        {'name': '不課税', 'rate': 0},
        {'name': '非課税', 'rate': 0},
    ]

    code = 1
    for tax in taxes:
        Tax.objects.create(**tax, code=code)
        code += 1


def main():
    create_currency_objects()
    create_tax_objects


if __name__ == '__main__':

    main()
    print('It’s done.')
