# Generated by Django 3.1.7 on 2021-03-16 06:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ameba', '0011_auto_20210311_1643'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workinghours',
            name='employee',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='ameba.employee', verbose_name='従業員'),
        ),
    ]
