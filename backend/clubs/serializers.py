from rest_framework import serializers
from .models import Club, ClubMember, Event, Post, PostComment, PostLike, EventRegistration, ClubApplication, ClubAdminClaim
from accounts.models import User

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role']

class EventRegistrationSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = EventRegistration
        fields = '__all__'
        read_only_fields = ['event', 'user']

class ClubApplicationSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = ClubApplication
        fields = '__all__'
        read_only_fields = ['club', 'user']

class ClubAdminClaimSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    club_name = serializers.CharField(source='club.name', read_only=True)

    class Meta:
        model = ClubAdminClaim
        fields = '__all__'
        read_only_fields = ['club', 'user']

class ClubSerializer(serializers.ModelSerializer):
    created_by = UserBasicSerializer(read_only=True)
    is_admin = serializers.SerializerMethodField(read_only=True)
    is_member = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Club
        fields = '__all__'

    def get_is_admin(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ClubMember.objects.filter(club=obj, user=request.user, role='admin').exists()
        return False

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ClubMember.objects.filter(club=obj, user=request.user).exists()
        return False

class EventSerializer(serializers.ModelSerializer):
    created_by = UserBasicSerializer(read_only=True)
    registrations_count = serializers.SerializerMethodField(read_only=True)
    is_registered = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ['club']

    def get_registrations_count(self, obj):
        return obj.registrations.count()

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.registrations.filter(user=request.user).exists()
        return False

class ClubMemberSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = ClubMember
        fields = '__all__'

class PostCommentSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = PostComment
        fields = '__all__'
        read_only_fields = ['post', 'user']

class PostLikeSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = PostLike
        fields = '__all__'
        read_only_fields = ['post', 'user']

class PostSerializer(serializers.ModelSerializer):
    created_by = UserBasicSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    club_name = serializers.CharField(source='club.name', read_only=True)
    club_logo = serializers.ImageField(source='club.logo', read_only=True)

    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ['club']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
