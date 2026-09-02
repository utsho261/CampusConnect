from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, MarketplaceItem, Wishlist, Conversation, Message, Offer
from .serializers import CategorySerializer, MarketplaceItemSerializer, WishlistSerializer, ConversationSerializer, MessageSerializer, OfferSerializer
from accounts.permissions import IsOwnerOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class MarketplaceItemViewSet(viewsets.ModelViewSet):
    # Do not filter out sold/found in the base queryset because details still need to be viewable
    queryset = MarketplaceItem.objects.all().order_by('-created_at')
    serializer_class = MarketplaceItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'condition', 'department', 'semester', 'course_code', 'listing_type', 'lost_or_found', 'status']
    search_fields = ['title', 'description', 'course_code', 'location']
    ordering_fields = ['price', 'created_at']

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_items(self, request):
        items = MarketplaceItem.objects.filter(seller=request.user).order_by('-created_at')
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def update_status(self, request, pk=None):
        item = self.get_object()
        if item.seller != request.user and request.user.role != 'admin':
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        new_status = request.data.get('status')
        if new_status in dict(MarketplaceItem.STATUS_CHOICES):
            item.status = new_status
            item.save()
            return Response({'status': f'Item marked as {new_status}'})
        return Response({'detail': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).order_by('-added_at')

    def perform_create(self, serializer):
        item_id = self.request.data.get('item_id')
        if Wishlist.objects.filter(user=self.request.user, item_id=item_id).exists():
            raise serializers.ValidationError({'detail': 'Already in wishlist'})
        serializer.save(user=self.request.user)

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(Q(buyer=user) | Q(seller=user)).order_by('-updated_at')

    def create(self, request, *args, **kwargs):
        item_id = request.data.get('item_id')
        try:
            item = MarketplaceItem.objects.get(id=item_id)
        except MarketplaceItem.DoesNotExist:
            return Response({'detail': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

        if item.seller == request.user:
            return Response({'detail': 'You cannot start a conversation with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        conversation, created = Conversation.objects.get_or_create(
            item=item,
            buyer=request.user,
            seller=item.seller
        )
        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            Q(conversation__buyer=user) | Q(conversation__seller=user)
        ).order_by('created_at')

    def perform_create(self, serializer):
        conversation_id = self.request.data.get('conversation')
        conversation = Conversation.objects.get(id=conversation_id)
        # Update conversation updated_at for sorting
        conversation.save()
        serializer.save(sender=self.request.user, conversation=conversation)

    @action(detail=False, methods=['post'], url_path='mark-read/(?P<conversation_id>[^/.]+)')
    def mark_read(self, request, conversation_id=None):
        Message.objects.filter(
            conversation_id=conversation_id,
            is_read=False
        ).exclude(sender=request.user).update(is_read=True)
        return Response({'status': 'ok'})

class OfferViewSet(viewsets.ModelViewSet):
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Offer.objects.filter(Q(buyer=user) | Q(item__seller=user)).order_by('-created_at')

    def perform_create(self, serializer):
        item_id = self.request.data.get('item_id')
        item = MarketplaceItem.objects.get(id=item_id)
        serializer.save(buyer=self.request.user, item=item)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        offer = self.get_object()
        new_status = request.data.get('status')
        # Simple authorization
        if request.user == offer.item.seller and new_status in ['accepted', 'rejected', 'countered']:
            offer.status = new_status
            offer.save()
            return Response({'status': f'Offer {new_status}'})
        elif request.user == offer.buyer and new_status == 'cancelled':
            offer.status = new_status
            offer.save()
            return Response({'status': 'Offer cancelled'})
        return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
