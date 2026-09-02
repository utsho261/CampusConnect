"""
BUBT Re-seed script: Clears old UIU data and adds proper BUBT data.
Run: venv\Scripts\python.exe seed_bubt.py
"""
import os, django, random
from datetime import timedelta, date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from django.contrib.auth import get_user_model
from academic.models import Note, CTQuestion, JobPosting
from blood_donation.models import BloodDonor, BloodRequest, CommunityPost
from clubs.models import Club, ClubMember, Event, Post
from marketplace.models import MarketplaceItem, Category
from leaderboard.models import ImpactProfile, PointLog
from emergency.models import EmergencyContact, EmergencyCategory

User = get_user_model()

# ─── STEP 1: Clear old UIU student data ──────────────────────────────────────
print("Clearing old student/academic data...")
PointLog.objects.all().delete()
ImpactProfile.objects.all().delete()
Note.objects.all().delete()
CTQuestion.objects.all().delete()
JobPosting.objects.all().delete()
BloodDonor.objects.all().delete()
BloodRequest.objects.all().delete()
CommunityPost.objects.all().delete()
ClubMember.objects.all().delete()
Post.objects.all().delete()
Event.objects.all().delete()
Club.objects.all().delete()
MarketplaceItem.objects.all().delete()
EmergencyContact.objects.all().delete()
EmergencyCategory.objects.all().delete()

# Delete old seeded students (keep admin/superusers)
User.objects.filter(role='student').delete()
print("Old data cleared.")

# ─── STEP 2: Create BUBT students ─────────────────────────────────────────────
print("\nCreating BUBT students...")

BUBT_DEPTS = ["CSE", "EEE", "BBA", "Civil", "Textile", "English", "Pharmacy"]

STUDENT_DATA = [
    ("Md. Rakibul Islam", "male", "CSE", "01711234567", "A+"),
    ("Sadia Afrin", "female", "BBA", "01812345678", "B+"),
    ("Tanvir Ahmed Shuvo", "male", "EEE", "01913456789", "O+"),
    ("Nusrat Jahan Rimi", "female", "CSE", "01714567890", "A-"),
    ("Mahfuzur Rahman", "male", "Civil", "01815678901", "B-"),
    ("Fatema Tuz Johura", "female", "Pharmacy", "01916789012", "AB+"),
    ("Ariful Islam", "male", "CSE", "01717890123", "O+"),
    ("Rima Begum", "female", "English", "01818901234", "A+"),
    ("Shahed Hossain", "male", "EEE", "01919012345", "B+"),
    ("Mitu Akter", "female", "BBA", "01720123456", "O-"),
    ("Karimul Haque", "male", "CSE", "01821234567", "A+"),
    ("Shirin Sultana", "female", "Textile", "01922345678", "B+"),
    ("Mostofa Kamal", "male", "Civil", "01723456789", "AB-"),
    ("Rifat Hasan", "male", "CSE", "01824567890", "A+"),
    ("Israt Jahan", "female", "BBA", "01925678901", "O+"),
]

students = []
for i, (name, gender, dept, phone, bg) in enumerate(STUDENT_DATA, 1):
    student_id = f"22134200{i:02d}"
    email = f"{''.join(name.lower().split()[:2])}{i}@std.bubt.edu.bd".replace('.', '').replace('md', 'md')
    fname = name.split()[0]
    lname = " ".join(name.split()[1:])

    if User.objects.filter(student_id=student_id).exists():
        u = User.objects.get(student_id=student_id)
    else:
        u = User.objects.create_user(
            username=f"bubt_{i:02d}",
            password="bubt2024",
            student_id=student_id,
            university_email=email,
            department=dept,
            role="student",
            verified=True,
            first_name=fname,
            last_name=lname,
        )
    students.append(u)

print(f"  Created {len(students)} BUBT students")

