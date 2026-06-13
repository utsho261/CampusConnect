from rest_framework import serializers
from .models import BloodDonor, BloodRequest, DonationRecord, CommunityPost


class BloodDonorSerializer(serializers.ModelSerializer):
    next_eligible_date = serializers.ReadOnlyField()
    is_eligible_to_donate = serializers.ReadOnlyField()
    donor_badge = serializers.ReadOnlyField()
    lives_saved = serializers.ReadOnlyField()
    username = serializers.CharField(source='user.username', read_only=True)
    profile_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = BloodDonor
        fields = [
            'id', 'username', 'full_name', 'profile_photo', 'profile_photo_url',
            'blood_group', 'phone', 'email', 'gender', 'date_of_birth', 'weight',
            'division', 'district', 'upazila', 'address',
            'last_donation_date', 'is_available', 'emergency_available', 'medical_notes',
            'total_donations', 'is_approved', 'is_verified', 'is_featured',
            'next_eligible_date', 'is_eligible_to_donate', 'donor_badge', 'lives_saved',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'is_approved', 'is_verified', 'is_featured', 'total_donations', 'created_at', 'updated_at']

    def get_profile_photo_url(self, obj):
        request = self.context.get('request')
        if obj.profile_photo and request:
            return request.build_absolute_uri(obj.profile_photo.url)
        return None


class BloodRequestSerializer(serializers.ModelSerializer):
    requested_by_username = serializers.CharField(source='requested_by.username', read_only=True)

    class Meta:
        model = BloodRequest
        fields = [
            'id', 'requested_by', 'requested_by_username',
            'patient_name', 'blood_group', 'bags_needed',
            'hospital_name', 'hospital_location', 'division', 'district',
            'contact_person', 'contact_number',
            'urgency', 'status', 'required_date', 'additional_notes',
            'is_featured', 'shares_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'requested_by', 'is_featured', 'shares_count', 'created_at', 'updated_at']


class DonationRecordSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donor.full_name', read_only=True)
    blood_group = serializers.CharField(source='donor.blood_group', read_only=True)

    class Meta:
        model = DonationRecord
        fields = [
            'id', 'donor', 'donor_name', 'donated_to', 'hospital',
            'donation_date', 'blood_group', 'bags', 'notes', 'verified', 'created_at',
        ]
        read_only_fields = ['id', 'verified', 'created_at']


class CommentSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=500)


class CommunityPostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_name = serializers.SerializerMethodField()
    likes_count = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = CommunityPost
        fields = [
            'id', 'author', 'author_username', 'author_name',
            'post_type', 'content', 'image', 'image_url',
            'likes_count', 'is_liked', 'comments', 'comments_count',
            'is_approved', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'author', 'is_approved', 'comments', 'created_at', 'updated_at']

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_comments_count(self, obj):
        return len(obj.comments) if obj.comments else 0


class DonationStatsSerializer(serializers.Serializer):
    total_donors = serializers.IntegerField()
    active_donors = serializers.IntegerField()
    emergency_donors = serializers.IntegerField()
    total_requests = serializers.IntegerField()
    open_requests = serializers.IntegerField()
    urgent_requests = serializers.IntegerField()
    fulfilled_requests = serializers.IntegerField()
    total_donations = serializers.IntegerField()
    lives_saved = serializers.IntegerField()
    blood_group_distribution = serializers.DictField()
    monthly_stats = serializers.ListField()
