from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta, date
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BloodDonor, BloodRequest, DonationRecord, CommunityPost
from .serializers import (
    BloodDonorSerializer, BloodRequestSerializer,
    DonationRecordSerializer, CommunityPostSerializer, DonationStatsSerializer,
)

# Compatible blood groups lookup
COMPATIBLE_DONORS = {
    'A+':  ['A+', 'A-', 'O+', 'O-'],
    'A-':  ['A-', 'O-'],
    'B+':  ['B+', 'B-', 'O+', 'O-'],
    'B-':  ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+':  ['O+', 'O-'],
    'O-':  ['O-'],
}


class BloodDonorViewSet(viewsets.ModelViewSet):
    serializer_class = BloodDonorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = BloodDonor.objects.filter(is_approved=True).select_related('user')

        blood_group = self.request.query_params.get('blood_group')
        division = self.request.query_params.get('division')
        district = self.request.query_params.get('district')
        upazila = self.request.query_params.get('upazila')
        available = self.request.query_params.get('available')
        emergency = self.request.query_params.get('emergency')
        search = self.request.query_params.get('search')

        if blood_group:
            qs = qs.filter(blood_group=blood_group)
        if division:
            qs = qs.filter(division=division)
        if district:
            qs = qs.filter(district__icontains=district)
        if upazila:
            qs = qs.filter(upazila__icontains=upazila)
        if available == 'true':
            qs = qs.filter(is_available=True)
        if emergency == 'true':
            qs = qs.filter(emergency_available=True)
        if search:
            qs = qs.filter(
                Q(full_name__icontains=search) |
                Q(district__icontains=search) |
                Q(division__icontains=search)
            )
        return qs

    def perform_create(self, serializer):
        # Prevent duplicate registrations
        if BloodDonor.objects.filter(user=self.request.user).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You are already registered as a donor.")
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-profile')
    def my_profile(self, request):
        try:
            donor = BloodDonor.objects.get(user=request.user)
            serializer = self.get_serializer(donor, context={'request': request})
            return Response(serializer.data)
        except BloodDonor.DoesNotExist:
            return Response({'detail': 'Not registered as donor.'}, status=404)

    @action(detail=False, methods=['put', 'patch'], url_path='update-profile')
    def update_profile(self, request):
        try:
            donor = BloodDonor.objects.get(user=request.user)
            serializer = self.get_serializer(
                donor, data=request.data, partial=True, context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except BloodDonor.DoesNotExist:
            return Response({'detail': 'Not registered as donor.'}, status=404)


class BloodRequestViewSet(viewsets.ModelViewSet):
    serializer_class = BloodRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = BloodRequest.objects.select_related('requested_by')

        blood_group = self.request.query_params.get('blood_group')
        division = self.request.query_params.get('division')
        district = self.request.query_params.get('district')
        urgency = self.request.query_params.get('urgency')
        req_status = self.request.query_params.get('status')
        mine = self.request.query_params.get('mine')

        if blood_group:
            qs = qs.filter(blood_group=blood_group)
        if division:
            qs = qs.filter(division=division)
        if district:
            qs = qs.filter(district__icontains=district)
        if urgency:
            qs = qs.filter(urgency=urgency)
        if req_status:
            qs = qs.filter(status=req_status)
        if mine == 'true':
            qs = qs.filter(requested_by=self.request.user)

        return qs

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='share')
    def share(self, request, pk=None):
        blood_request = self.get_object()
        blood_request.shares_count += 1
        blood_request.save(update_fields=['shares_count'])
        return Response({'shares_count': blood_request.shares_count})

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        blood_request = self.get_object()
        if blood_request.requested_by != request.user and not request.user.is_staff:
            return Response({'detail': 'Forbidden.'}, status=403)
        new_status = request.data.get('status')
        if new_status not in dict(BloodRequest._meta.get_field('status').choices):
            return Response({'detail': 'Invalid status.'}, status=400)
        blood_request.status = new_status
        blood_request.save(update_fields=['status'])
        return Response({'status': blood_request.status})


class DonationRecordViewSet(viewsets.ModelViewSet):
    serializer_class = DonationRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            donor = BloodDonor.objects.get(user=self.request.user)
            return DonationRecord.objects.filter(donor=donor)
        except BloodDonor.DoesNotExist:
            return DonationRecord.objects.none()

    def perform_create(self, serializer):
        try:
            donor = BloodDonor.objects.get(user=self.request.user)
            record = serializer.save(donor=donor, blood_group=donor.blood_group)
            # Update donor stats
            donor.total_donations += 1
            donor.last_donation_date = record.donation_date
            donor.save(update_fields=['total_donations', 'last_donation_date'])
        except BloodDonor.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You must be registered as a donor first.")