# ─── STEP 3: Leaderboard ─────────────────────────────────────────────────────
print("\nSeeding leaderboard...")
points_data = [
    (450, 120, 80, 30, 50),   # CSE topper
    (380, 90, 150, 20, 40),
    (420, 200, 60, 40, 30),
    (310, 100, 80, 60, 70),
    (290, 80, 100, 40, 50),
    (350, 150, 70, 30, 60),
    (260, 70, 90, 50, 40),
    (320, 110, 80, 30, 50),
    (280, 90, 100, 20, 30),
    (400, 160, 90, 50, 60),
    (230, 60, 80, 40, 30),
    (180, 50, 70, 20, 40),
    (270, 100, 60, 30, 50),
    (340, 130, 80, 40, 60),
    (300, 110, 70, 30, 50),
]
for student, (total, acad, comm, career, market) in zip(students, points_data):
    profile, _ = ImpactProfile.objects.get_or_create(user=student)
    profile.academic_points = acad
    profile.community_points = comm
    profile.career_points = career
    profile.marketplace_points = market
    profile.save()
    PointLog.objects.create(user=student, category='academic', action_name='Semester achievement', points=acad)
print(f"  Leaderboard seeded for {len(students)} students")

# ─── STEP 4: Notes ───────────────────────────────────────────────────────────
print("\nSeeding Notes...")
NOTES = [
    ("CSE301 Data Structures Complete Notes", "Data Structures", "CSE", "57"),
    ("CSE303 Algorithm Design & Analysis", "Algorithms", "CSE", "57"),
    ("CSE401 Database Management Systems", "DBMS", "CSE", "55"),
    ("CSE201 Discrete Mathematics Notes", "Discrete Math", "CSE", "59"),
    ("CSE403 Computer Networks Full Notes", "Computer Networks", "CSE", "55"),
    ("CSE405 Software Engineering Notes", "Software Engineering", "CSE", "55"),
    ("EEE201 Circuit Analysis Full Notes", "Circuit Analysis", "EEE", "57"),
    ("EEE301 Signals & Systems Notes", "Signals & Systems", "EEE", "57"),
    ("EEE401 Power Systems Notes", "Power Systems", "EEE", "55"),
    ("BBA201 Principles of Management", "Management", "BBA", "57"),
    ("BBA301 Financial Accounting Notes", "Accounting", "BBA", "57"),
    ("BBA401 Marketing Management Notes", "Marketing", "BBA", "55"),
    ("Civil301 Structural Analysis Notes", "Structural Analysis", "Civil", "57"),
    ("PHR201 Pharmacology Notes", "Pharmacology", "Pharmacy", "57"),
    ("ENG201 English Literature Notes", "Literature", "English", "57"),
]
for title, subject, dept, intake in NOTES:
    Note.objects.create(
        uploaded_by=random.choice([s for s in students if s.department == dept] or students),
        title=title,
        subject=subject,
        department=dept,
        intake=intake,
        description=f"Complete lecture notes for {subject}. Prepared by BUBT students based on course content. Covers all chapters with examples.",
    )
print(f"  {Note.objects.count()} notes created")

# ─── STEP 5: CT Questions ────────────────────────────────────────────────────
print("\nSeeding CT Questions...")
CT_QUESTIONS = [
    ("CSE301 CT-1 2024", "CSE301", "CSE", "57", "medium"),
    ("CSE303 Algorithm CT-2 2024", "CSE303", "CSE", "57", "hard"),
    ("CSE401 DBMS CT-1 2024", "CSE401", "CSE", "55", "medium"),
    ("CSE201 Discrete Math Final 2023", "CSE201", "CSE", "59", "hard"),
    ("CSE403 Networks CT-1 2024", "CSE403", "CSE", "55", "medium"),
    ("EEE201 Circuit CT-1 2024", "EEE201", "EEE", "57", "easy"),
    ("EEE301 Signals CT-2 2024", "EEE301", "EEE", "57", "hard"),
    ("BBA201 Management CT-1 2024", "BBA201", "BBA", "57", "easy"),
    ("BBA301 Accounting Mid 2024", "BBA301", "BBA", "57", "medium"),
    ("Civil301 Structural CT-1", "Civil301", "Civil", "57", "hard"),
]
for title, course, dept, intake, diff in CT_QUESTIONS:
    CTQuestion.objects.create(
        uploaded_by=random.choice(students),
        title=title,
        course=course,
        department=dept,
        intake=intake,
        total_questions=random.randint(4, 10),
        difficulty=diff,
        description=f"CT question paper for {course}. BUBT exam pattern.",
    )
