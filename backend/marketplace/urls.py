from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, MarketplaceItemViewSet, WishlistViewSet, ConversationViewSet, MessageViewSet, OfferViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'items', MarketplaceItemViewSet, basename='item')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'offers', OfferViewSet, basename='offer')

urlpatterns = [
    path('', include(router.urls)),
]
