from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0005_jobposting'),
    ]

    operations = [
        migrations.CreateModel(
            name='AssignmentTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('template_file', models.FileField(upload_to='assignment_templates/')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-is_active', '-created_at'],
            },
        ),
    ]
