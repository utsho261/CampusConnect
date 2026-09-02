from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission


class User(AbstractUser):

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('senior_student', 'Senior Student'),
        ('club_authority', 'Club Authority'),
        ('admin', 'Admin'),
    )

    student_id = models.CharField(
        max_length=20,
        unique=True
    )

    department = models.CharField(
        max_length=100
    )

    university_email = models.EmailField(
        unique=True
    )

    intake = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student'
    )

    phone_number = models.CharField(max_length=20, blank=True, null=True)
    blood_group = models.CharField(max_length=10, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    cover_photo = models.ImageField(upload_to='covers/', blank=True, null=True)
    
    id_front = models.ImageField(upload_to='verification/', blank=True, null=True)
    id_back = models.ImageField(upload_to='verification/', blank=True, null=True)
    semester = models.CharField(max_length=50, blank=True, null=True)

    verified = models.BooleanField(
        default=False
    )

    login_count = models.PositiveIntegerField(
        default=0
    )

    is_blocked = models.BooleanField(
        default=False
    )

    max_usage_limit = models.PositiveIntegerField(
        default=0,
        help_text="0 means unlimited logins"
    )

    groups = models.ManyToManyField(
        Group,
        related_name="accounts_users",
        blank=True,
    )

    user_permissions = models.ManyToManyField(
        Permission,
        related_name="accounts_users_permissions",
        blank=True,
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


class FeaturePermission(models.Model):

    FEATURE_CHOICES = [
        ('notes', 'Notes Repository'),
        ('ct_questions', 'CT Question Bank'),
        ('lab_cover', 'Lab Cover Generator'),
        ('assignment_cover', 'Assignment Cover'),
        ('jobs', 'Job & Internship Board'),
        ('blood_donation', 'Blood Donation'),
        ('clubs_events', 'Club & Events'),
        ('lost_found', 'Lost & Found'),
        ('book_marketplace', 'Book Marketplace'),
        ('emergency', 'Emergency Contacts'),
    ]

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='feature_permissions',
        limit_choices_to={'role': 'student'},
    )

    feature_key = models.CharField(
        max_length=30,
        choices=FEATURE_CHOICES,
    )

    is_allowed = models.BooleanField(
        default=True,
    )

    daily_limit = models.PositiveIntegerField(
        default=0,
        help_text="0 means unlimited daily usage",
    )

    usage_count = models.PositiveIntegerField(
        default=0,
    )

    class Meta:
        unique_together = ('student', 'feature_key')
        ordering = ['feature_key']

    def __str__(self):
        status = "✓" if self.is_allowed else "✗"
        return f"{self.student.username} → {self.get_feature_key_display()} [{status}]"