print(f"  {CTQuestion.objects.count()} CT questions created")

# ─── STEP 6: Jobs ────────────────────────────────────────────────────────────
print("\nSeeding Jobs...")
JOBS = [
    ("Junior Software Engineer", "Brain Station 23", "full_time", "Dhaka, Bangladesh", "30,000 - 50,000 BDT", "https://brainstation-23.com"),
    ("Frontend Developer (React)", "Shohoz Ltd.", "full_time", "Dhaka, Bangladesh", "35,000 - 55,000 BDT", "https://shohoz.com"),
    ("Software Intern - Summer 2024", "BJIT Group", "internship", "Dhaka, Bangladesh", "10,000 - 15,000 BDT", "https://bjitgroup.com"),
    ("Android Developer", "Shajgoj", "full_time", "Dhaka, Bangladesh", "40,000 - 60,000 BDT", "https://shajgoj.com"),
    ("Data Analyst Intern", "Pathao", "internship", "Dhaka, Bangladesh", "12,000 BDT", "https://pathao.com"),
    ("Backend Developer (Django)", "SSL Wireless", "full_time", "Dhaka, Bangladesh", "45,000 - 65,000 BDT", "https://sslwireless.com"),
    ("ML Engineer Trainee", "Kona Software Lab", "internship", "Dhaka, Bangladesh", "15,000 BDT", "https://konai.com"),
    ("Electrical Engineer", "DESCO", "full_time", "Dhaka, Bangladesh", "40,000 - 60,000 BDT", "https://desco.org.bd"),
    ("Marketing Executive", "Grameenphone", "full_time", "Dhaka, Bangladesh", "35,000 - 55,000 BDT", "https://grameenphone.com"),
    ("Civil Engineer (Graduate)", "Max Group", "full_time", "Dhaka, Bangladesh", "35,000 - 50,000 BDT", "https://maxgroup.com.bd"),
    ("IT Support Officer", "Banglalink", "full_time", "Dhaka, Bangladesh", "30,000 - 45,000 BDT", "https://banglalink.net"),
    ("Part-time Tutor (CSE)", "Shikho", "part_time", "Dhaka, Bangladesh", "500-700 BDT/hr", "https://shikho.com"),
]
for title, company, jtype, loc, salary, link in JOBS:
    JobPosting.objects.create(
        posted_by=random.choice(students),
        title=title,
        company_name=company,
        job_type=jtype,
        location=loc,
        description=f"We are looking for a passionate {title} to join our team. Apply if you are a BUBT graduate or student with relevant skills.",
        requirements="- Relevant degree from BUBT or equivalent university\n- Strong communication skills\n- Ability to work in a team",
        apply_link=link,
        salary_range=salary,
        deadline=date.today() + timedelta(days=random.randint(15, 60)),
        status='approved',
    )
print(f"  {JobPosting.objects.count()} jobs created")

# ─── STEP 7: Blood Donors ─────────────────────────────────────────────────────
print("\nSeeding Blood Donors...")
blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
divisions = ['dhaka', 'chittagong', 'sylhet', 'rajshahi']
districts_map = {
    'dhaka': ['Dhaka', 'Gazipur', 'Narayanganj'],
    'chittagong': ['Chittagong', 'Comilla', "Cox's Bazar"],
    'sylhet': ['Sylhet', 'Habiganj'],
    'rajshahi': ['Rajshahi', 'Bogura'],
}

for i, student in enumerate(students[:12]):
    div = random.choice(divisions)
    dist = random.choice(districts_map[div])
    total_don = random.randint(0, 8)
    BloodDonor.objects.create(
        user=student,
        full_name=f"{student.first_name} {student.last_name}",
        blood_group=random.choice(blood_groups),
        phone=STUDENT_DATA[i][3],
        email=student.university_email,
        gender=STUDENT_DATA[i][1],
        date_of_birth=date(random.randint(1999, 2004), random.randint(1, 12), random.randint(1, 28)),
        weight=random.randint(50, 85),
        division=div,
        district=dist,
        upazila=f"{dist} Sadar",
        address=f"BUBT Campus, Rupnagar, Mirpur, {dist}",
        last_donation_date=(date.today() - timedelta(days=random.randint(100, 400))) if total_don > 0 else None,
        is_available=random.choice([True, True, True, False]),
        emergency_available=random.choice([True, False, False]),
        medical_notes="No known medical issues.",
        total_donations=total_don,
        is_approved=True,
        is_verified=random.choice([True, False]),
        is_featured=i < 3,
    )
