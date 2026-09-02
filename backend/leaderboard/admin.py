from django.contrib import admin
from .models import ImpactProfile, PointLog

@admin.register(ImpactProfile)
class ImpactProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_points', 'academic_points', 'career_points', 'club_points', 'community_points', 'marketplace_points')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('total_points',)

@admin.register(PointLog)
class PointLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'action_name', 'points', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('user__username', 'action_name')
