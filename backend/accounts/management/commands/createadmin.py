from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = "Create an admin user for CampusConnect"

    def add_arguments(self, parser):
        parser.add_argument("--username", type=str, default="admin")
        parser.add_argument("--password", type=str, default="admin1234")
        parser.add_argument("--email", type=str, default="admin@campusconnect.com")
        parser.add_argument("--student-id", type=str, default="ADMIN-001")

    def handle(self, *args, **options):
        username = options["username"]
        password = options["password"]
        email = options["email"]
        student_id = options["student_id"]

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'Admin user "{username}" already exists.'))
            return

        user = User(
            username=username,
            student_id=student_id,
            department="Administration",
            university_email=email,
            role="admin",
            verified=True,
            is_staff=True,
            is_superuser=True,
        )
        user.set_password(password)
        user.save()

        self.stdout.write(
            self.style.SUCCESS(
                f'Admin user created!\n'
                f'  Username: {username}\n'
                f'  Password: {password}\n'
                f'  Role:     admin'
            )
        )
