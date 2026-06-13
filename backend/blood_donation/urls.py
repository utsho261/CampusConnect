from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BloodDonorViewSet, BloodRequestViewSet,
    DonationRecordViewSet, CommunityPostViewSet,
    DonationStatsView, SmartMatchView,
    AdminDonorManagementView, AdminDonorApproveView, AdminRequestManageView,
)

router = DefaultRouter()
router.register(r'blood/donors', BloodDonorViewSet, basename='blood-donors')
router.register(r'blood/requests', BloodRequestViewSet, basename='blood-requests')
router.register(r'blood/records', DonationRecordViewSet, basename='blood-records')
router.register(r'blood/community', CommunityPostViewSet, basename='blood-community')

urlpatterns = [
    path('', include(router.urls)),
    path('blood/stats/', DonationStatsView.as_view(), name='blood-stats'),
    path('blood/smart-match/', SmartMatchView.as_view(), name='blood-smart-match'),

    # Admin endpoints
    path('admin/blood/donors/', AdminDonorManagementView.as_view(), name='admin-blood-donors'),
    path('admin/blood/donors/<int:donor_id>/approve/', AdminDonorApproveView.as_view(), name='admin-blood-approve'),
    path('admin/blood/requests/<int:request_id>/manage/', AdminRequestManageView.as_view(), name='admin-blood-request'),
]