print(f"  {BloodDonor.objects.count()} blood donors created")

# ─── STEP 8: Blood Requests ──────────────────────────────────────────────────
print("\nSeeding Blood Requests...")
HOSPITALS = ["BUBT Medical Center", "Mirpur General Hospital", "Square Hospital, Dhaka", "Ibn Sina Hospital, Mirpur", "National Heart Foundation Hospital"]
REQUEST_DATA = [
    ("Zahir Hossain", "A+", 2, "urgent", "BUBT Medical Center"),
    ("Rina Begum", "B+", 1, "normal", "Mirpur General Hospital"),
    ("Farhan Ali", "O-", 3, "critical", "Square Hospital, Dhaka"),
    ("Sumaiya Islam", "AB+", 1, "normal", "Ibn Sina Hospital, Mirpur"),
    ("Khalid Hasan", "B-", 2, "urgent", "National Heart Foundation Hospital"),
    ("Dilruba Akter", "A-", 1, "normal", "BUBT Medical Center"),
    ("Imran Khan", "O+", 2, "normal", "Mirpur General Hospital"),
    ("Parvin Sultana", "AB-", 1, "urgent", "Square Hospital, Dhaka"),
]
for patient, bg, bags, urgency, hospital in REQUEST_DATA:
    BloodRequest.objects.create(
        requested_by=random.choice(students),
        patient_name=patient,
        blood_group=bg,
        bags_needed=bags,
        hospital_name=hospital,
        hospital_location="Mirpur, Dhaka",
        division='dhaka',
        district='Dhaka',
        contact_person="Family Member",
        contact_number=f"017{random.randint(10000000, 99999999)}",
        urgency=urgency,
        status=random.choice(['open', 'open', 'urgent', 'in_progress']),
        required_date=date.today() + timedelta(days=random.randint(1, 5)),
        additional_notes="Please contact immediately. Patient is at BUBT area.",
    )
print(f"  {BloodRequest.objects.count()} blood requests created")

# Community posts
for i, student in enumerate(students[:5]):
    texts = [
        "BUBT-এ আজ রক্তদান করলাম। সবাইকে অনুরোধ, বছরে অন্তত একবার রক্তদান করুন। জীবন বাঁচান! 🩸",
        "Blood donation drive at BUBT campus next week. Join us and save lives!",
        "৩ মাস পর আবার রক্তদান করলাম BUBT Medical Center-এ। অসাধারণ অনুভূতি!",
        "O- blood is universal donor. BUBT students with O- please register as donors!",
        "আমাদের BUBT Blood Club-এর সাথে যোগ দিন। একসাথে অনেক জীবন বাঁচাতে পারি।",
    ]
    CommunityPost.objects.create(
        author=student,
        post_type=random.choice(['story', 'awareness']),
        content=texts[i],
        is_approved=True,
    )

