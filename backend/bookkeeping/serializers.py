from rest_framework import serializers
from rest_framework.fields import BooleanField
from .models import AccountCategory, Account, Transaction, TransactionGroup, \
                    Department, Tax, Currency, \
                    ExcludedAccount, ExcludedCurrency, \
                    ExcludedDepartment, ExcludedTax
from django.core.exceptions import ValidationError
import re
from datetime import date, timedelta
from .validators import PDFValidator


# class CustomModelSerializer(serializers.ModelSerializer):

#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)

#         view = self.context.get('view', '')
#         # test_serializers.pyのための、条件分岐
#         self.request_method = view.request.method if view else ''
#         self.request_user = view.request.user if view else ''


class TransactionSerializer(serializers.ModelSerializer):
    """
        勘定科目について
        出力：日本語（例: 現金、売掛金、）
        入力：ID (例:"dc6e3c0c-2845-4841-beb0-5714e9b2cd01")
    """
    accountName = serializers.ReadOnlyField(source='account.name')

    class Meta:
        model = Transaction
        exclude = ('group',)

    def validate_money(self, value):
        if value <= 0:
            raise ValidationError('金額は0より大きい必要があります')
        return value


class TransactionListSerializer(serializers.ListSerializer):
    """
        複数のモデルオブジェクトをまとめて作成&更新するためのシリアライザー
        validated_data_listの形式：[辞書1, 辞書2, 辞書3]
    """

    child = TransactionSerializer()


class TransactionGroupSerializer(serializers.ModelSerializer):
    transactions = TransactionListSerializer()

    class Meta:
        model = TransactionGroup
        exclude = ('user', )

        extra_kwargs = {
            'slipNum': {'read_only': True},
            'createdOn': {'read_only': True},
        }

    def create(self, validated_data):
        poped_transactions = validated_data.pop('transactions')
        transaction_group = TransactionGroup.objects.create(**validated_data)
        for transaction_data in poped_transactions:
            Transaction.objects.create(group=transaction_group,
                                       **transaction_data)
        return transaction_group

    def update(self, instance, validated_data):
        Transaction.objects.filter(group=instance).delete()
        for transaction_data in validated_data.pop('transactions'):
            Transaction.objects.create(group=instance, **transaction_data)
        transaction_group = super().update(instance, validated_data)
        return transaction_group

    def validate_date(self, value):

        if date.today() - value >= timedelta(days=365):
            raise ValidationError("1年以上前の日付は、受け入れられません")
        return value

    def validate_transactions(self, data_list):

        # データが2以上であることを保証
        if len(data_list) < 2:
            raise ValidationError('少なくとも2つのTransactionが必要です')

        # 借方・貸方一致のバリデーション
        total_debit = 0
        total_credit = 0

        for item in data_list:
            if item['debitCredit'] == 0:
                total_debit += float(item['money'])
            else:
                total_credit += float(item['money'])

        if round(total_debit) != round(total_credit):
            raise ValidationError('借方と貸方が一致しません')

        # orderのバリデーション
        order = []
        for item in data_list:
            order.append(item['order'])

        order.sort()

        if order[0] != 0:
            raise ValidationError('orderフィールドは0から始まる必要があります。')
        for index, order in enumerate(order):
            if index != int(order):
                raise ValidationError('orderフィールドの値に問題があります。')

        return data_list


class TransactionReadOnlySerializer(serializers.ModelSerializer):
    accountName = serializers.ReadOnlyField(source='account.name')
    tax = serializers.ReadOnlyField(source='tax.title')

    class Meta:
        model = Transaction
        exclude = ('group', 'id')


class TransactionReadOnlyListSerializer(serializers.ListSerializer):
    child = TransactionReadOnlySerializer()


class TransactionGroupReadOnlySerializer(serializers.ModelSerializer):
    transactions = TransactionReadOnlyListSerializer()

    currencyName = serializers.ReadOnlyField(source='currency.name')
    currencyCode = serializers.ReadOnlyField(source='currency.code')
    department = serializers.ReadOnlyField(source='department.name')

    class Meta:
        model = TransactionGroup
        exclude = ('user', 'currency')

        extra_kwargs = {
            'slipNum': {'read_only': True},
            'createdOn': {'read_only': True},
        }


