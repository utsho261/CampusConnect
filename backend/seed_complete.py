"""
Complete seed script — blood donors, realistic clubs, marketplace items.
Run: venv\Scripts\python.exe seed_complete.py
"""
import os, django, random
from datetime import timedelta, date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from django.contrib.auth import get_user_model
from blood_donation.models import BloodDonor, BloodRequest, CommunityPost
from clubs.models import Club, ClubMember, Event, Post
from marketplace.models import MarketplaceItem, Category

User = get_user_model()

# Get existing students
students = list(User.objects.filter(role='student'))
if not students:
    print("No students found! Run seed_all_data.py first.")
    exit()

print(f"Found {len(students)} students.")

blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
divisions = ['dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'rangpur']
districts_map = {
    'dhaka': ['Dhaka', 'Gazipur', 'Narayanganj'],
    'chittagong': ['Chittagong', "Cox's Bazar", 'Comilla'],
    'sylhet': ['Sylhet', 'Habiganj', 'Moulvibazar'],
    'rajshahi': ['Rajshahi', 'Bogura', 'Natore'],
    'khulna': ['Khulna', 'Jessore', 'Satkhira'],
    'rangpur': ['Rangpur', 'Dinajpur', 'Nilphamari'],
}

# ─── 1. Blood Donors ──────────────────────────────────────────────────────────
print("\n--- Seeding Blood Donors ---")
donor_names = [
    ("Rahul Ahmed", "male"), ("Sadia Islam", "female"), ("Tanvir Hossain", "male"),
    ("Nusrat Jahan", "female"), ("Mahmudul Hasan", "male"), ("Fatema Begum", "female"),
    ("Arif Khan", "male"), ("Rima Akter", "female"), ("Shahed Ali", "male"),
    ("Mitu Roy", "female"), ("Karim Uddin", "male"), ("Shirin Sultana", "female"),
]

created_donors = 0
for i, student in enumerate(students[:12]):
    if BloodDonor.objects.filter(user=student).exists():
        continue
    name, gender = donor_names[i % len(donor_names)]
    div = random.choice(divisions)
    dist = random.choice(districts_map[div])
    total_don = random.randint(0, 8)
    BloodDonor.objects.create(
        user=student,
        full_name=f"{student.first_name or name} {student.last_name or ''}".strip() or name,
        blood_group=random.choice(blood_groups),
        phone=f"017{random.randint(10000000,99999999)}",
        email=student.university_email or f"{student.username}@student.uiu.ac.bd",
        gender=gender,
        date_of_birth=date(random.randint(1998, 2004), random.randint(1,12), random.randint(1,28)),
        weight=random.randint(50, 85),
        division=div,
        district=dist,
        upazila=f"{dist} Sadar",
        address=f"Road {random.randint(1,20)}, {dist}",
        last_donation_date=(date.today() - timedelta(days=random.randint(100, 400))) if total_don > 0 else None,
        is_available=random.choice([True, True, True, False]),
        emergency_available=random.choice([True, False, False]),
        medical_notes="No known medical issues.",
        total_donations=total_don,
        is_approved=True,
        is_verified=random.choice([True, False]),
        is_featured=i < 3,
    )
    created_donors += 1

print(f"  Created {created_donors} blood donors. Total: {BloodDonor.objects.count()}")

# ─── 2. Community Posts ──────────────────────────────────────────────────────
print("\n--- Seeding Community Posts ---")
post_texts = [
    "আমি আজকে রক্ত দান করলাম। সবার উচিত বছরে অন্তত একবার রক্ত দান করা। 🩸",
    "Blood donation saves lives! I donated today at BUBT campus. Join me next time!",
    "৩ মাস পর আবার রক্ত দিলাম। এটা একটা অসাধারণ অনুভূতি।",
    "Awareness: O- blood group is universal donor. Please register if you have this group!",
    "আমাদের ক্যাম্পাসে রক্তদান শিবির আসছে। সবাই অংশগ্রহণ করুন।",
]
for i, student in enumerate(students[:5]):
    if not CommunityPost.objects.filter(author=student).exists():
        CommunityPost.objects.create(
            author=student,
            post_type=random.choice(['story', 'awareness']),
            content=post_texts[i],
            is_approved=True,
        )
print(f"  Community posts total: {CommunityPost.objects.count()}")

# ─── 3. Clubs (Rich data) ─────────────────────────────────────────────────────
print("\n--- Seeding Clubs ---")
CLUBS_DATA = [
    {
        "name": "UIU Computer Programming Club",
        "description": "A club for passionate programmers. We organize coding contests, hackathons, workshops, and collaborative coding sessions. Join us to sharpen your problem-solving skills!",
        "category": "technology",
        "is_recruiting": True,
        "requires_application": True,
    },
    {
        "name": "UIU Business & Entrepreneurship Club",
        "description": "Empowering future business leaders through case competitions, guest lectures from industry leaders, and startup incubation programs.",
        "category": "business",
        "is_recruiting": True,
        "requires_application": False,
    },
    {
        "name": "UIU Cultural Club",
        "description": "Celebrating diversity through music, dance, drama, and art. We host annual cultural programs, Pahela Baishakh events, and creative workshops.",
        "category": "cultural",
        "is_recruiting": True,
        "requires_application": False,
    },
    {
        "name": "UIU Robotics & AI Society",
        "description": "Building the future with robotics, machine learning, and AI. We participate in national robotics competitions and organize AI bootcamps.",
        "category": "technology",
        "is_recruiting": True,
        "requires_application": True,
    },
    {
        "name": "UIU Sports & Athletics Club",
        "description": "Promoting physical fitness and sportsmanship. We organize cricket, football, badminton tournaments and regular gym sessions.",
        "category": "sports",
        "is_recruiting": True,
        "requires_application": False,
    },
    {
        "name": "UIU Volunteer & Social Welfare Club",
        "description": "Making a positive impact in society through blood donation drives, tree plantation, tutoring underprivileged children, and disaster relief.",
        "category": "volunteer",
        "is_recruiting": True,
        "requires_application": False,
    },
    {
        "name": "UIU Photography & Media Club",
        "description": "Capturing moments, telling stories. We organize photography walks, editing workshops, and produce the campus magazine.",
        "category": "cultural",
        "is_recruiting": True,
        "requires_application": False,
    },
    {
        "name": "UIU Debate & Public Speaking Club",
        "description": "Hone your argumentation and public speaking skills. We participate in national debate competitions and run weekly practice sessions.",
        "category": "academic",
        "is_recruiting": True,
        "requires_application": True,
    },
]

created_clubs = 0
for data in CLUBS_DATA:
    if Club.objects.filter(name=data["name"]).exists():
        continue
    creator = random.choice(students)
    club = Club.objects.create(
        name=data["name"],
        description=data["description"],
        category=data["category"],
        status='approved',
        established_date=date(random.randint(2018, 2023), random.randint(1,12), 1),
        is_recruiting=data["is_recruiting"],
        requires_application=data["requires_application"],
        created_by=creator,
        email=f"{data['name'].lower().replace(' ', '.')[:20]}@uiu.ac.bd",
        facebook_link=f"https://facebook.com/UIU{data['category'].title()}Club",
    )
    # Add members
    members_to_add = random.sample(students, min(len(students), random.randint(5, 10)))
    for j, member in enumerate(members_to_add):
        role = 'admin' if j == 0 else ('executive' if j < 3 else 'member')
        ClubMember.objects.get_or_create(user=member, club=club, defaults={'role': role})

    # Add events
    event_titles = [
        f"{club.name} Annual Fest 2025",
        f"Workshop: Introduction to {data['category'].title()}",
        f"Inter-University {data['category'].title()} Competition",
        f"{club.name} Orientation Day",
    ]
    for k, title in enumerate(event_titles[:3]):
        Event.objects.create(
            club=club,
            title=title,
            description=f"Join us for an exciting event organized by {club.name}. Limited seats available!",
            date=timezone.now() + timedelta(days=random.randint(5, 60)),
            location=f"UIU Campus, Room {random.randint(100, 500)}",
            seat_capacity=random.randint(30, 100),
            status=random.choice(['open', 'open', 'closing_soon']),
            created_by=random.choice(members_to_add[:3]),
        )
    
    # Add posts
    post_contents = [
        f"Welcome to {club.name}! We are excited to announce our new semester activities.",
        f"Great session today! Thanks to everyone who attended our workshop. 🙌",
        f"Registration is now open for our upcoming event! Don't miss out.",
    ]
    for content in post_contents[:2]:
        Post.objects.create(
            club=club,
            created_by=random.choice(members_to_add[:3]),
            content=content,
            status='approved',
        )
    
    created_clubs += 1

print(f"  Created {created_clubs} clubs. Total: {Club.objects.count()}")

# ─── 4. Marketplace Items (Rich data) ─────────────────────────────────────────
print("\n--- Seeding Marketplace Items ---")

# Get or create categories
cat_books, _ = Category.objects.get_or_create(name="Textbooks", defaults={"slug": "textbooks", "icon": "Book"})
cat_electronics, _ = Category.objects.get_or_create(name="Electronics", defaults={"slug": "electronics", "icon": "Laptop"})
cat_stationery, _ = Category.objects.get_or_create(name="Stationery", defaults={"slug": "stationery", "icon": "PenTool"})
cat_notes, _ = Category.objects.get_or_create(name="Handwritten Notes", defaults={"slug": "handwritten-notes", "icon": "FileText"})
cat_uniform, _ = Category.objects.get_or_create(name="Uniform & Accessories", defaults={"slug": "uniform", "icon": "Shirt"})
cat_lf, _ = Category.objects.get_or_create(name="Lost & Found", defaults={"slug": "lost-found", "icon": "Search"})

ITEMS = [
    # Books
    {"title": "Data Structures & Algorithms (Cormen) - 4th Edition", "cat": cat_books, "price": 850, "cond": "good", "dept": "CSE", "course": "CSE220", "desc": "Good condition. Some highlights. Perfect for CSE students."},
    {"title": "C Programming Language by Kernighan & Ritchie", "cat": cat_books, "price": 350, "cond": "like_new", "dept": "CSE", "course": "CSE111", "desc": "Like new, no writing inside. Selling because course is over."},
    {"title": "Engineering Mathematics Vol. 1 & 2 (H.K. Dass)", "cat": cat_books, "price": 600, "cond": "used", "dept": "EEE", "course": "MAT101", "desc": "Used but all pages intact. Great for first year students."},
    {"title": "Signals & Systems by Oppenheim", "cat": cat_books, "price": 700, "cond": "good", "dept": "EEE", "course": "EEE221", "desc": "Lightly used. A few pencil marks, fully erasable."},
    {"title": "Microeconomics by Mankiw - 8th Edition", "cat": cat_books, "price": 400, "cond": "good", "dept": "BBA", "course": "ECO101", "desc": "Good condition. Sold because I changed department."},
    {"title": "Financial Accounting by Weygandt", "cat": cat_books, "price": 550, "cond": "like_new", "dept": "BBA", "course": "ACC101", "desc": "Almost new. Bought last semester, barely used."},
    {"title": "Database Systems by Korth - 6th Ed", "cat": cat_books, "price": 650, "cond": "good", "dept": "CSE", "course": "CSE335", "desc": "Good condition with some bookmarks. Helpful annotations."},
    # Electronics
    {"title": "Scientific Calculator (Casio fx-991ES Plus)", "cat": cat_electronics, "price": 1200, "cond": "good", "desc": "Works perfectly. Selling because I bought a new one."},
    {"title": "USB 3.0 Portable Hard Drive 1TB", "cat": cat_electronics, "price": 2200, "cond": "good", "desc": "1TB storage. Transfer speed 100MB/s. Minor scratches on casing only."},
    {"title": "Logitech Wireless Mouse M185", "cat": cat_electronics, "price": 450, "cond": "like_new", "desc": "Barely used. Comes with original box."},
    {"title": "Campus Student Laptop - Lenovo IdeaPad (2022)", "cat": cat_electronics, "price": 25000, "cond": "good", "desc": "Intel i5, 8GB RAM, 512GB SSD. Battery health 85%. Great for coding/study."},
    # Stationery
    {"title": "Drawing Board A2 Size + T-Square Set", "cat": cat_stationery, "price": 350, "cond": "good", "dept": "Architecture", "desc": "Architecture students item. Used 1 semester. Full set."},
    {"title": "Bundle of 5 Coloured Highlighters (Stabilo)", "cat": cat_stationery, "price": 150, "cond": "new", "desc": "Never opened. Got as gift but don't need it."},
    # Handwritten Notes
    {"title": "CSE220 Data Structures Complete Notes (Handwritten)", "cat": cat_notes, "price": 200, "cond": "good", "dept": "CSE", "course": "CSE220", "desc": "Full semester notes with diagrams. Very helpful for exam prep."},
    {"title": "EEE Circuit Analysis Complete Notes", "cat": cat_notes, "price": 180, "cond": "good", "dept": "EEE", "desc": "Neatly written. Covers all chapters with solved examples."},
    # Lost & Found
    {"title": "FOUND: Blue Wallet near Library", "cat": cat_lf, "price": 0, "cond": "good", "lt": "sell", "desc": "Found a blue leather wallet near the main library. Please contact if it's yours."},
    {"title": "LOST: UIU ID Card (Student: Arif)", "cat": cat_lf, "price": 0, "cond": "good", "lt": "buy", "desc": "Lost my student ID card near the cafeteria. Please contact if found. Reward available."},
    # Looking to buy
    {"title": "WANTED: Operating Systems by Silberschatz (Dinosaur Book)", "cat": cat_books, "price": 400, "cond": "good", "lt": "buy", "desc": "Looking to buy CSE OS textbook. Willing to pay up to 400 Tk. Good condition preferred."},
]

created_items = 0
for item in ITEMS:
    if MarketplaceItem.objects.filter(title=item["title"]).exists():
        continue
    MarketplaceItem.objects.create(
        seller=random.choice(students),
        listing_type=item.get("lt", "sell"),
        category=item["cat"],
        title=item["title"],
        description=item["desc"],
        price=item["price"],
        condition=item["cond"],
        status='active',
        course_code=item.get("course", ""),
        department=item.get("dept", ""),
        is_negotiable=random.choice([True, True, False]),
    )
    created_items += 1

print(f"  Created {created_items} marketplace items. Total: {MarketplaceItem.objects.count()}")

# ─── Summary ──────────────────────────────────────────────────────────────────
print("\n=============================")
print("✅ Seeding complete!")
print(f"  Blood Donors:       {BloodDonor.objects.count()}")
print(f"  Blood Requests:     {BloodRequest.objects.count()}")
print(f"  Community Posts:    {CommunityPost.objects.count()}")
print(f"  Clubs:              {Club.objects.count()}")
print(f"  Events:             {Event.objects.count()}")
print(f"  Marketplace Items:  {MarketplaceItem.objects.count()}")
print("=============================")
