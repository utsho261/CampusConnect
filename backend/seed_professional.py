import os
import django
import random
from datetime import timedelta
from django.utils import timezone

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

print("Starting to seed professional dummy data...")

# 1. Add 10 students
print("Seeding students...")
departments = ["CSE", "EEE", "BBA", "Civil", "Architecture"]
students = []
for i in range(1, 11):
    student_id = f"231100{i:03d}"
    email = f"student{i}@student.uiu.ac.bd"
    if not User.objects.filter(student_id=student_id).exists():
        user = User.objects.create_user(
            username=f"student{i}",
            password="password123",
            student_id=student_id,
            university_email=email,
            department=random.choice(departments),
            role="student",
            verified=True,
            first_name="John",
            last_name=f"Doe {i}"
        )
        students.append(user)
    else:
        students.append(User.objects.get(student_id=student_id))

# 2. Leaderboard Points
print("Seeding leaderboard...")
for student in students:
    profile, _ = ImpactProfile.objects.get_or_create(user=student)
    points_to_add = random.randint(100, 1000)
    profile.academic_points += points_to_add
    profile.save()
    PointLog.objects.create(
        user=student,
        category='academic',
        action_name="Initial seed points",
        points=points_to_add
    )

# 3. Academic - Notes
print("Seeding notes...")
note_topics = [
    ("Data Structures and Algorithms", "CSE"),
    ("Digital Logic Design", "CSE"),
    ("Marketing Principles", "BBA"),
    ("Structural Engineering", "Civil"),
    ("Analog Electronics", "EEE"),
    ("Machine Learning Basics", "CSE"),
    ("Financial Accounting", "BBA"),
    ("Fluid Mechanics", "Civil"),
    ("Signals and Systems", "EEE"),
    ("History of Architecture", "Architecture")
]
for title, dept in note_topics:
    Note.objects.create(
        uploaded_by=random.choice(students),
        title=f"{title} Complete Notes",
        subject=title,
        department=dept,
        intake=str(random.randint(40, 55)),
        description=f"Comprehensive lecture notes covering the entire syllabus for {title}. Very helpful for final exam preparation.",
        pdf_file="notes/SOLID_Principles.pptx.pdf"
    )

# 4. Academic - CT Questions
print("Seeding CT Questions...")
ct_topics = [
    ("Algorithm Analysis CT-1", "CSE", "CSE221"),
    ("Microprocessors CT-2", "CSE", "CSE323"),
    ("Business Ethics Midterm", "BBA", "BBA301"),
    ("Surveying CT-1", "Civil", "CE201"),
    ("Power Systems CT-3", "EEE", "EEE401"),
    ("Database Management Systems CT-1", "CSE", "CSE311"),
    ("Macroeconomics Midterm", "BBA", "BBA202"),
    ("Geotechnical Engineering CT-2", "Civil", "CE302"),
    ("Control Systems CT-1", "EEE", "EEE303"),
    ("Building Materials CT-1", "Architecture", "ARCH101")
]
for title, dept, course in ct_topics:
    CTQuestion.objects.create(
        uploaded_by=random.choice(students),
        title=title,
        course=course,
        department=dept,
        intake=str(random.randint(40, 55)),
        total_questions=5,
        difficulty=random.choice(['easy', 'medium', 'hard']),
        description=f"Previous year CT question paper for {course} - {title}. Useful for understanding question patterns.",
        pdf_file="notes/SOLID_Principles.pptx.pdf"
    )

# 5. Academic - Jobs
print("Seeding Jobs...")
jobs = [
    ("Software Engineer Intern", "Therap (BD) Ltd.", "internship"),
    ("Junior Data Analyst", "BrainStation-23", "full_time"),
    ("Management Trainee", "Unilever Bangladesh", "full_time"),
    ("Structural Design Engineer", "BSRM", "full_time"),
    ("Electrical Engineer", "Energypac", "full_time"),
    ("Frontend Developer Intern", "Pathao", "internship"),
    ("HR Executive", "Bata", "full_time"),
    ("Civil Estimator", "Concord Group", "full_time"),
    ("Hardware Engineer Intern", "Walton", "internship"),
    ("Architectural Intern", "Vitti Sthapati Brindo", "internship")
]
for title, company, job_type in jobs:
    JobPosting.objects.create(
        posted_by=random.choice(students),
        title=title,
        company_name=company,
        job_type=job_type,
        location="Dhaka, Bangladesh",
        description=f"We are looking for a highly motivated {title} to join our dynamic team at {company}.",
        apply_link="https://linkedin.com/jobs",
        deadline=timezone.now() + timedelta(days=random.randint(15, 60)),
        status='approved'
    )

