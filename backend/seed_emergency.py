import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from emergency.models import EmergencyCategory, EmergencyContact, EmergencyNotice

def seed_data():
    print("Seeding Emergency Data...")
    
    # 1. Clear existing data to avoid duplicates on re-run
    EmergencyCategory.objects.all().delete()
    EmergencyNotice.objects.all().delete()
    
    # 2. Add Notice
    EmergencyNotice.objects.create(
        message="Main Gate temporarily closed due to security issues. Please use the North Gate.",
        is_active=True
    )
    
    # 3. Add Categories and Contacts
    cat_campus = EmergencyCategory.objects.create(name="Campus Emergency", icon="ShieldAlert", color="yellow", order=1)
    EmergencyContact.objects.create(category=cat_campus, name="Campus Security", phone="01819XXXXXX", location="Main Gate", hours="24/7", icon="ShieldAlert", color="yellow")
    EmergencyContact.objects.create(category=cat_campus, name="Medical Center", phone="01711XXXXXX", location="Building B", hours="24/7", icon="HeartPulse", color="red")
    EmergencyContact.objects.create(category=cat_campus, name="Helpdesk", phone="01555XXXXXX", location="Ground Floor", hours="8 AM - 8 PM", icon="LifeBuoy", color="blue")
    EmergencyContact.objects.create(category=cat_campus, name="Ambulance", phone="01999XXXXXX", location="Medical Wing", hours="24/7", icon="HeartPulse", color="red")

    cat_police = EmergencyCategory.objects.create(name="Police & Law", icon="ShieldAlert", color="blue", order=2)
    EmergencyContact.objects.create(category=cat_police, name="Campus Police", phone="0123456789", location="North Wing", icon="ShieldAlert", color="blue")
    EmergencyContact.objects.create(category=cat_police, name="Local Police Station", phone="999", location="City Center", icon="ShieldAlert", color="blue")

    cat_it = EmergencyCategory.objects.create(name="IT Emergency", icon="Monitor", color="purple", order=3)
    EmergencyContact.objects.create(category=cat_it, name="Network Support", phone="Ext. 401", location="IT Lab", icon="Monitor", color="purple")
    EmergencyContact.objects.create(category=cat_it, name="Student Portal Help", phone="Ext. 402", location="Building A", icon="Monitor", color="purple")

    cat_student = EmergencyCategory.objects.create(name="Student Support", icon="Info", color="green", order=4)
    EmergencyContact.objects.create(category=cat_student, name="Academic Support", phone="Ext. 501", location="Library", icon="Info", color="green")
    EmergencyContact.objects.create(category=cat_student, name="Student Counseling", phone="Ext. 502", location="Student Center", icon="Info", color="green")

    print("Successfully seeded Emergency Contacts!")

if __name__ == '__main__':
    seed_data()
