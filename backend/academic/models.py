from django.db import models
from django.conf import settings


class Note(models.Model):

    DEPARTMENT_CHOICES = [
        ('CSE', 'CSE'),
        ('EEE', 'EEE'),
        ('BBA', 'BBA'),
        ('English', 'English'),
        ('Civil', 'Civil'),
        ('Architecture', 'Architecture'),
        ('Law', 'Law'),
    ]

    INTAKE_CHOICES = [
        (str(i), str(i))
        for i in range(30, 201)
    ]

    title = models.CharField(
        max_length=255
    )

    subject = models.CharField(
        max_length=255
    )

    department = models.CharField(
        max_length=50,
        choices=DEPARTMENT_CHOICES
    )

    intake = models.CharField(
        max_length=10,
        choices=INTAKE_CHOICES
    )

    description = models.TextField()

    pdf_file = models.FileField(
        upload_to='notes/'
    )

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notes'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} | {self.department} | Intake {self.intake}"


class CTQuestion(models.Model):

    DEPARTMENT_CHOICES = Note.DEPARTMENT_CHOICES
    INTAKE_CHOICES = Note.INTAKE_CHOICES

    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    title = models.CharField(
        max_length=255
    )

    course = models.CharField(
        max_length=255
    )

    department = models.CharField(
        max_length=50,
        choices=DEPARTMENT_CHOICES
    )

    intake = models.CharField(
        max_length=10,
        choices=INTAKE_CHOICES
    )

    total_questions = models.PositiveIntegerField()

    difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTY_CHOICES,
        default='medium'
    )

    description = models.TextField(
        blank=True
    )

    pdf_file = models.FileField(
        upload_to='ct_questions/'
    )

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ct_questions'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} | {self.department} | Intake {self.intake}"


class JobPosting(models.Model):

    DEPARTMENT_CHOICES = [('', 'All Departments')] + list(Note.DEPARTMENT_CHOICES)

    JOB_TYPE_CHOICES = [
        ('internship', 'Internship'),
        ('full_time', 'Full-time Job'),
        ('part_time', 'Part-time'),
        ('freelance', 'Freelance'),
    ]

    WORK_MODE_CHOICES = [
        ('on_site', 'On-site'),
        ('remote', 'Remote'),
        ('hybrid', 'Hybrid'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, blank=True, default='')
    location = models.CharField(max_length=255)
    work_mode = models.CharField(max_length=20, choices=WORK_MODE_CHOICES, default='on_site')
    salary_range = models.CharField(max_length=120, blank=True)
    deadline = models.DateField(null=True, blank=True)
    description = models.TextField()
    requirements = models.TextField()
    apply_link = models.URLField(blank=True)
    apply_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True)

    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='job_postings'
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_jobs'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} @ {self.company_name} [{self.status}]"


class AssignmentTemplate(models.Model):

    name = models.CharField(max_length=120)
    template_file = models.FileField(upload_to='assignment_templates/')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_active', '-created_at']

    def __str__(self):
        return self.name


class Assignment(models.Model):

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    template = models.ForeignKey(
        AssignmentTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assignments'
    )
    course_title = models.CharField(max_length=255)
    course_code = models.CharField(max_length=50)
    experiment_name = models.CharField(max_length=255)
    generated_file = models.FileField(upload_to='generated_assignments/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.course_code} | {self.student}"