# 6. Blood Donation
print("Seeding Blood Donation...")
blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
for i in range(1, 11):
    BloodRequest.objects.create(
        requested_by=random.choice(students),
        patient_name=f"Patient {i}",
        blood_group=random.choice(blood_groups),
        bags_needed=random.randint(1, 3),
        hospital_name=random.choice(["Evercare Hospital", "Square Hospital", "United Hospital", "Apollo Hospital", "Dhaka Medical College"]),
        contact_person=f"Relative {i}",
        contact_number=f"017110000{i:02d}",
        required_date=timezone.now() + timedelta(days=random.randint(1, 7))
    )

# 7. Clubs
print("Seeding Clubs...")
club_names = ["Computer Club", "Robotics Club", "Business Club", "Photography Club", "Debating Society"]
clubs = []
for name in club_names:
    club, _ = Club.objects.get_or_create(
        name=name,
        description=f"The official {name} of the university. Join us to enhance your skills and network with peers.",
        established_date=timezone.now().date() - timedelta(days=365*random.randint(1, 5)),
        status='approved'
    )
    clubs.append(club)

print("Seeding Events...")
for i, club in enumerate(clubs):
    Event.objects.create(
        club=club,
        title=f"Annual {club.name} Workshop {timezone.now().year}",
        description=f"Join the biggest workshop of the year organized by {club.name}. Open for all departments.",
        date=timezone.now() + timedelta(days=random.randint(10, 30)),
        location="Auditorium"
    )
    Event.objects.create(
        club=club,
        title=f"{club.name} Intra-University Competition",
        description=f"Showcase your talent at the {club.name} competition.",
        date=timezone.now() + timedelta(days=random.randint(31, 60)),
        location="Room 404"
    )

# 8. Marketplace (Books & Lost/Found)
print("Seeding Marketplace...")
cat_book, _ = Category.objects.get_or_create(name="Books", slug="books")
cat_lf, _ = Category.objects.get_or_create(name="Lost & Found", slug="lost-found")
market_items = [
    ("Thomas Calculus 14th Edition", cat_book, "sell", 350),
    ("Found Keys near Cafe", cat_lf, "sell", 0),
    ("Fundamentals of Electric Circuits", cat_book, "buy", 400),
    ("Lost Student ID Card", cat_lf, "buy", 0),
    ("Introduction to Algorithms (CLRS)", cat_book, "sell", 500),
    ("Scientific Calculator fx-991EX", cat_book, "sell", 1200),
    ("Found Black Umbrella in Library", cat_lf, "sell", 0),
    ("Marketing Management by Philip Kotler", cat_book, "sell", 300),
    ("Lost Blue Notebook in Room 302", cat_lf, "buy", 0),
    ("Physics for Scientists and Engineers", cat_book, "sell", 450)
]
for title, cat, listing_type, price in market_items:
    MarketplaceItem.objects.create(
        seller=random.choice(students),
        listing_type=listing_type,
        category=cat,
        title=title,
        description=f"Marketplace listing for {title}. Please contact me if you are interested.",
        price=price
    )

# 9. Emergency
print("Seeding Emergency...")
cat_em, _ = EmergencyCategory.objects.get_or_create(name="Hospital", icon="hospital")
cat_police, _ = EmergencyCategory.objects.get_or_create(name="Police", icon="shield")
cat_fire, _ = EmergencyCategory.objects.get_or_create(name="Fire Service", icon="flame")

emergencies = [
    (cat_em, "Kurmitola General Hospital", "02-9832244", "Dhaka Cantonment"),
    (cat_em, "Evercare Hospital Emergency", "10678", "Bashundhara R/A"),
    (cat_em, "United Hospital Emergency", "10666", "Gulshan 2"),
    (cat_police, "Vatara Police Station", "01320-041478", "Vatara, Dhaka"),
    (cat_police, "Badda Police Station", "01320-041485", "Badda, Dhaka"),
    (cat_police, "Gulshan Police Station", "01320-041468", "Gulshan, Dhaka"),
    (cat_fire, "Fire Service Headquarters", "02-9555555", "Gulistan, Dhaka"),
    (cat_fire, "Baridhara Fire Station", "02-9895555", "Baridhara, Dhaka"),
    (cat_fire, "Kurmitola Fire Station", "02-8821111", "Kurmitola, Dhaka"),
    (cat_em, "National Ambulance Service", "999", "All Bangladesh")
]

for cat, name, phone, loc in emergencies:
    EmergencyContact.objects.create(
        category=cat,
        name=name,
        phone=phone,
        location=loc
    )

print("Professional Data seeding completed successfully!")
