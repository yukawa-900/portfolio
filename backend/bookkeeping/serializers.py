from rest_framework import serializers
from .models import Account, Transaction
from django.core.exceptions import ValidationError
import re


class AccountSerializer(serializers.ModelSerializer):
    """ListViewのみ提供する"""

    categoryName = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Account
        fields = ['id', 'name',  'furigana', 'categoryName', 'description']

    def validate_furigana(self, value):
        pattern = re.compile('[\u3041-\u309F]+')
        if not pattern.fullmatch(value):
            raise ValidationError('ふりがなは、平仮名である必要があります')


class TransactionListSerializer(serializers.ListSerializer):
    """
        複数のモデルオブジェクトをまとめて作成&更新するためのシリアライザー
        validated_data_listの形式：[辞書1, 辞書2, 辞書3]
    """

    def validate(self, data_list):

        # idが重複していないかのバリデーション
        if data_list[0].get('id'):
            # Createの場合は、idが存在しないため、このif文が無いと、KeyErrorとなる

            id_list = [item['id'] for item in data_list]

            if len(id_list) != len(set(id_list)):
                raise ValidationError(
                    "1つの取引を同時に2回以上編集しようとしています。どれが正しいのか分かりません。"
                    )

        # 借方・貸方一致のバリデーション
        total_debit = 0
        total_credit = 0

        for item in data_list:
            if item['debitCredit'] == 0:
                total_debit += int(item['money'])
            else:
                total_credit += int(item['money'])

        if total_debit != total_credit:
            raise ValidationError('借方と貸方が一致しません')

        # 異なる日付の取引に対するバリデーション
        if len(set([item["date"] for item in data_list])) > 1:
            raise ValidationError('異なる日付の取引を編集することはできません')

        # orderに対するバリデーション（0から始まっているか）（0, 1, 2・・と順番になっているか）
        debits = []
        credits = []
        for item in data_list:
            if item['debitCredit'] == 0:
                debits.append(item['order'])
            else:
                credits.append(item['order'])

        debits.sort()
        credits.sort()

        def check_order(list):
            if list[0] != 0:
                raise ValidationError('orderフィールドは0から始まる必要があります。')
            for index, order in enumerate(list):
                if index != int(order):
                    raise ValidationError('orderフィールドの値に問題があります。')

        check_order(debits)
        check_order(credits)

        return data_list

    def create(self, validated_data_list):
        """
            オブジェクト１つごとcreateを呼ぶ（デフォルト）のではなく、リストにしてまとめて作成
        """

        transactions = [Transaction(**item) for item in validated_data_list]
        return Transaction.objects.bulk_create(transactions)

    def update(self, instances, validated_data_list):
        """
            views.pyでserializer.save()が呼ばれると実行される関数
            update()に渡ってくるinstancesは、validated_data_listに対応するinstance（更新対象のインスタンス）だけなので、
            消去対象となるインスタンスを、後から追加している
        """

        # 日付を取得（instancesの中に、異なる日付のものは含まれない（バリデーション済））
        target_date = instances[0].date

        instances = list(instances)  # extendメソッドを使うために、リスト型に変換

        # 既存のインスタンスを、DBから取り出す（後に消去するため）
        existing_instances = Transaction.objects.filter(date=target_date)

        # ユーザーからリクエストがあった更新対象のインスタンスに加えて、同じ日付を持つインスタンスをリストに加えた
        instances.extend(existing_instances)

        # （辞書内包表記）
        instance_mapping = {str(instance.id): instance
                            for instance in instances}  # 更新対象のモデルオブジェクト

        request_mapping = {str(item.pop('id')): item  # idを消去しないと、エラーが出る
                           for item in validated_data_list}  # ユーザーからのデータ

        # Perform creations and updates.
        ret = []
        for id, request_data in request_mapping.items():
            instance = instance_mapping.get(id, None)
            if instance is None:
                ret.append(self.child.create(request_data))
            else:
                ret.append(self.child.update(instance, request_data))

        # Perform deletions.
        for id, instance in instance_mapping.items():
            if id not in request_mapping:
                instance.delete()

        return ret


class TransactionSerializer(serializers.ModelSerializer):
    """
        勘定科目について
        出力：日本語（例: 現金、売掛金、）
        入力：ID (例:"dc6e3c0c-2845-4841-beb0-5714e9b2cd01")
    """
    accountName = serializers.ReadOnlyField(source='account.name')

    class Meta:
        model = Transaction
        list_serializer_class = TransactionListSerializer

        fields = ['id', 'user', 'debitCredit', 'account', 'accountName',
                  'money', 'date', 'order', 'memo']

        extra_kwargs = {
            'account': {'write_only': True},
            'user': {'read_only': True}
        }

    def to_internal_value(self, data):
        """
            validated_dataに、idを加えるために、to_intervanl_valueをオーバーライド
            （注）デフォルトでは、raed_only=Trueのフィールドは、validated_dataに含まれない
            django-rest-framework-bulkというライブラリを参考にした
        """
        ret = super().to_internal_value(data)

        view = self.context.get('view', '')

        # test_serializers.pyのための、条件分岐
        request_method = view.request.method if view else ''

        if request_method in ('PUT', 'PATCH'):
            id = self.fields['id'].get_value(data)
            ret['id'] = id

        # print("************************\n")
        return ret

    def validate_money(self, value):
        if value <= 0:
            raise ValidationError('金額は0より大きい必要があります')
        return value

    # order > 0のバリデーションは、ListSerializerで行っている