# ─── STEP 9: BUBT Clubs ──────────────────────────────────────────────────────
print("\nSeeding BUBT Clubs...")
BUBT_CLUBS = [
    {
        "name": "BUBT Computer Programming Club",
        "description": "A club for passionate programmers at BUBT. We organize competitive programming contests, hackathons, workshops on DSA, Web Development, and collaborative coding sessions. Join us to represent BUBT in national competitions!",
        "category": "technology",
        "email": "cpc@bubt.edu.bd",
    },
    {
        "name": "BUBT Business & Entrepreneurship Club",
        "description": "Empowering future business leaders of BUBT through case competitions, sessions with industry veterans, startup ideas, and networking events with Bangladesh's top entrepreneurs.",
        "category": "business",
        "email": "bec@bubt.edu.bd",
    },
    {
        "name": "BUBT Cultural Club",
        "description": "Celebrating our rich Bengali culture through music, dance, drama, art and literary programs. We organize Pahela Baishakh, Independence Day programs, and inter-university cultural competitions.",
        "category": "cultural",
        "email": "cultural@bubt.edu.bd",
    },
    {
        "name": "BUBT Robotics & IoT Club",
        "description": "Building smart solutions with robotics, IoT, and embedded systems. We participate in national robotics olympiads and organize hands-on electronics workshops for BUBT students.",
        "category": "technology",
        "email": "robotics@bubt.edu.bd",
    },
    {
        "name": "BUBT Sports Club",
        "description": "Promoting physical fitness and sportsmanship at BUBT. We organize inter-department cricket, football, badminton, and table-tennis tournaments throughout the year.",
        "category": "sports",
        "email": "sports@bubt.edu.bd",
    },
    {
        "name": "BUBT Volunteer & Social Welfare Club",
        "description": "Making positive impact in society through blood donation drives, tree plantation, free tutoring for underprivileged children in Mirpur, and disaster relief operations.",
        "category": "volunteer",
        "email": "volunteer@bubt.edu.bd",
    },
    {
        "name": "BUBT Photography & Film Club",
        "description": "Capturing stories through lens. We organize photography walks around Mirpur, editing masterclasses, short film competitions, and publish the annual BUBT campus magazine.",
        "category": "cultural",
        "email": "photo@bubt.edu.bd",
    },
    {
        "name": "BUBT Debate Club",
        "description": "Honing argumentation, critical thinking and public speaking skills. We represent BUBT in national debate competitions and hold weekly practice sessions open to all departments.",
        "category": "academic",
        "email": "debate@bubt.edu.bd",
    },
    {
        "name": "BUBT English Language Club",
        "description": "Improving English communication skills for BUBT students through spoken English sessions, essay writing competitions, drama in English, and language exchange programs.",
        "category": "academic",
        "email": "elc@bubt.edu.bd",
    },
    {
        "name": "BUBT Blood Donation Club",
        "description": "Dedicated to saving lives through voluntary blood donation. We organize regular blood donation campaigns at BUBT campus and maintain an emergency blood donor database.",
        "category": "volunteer",
        "email": "bloodclub@bubt.edu.bd",
    },
]

BUBT_EVENTS = {
    "BUBT Computer Programming Club": [
        ("BUBT Inter-Dept Programming Contest 2024", "Room 501, Academic Building, BUBT", 100),
        ("Web Development Bootcamp — React & Django", "CS Lab 3, BUBT", 40),
        ("ICPC Selection Round 2024", "Computer Lab 1, BUBT", 60),
    ],
    "BUBT Business & Entrepreneurship Club": [
        ("Case Competition: Startup Bangladesh 2024", "Seminar Hall, BUBT", 80),
        ("Entrepreneurship Summit 2024", "Auditorium, BUBT", 200),
        ("Workshop: Business Plan Writing", "Room 301, BUBT", 50),
    ],
    "BUBT Cultural Club": [
        ("Pahela Baishakh Celebration 2024", "BUBT Main Campus", 500),
        ("Annual Cultural Night 2024", "Auditorium, BUBT", 300),
        ("Nazrul Jayanti Program", "BUBT Campus Ground", 200),
    ],
    "BUBT Robotics & IoT Club": [
        ("BUBT Robotics Showdown 2024", "Engineering Lab, BUBT", 80),
        ("Arduino Workshop for Beginners", "EEE Lab, BUBT", 40),
    ],
    "BUBT Sports Club": [
        ("Inter-Dept Cricket Tournament 2024", "BUBT Playground", 200),
        ("Badminton Championship 2024", "Indoor Court, BUBT", 100),
    ],
    "BUBT Volunteer & Social Welfare Club": [
        ("Blood Donation Camp — October 2024", "BUBT Campus", 200),
        ("Tree Plantation Day", "BUBT Campus", 100),
    ],
    "BUBT Photography & Film Club": [
        ("Campus Photography Walk", "BUBT Campus", 50),
        ("Short Film Competition 2024", "Auditorium, BUBT", 150),
    ],
    "BUBT Debate Club": [
        ("BUBT National Debate Competition 2024", "Seminar Hall, BUBT", 100),
        ("Mock UN Session", "Room 401, BUBT", 60),
    ],
    "BUBT English Language Club": [
        ("Spoken English Workshop", "Room 201, BUBT", 80),
        ("Essay Writing Competition", "Room 301, BUBT", 120),
    ],
    "BUBT Blood Donation Club": [
        ("Emergency Blood Donor Registration Drive", "BUBT Campus", 300),
        ("Blood Group Test Camp", "BUBT Medical Center", 200),
    ],
}

