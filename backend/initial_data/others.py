from bookkeeping.models import Currency, Department, Tax


def create_currency_objects():
    currencies = [
        # 日本は除く
        {'title': 'カナダ・ドル', 'code': 'CAD'},
        {'title': '香港ドル', 'code': 'HKD'},
        {'title': 'アイスランド・クローナ', 'code': 'ISK'},
        {'title': 'フィリピン・ペソ', 'code': 'PHP'},
        {'title': 'デンマーク・クローネ', 'code': 'DKK'},
        {'title': 'ハンガリー・フォリント', 'code': 'HUF'},
        {'title': 'チェコ・コルナ', 'code': 'CZK'},
        {'title': 'オーストラリア・ドル', 'code': 'AUD'},
        {'title': 'ルーマニア・レウ', 'code': 'RON'},
        {'title': 'スウェーデン・クローナ', 'code': 'SEK'},
        {'title': 'インドネシア・ルピア', 'code': 'IDR'},
        {'title': 'インド・ルピー', 'code': 'INR'},
        {'title': 'ブラジル・レアル', 'code': 'BRL'},
        {'title': 'ロシア・ルーブル', 'code': 'RUB'},
        {'title': 'クロアチア・クーナ', 'code': 'HRK'},
        {'title': 'タイ・バーツ', 'code': 'THB'},
        {'title': 'スイス・フラン ', 'code': 'CHF'},
        {'title': 'シンガポール・ドル', 'code': 'SGD'},
        {'title': 'ポーランド・ズウォティ', 'code': 'PLN'},
        {'title': 'ブルガリア・レフ', 'code': 'BGN'},
        {'title': 'トルコ・リラ', 'code': 'TRY'},
        {'title': '中国人民元', 'code': 'CNY'},
        {'title': 'ノルウェー・クローネ', 'code': 'NOK'},
        {'title': 'ニュージーランド・ドル', 'code': 'NZD'},
        {'title': '南アフリカ・ランド', 'code': 'ZAR'},
        {'title': '米国・ドル', 'code': 'USD'},
        {'title': 'メキシコ・ペソ', 'code': 'MXN'},
        {'title': 'イスラエル・シェケル', 'code': 'ILS'},
        {'title': '英国ポンド', 'code': 'GBP'},
        {'title': '韓国ウォン', 'code': 'KRW'},
        {'title': 'マレーシア・リンギット', 'code': 'MYR'},
        {'title': 'ユーロ', 'code': 'EUR'},
    ]

    for currency in currencies:
        Currency.objects.create(**currency)


def create_tax_objects():
    taxes = [
        {'title': '消費税(8%)', 'rate': 8},
        {'title': '消費税(10%)', 'rate': 10},
        {'title': '不課税', 'rate': 0},
        {'title': '非課税', 'rate': 0},
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
