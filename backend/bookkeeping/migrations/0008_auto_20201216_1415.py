# Generated by Django 3.1.3 on 2020-12-16 05:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookkeeping', '0007_auto_20201213_1747'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='money',
            field=models.DecimalField(decimal_places=15, max_digits=31, verbose_name='金額（日本円）'),
        ),
    ]
