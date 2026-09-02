from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import EmergencyCategory, EmergencyContact, EmergencyNotice, EmergencyReport
from .serializers import (
    EmergencyCategorySerializer, 
    EmergencyContactSerializer, 
    EmergencyNoticeSerializer, 
    EmergencyReportSerializer
)

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class EmergencyCategoryViewSet(viewsets.ModelViewSet):
    queryset = EmergencyCategory.objects.all()
    serializer_class = EmergencyCategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class EmergencyContactViewSet(viewsets.ModelViewSet):
    queryset = EmergencyContact.objects.all()
    serializer_class = EmergencyContactSerializer
    permission_classes = [IsAdminOrReadOnly]

class EmergencyNoticeViewSet(viewsets.ModelViewSet):
    queryset = EmergencyNotice.objects.all()
    serializer_class = EmergencyNoticeSerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(detail=False, methods=['get'])
    def active(self, request):
        notices = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(notices, many=True)
        return Response(serializer.data)

class EmergencyReportViewSet(viewsets.ModelViewSet):
    queryset = EmergencyReport.objects.all()
    serializer_class = EmergencyReportSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdminOrReadOnly()]
