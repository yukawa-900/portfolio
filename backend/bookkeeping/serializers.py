from rest_framework import serializers
from .models import Category, Account, Transaction
from django.core.exceptions import ValidationError
import datetime


class CategorySerializer(serializers.ModelSerializer):
    """現在は未使用"""
    class Meta:
        model = Category
        fields = ['id', 'name']
        extra_kwargs = {
            'name': {'read_only': True}
        }


class AccountSerializer(serializers.ModelSerializer):
    """ListViewのみ提供する"""

    categoryName = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Account
        fields = ['id', 'name', 'categoryName']
        # extra_kwargs = {
        #     'name': {'read_only': True},
        #     'categoryName': {'read_only': True},
        #     'description': {'read_only': True},
        # }


class TransactionListSerializer(serializers.ListSerializer):
    """
        複数のモデルオブジェクトをまとめて作成&更新するためのシリアライザー
        validated_data_listの形式：[辞書1, 辞書2, 辞書3]
    """

    def validate(self, data_list):
        """複数オブジェクトに対する、バリデーション"""

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
            → 借方・貸方が一致するバリデーションを追加
            → 全ての日付が一致しているかのバリデーションを追加
            オブジェクト１つごとcreateを呼ぶ（デフォルト）のではなく、リストにしてまとめて作成
        """

        transactions = [Transaction(**item) for item in validated_data_list]
        return Transaction.objects.bulk_create(transactions)

    def update(self, instances, validated_data_list):
        """
            views.pyでserializer.save()が呼ばれると実行される関数
            → 借方・貸方が一致するバリデーションを追加
            → 全ての日付が一致しているかのバリデーションを追加
            公式ドキュメントのexampleを参考にした↓
            https://www.django-rest-framework.org/api-guide/serializers/#listserializer
        """

        # 日付（文字列）を取得
        target_date = validated_data_list[0]['date']

        # # 文字列 → datetimeオブジェクト → dateオブジェクト
        # target_date_object = datetime.date(
        #     datetime.datetime.strptime(target_date_str, "%Y-%m-%d")
        #     )

        # インスタンスを上書きする（Delete対象のinstanceを取得するため)
        instances = Transaction.objects.filter(date=target_date)

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
                instances.delete()

        return ret


class BulkSerializer(serializers.ModelSerializer):
    """
        validated_dataに、idを加えるために、to_intervanl_valueをオーバーライド
        （注）デフォルトでは、raed_only=Trueのフィールドは、validated_dataに含まれない
    　　django-rest-framework-bulkというライブラリを参考にした
    """

    def to_internal_value(self, data):
        ret = super().to_internal_value(data)

        request_method = self.context['view'].request.method
        if request_method in ('PUT', 'PATCH'):
            id = self.fields['id'].get_value(data)
            ret['id'] = id

        return ret

        # getattr(getattr(self.context.get('view'), 'request'),
        #                          'method', '')


class TransactionSerializer(BulkSerializer):
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
