from rest_framework import serializers
from .models import EmergencyCategory, EmergencyContact, EmergencyNotice, EmergencyReport

class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = '__all__'

class EmergencyCategorySerializer(serializers.ModelSerializer):
    contacts = EmergencyContactSerializer(many=True, read_only=True)

    class Meta:
        model = EmergencyCategory
        fields = ['id', 'name', 'icon', 'color', 'order', 'contacts']

class EmergencyNoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyNotice
        fields = '__all__'

class EmergencyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyReport
        fields = '__all__'
