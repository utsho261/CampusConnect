from django.db import models
from django.conf import settings
from django.db.models import Sum

class ImpactProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='impact_profile'
    )
    
    academic_points = models.IntegerField(default=0)
    career_points = models.IntegerField(default=0)
    club_points = models.IntegerField(default=0)
    community_points = models.IntegerField(default=0)
    marketplace_points = models.IntegerField(default=0)
    
    @property
    def total_points(self):
        return (
            self.academic_points +
            self.career_points +
            self.club_points +
            self.community_points +
            self.marketplace_points
        )
    
    def __str__(self):
        return f"{self.user.username} - {self.total_points} pts"


class PointLog(models.Model):
    CATEGORY_CHOICES = (
        ('academic', 'Academic'),
        ('career', 'Career'),
        ('club', 'Club & Events'),
        ('community', 'Community'),
        ('marketplace', 'Marketplace'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='point_logs'
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    action_name = models.CharField(max_length=255)
    points = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} | {self.action_name} | {self.points} pts | {self.category}"