BUBT_POSTS = {
    "BUBT Computer Programming Club": [
        "BUBT CPC-এর ৩য় ইন্টার-ডিপার্টমেন্ট প্রোগ্রামিং কন্টেস্টে অংশগ্রহণ করতে রেজিস্ট্রেশন করুন! 💻 CSE, EEE সহ সকল বিভাগের শিক্ষার্থীরা অংশ নিতে পারবে।",
        "Congratulations to our team for qualifying for ICPC Dhaka Regional 2024! Proud of BUBT CPC members! 🏆",
    ],
    "BUBT Cultural Club": [
        "পহেলা বৈশাখ ১৪৩১ উদযাপনে সকলকে আমন্ত্রণ! BUBT ক্যাম্পাসে রঙিন অনুষ্ঠানে যোগ দিন। 🎉",
        "Annual Cultural Night 2024-এর টিকেট পাওয়া যাচ্ছে। সীমিত আসন, আজই সংগ্রহ করুন!",
    ],
    "BUBT Blood Donation Club": [
        "আগামী সপ্তাহে BUBT ক্যাম্পাসে রক্তদান ক্যাম্প। সকল রক্তের গ্রুপ প্রয়োজন। একজন দাতার রক্ত ৩টি জীবন বাঁচাতে পারে! 🩸",
        "Emergency: O- blood needed urgently at BUBT Medical Center. Please contact immediately if you are an O- donor.",
    ],
    "BUBT Business & Entrepreneurship Club": [
        "আমাদের Entrepreneurship Summit 2024-এ বাংলাদেশের শীর্ষ উদ্যোক্তারা বক্তৃতা দেবেন। সীমিত আসন — আজই রেজিস্ট্রেশন করুন!",
    ],
    "BUBT Sports Club": [
        "ক্রিকেট টুর্নামেন্টে CSE বিভাগ জয়লাভ করেছে! অভিনন্দন Team CSE! 🏏🎊",
    ],
}

created_clubs = 0
for club_data in BUBT_CLUBS:
    club_name = club_data["name"]
    creator = random.choice(students)
    club, created = Club.objects.get_or_create(
        name=club_name,
        defaults={
            "description": club_data["description"],
            "category": club_data["category"],
            "status": "approved",
            "established_date": date(random.randint(2015, 2022), random.randint(1, 12), 1),
            "is_recruiting": True,
            "requires_application": random.choice([True, False]),
            "created_by": creator,
            "email": club_data["email"],
            "facebook_link": f"https://facebook.com/BUBT{club_data['category'].title()}Club",
        }
    )
    if not created:
        club.status = 'approved'
        club.description = club_data["description"]
        club.save()

    # Add members
    members = random.sample(students, min(len(students), random.randint(6, 12)))
    for j, member in enumerate(members):
        role = 'admin' if j == 0 else ('executive' if j < 3 else 'member')
        ClubMember.objects.get_or_create(user=member, club=club, defaults={'role': role})

    # Add events
    for ev_title, ev_loc, ev_seats in BUBT_EVENTS.get(club_name, []):
        Event.objects.create(
            club=club,
            title=ev_title,
            description=f"Join us for {ev_title}, organized by {club_name}. All BUBT students are welcome!",
            date=timezone.now() + timedelta(days=random.randint(7, 90)),
            location=ev_loc,
            seat_capacity=ev_seats,
            status=random.choice(['open', 'open', 'closing_soon']),
            created_by=members[0],
        )

    # Add posts
    for content in BUBT_POSTS.get(club_name, []):
        Post.objects.create(
            club=club,
            created_by=random.choice(members[:3]),
            content=content,
            status='approved',
        )

    created_clubs += 1

print(f"  {Club.objects.count()} BUBT clubs created")

