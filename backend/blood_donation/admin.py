from django.contrib import admin
from .models import BloodDonor, BloodRequest, DonationRecord, CommunityPost


@admin.register(BloodDonor)
class BloodDonorAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'blood_group', 'division', 'district', 'is_available', 'emergency_available', 'is_approved', 'is_verified', 'total_donations', 'created_at']
    list_filter = ['blood_group', 'division', 'is_available', 'emergency_available', 'is_approved', 'is_verified']
    search_fields = ['full_name', 'district', 'phone']
    list_editable = ['is_approved', 'is_verified']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(BloodRequest)
class BloodRequestAdmin(admin.ModelAdmin):
    list_display = ['patient_name', 'blood_group', 'hospital_name', 'district', 'urgency', 'status', 'is_featured', 'created_at']
    list_filter = ['blood_group', 'urgency', 'status', 'division', 'is_featured']
    search_fields = ['patient_name', 'hospital_name', 'district', 'contact_person']
    list_editable = ['status', 'is_featured']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(DonationRecord)
class DonationRecordAdmin(admin.ModelAdmin):
    list_display = ['donor', 'blood_group', 'donation_date', 'hospital', 'bags', 'verified']
    list_filter = ['blood_group', 'verified', 'donation_date']
    search_fields = ['donor__full_name', 'hospital', 'donated_to']
    list_editable = ['verified']
    readonly_fields = ['created_at']
    ordering = ['-donation_date']


@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = ['author', 'post_type', 'is_approved', 'likes_count', 'created_at']
    list_filter = ['post_type', 'is_approved', 'created_at']
    search_fields = ['author__username', 'content']
    list_editable = ['is_approved']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