class CreatedOnSerializer(serializers.Serializer):

    id = serializers.CharField()

    def validate(self, data):
        """
        注釈:過去の取引を編集できてしまうと、粉飾決算につながる
                そのため通常は、反対仕訳をきる必要がある
                ただしユーザーの「誤入力」を想定し、当日に編集した取引のみ「PUT, DELETE」を許容している
        """
        createdOn = TransactionGroup.objects.get(id=data['id']).createdOn

        if createdOn != date.today():
            raise serializers.ValidationError(
                        '編集できるのは今日編集した取引のみです。代わりに反対仕訳を切ってください。'
                        )
        return data


class TransactionPDFSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionGroup
        fields = ['id', 'pdf']
        extra_kwargs = {
            'id': {'read_only': True}
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['pdf'].validators = [PDFValidator()]


class AccountCategorySerializer(serializers.ModelSerializer):
    """List Viewのみ提供する"""
    class Meta:
        model = AccountCategory
        fields = ['name', 'id']


class TaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tax
        fields = '__all__'


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = '__all__'


class SettingsModelSerializer(serializers.ModelSerializer):
    """
        設定画面に関わる、継承用のSerializer
    """

    class Meta:
        abstract = True
        # fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True},
        }


class AccountSerializer(SettingsModelSerializer):

    categoryName = serializers.ReadOnlyField(source='category.name')
    categoryOrder = serializers.ReadOnlyField(source='category.order')

    class Meta(SettingsModelSerializer.Meta):
        model = Account
        exclude = ("category",)

    def validate_furigana(self, value):
        pattern = re.compile('[\u3041-\u309F]+')
        if not pattern.fullmatch(value):
            raise ValidationError('ふりがなは、平仮名である必要があります')
        return value


class DepartmentSerializer(SettingsModelSerializer):

    class Meta(SettingsModelSerializer.Meta):
        model = Department
        fields = '__all__'


class ExcludedItemListSerializer(serializers.ListSerializer):
    """
      isActiveをまとめて編集するためのシリアライザー
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        view = self.context.get('view', '')
        # test_serializers.pyのための、条件分岐
        self.request_method = view.request.method if view else ''
        self.request_user = view.request.user if view else ''

    def validate(self, data_list):

        # itemが重複していないかのバリデーション
        item_list = [item['item'] for item in data_list]

        if len(item_list) != len(set(item_list)):
            raise ValidationError(
                "1つの項目を同時に2回以上編集しようとしています。どれが正しいのか分かりません。"
                )
        return data_list

    def create(self, validated_data_list):
        # excludedテーブルに、まだ何も登録されていない場合
        ret = []
        for data in validated_data_list:
            if data['isActive'] is False:
                ret.append(self.child.create(item=data['item'],
                                             user=self.request_user))

        return ret

    def update(self, instances, validated_data_list):
        """
            views.pyでserializer.save()が呼ばれると実行される関数
            DBに登録するのは、ユーザーが「使わないもの」
        """

        instance_mapping = {instance.item: instance
                            for instance in instances}

        request_mapping = {data['item']: data
                           for data in validated_data_list}  # ユーザーからのデータ

        # 作成 & 消去 を実行する
        ret = []
        for item, request_data in request_mapping.items():

            instance = instance_mapping.get(item)

            if (instance is None) and (request_data['isActive'] is False):
                # まだDBに登録されていない & isActive == Falseのとき

                ret.append(self.child.create(item=item,
                                             user=self.request_user))
                print(ret)

            elif (instance) and (request_data['isActive'] is True):
                # 既にDBに登録されている & isActive == Trueのとき
                instance.delete()

            else:
                # まだDBに登録されていない & isActive == Trueのとき
                # 既にDBに登録されている & isActive == Falseのとき
                print('Nothing to do')

        return ret


class ExcludedItemSerializer(serializers.ModelSerializer):

    isActive = BooleanField()

    def create(self, **kwargs):
        ModelClass = self.Meta.model
        instance = ModelClass.objects.create(**kwargs)

        return instance

    class Meta:
        abstract = True
        list_serializer_class = ExcludedItemListSerializer
        fields = ['item', 'isActive']


class ExcludedTaxSerializer(ExcludedItemSerializer):

    class Meta(ExcludedItemSerializer.Meta):
        model = ExcludedTax


class ExcludedCurrencySerializer(ExcludedItemSerializer):

    class Meta(ExcludedItemSerializer.Meta):
        model = ExcludedCurrency


class ExcludedAccountSerializer(ExcludedItemSerializer):

    class Meta(ExcludedItemSerializer.Meta):
        model = ExcludedAccount


class ExcludedDepartmentSerializer(ExcludedItemSerializer):

    class Meta(ExcludedItemSerializer.Meta):
        model = ExcludedDepartment
