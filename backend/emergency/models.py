from django.db import models

class EmergencyCategory(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, help_text="Lucide icon name, e.g. ShieldAlert")
    color = models.CharField(max_length=20, default="red", help_text="Tailwind color name e.g. red, blue, yellow")
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name

class EmergencyContact(models.Model):
    category = models.ForeignKey(EmergencyCategory, on_delete=models.CASCADE, related_name='contacts')
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=50)
    location = models.CharField(max_length=100)
    hours = models.CharField(max_length=50, blank=True, null=True)
    
    # Overrides for specific contacts
    icon = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=20, blank=True, null=True)

    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['category__order', 'order']

    def __str__(self):
        return f"{self.name} ({self.category.name})"

class EmergencyNotice(models.Model):
    message = models.TextField()
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Notice (Active: {self.is_active}) - {self.message[:20]}"

class EmergencyReport(models.Model):
    emergency_type = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    description = models.TextField()
    contact_number = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.emergency_type} at {self.location}"
