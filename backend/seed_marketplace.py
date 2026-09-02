import os
import django
from decimal import Decimal

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from marketplace.models import Category, MarketplaceItem

def seed_marketplace():
    # Ensure at least one user exists
    user = User.objects.filter(role='student').first()
    if not user:
        user = User.objects.create_user(
            username='student_seed',
            password='password123',
            email='seed@example.com',
            role='student',
            full_name='Seed Student'
        )

    # Create Categories
    categories_data = [
        {'name': 'Books', 'slug': 'books', 'icon': 'Book'},
        {'name': 'Electronics', 'slug': 'electronics', 'icon': 'Laptop'},
        {'name': 'Lab Equipment', 'slug': 'lab-equipment', 'icon': 'Microscope'},
        {'name': 'Stationery', 'slug': 'stationery', 'icon': 'Pen'},
        {'name': 'Others', 'slug': 'others', 'icon': 'Box'},
    ]
    
    categories = {}
    for cat_data in categories_data:
        cat, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults={'name': cat_data['name'], 'icon': cat_data['icon']}
        )
        categories[cat_data['slug']] = cat

    # Create Items
    items_data = [
        {
            'title': 'Database System Concepts (6th Edition)',
            'description': 'Almost new condition. Very useful for CSE330. Minimal highlighting.',
            'price': Decimal('450.00'),
            'category': categories['books'],
            'condition': 'like_new',
            'course_code': 'CSE330',
            'department': 'CSE',
            'listing_type': 'sell',
        },
        {
            'title': 'Arduino Uno R3 with Starter Kit',
            'description': 'Used for one semester in Microprocessors lab. Includes breadboard, jumper wires, resistors, and sensors.',
            'price': Decimal('1200.00'),
            'category': categories['electronics'],
            'condition': 'good',
            'course_code': 'CSE331',
            'department': 'CSE',
            'listing_type': 'sell',
        },
        {
            'title': 'Engineering Drawing Drafter',
            'description': 'Mini drafter in excellent condition with cover.',
            'price': Decimal('300.00'),
            'category': categories['stationery'],
            'condition': 'used',
            'course_code': 'ME101',
            'department': 'ME',
            'listing_type': 'sell',
        },
        {
            'title': 'Looking for Fundamentals of Physics by Halliday & Resnick',
            'description': 'Need the 10th edition. Willing to negotiate on price if condition is good.',
            'price': Decimal('350.00'),
            'category': categories['books'],
            'condition': 'good',
            'course_code': 'PHY101',
            'department': 'PHY',
            'listing_type': 'buy',
        },
        {
            'title': 'Casio fx-991EX ClassWiz Calculator',
            'description': 'Original Casio scientific calculator. Got a new one so selling this.',
            'price': Decimal('1500.00'),
            'category': categories['electronics'],
            'condition': 'like_new',
            'course_code': 'MAT110',
            'department': 'MAT',
            'listing_type': 'sell',
        },
        {
            'title': 'Chemistry Lab Apron & Safety Goggles',
            'description': 'Used only for two lab classes. Cleaned and washed.',
            'price': Decimal('200.00'),
            'category': categories['lab-equipment'],
            'condition': 'like_new',
            'course_code': 'CHE101',
            'department': 'CHE',
            'listing_type': 'sell',
        },
    ]

    count = 0
    for item_data in items_data:
        # Check if already exists to avoid duplicates if run multiple times
        if not MarketplaceItem.objects.filter(title=item_data['title']).exists():
            MarketplaceItem.objects.create(
                seller=user,
                **item_data
            )
            count += 1
            
    print(f"Successfully seeded {count} marketplace items.")

if __name__ == '__main__':
    seed_marketplace()
