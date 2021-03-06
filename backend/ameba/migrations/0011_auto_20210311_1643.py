# Generated by Django 3.1.7 on 2021-03-11 07:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ameba', '0010_auto_20210310_1711'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='cost',
            name='user',
        ),
        migrations.RemoveField(
            model_name='employee',
            name='department',
        ),
        migrations.RemoveField(
            model_name='employee',
            name='user',
        ),
        migrations.RemoveField(
            model_name='salesbycategory',
            name='user',
        ),
        migrations.RemoveField(
            model_name='salesbyitem',
            name='user',
        ),
        migrations.RemoveField(
            model_name='workinghours',
            name='user',
        ),
        migrations.AddField(
            model_name='costitem',
            name='departments',
            field=models.ManyToManyField(to='ameba.AmebaDepartment', verbose_name='部門'),
        ),
        migrations.AddField(
            model_name='employee',
            name='departments',
            field=models.ManyToManyField(to='ameba.AmebaDepartment', verbose_name='部門'),
        ),
        migrations.AddField(
            model_name='employee',
            name='name',
            field=models.CharField(default='川人', max_length=30),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='salescategory',
            name='departments',
            field=models.ManyToManyField(to='ameba.AmebaDepartment', verbose_name='部門'),
        ),
        migrations.AddField(
            model_name='workinghours',
            name='department',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ameba.amebadepartment', verbose_name='部門'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='cost',
            name='item',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='ameba.costitem', verbose_name='費用項目'),
        ),
        migrations.AlterField(
            model_name='salesbycategory',
            name='category',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='ameba.salescategory', verbose_name='売上カテゴリー'),
        ),
        migrations.AlterField(
            model_name='salesbyitem',
            name='item',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='ameba.salesunit', verbose_name='売上項目'),
        ),
        migrations.AlterField(
            model_name='workinghours',
            name='employee',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='ameba.employee', verbose_name='費用項目'),
        ),
        migrations.AlterUniqueTogether(
            name='costitem',
            unique_together=set(),
        ),
        migrations.AlterUniqueTogether(
            name='salescategory',
            unique_together=set(),
        ),
        migrations.AlterUniqueTogether(
            name='salesunit',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='costitem',
            name='user',
        ),
        migrations.RemoveField(
            model_name='salescategory',
            name='user',
        ),
        migrations.RemoveField(
            model_name='salesunit',
            name='user',
        ),
    ]
