from rest_framework import serializers
from .models import User, FeaturePermission


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = [
            'username',
            'first_name',
            'last_name',
            'password',
            'student_id',
            'department',
            'intake',
            'university_email',
        ]

    def create(self, validated_data):

        password = validated_data.pop('password')

        user = User(
            username=validated_data.get('username') or validated_data.get('student_id'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            student_id=validated_data['student_id'],
            department=validated_data['department'],
            intake=validated_data.get('intake'),
            university_email=validated_data['university_email'],
        )

        user.set_password(password)

        user.save()

        return user


class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'student_id',
            'department',
            'university_email',
            'role',
            'verified',
        ]


class AdminStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'student_id',
            'department',
            'university_email',
            'role',
            'verified',
            'login_count',
            'is_blocked',
            'max_usage_limit',
            'last_login',
        ]


class FeaturePermissionSerializer(serializers.ModelSerializer):
    feature_name = serializers.CharField(
        source='get_feature_key_display',
        read_only=True,
    )

    class Meta:
        model = FeaturePermission
        fields = [
            'id',
            'feature_key',
            'feature_name',
            'is_allowed',
            'daily_limit',
            'usage_count',
        ]