from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = "Create default admin user (student_id: admin, password: 123456)"

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            student_id='admin',
            defaults={
                'username': 'admin',
                'department': 'Admin',
                'university_email': 'admin@campusconnect.local',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'verified': True,
            },
        )
        user.set_password('123456')
        user.is_staff = True
        user.is_superuser = True
        user.role = 'admin'
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS('Admin user created.'))
        else:
            self.stdout.write(self.style.SUCCESS('Admin user updated.'))
