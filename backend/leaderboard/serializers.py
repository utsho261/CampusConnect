from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ImpactProfile, PointLog

User = get_user_model()

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'profile_picture']

class ImpactProfileSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    total_points = serializers.IntegerField(read_only=True)

    class Meta:
        model = ImpactProfile
        fields = [
            'user', 
            'academic_points', 
            'career_points', 
            'club_points', 
            'community_points', 
            'marketplace_points', 
            'total_points'
        ]

class PointLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointLog
        fields = ['id', 'category', 'action_name', 'points', 'created_at']
