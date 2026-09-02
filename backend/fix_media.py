import os
import django

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from django.apps import apps
from django.db import models

for model in apps.get_models():
    for field in model._meta.fields:
        if isinstance(field, models.FileField):
            for obj in model.objects.all():
                file_field = getattr(obj, field.name)
                if file_field and file_field.name:
                    file_path = os.path.join(settings.MEDIA_ROOT, file_field.name)
                    if not os.path.exists(file_path):
                        print(f'Creating missing file: {file_field.name}')
                        os.makedirs(os.path.dirname(file_path), exist_ok=True)
                        with open(file_path, 'w') as f:
                            f.write('This is a dummy file for the presentation.')
