from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ClubViewSet, EventViewSet, PostViewSet, GlobalPostViewSet, GlobalEventViewSet, ClubApplicationViewSet, ClubAdminClaimViewSet

router = DefaultRouter()
router.register(r'clubs', ClubViewSet, basename='club')

urlpatterns = [
    path('clubs/<int:club_pk>/events/', EventViewSet.as_view({'get': 'list', 'post': 'create'}), name='club-events'),
    path('clubs/<int:club_pk>/events/<int:pk>/', EventViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='club-event-detail'),
    path('clubs/<int:club_pk>/events/<int:pk>/register/', EventViewSet.as_view({'post': 'register'}), name='club-event-register'),
    path('clubs/<int:club_pk>/posts/', PostViewSet.as_view({'get': 'list', 'post': 'create'}), name='club-posts'),
    path('clubs/<int:club_pk>/posts/<int:pk>/', PostViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='club-post-detail'),
    path('clubs/<int:club_pk>/posts/<int:pk>/like/', PostViewSet.as_view({'post': 'like'}), name='club-post-like'),
    path('clubs/<int:club_pk>/applications/', ClubApplicationViewSet.as_view({'get': 'list'}), name='club-applications'),
    path('clubs/<int:club_pk>/applications/<int:pk>/process/', ClubApplicationViewSet.as_view({'post': 'process'}), name='club-application-process'),
    path('clubs/claims/', ClubAdminClaimViewSet.as_view({'get': 'list', 'post': 'create'}), name='club-admin-claims'),
    path('clubs/claims/<int:pk>/approve/', ClubAdminClaimViewSet.as_view({'post': 'approve'}), name='club-admin-claim-approve'),
    path('clubs/claims/<int:pk>/reject/', ClubAdminClaimViewSet.as_view({'post': 'reject'}), name='club-admin-claim-reject'),
    path('posts/', GlobalPostViewSet.as_view({'get': 'list'}), name='global-posts'),
    path('events/', GlobalEventViewSet.as_view({'get': 'list'}), name='global-events'),
] + router.urls