class CommunityPostViewSet(viewsets.ModelViewSet):
    serializer_class = CommunityPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CommunityPost.objects.filter(is_approved=True).prefetch_related('likes', 'author')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], url_path='toggle-like')
    def toggle_like(self, request, pk=None):
        post = self.get_object()
        user = request.user
        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user)
            liked = False
        else:
            post.likes.add(user)
            liked = True
        return Response({'liked': liked, 'likes_count': post.likes_count})

    @action(detail=True, methods=['post'], url_path='add-comment')
    def add_comment(self, request, pk=None):
        post = self.get_object()
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'detail': 'Comment text required.'}, status=400)

        comment = {
            'user': request.user.username,
            'text': text,
            'timestamp': timezone.now().isoformat(),
        }
        comments = list(post.comments or [])
        comments.append(comment)
        post.comments = comments
        post.save(update_fields=['comments'])
        serializer = self.get_serializer(post, context={'request': request})
        return Response(serializer.data)


class DonationStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_donors = BloodDonor.objects.filter(is_approved=True).count()
        active_donors = BloodDonor.objects.filter(is_approved=True, is_available=True).count()
        emergency_donors = BloodDonor.objects.filter(is_approved=True, emergency_available=True).count()
        total_requests = BloodRequest.objects.count()
        open_requests = BloodRequest.objects.filter(status__in=['open', 'urgent']).count()
        urgent_requests = BloodRequest.objects.filter(urgency__in=['urgent', 'critical'], status__in=['open', 'urgent']).count()
        fulfilled_requests = BloodRequest.objects.filter(status='fulfilled').count()

        total_donations = DonationRecord.objects.aggregate(total=Sum('bags'))['total'] or 0
        lives_saved = total_donations * 3

        # Blood group distribution
        bg_dist = {}
        for item in BloodDonor.objects.filter(is_approved=True).values('blood_group').annotate(count=Count('id')):
            bg_dist[item['blood_group']] = item['count']

        # Monthly stats (last 6 months)
        monthly_stats = []
        now = timezone.now().date()
        for i in range(5, -1, -1):
            month_start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
            month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
            donations = DonationRecord.objects.filter(
                donation_date__gte=month_start, donation_date__lt=month_end
            ).aggregate(total=Sum('bags'))['total'] or 0
            requests_count = BloodRequest.objects.filter(
                created_at__date__gte=month_start, created_at__date__lt=month_end
            ).count()
            monthly_stats.append({
                'month': month_start.strftime('%b %Y'),
                'donations': donations,
                'requests': requests_count,
            })

        return Response({
            'total_donors': total_donors,
            'active_donors': active_donors,
            'emergency_donors': emergency_donors,
            'total_requests': total_requests,
            'open_requests': open_requests,
            'urgent_requests': urgent_requests,
            'fulfilled_requests': fulfilled_requests,
            'total_donations': total_donations,
            'lives_saved': lives_saved,
            'blood_group_distribution': bg_dist,
            'monthly_stats': monthly_stats,
        })


class SmartMatchView(APIView):
    """Returns compatible available donors for a given blood request."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        blood_group = request.query_params.get('blood_group')
        division = request.query_params.get('division', '')
        district = request.query_params.get('district', '')

        if not blood_group:
            return Response({'detail': 'blood_group is required.'}, status=400)

        compatible_groups = COMPATIBLE_DONORS.get(blood_group, [blood_group])
        qs = BloodDonor.objects.filter(
            is_approved=True, is_available=True,
            blood_group__in=compatible_groups
        ).select_related('user')

        # Prioritize same location
        if district:
            qs = sorted(qs, key=lambda d: (
                0 if d.district.lower() == district.lower() else
                1 if d.division.lower() == division.lower() else 2
            ))
        elif division:
            qs = sorted(qs, key=lambda d: 0 if d.division.lower() == division.lower() else 1)

        # Limit to top 10
        qs = list(qs)[:10]
        serializer = BloodDonorSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


# Admin views
class AdminDonorManagementView(generics.ListAPIView):
    serializer_class = BloodDonorSerializer
    permission_classes = [IsAdminUser]
    queryset = BloodDonor.objects.all().select_related('user')


class AdminDonorApproveView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, donor_id):
        try:
            donor = BloodDonor.objects.get(id=donor_id)
        except BloodDonor.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        donor.is_approved = request.data.get('is_approved', donor.is_approved)
        donor.is_verified = request.data.get('is_verified', donor.is_verified)
        donor.is_featured = request.data.get('is_featured', donor.is_featured)
        donor.save(update_fields=['is_approved', 'is_verified', 'is_featured'])
        return Response(BloodDonorSerializer(donor, context={'request': request}).data)


class AdminRequestManageView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, request_id):
        try:
            blood_request = BloodRequest.objects.get(id=request_id)
        except BloodRequest.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        blood_request.is_featured = request.data.get('is_featured', blood_request.is_featured)
        blood_request.status = request.data.get('status', blood_request.status)
        blood_request.save(update_fields=['is_featured', 'status'])
        return Response(BloodRequestSerializer(blood_request).data)
