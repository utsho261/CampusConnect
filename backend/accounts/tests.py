from django.test import TestCase
from rest_framework.test import APIClient

from .models import User


class ChangePasswordAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='student1',
            student_id='S123',
            department='CSE',
            university_email='student1@example.com',
            password='OldPass123!',
            role='student',
        )
        self.client.force_authenticate(user=self.user)

    def test_change_password_success(self):
        response = self.client.post(
            '/api/change-password/',
            {
                'current_password': 'OldPass123!',
                'new_password': 'NewPass123!',
                'confirm_password': 'NewPass123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass123!'))

    def test_change_password_rejects_invalid_current_password(self):
        response = self.client.post(
            '/api/change-password/',
            {
                'current_password': 'WrongPassword123!',
                'new_password': 'NewPass123!',
                'confirm_password': 'NewPass123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('OldPass123!'))
