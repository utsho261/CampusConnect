from rest_framework import serializers
from .models import Category, MarketplaceItem, Wishlist, Conversation, Message, Offer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class MarketplaceItemSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    seller_phone = serializers.CharField(source='seller.phone', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = MarketplaceItem
        fields = [
            'id', 'seller', 'seller_name', 'seller_phone', 'category', 'category_name', 
            'title', 'description', 'price', 'is_negotiable', 'condition', 'status', 
            'course_code', 'semester', 'department', 'image', 'listing_type', 'is_saved',
            'lost_or_found', 'location', 'date_lost_found', 'reward', 'contact_number', 'created_at', 'updated_at'
        ]
        read_only_fields = ('seller', 'created_at', 'updated_at')

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Wishlist.objects.filter(user=request.user, item=obj).exists()
        return False

class WishlistSerializer(serializers.ModelSerializer):
    item = MarketplaceItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=MarketplaceItem.objects.all(), source='item', write_only=True
    )

    class Meta:
        model = Wishlist
        fields = ['id', 'item', 'item_id', 'added_at']
        read_only_fields = ('user', 'added_at')

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_name', 'content', 'is_read', 'created_at']
        read_only_fields = ('sender', 'created_at', 'is_read')

class ConversationSerializer(serializers.ModelSerializer):
    item_title = serializers.CharField(source='item.title', read_only=True)
    item_image = serializers.SerializerMethodField()
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'item', 'item_title', 'item_image', 'buyer', 'buyer_name', 
            'seller', 'seller_name', 'created_at', 'updated_at', 'last_message', 'unread_count'
        ]
        read_only_fields = ('buyer', 'seller', 'created_at', 'updated_at')

    def get_item_image(self, obj):
        request = self.context.get('request')
        if obj.item.image and request:
            return request.build_absolute_uri(obj.item.image.url)
        if obj.item.image:
            return obj.item.image.url
        return None

    def get_last_message(self, obj):
        last = obj.messages.order_by('-created_at').first()
        if last:
            return {
                'content': last.content,
                'sender_name': last.sender.username,
                'created_at': last.created_at
            }
        return None
        
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

class OfferSerializer(serializers.ModelSerializer):
    item_title = serializers.CharField(source='item.title', read_only=True)
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    seller_name = serializers.CharField(source='item.seller.username', read_only=True)
    
    class Meta:
        model = Offer
        fields = [
            'id', 'item', 'item_title', 'buyer', 'buyer_name', 'seller_name',
            'amount', 'message', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ('buyer', 'created_at', 'updated_at')