# ─── STEP 10: Marketplace ────────────────────────────────────────────────────
print("\nSeeding Marketplace...")
cat_books, _ = Category.objects.get_or_create(name="Textbooks", defaults={"slug": "textbooks", "icon": "Book"})
cat_elec, _ = Category.objects.get_or_create(name="Electronics", defaults={"slug": "electronics", "icon": "Laptop"})
cat_stat, _ = Category.objects.get_or_create(name="Stationery", defaults={"slug": "stationery", "icon": "PenTool"})
cat_notes_cat, _ = Category.objects.get_or_create(name="Handwritten Notes", defaults={"slug": "handwritten-notes", "icon": "FileText"})
cat_lf, _ = Category.objects.get_or_create(name="Lost & Found", defaults={"slug": "lost-found", "icon": "Search"})

MARKETPLACE_ITEMS = [
    # BUBT Books
    (cat_books, "sell", "Data Structures (Cormen) — CSE301 BUBT", "Perfect for BUBT CSE301. Good condition, some highlights.", 800, "good", "CSE", "CSE301"),
    (cat_books, "sell", "C Programming (Kernighan) — CSE111 BUBT", "Like new. No writing inside. Selling since course completed.", 350, "like_new", "CSE", "CSE111"),
    (cat_books, "sell", "Engineering Mathematics Vol 1 — MAT101 BUBT", "Used one semester. All pages intact. Great for freshers.", 550, "used", "EEE", "MAT101"),
    (cat_books, "sell", "Signals & Systems (Oppenheim) — EEE301 BUBT", "Good condition. Pencil marks only, fully erasable.", 700, "good", "EEE", "EEE301"),
    (cat_books, "sell", "Microeconomics (Mankiw) — ECO101 BUBT", "Good condition. Changed department so selling.", 400, "good", "BBA", "ECO101"),
    (cat_books, "sell", "Financial Accounting (Weygandt) — ACC101 BUBT", "Almost new. Barely used. Bought last semester.", 550, "like_new", "BBA", "ACC101"),
    (cat_books, "sell", "Database Systems (Korth) — CSE401 BUBT", "Good condition. Helpful annotations and bookmarks.", 650, "good", "CSE", "CSE401"),
    (cat_books, "sell", "Structural Analysis (Hibbeler) — Civil301 BUBT", "Used 1 semester. All pages clear.", 750, "good", "Civil", "Civil301"),
    (cat_books, "buy", "WANTED: Operating Systems (Silberschatz) CSE403", "Looking to buy OS textbook for BUBT CSE403. Max 400 Tk.", 400, "good", "CSE", "CSE403"),
    # Electronics
    (cat_elec, "sell", "Casio fx-991ES Plus Scientific Calculator", "Works perfectly. Selling because bought upgrade.", 1200, "good", "", ""),
    (cat_elec, "sell", "1TB USB 3.0 Portable Hard Drive", "1TB storage. Works great. Minor scratches on casing.", 2200, "good", "", ""),
    (cat_elec, "sell", "Logitech Wireless Mouse M185 — Original Box", "Barely used. Comes with original box. 2 AA batteries included.", 450, "like_new", "", ""),
    # Stationery
    (cat_stat, "sell", "Drawing Board A2 + T-Square Set (Architecture)", "Architecture students item. Used 1 semester. Full set.", 350, "good", "Architecture", ""),
    (cat_stat, "sell", "Stabilo Coloured Highlighter Set (6 pcs)", "Never opened. Got as gift.", 180, "new", "", ""),
    # Handwritten Notes
    (cat_notes_cat, "sell", "CSE301 Data Structures — Complete Handwritten Notes", "Full semester notes with diagrams. Very helpful for exam.", 200, "good", "CSE", "CSE301"),
    (cat_notes_cat, "sell", "EEE201 Circuit Analysis — Handwritten Notes", "Neatly written. All chapters with solved examples.", 180, "good", "EEE", "EEE201"),
    (cat_notes_cat, "sell", "BBA301 Financial Accounting — Handwritten Notes", "Chapter wise notes with practice problems.", 150, "good", "BBA", "BBA301"),
    # Lost & Found
    (cat_lf, "sell", "FOUND: Blue Wallet near BUBT Library", "Found a blue wallet near BUBT main library. Contact to claim.", 0, "good", "", ""),
    (cat_lf, "buy", "LOST: BUBT ID Card (Dept: CSE, Semester 5)", "Lost ID card near BUBT cafeteria. Finder please contact. Reward available.", 0, "good", "", ""),
]

