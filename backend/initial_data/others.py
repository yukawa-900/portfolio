from bookkeeping.models import Currency, Department, Tax


def create_currency_objects():
    currencies = [
        # 日本は除く
        {'title': 'カナダ・ドル', 'currency': 'CAD'},
        {'title': '香港ドル', 'currency': 'HKD'},
        {'title': 'アイスランド・クローナ', 'currency': 'ISK'},
        {'title': 'フィリピン・ペソ', 'currency': 'PHP'},
        {'title': 'デンマーク・クローネ', 'currency': 'DKK'},
        {'title': 'ハンガリー・フォリント', 'currency': 'HUF'},
        {'title': 'チェコ・コルナ', 'currency': 'CZK'},
        {'title': 'オーストラリア・ドル', 'currency': 'AUD'},
        {'title': 'ルーマニア・レウ', 'currency': 'RON'},
        {'title': 'スウェーデン・クローナ', 'currency': 'SEK'},
        {'title': 'インドネシア・ルピア', 'currency': 'IDR'},
        {'title': 'インド・ルピー', 'currency': 'INR'},
        {'title': 'ブラジル・レアル', 'currency': 'BRL'},
        {'title': 'ロシア・ルーブル', 'currency': 'RUB'},
        {'title': 'クロアチア・クーナ', 'currency': 'HRK'},
        {'title': 'タイ・バーツ', 'currency': 'THB'},
        {'title': 'スイス・フラン ', 'currency': 'CHF'},
        {'title': 'シンガポール・ドル', 'currency': 'SGD'},
        {'title': 'ポーランド・ズウォティ', 'currency': 'PLN'},
        {'title': 'ブルガリア・レフ', 'currency': 'BGN'},
        {'title': 'トルコ・リラ', 'currency': 'TRY'},
        {'title': '中国人民元', 'currency': 'CNY'},
        {'title': 'ノルウェー・クローネ', 'currency': 'NOK'},
        {'title': 'ニュージーランド・ドル', 'currency': 'NZD'},
        {'title': '南アフリカ・ランド', 'currency': 'ZAR'},
        {'title': '米国・ドル', 'currency': 'USD'},
        {'title': 'メキシコ・ペソ', 'currency': 'MXN'},
        {'title': 'イスラエル・シェケル', 'currency': 'ILS'},
        {'title': '英国ポンド', 'currency': 'GBP'},
        {'title': '韓国ウォン', 'currency': 'KRW'},
        {'title': 'マレーシア・リンギット', 'currency': 'MYR'},
        {'title': 'ユーロ', 'currency': 'EUR'},
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
