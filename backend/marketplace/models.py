from django.db import models
from accounts.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, blank=True, null=True) # e.g., 'Book', 'Laptop'
    
    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class MarketplaceItem(models.Model):
    CONDITION_CHOICES = (
        ('new', 'New'),
        ('like_new', 'Like New'),
        ('good', 'Good'),
        ('used', 'Used'),
        ('damaged', 'Damaged'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('found', 'Found'),
        ('resolved', 'Resolved'),
        ('hidden', 'Hidden'),
    )
    LISTING_TYPE_CHOICES = (
        ('FOR_SALE', 'For Sale'),
        ('WANT_TO_BUY', 'Want to Buy'),
        ('LOST_AND_FOUND', 'Lost & Found'),
    )
    LOST_OR_FOUND_CHOICES = (
        ('lost', 'Lost'),
        ('found', 'Found'),
        ('na', 'Not Applicable'),
    )

    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='marketplace_items')
    listing_type = models.CharField(max_length=20, choices=LISTING_TYPE_CHOICES, default='FOR_SALE')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='items')
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_negotiable = models.BooleanField(default=True)
    
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Optional fields for academic specifics
    course_code = models.CharField(max_length=50, blank=True, null=True) # e.g. CSE220
    semester = models.CharField(max_length=50, blank=True, null=True) # e.g. Semester-4
    department = models.CharField(max_length=100, blank=True, null=True) # e.g. CSE
    
    # Lost & Found Fields
    lost_or_found = models.CharField(max_length=10, choices=LOST_OR_FOUND_CHOICES, default='na')
    location = models.CharField(max_length=255, blank=True, null=True)
    date_lost_found = models.DateField(blank=True, null=True)
    reward = models.CharField(max_length=255, blank=True, null=True)
    contact_number = models.CharField(max_length=20, blank=True, null=True)

    image = models.ImageField(upload_to='marketplace/items/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.listing_type == 'FOR_SALE':
            return f"{self.title} - {self.price} Tk"
        return f"{self.title} - {self.lost_or_found}"

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    item = models.ForeignKey(MarketplaceItem, on_delete=models.CASCADE, related_name='wishlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'item')

    def __str__(self):
        return f"{self.user.username} - {self.item.title}"

class Conversation(models.Model):
    item = models.ForeignKey(MarketplaceItem, on_delete=models.CASCADE, related_name='conversations')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buying_conversations')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='selling_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('item', 'buyer', 'seller')

    def __str__(self):
        return f"{self.buyer.username} & {self.seller.username} - {self.item.title}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender.username} in {self.conversation.id}"

class Offer(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('countered', 'Countered'),
        ('cancelled', 'Cancelled'),
    )
    item = models.ForeignKey(MarketplaceItem, on_delete=models.CASCADE, related_name='offers')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='made_offers')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Offer {self.amount} for {self.item.title} by {self.buyer.username}"
