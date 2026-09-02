from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmergencyCategoryViewSet,
    EmergencyContactViewSet,
    EmergencyNoticeViewSet,
    EmergencyReportViewSet
)

router = DefaultRouter()
router.register(r'categories', EmergencyCategoryViewSet)
router.register(r'contacts', EmergencyContactViewSet)
router.register(r'notices', EmergencyNoticeViewSet)
router.register(r'reports', EmergencyReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
