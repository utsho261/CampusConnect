from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


BLOOD_GROUPS = [
    ('A+', 'A+'), ('A-', 'A-'),
    ('B+', 'B+'), ('B-', 'B-'),
    ('AB+', 'AB+'), ('AB-', 'AB-'),
    ('O+', 'O+'), ('O-', 'O-'),
]

DIVISIONS = [
    ('dhaka', 'Dhaka'), ('chittagong', 'Chittagong'),
    ('sylhet', 'Sylhet'), ('rajshahi', 'Rajshahi'),
    ('khulna', 'Khulna'), ('barisal', 'Barisal'),
    ('rangpur', 'Rangpur'), ('mymensingh', 'Mymensingh'),
]

URGENCY_LEVELS = [
    ('normal', 'Normal'), ('urgent', 'Urgent'), ('critical', 'Critical'),
]

REQUEST_STATUS = [
    ('open', 'Open'), ('urgent', 'Urgent'),
    ('in_progress', 'In Progress'), ('fulfilled', 'Fulfilled'), ('closed', 'Closed'),
]


class BloodDonor(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blood_donor_profile',
    )
    full_name = models.CharField(max_length=120)
    profile_photo = models.ImageField(upload_to='blood_donor_photos/', blank=True, null=True)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')])
    date_of_birth = models.DateField(null=True, blank=True)
    weight = models.PositiveSmallIntegerField(null=True, blank=True, help_text='Weight in kg')

    division = models.CharField(max_length=30, choices=DIVISIONS, blank=True)
    district = models.CharField(max_length=60, blank=True)
    upazila = models.CharField(max_length=60, blank=True)
    address = models.TextField(blank=True)

    last_donation_date = models.DateField(null=True, blank=True)
    is_available = models.BooleanField(default=True)
    emergency_available = models.BooleanField(default=False)
    medical_notes = models.TextField(blank=True)

    total_donations = models.PositiveIntegerField(default=0)
    is_approved = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', '-emergency_available', '-total_donations', '-created_at']

    def __str__(self):
        return f"{self.full_name} ({self.blood_group})"

    @property
    def next_eligible_date(self):
        if self.last_donation_date:
            return self.last_donation_date + timedelta(days=90)
        return None

    @property
    def is_eligible_to_donate(self):
        if not self.last_donation_date:
            return True
        return timezone.now().date() >= self.last_donation_date + timedelta(days=90)

    @property
    def donor_badge(self):
        if self.total_donations == 0:
            return 'new_donor'
        elif self.total_donations < 3:
            return 'active_donor'
        elif self.emergency_available and self.total_donations >= 3:
            return 'emergency_hero'
        elif self.total_donations >= 10:
            return 'life_saver'
        elif self.total_donations >= 5:
            return 'top_contributor'
        return 'active_donor'

    @property
    def lives_saved(self):
        return self.total_donations * 3


class BloodRequest(models.Model):
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blood_requests',
    )
    patient_name = models.CharField(max_length=120)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS)
    bags_needed = models.PositiveSmallIntegerField(default=1)

    hospital_name = models.CharField(max_length=200)
    hospital_location = models.CharField(max_length=200, blank=True)
    division = models.CharField(max_length=30, choices=DIVISIONS, blank=True)
    district = models.CharField(max_length=60, blank=True)

    contact_person = models.CharField(max_length=120)
    contact_number = models.CharField(max_length=20)

    urgency = models.CharField(max_length=10, choices=URGENCY_LEVELS, default='normal')
    status = models.CharField(max_length=15, choices=REQUEST_STATUS, default='open')
    required_date = models.DateField(null=True, blank=True)
    additional_notes = models.TextField(blank=True)

    # Admin can feature critical requests
    is_featured = models.BooleanField(default=False)

    # Like/share tracking
    shares_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return f"{self.blood_group} for {self.patient_name} at {self.hospital_name}"


class DonationRecord(models.Model):
    donor = models.ForeignKey(
        BloodDonor, on_delete=models.CASCADE, related_name='donation_records'
    )
    donated_to = models.CharField(max_length=120, blank=True)
    hospital = models.CharField(max_length=200, blank=True)
    donation_date = models.DateField()
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS)
    bags = models.PositiveSmallIntegerField(default=1)
    notes = models.TextField(blank=True)
    verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-donation_date']

    def __str__(self):
        return f"{self.donor.full_name} donated on {self.donation_date}"


class CommunityPost(models.Model):
    POST_TYPES = [
        ('story', 'Donation Story'), ('awareness', 'Awareness'), ('request', 'Request Share'),
    ]

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blood_posts'
    )
    post_type = models.CharField(max_length=15, choices=POST_TYPES, default='story')
    content = models.TextField()
    image = models.ImageField(upload_to='blood_posts/', blank=True, null=True)

    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='liked_blood_posts', blank=True
    )
    comments = models.JSONField(default=list)  # [{user, text, timestamp}]

    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.author.username}: {self.content[:50]}"

    @property
    def likes_count(self):
        return self.likes.count()
