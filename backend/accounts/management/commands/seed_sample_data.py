from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management.base import BaseCommand
from django.utils import timezone

from academic.models import Assignment, AssignmentTemplate, CTQuestion, JobPosting, Note
from blood_donation.models import BloodDonor, BloodRequest, CommunityPost
from clubs.models import Club, Event, Post


class Command(BaseCommand):
    help = "Seed the database with sample records across the existing features"

    def handle(self, *args, **options):
        User = get_user_model()

        def ensure_user(username, student_id, email, role='student'):
            user, created = User.objects.get_or_create(
                student_id=student_id,
                defaults={
                    'username': username,
                    'email': email,
                    'department': 'CSE',
                    'university_email': email,
                    'intake': 48,
                    'role': role,
                    'verified': True,
                },
            )
            if created:
                user.set_password('123456')
                user.save()
            return user

        def pdf_file(name, content):
            return SimpleUploadedFile(
                f"{name}.pdf",
                content.encode('utf-8'),
                content_type='application/pdf',
            )

        def image_file(name):
            return SimpleUploadedFile(
                f"{name}.png",
                b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQABAA0BA7+f3AAAAABJRU5ErkJggg==',
                content_type='image/png',
            )

        admin_user = ensure_user('admin', 'admin', 'admin@campusconnect.local', role='admin')
        users = [admin_user]
        for i in range(1, 6):
            users.append(ensure_user(f'student{i}', f'student{i}', f'student{i}@campusconnect.local'))

        # Clubs and club content
        club_specs = [
            ('AI & Robotics Club', 'A growing community for robotics, AI, and smart systems innovation.', 'technology'),
            ('Campus Music Society', 'Celebrating creativity through concerts, jam sessions, and cultural events.', 'cultural'),
            ('Green Campus Initiative', 'Promoting sustainability, volunteering, and community action on campus.', 'social'),
        ]

        clubs = []
        for name, description, category in club_specs:
            club, created = Club.objects.get_or_create(
                name=name,
                defaults={
                    'description': description,
                    'category': category,
                    'status': 'approved',
                    'created_by': admin_user,
                    'is_recruiting': True,
                    'requires_application': True,
                },
            )
            clubs.append(club)

        for club in clubs:
            if club.posts.count() < 3:
                for idx, content in enumerate([
                    f"{club.name} is welcoming new members for this semester.",
                    f"A collaborative meetup has been scheduled for {club.name} this week.",
                    f"Our latest project update from {club.name} is now live.",
                ], start=1):
                    if club.posts.count() >= 3:
                        break
                    Post.objects.create(
                        club=club,
                        content=content,
                        created_by=admin_user,
                        image=image_file(f"post-{club.name.lower().replace(' ', '-')}-{idx}"),
                    )

            if club.events.count() < 3:
                for idx, (title, desc) in enumerate([
                    ('Kickoff Session', 'A welcoming session for first-time members.'),
                    ('Workshop Day', 'Hands-on learning and networking activity.'),
                    ('Community Showcase', 'A public event to demonstrate projects and ideas.'),
                ], start=1):
                    if club.events.count() >= 3:
                        break
                    Event.objects.create(
                        club=club,
                        title=f"{club.name}: {title}",
                        description=desc,
                        date=timezone.now() + timedelta(days=idx * 5),
                        location='Campus Auditorium',
                        registration_link='https://campusconnect.local/register',
                        fee=0.00,
                        seat_capacity=80,
                        status='open',
                        created_by=admin_user,
                    )

        # Academic content
        for idx in range(3):
            if Note.objects.filter(title=f'Sample Note {idx + 1}').exists():
                continue
            Note.objects.create(
                title=f'Sample Note {idx + 1}',
                subject=['Data Structures', 'Digital Logic', 'Business Communication'][idx],
                department=['CSE', 'EEE', 'BBA'][idx],
                intake='48',
                description='A curated study note with summary points and practical examples.',
                pdf_file=pdf_file(f'note-{idx + 1}', f'PDF content for note {idx + 1}'),
                uploaded_by=users[idx % len(users)],
            )

        for idx in range(3):
            if CTQuestion.objects.filter(title=f'Sample CT Question {idx + 1}').exists():
                continue
            CTQuestion.objects.create(
                title=f'Sample CT Question {idx + 1}',
                course=['Algorithms', 'Microprocessors', 'Marketing'][idx],
                department=['CSE', 'EEE', 'BBA'][idx],
                intake='48',
                total_questions=25 + idx,
                difficulty=['easy', 'medium', 'hard'][idx],
                description='A realistic practice set for exam preparation.',
                pdf_file=pdf_file(f'ct-question-{idx + 1}', f'CT question content {idx + 1}'),
                uploaded_by=users[(idx + 1) % len(users)],
            )

        for idx in range(3):
            if JobPosting.objects.filter(title=f'Sample Job {idx + 1}').exists():
                continue
            JobPosting.objects.create(
                title=f'Sample Job {idx + 1}',
                company_name=['TechNova', 'BluePeak', 'CampusWorks'][idx],
                job_type=['internship', 'full_time', 'part_time'][idx],
                department=['CSE', 'EEE', 'BBA'][idx],
                location='Dhaka',
                work_mode=['on_site', 'remote', 'hybrid'][idx],
                salary_range='Tk 20,000 - 40,000',
                deadline=date.today() + timedelta(days=20 + idx * 5),
                description='A student-friendly opportunity with mentorship and growth potential.',
                requirements='Good communication skills and basic domain knowledge.',
                apply_link='https://campusconnect.local/apply',
                status='approved',
                posted_by=users[idx % len(users)],
            )

        for idx in range(3):
            if AssignmentTemplate.objects.filter(name=f'Sample Template {idx + 1}').exists():
                continue
            AssignmentTemplate.objects.create(
                name=f'Sample Template {idx + 1}',
                template_file=pdf_file(f'assignment-template-{idx + 1}', f'Assignment template {idx + 1}'),
            )

        template_ids = list(AssignmentTemplate.objects.all()[:3])
        for idx in range(3):
            if Assignment.objects.filter(course_code=f'COURSE{idx + 1}').exists():
                continue
            Assignment.objects.create(
                student=users[(idx + 2) % len(users)],
                template=template_ids[idx] if idx < len(template_ids) else None,
                course_title=['Programming Lab', 'Circuit Lab', 'Business Plan'][idx],
                course_code=f'COURSE{idx + 1}',
                experiment_name=['Logic Building', 'Circuit Analysis', 'Market Research'][idx],
                generated_file=pdf_file(f'assignment-{idx + 1}', f'Generated assignment {idx + 1}'),
            )

        # Blood donation content
        blood_users = users[1:]
        for idx in range(3):
            if BloodDonor.objects.filter(full_name=f'Sample Donor {idx + 1}').exists():
                continue
            BloodDonor.objects.create(
                user=blood_users[idx % len(blood_users)],
                full_name=f'Sample Donor {idx + 1}',
                blood_group=['A+', 'B+', 'O-'][idx],
                phone=f'017{10000000 + idx * 1111111}',
                email=f'donor{idx + 1}@campusconnect.local',
                gender=['male', 'female', 'other'][idx],
                division=['dhaka', 'chittagong', 'sylhet'][idx],
                district='Central',
                upazila='Downtown',
                address='Sample address',
                last_donation_date=date.today() - timedelta(days=120 + idx * 15),
                is_available=True,
                emergency_available=idx == 0,
                total_donations=3 + idx,
                is_approved=True,
                is_verified=idx != 2,
                is_featured=idx == 0,
            )

        for idx in range(3):
            if BloodRequest.objects.filter(patient_name=f'Sample Patient {idx + 1}').exists():
                continue
            BloodRequest.objects.create(
                requested_by=users[(idx + 1) % len(users)],
                patient_name=f'Sample Patient {idx + 1}',
                blood_group=['A+', 'B+', 'O-'][idx],
                bags_needed=1 + idx,
                hospital_name=['Square Hospital', 'Evercare', 'Popular Hospital'][idx],
                hospital_location='Dhaka',
                division=['dhaka', 'sylhet', 'chittagong'][idx],
                district='Central',
                contact_person=f'Contact {idx + 1}',
                contact_number=f'018{20000000 + idx * 1111111}',
                urgency=['normal', 'urgent', 'critical'][idx],
                status=['open', 'urgent', 'in_progress'][idx],
                required_date=date.today() + timedelta(days=2 + idx),
                additional_notes='Need support from the campus community.',
                is_featured=idx == 1,
            )

        for idx in range(3):
            if CommunityPost.objects.filter(content=f'Sample community post {idx + 1}').exists():
                continue
            CommunityPost.objects.create(
                author=users[(idx + 1) % len(users)],
                post_type=['story', 'awareness', 'request'][idx],
                content=f'Sample community post {idx + 1} from the campus community.',
                image=image_file(f'community-post-{idx + 1}'),
                comments=[{'user': users[(idx + 2) % len(users)].username, 'text': 'Nice update!', 'timestamp': timezone.now().isoformat()}],
                is_approved=True,
            )

        self.stdout.write(self.style.SUCCESS(
            'Seeded sample content for clubs, academic, and blood donation features.'
        ))