for cat, lt, title, desc, price, cond, dept, course in MARKETPLACE_ITEMS:
    MarketplaceItem.objects.create(
        seller=random.choice(students),
        listing_type=lt,
        category=cat,
        title=title,
        description=desc,
        price=price,
        condition=cond,
        status='active',
        department=dept,
        course_code=course,
        is_negotiable=True,
    )
print(f"  {MarketplaceItem.objects.count()} marketplace items created")

# ─── STEP 11: Emergency Contacts ─────────────────────────────────────────────
print("\nSeeding Emergency Contacts...")
EMERGENCY_DATA = [
    ("Hospital", "hospital", [
        ("BUBT Medical Center", "09612-345678", "BUBT Campus, Rupnagar, Mirpur-2, Dhaka"),
        ("Mirpur General Hospital", "02-9001234", "Mirpur-10, Dhaka-1216"),
        ("National Institute of Cancer Research & Hospital", "02-9101000", "Mohakhali, Dhaka-1212"),
        ("Square Hospital Ltd.", "10616", "18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka"),
        ("Ibn Sina Hospital Mirpur", "02-8018497", "House 48, Road 9/A, Mirpur-2, Dhaka"),
    ]),
    ("Police", "shield", [
        ("Mirpur Police Station (BUBT Area)", "01769-690127", "Mirpur, Dhaka-1216"),
        ("Bangladesh Police Emergency", "999", "National Emergency Number"),
        ("BUBT Campus Security", "09612-999888", "BUBT Campus, Rupnagar"),
    ]),
    ("Fire Service", "flame", [
        ("Bangladesh Fire Service Emergency", "199", "National Fire Emergency"),
        ("Mirpur Fire Station", "02-9006545", "Mirpur-2, Dhaka"),
    ]),
    ("Ambulance", "truck", [
        ("National Emergency Ambulance", "999", "Call for ambulance dispatch"),
        ("DGDA Ambulance Service Dhaka", "01713-375678", "Dhaka"),
        ("Red Crescent Ambulance", "01713-035516", "Dhaka"),
    ]),
    ("Student Support", "heart", [
        ("BUBT Student Affairs Office", "09612-345600", "BUBT Campus, Rupnagar, Mirpur-2"),
        ("BUBT Mental Health Counselor", "09612-345655", "BUBT Campus, Room 201"),
        ("BUBT Dean Office", "09612-345610", "BUBT Main Building, Ground Floor"),
    ]),
    ("Utility", "zap", [
        ("DESCO Power Emergency", "16116", "For power outage/emergency in Mirpur area"),
        ("WASA Mirpur", "09612-345000", "Water Supply Authority, Mirpur Division"),
        ("TITAS Gas Emergency", "16430", "National Gas Emergency"),
    ]),
]

for cat_name, icon, contacts in EMERGENCY_DATA:
    cat, _ = EmergencyCategory.objects.get_or_create(name=cat_name, defaults={"icon": icon})
    for name, phone, location in contacts:
        EmergencyContact.objects.create(
            category=cat,
            name=name,
            phone=phone,
            location=location,
        )

print(f"  {EmergencyContact.objects.count()} emergency contacts created")

# ─── Summary ──────────────────────────────────────────────────────────────────
print("\n" + "=" * 50)
print("BUBT Data Seeding Complete!")
print(f"  Students:          {User.objects.filter(role='student').count()}")
print(f"  Notes:             {Note.objects.count()}")
print(f"  CT Questions:      {CTQuestion.objects.count()}")
print(f"  Jobs:              {JobPosting.objects.count()}")
print(f"  Blood Donors:      {BloodDonor.objects.count()}")
print(f"  Blood Requests:    {BloodRequest.objects.count()}")
print(f"  Clubs:             {Club.objects.count()}")
print(f"  Events:            {Event.objects.count()}")
print(f"  Marketplace Items: {MarketplaceItem.objects.count()}")
print(f"  Emergency Contacts:{EmergencyContact.objects.count()}")
print("=" * 50)
