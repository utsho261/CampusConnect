import os
import django
import random
from datetime import timedelta
from django.utils import timezone
from django.core.files import File

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from academic.models import Note, CTQuestion, JobPosting
from blood_donation.models import BloodDonor, BloodRequest
from clubs.models import Club, Event
from marketplace.models import MarketplaceItem, Category
from emergency.models import EmergencyContact, EmergencyCategory
from leaderboard.models import ImpactProfile, PointLog

User = get_user_model()

print("Starting to seed dummy data with realistic entries and Cloudinary upload...")

# Create 10 Students
print("Seeding students...")
departments = ["CSE", "EEE", "BBA", "Civil", "Architecture"]
students = []
for i in range(1, 11):
    student_id = f"251100{i:03d}"
    email = f"student{i}@student.uiu.ac.bd"
    if not User.objects.filter(student_id=student_id).exists():
        user = User.objects.create_user(
            username=f"student_{i}",
            password="Password123!",
            student_id=student_id,
            university_email=email,
            department=random.choice(departments),
            role="student",
            verified=True,
            first_name=f"Student",
            last_name=f"{i}"
        )
        students.append(user)
    else:
        students.append(User.objects.get(student_id=student_id))

# 1. Notes (10 Items)
print("Seeding exactly 10 realistic notes...")
Note.objects.all().delete()
subjects = ["Data Structures", "Algorithms", "Microprocessors", "Accounting", "Structural Analysis", "Digital Logic", "Thermodynamics", "Linear Algebra", "Software Engineering", "Business Ethics"]
with open('dummy_note.pdf', 'rb') as pdf_f:
    for i in range(10):
        n = Note(
            uploaded_by=random.choice(students),
            title=f"Complete Guide to {subjects[i]} - Midterm",
            subject=subjects[i],
            department=random.choice(departments),
            intake=str(random.randint(40, 60)),
            description=f"This is a comprehensive study guide for {subjects[i]} covering chapters 1 to 5. It contains important formulas, derivations, and previous year questions.",
        )
        n.pdf_file.save(f"note_{i}.pdf", File(pdf_f))
        n.save()

# 2. CT Questions (10 Items)
print("Seeding exactly 10 realistic CT Questions...")
CTQuestion.objects.all().delete()
courses = ["CSE225", "EEE101", "BBA201", "CE301", "CSE323", "EEE201", "BBA405", "CE401", "CSE421", "EEE305"]
with open('dummy_note.pdf', 'rb') as pdf_f:
    for i in range(10):
        ct = CTQuestion(
            uploaded_by=random.choice(students),
            title=f"{courses[i]} CT-2 Question Paper - Fall 2024",
            course=courses[i],
            department=random.choice(departments),
            intake=str(random.randint(40, 60)),
            total_questions=random.randint(3, 5),
            difficulty=random.choice(['easy', 'medium', 'hard']),
            description=f"Class test 2 questions for {courses[i]} taken by Prof. XYZ."
        )
        ct.pdf_file.save(f"ct_{i}.pdf", File(pdf_f))
        ct.save()

# 3. Jobs (10 Items)
print("Seeding exactly 10 realistic Jobs...")
JobPosting.objects.all().delete()
job_titles = ["Software Engineer Intern", "Marketing Executive", "Structural Engineer", "Frontend Developer", "Data Analyst", "HR Assistant", "Backend Developer", "Sales Executive", "Project Manager", "Network Admin"]
for i in range(10):
    JobPosting.objects.create(
        posted_by=random.choice(students),
        title=job_titles[i],
        company_name=f"Company {i} Ltd",
        job_type=random.choice(['internship', 'full_time', 'part_time']),
        location="Dhaka, Bangladesh",
        description=f"We are hiring a passionate {job_titles[i]} to join our team. Excellent benefits and growth opportunities.",
        apply_link="https://linkedin.com/jobs",
        deadline=timezone.now() + timedelta(days=random.randint(10, 45)),
        status='approved'
    )

# 4. Blood Donation (10 Items)
print("Seeding exactly 10 Blood Requests...")
BloodRequest.objects.all().delete()
blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
hospitals = ["Evercare Hospital", "Square Hospital", "Labaid", "United Hospital", "Ibn Sina"]
for i in range(10):
    BloodRequest.objects.create(
        requested_by=random.choice(students),
        patient_name=f"Patient Name {i}",
        blood_group=random.choice(blood_groups),
        bags_needed=random.randint(1, 3),
        hospital_name=random.choice(hospitals),
        contact_person="Family Member",
        contact_number=f"01711{random.randint(10000, 99999)}",
        required_date=timezone.now() + timedelta(days=random.randint(1, 7))
    )

# 5. Clubs and Events (10 Clubs total)
print("Seeding exactly 10 Clubs...")
Club.objects.all().delete()
club_names = ["Computer Club", "Robotics Club", "Business Club", "Debate Club", "Cultural Club", "Sports Club", "Photography Club", "Literature Club", "Science Club", "Gaming Club"]
for i in range(10):
    club = Club.objects.create(
        name=club_names[i],
        description=f"The premier {club_names[i]} of the university, focusing on skill development and networking.",
        established_date=timezone.now().date() - timedelta(days=365*random.randint(1, 10)),
        status='approved'
    )
    # Add 1 event per club
    Event.objects.create(
        club=club,
        title=f"Annual {club_names[i]} Fest",
        description="Join us for the biggest event of the year!",
        date=timezone.now() + timedelta(days=random.randint(5, 60)),
        location="University Auditorium"
    )

# 6. Marketplace (10 Items)
print("Seeding exactly 10 Marketplace Items...")
MarketplaceItem.objects.all().delete()
cat_book, _ = Category.objects.get_or_create(name="Books", slug="books")
cat_lf, _ = Category.objects.get_or_create(name="Others", slug="others")
items = ["Calculus Book", "Physics Textbook", "Lost Wallet", "Found USB Drive", "Engineering Drawing Kit", "Lost ID Card", "Found Keys", "Data Structures Book", "Scientific Calculator", "Lost Umbrella"]
for i in range(10):
    MarketplaceItem.objects.create(
        seller=random.choice(students),
        listing_type="sell" if "Book" in items[i] or "Kit" in items[i] or "Calculator" in items[i] else "buy",
        category=cat_book if "Book" in items[i] else cat_lf,
        title=items[i],
        description=f"Details for {items[i]}. Please contact if interested.",
        price=random.randint(100, 500) if "sell" else 0
    )

# 7. Emergency (10 Contacts)
print("Seeding exactly 10 Emergency Contacts...")
EmergencyContact.objects.all().delete()
cat_em, _ = EmergencyCategory.objects.get_or_create(name="Emergency Responders", icon="alert-triangle")
contacts = ["Ambulance Service", "Fire Brigade", "Police Station", "University Medical", "Security Guard", "Blood Bank", "Pharmacy", "RAB", "National Helpline", "Mental Health Hotline"]
for i in range(10):
    EmergencyContact.objects.create(
        category=cat_em,
        name=contacts[i],
        phone=f"01811{random.randint(10000, 99999)}",
        location="Dhaka City"
    )

print("Data seeding completed successfully! All items now have 10 realistic entries.")
