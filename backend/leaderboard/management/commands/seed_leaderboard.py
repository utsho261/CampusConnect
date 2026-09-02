import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from leaderboard.models import ImpactProfile, PointLog
from leaderboard.utils import award_points

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the leaderboard with mock data'

    def handle(self, *args, **kwargs):
        users = User.objects.filter(role='student')
        if not users.exists():
            self.stdout.write(self.style.ERROR('No student users found to seed. Please run basic seeders first.'))
            return
            
        # Clear existing logs
        PointLog.objects.all().delete()
        ImpactProfile.objects.all().delete()

        actions = [
            ('academic', 'Useful Note Upload', 10),
            ('academic', 'Note gets Like', 2),
            ('academic', 'Helpful Answer', 5),
            ('career', 'Job/Internship Share', 8),
            ('club', 'Event Attend', 5),
            ('community', 'Blood Donation Help', 15),
            ('community', 'Lost Item Returned', 15),
            ('marketplace', 'Successful Sale', 5),
            ('community', 'Helpful Review', 3)
        ]

        self.stdout.write(self.style.SUCCESS(f'Seeding leaderboard for {users.count()} users...'))

        for user in users:
            # Award random points based on a random number of actions
            num_actions = random.randint(5, 50)
            
            for _ in range(num_actions):
                cat, name, pts = random.choice(actions)
                # Some variance
                pts = pts + random.randint(0, 5)
                
                award_points(user, cat, name, pts)
                
        self.stdout.write(self.style.SUCCESS('Successfully seeded leaderboard data!'))
