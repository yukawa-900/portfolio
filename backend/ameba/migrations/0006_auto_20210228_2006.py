# Generated by Django 3.1.7 on 2021-02-28 11:06

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('ameba', '0005_salesunit_category'),
    ]

    operations = [
        migrations.CreateModel(
            name='SalesByCategory',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('date', models.DateField(verbose_name='日付')),
                ('money', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0.01)], verbose_name='金額')),
                ('category', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='ameba.salescategory', verbose_name='売上カテゴリー')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SalesByItem',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('date', models.DateField(verbose_name='日付')),
                ('num', models.DecimalField(blank=True, decimal_places=0, default=1, max_digits=5, null=True, validators=[django.core.validators.MinValueValidator(0)], verbose_name='売上個数')),
                ('money', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0.01)], verbose_name='売上高')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.RemoveField(
            model_name='amebadepartment',
            name='code',
        ),
        migrations.DeleteModel(
            name='Sales',
        ),
        migrations.AddField(
            model_name='salesbyitem',
            name='department',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ameba.amebadepartment', verbose_name='部門'),
        ),
        migrations.AddField(
            model_name='salesbyitem',
            name='item',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='ameba.salesunit', verbose_name='売上項目'),
        ),
        migrations.AddField(
            model_name='salesbyitem',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='作成ユーザー'),
        ),
        migrations.AddField(
            model_name='salesbycategory',
            name='department',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ameba.amebadepartment', verbose_name='部門'),
        ),
        migrations.AddField(
            model_name='salesbycategory',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='作成ユーザー'),
        ),
    ]
