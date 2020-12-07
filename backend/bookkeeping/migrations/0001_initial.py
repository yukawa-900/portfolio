# Generated by Django 3.1.3 on 2020-12-02 00:40

import bookkeeping.models
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=40, unique=True, verbose_name='勘定科目')),
                ('code', models.CharField(max_length=30, unique=True, validators=[django.core.validators.RegexValidator(message='半角数字・または半角大文字アルファベットで入力してください。例: AZ123', regex='[A-Z0-9]+$')], verbose_name='コード')),
                ('furigana', models.CharField(blank=True, max_length=30, null=True, verbose_name='ふりがな')),
                ('isActive', models.BooleanField(default=True, verbose_name='有効/無効')),
                ('description', models.CharField(blank=True, max_length=500, null=True, verbose_name='説明')),
            ],
            options={
                'db_table': 'account',
                'ordering': ['category', '-name'],
            },
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=30, unique=True, verbose_name='カテゴリー名')),
                ('order', models.IntegerField(verbose_name='順番')),
            ],
            options={
                'db_table': 'name',
            },
        ),
        migrations.CreateModel(
            name='Currency',
            fields=[
                ('title', models.CharField(max_length=100, verbose_name='タイトル')),
                ('currency', models.CharField(max_length=3, primary_key=True, serialize=False, verbose_name='ISO 4217 通貨コード')),
                ('isActive', models.BooleanField(default=True, verbose_name='有効/無効')),
            ],
        ),
        migrations.CreateModel(
            name='Department',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('code', models.CharField(max_length=30, unique=True, validators=[django.core.validators.RegexValidator(message='半角数字・または半角大文字アルファベットで入力してください。例: AZ123', regex='[A-Z0-9]+$')], verbose_name='コード')),
                ('name', models.CharField(max_length=100, verbose_name='部門名')),
            ],
        ),
        migrations.CreateModel(
            name='Tax',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('code', models.CharField(max_length=30, unique=True, validators=[django.core.validators.RegexValidator(message='半角数字・または半角大文字アルファベットで入力してください。例: AZ123', regex='[A-Z0-9]+$')], verbose_name='コード')),
                ('title', models.CharField(max_length=50, verbose_name='タイトル')),
                ('rate', models.IntegerField(verbose_name='税率')),
                ('isActive', models.BooleanField(default=True, verbose_name='有効/無効')),
            ],
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('order', models.IntegerField(verbose_name='順番')),
                ('debitCredit', models.IntegerField(choices=[(0, '借方'), (1, '貸方')], verbose_name='借方(0)貸方(1)')),
                ('money', models.DecimalField(decimal_places=0, max_digits=11, verbose_name='')),
            ],
            options={
                'db_table': 'transaction',
                'ordering': ['-group', 'order'],
            },
        ),
        migrations.CreateModel(
            name='TransactionGroup',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('slipNum', models.IntegerField(verbose_name='伝票番号')),
                ('date', models.DateField(verbose_name='転記日付')),
                ('createdOn', models.DateField(auto_now_add=True, verbose_name='入力日付')),
                ('memo', models.CharField(blank=True, max_length=200, null=True, verbose_name='備考')),
                ('pdf', models.FileField(blank=True, null=True, unique=True, upload_to=bookkeeping.models.pdf_file_path)),
                ('currency', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='bookkeeping.currency')),
                ('department', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='bookkeeping.department')),
            ],
            options={
                'db_table': 'transaction_group',
                'ordering': ['-date', '-slipNum'],
            },
        ),
    ]
