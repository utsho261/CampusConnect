from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Club, ClubMember, Event, Post, PostLike, PostComment, EventRegistration, ClubApplication, ClubAdminClaim
from .serializers import ClubSerializer, ClubMemberSerializer, EventSerializer, PostSerializer, PostCommentSerializer, EventRegistrationSerializer, ClubApplicationSerializer, ClubAdminClaimSerializer
from accounts.permissions import IsOwnerOrReadOnly

class ClubViewSet(viewsets.ModelViewSet):
    serializer_class = ClubSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'admin':
            return Club.objects.all().order_by('-created_at')
        return Club.objects.filter(status='approved').order_by('-created_at')

    def perform_create(self, serializer):
        club = serializer.save(created_by=self.request.user)
        # Automatically make the creator an admin of the club
        ClubMember.objects.create(user=self.request.user, club=club, role='admin')

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def join(self, request, pk=None):
        club = self.get_object()
        user = request.user
        
        if ClubMember.objects.filter(user=user, club=club).exists():
            return Response({'detail': 'You are already a member of this club.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if club.requires_application:
            return Response({'detail': 'This club requires an application to join. Please apply instead.'}, status=status.HTTP_400_BAD_REQUEST)

        ClubMember.objects.create(user=user, club=club, role='member')
        return Response({'detail': 'Successfully joined the club.'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def apply(self, request, pk=None):
        club = self.get_object()
        user = request.user
        
        if not club.requires_application:
            return Response({'detail': 'This club does not require an application. You can join directly.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if ClubMember.objects.filter(user=user, club=club).exists():
            return Response({'detail': 'You are already a member of this club.'}, status=status.HTTP_400_BAD_REQUEST)
            
        message = request.data.get('message', '')
        application, created = ClubApplication.objects.get_or_create(
            user=user, club=club, defaults={'message': message, 'status': 'pending'}
        )
        if not created:
            return Response({'detail': 'You have already applied to this club.'}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({'detail': 'Application submitted successfully.'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def members(self, request, pk=None):
        club = self.get_object()
        members = ClubMember.objects.filter(club=club)
        serializer = ClubMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'detail': 'Only site admins can approve clubs.'}, status=status.HTTP_403_FORBIDDEN)
        club = self.get_object()
        club.status = 'approved'
        club.save()
        return Response({'detail': 'Club approved successfully.'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'detail': 'Only site admins can reject clubs.'}, status=status.HTTP_403_FORBIDDEN)
        club = self.get_object()
        club.status = 'rejected'
        club.save()
        return Response({'detail': 'Club rejected successfully.'})

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Event.objects.filter(club_id=self.kwargs.get('club_pk')).order_by('-date')

    def perform_create(self, serializer):
        club = get_object_or_404(Club, pk=self.kwargs.get('club_pk'))
        
        # Verify if the user is an admin of the club
        is_admin = ClubMember.objects.filter(user=self.request.user, club=club, role='admin').exists()
        
        if not is_admin:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must be an admin of this club to create events.")
            
        serializer.save(club=club, created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def register(self, request, pk=None, club_pk=None):
        event = self.get_object()
        user = request.user
        
        if event.status not in ['open', 'closing_soon']:
            return Response({'detail': 'Registration is closed for this event.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if event.seat_capacity and event.registrations.count() >= event.seat_capacity:
            return Response({'detail': 'This event is full.'}, status=status.HTTP_400_BAD_REQUEST)
            
        registration, created = EventRegistration.objects.get_or_create(event=event, user=user)
        if not created:
             return Response({'detail': 'You are already registered.'}, status=status.HTTP_400_BAD_REQUEST)
             
        return Response({'detail': 'Successfully registered for the event.'}, status=status.HTTP_201_CREATED)

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    queryset = Post.objects.all().order_by('-created_at')

    def get_queryset(self):
        club_pk = self.kwargs.get('club_pk')
        user = self.request.user
        
        qs = Post.objects.all().order_by('-created_at')
        
        if club_pk:
            qs = qs.filter(club_id=club_pk)
            
            # If user is admin of the club, show all posts. Otherwise, only show approved posts.
            is_admin = False
            if user.is_authenticated:
                is_admin = ClubMember.objects.filter(user=user, club_id=club_pk, role='admin').exists()
                
            if not is_admin:
                qs = qs.filter(status='approved')
                
        else:
            qs = qs.filter(status='approved')
            
        return qs

    def perform_create(self, serializer):
        club = get_object_or_404(Club, pk=self.kwargs.get('club_pk'))
        user = self.request.user
        
        # Verify if the user is a member of the club
        is_member = ClubMember.objects.filter(user=user, club=club).exists()
        is_admin = ClubMember.objects.filter(user=user, club=club, role='admin').exists()
        
        if not is_member and user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must be a member of this club to post.")
            
        # If admin, auto approve. Else, pending.
        post_status = 'approved' if is_admin or user.role == 'admin' else 'pending'
            
        serializer.save(club=club, created_by=user, status=post_status)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None, club_pk=None):
        post = self.get_object()
        club = get_object_or_404(Club, pk=club_pk)
        
        is_admin = ClubMember.objects.filter(user=request.user, club=club, role='admin').exists()
        if not is_admin and request.user.role != 'admin':
            return Response({'detail': 'Only club admins can approve posts.'}, status=status.HTTP_403_FORBIDDEN)
            
        post.status = 'approved'
        post.save()
        return Response({'detail': 'Post approved successfully.'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None, club_pk=None):
        post = self.get_object()
        club = get_object_or_404(Club, pk=club_pk)
        
        is_admin = ClubMember.objects.filter(user=request.user, club=club, role='admin').exists()
        if not is_admin and request.user.role != 'admin':
            return Response({'detail': 'Only club admins can reject posts.'}, status=status.HTTP_403_FORBIDDEN)
            
        post.status = 'rejected'
        post.save()
        return Response({'detail': 'Post rejected successfully.'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None, club_pk=None):
        post = self.get_object()
        user = request.user
        
        like, created = PostLike.objects.get_or_create(post=post, user=user)
        
        if not created:
            like.delete()
            return Response({'status': 'unliked'})
            
        return Response({'status': 'liked'})

class GlobalPostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoint to get posts from all approved clubs for the global community feed.
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        return Post.objects.filter(club__status='approved', status='approved').order_by('-created_at')

class GlobalEventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoint to get events from all clubs for the global calendar/upcoming.
    """
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        return Event.objects.all().order_by('-date')

class ClubApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ClubApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        club_pk = self.kwargs.get('club_pk')
        if club_pk:
            # Check if user is admin
            is_admin = ClubMember.objects.filter(user=self.request.user, club_id=club_pk, role__in=['admin', 'president', 'vice_president', 'executive']).exists()
            if is_admin:
                return ClubApplication.objects.filter(club_id=club_pk).order_by('-applied_at')
        return ClubApplication.objects.none()

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None, club_pk=None):
        application = self.get_object()
        action_type = request.data.get('action')
        
        if action_type == 'accept':
            application.status = 'accepted'
            application.save()
            ClubMember.objects.get_or_create(user=application.user, club=application.club, defaults={'role': 'member'})
            return Response({'detail': 'Application accepted.'})
        elif action_type == 'reject':
            application.status = 'rejected'
            application.save()
            return Response({'detail': 'Application rejected.'})
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ClubAdminClaimViewSet(viewsets.ModelViewSet):
    serializer_class = ClubAdminClaimSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return ClubAdminClaim.objects.all().order_by('-submitted_at')
        return ClubAdminClaim.objects.filter(user=user).order_by('-submitted_at')

    def perform_create(self, serializer):
        club_id = self.request.data.get('club')
        club = get_object_or_404(Club, pk=club_id)
        
        # Check if they already claimed
        if ClubAdminClaim.objects.filter(user=self.request.user, club=club, status='pending').exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You already have a pending admin claim for this club.")
            
        serializer.save(user=self.request.user, club=club)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'detail': 'Only university admins can approve claims.'}, status=status.HTTP_403_FORBIDDEN)
            
        claim = self.get_object()
        claim.status = 'approved'
        claim.save()
        
        # Make them admin
        ClubMember.objects.update_or_create(
            user=claim.user, 
            club=claim.club, 
            defaults={'role': 'admin'}
        )
        
        return Response({'detail': 'Claim approved successfully. User is now an admin.'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'detail': 'Only university admins can reject claims.'}, status=status.HTTP_403_FORBIDDEN)
            
        claim = self.get_object()
        claim.status = 'rejected'
        claim.save()
        return Response({'detail': 'Claim rejected.'})
