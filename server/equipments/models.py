# equipment/models.py
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

User = settings.AUTH_USER_MODEL


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.ImageField(upload_to="categories/", blank=True, null=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self) -> str:
        return self.name


class Equipment(models.Model):
    class AvailabilityStatus(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        RENTED = "RENTED", "Currently Rented"
        MAINTENANCE = "MAINTENANCE", "Under Maintenance"
        OUT_OF_SERVICE = "OUT_OF_SERVICE", "Out of Service"

    class ConditionRating(models.IntegerChoices):
        POOR = 1, "Poor"
        FAIR = 2, "Fair"
        GOOD = 3, "Good"
        VERY_GOOD = 4, "Very Good"
        EXCELLENT = 5, "Excellent"

    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, related_name="equipments", on_delete=models.PROTECT)
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    
    # Images
    image = models.ImageField(upload_to="equipment/")
    additional_images = models.JSONField(default=list, blank=True)  # Store additional image paths
    
    # Pricing Structure
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    weekly_rate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    monthly_rate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    late_return_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Availability & Status
    availability_status = models.CharField(
        max_length=20, 
        choices=AvailabilityStatus.choices, 
        default=AvailabilityStatus.AVAILABLE
    )
    is_featured = models.BooleanField(default=False)  # For landing page display
    show_on_landing = models.BooleanField(default=False)  # For landing page visibility
    
    # Technical Specifications
    operating_weight = models.CharField(max_length=50, blank=True)  # "18 tons"
    engine_power = models.CharField(max_length=50, blank=True)      # "168 hp"
    blade_capacity = models.CharField(max_length=50, blank=True)    # "4.5 cubic yards"
    fuel_capacity = models.CharField(max_length=50, blank=True)
    max_speed = models.CharField(max_length=50, blank=True)
    
    # Dimensions
    length = models.CharField(max_length=30, blank=True)
    width = models.CharField(max_length=30, blank=True)
    height = models.CharField(max_length=30, blank=True)
    
    # Features (Boolean fields for key features)
    gps_ready = models.BooleanField(default=False)
    air_conditioning = models.BooleanField(default=False)
    hydraulic_system = models.BooleanField(default=False)
    
    # Operational Details
    current_location = models.CharField(max_length=200, blank=True)
    pickup_location = models.CharField(max_length=200, blank=True)
    delivery_available = models.BooleanField(default=False)
    delivery_radius = models.PositiveIntegerField(default=0)  # in kilometers
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    # Maintenance & Condition
    last_service_date = models.DateField(blank=True, null=True)
    next_service_due = models.DateField(blank=True, null=True)
    service_hours = models.PositiveIntegerField(default=0)
    condition_rating = models.IntegerField(
        choices=ConditionRating.choices,
        default=ConditionRating.GOOD,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    # Asset Management
    serial_number = models.CharField(max_length=100, blank=True, null=True)
    asset_tag = models.CharField(max_length=50, blank=True)
    purchase_date = models.DateField(blank=True, null=True)
    depreciation_value = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    
    # Rental Requirements
    minimum_rental_period = models.PositiveIntegerField(default=1)  # days
    maximum_rental_period = models.PositiveIntegerField(default=365)  # days
    advance_booking_days = models.PositiveIntegerField(default=30)
    operator_license_required = models.BooleanField(default=False)
    training_required = models.BooleanField(default=False)
    age_restriction = models.PositiveIntegerField(default=18)
    insurance_required = models.BooleanField(default=True)
    
    # Documentation
    manual_url = models.URLField(blank=True)
    certification_documents = models.JSONField(default=list, blank=True)
    
    # Analytics (updated by system)
    total_rental_days = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    popularity_score = models.FloatField(default=0.0)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['category', 'availability_status']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['daily_rate']),
        ]

    def __str__(self) -> str:
        return f"{self.name} - {self.availability_status}"

    @property
    def is_available(self):
        return self.availability_status == self.AvailabilityStatus.AVAILABLE

    @property
    def weekly_discount_percentage(self):
        if self.weekly_rate and self.daily_rate:
            weekly_equivalent = self.daily_rate * 7
            return round(((weekly_equivalent - self.weekly_rate) / weekly_equivalent) * 100, 1)
        return 0

    @property
    def monthly_discount_percentage(self):
        if self.monthly_rate and self.daily_rate:
            monthly_equivalent = self.daily_rate * 30
            return round(((monthly_equivalent - self.monthly_rate) / monthly_equivalent) * 100, 1)
        return 0

    def calculate_rental_cost(self, days):
        """Calculate the most cost-effective rental price for given duration"""
        if days >= 30 and self.monthly_rate:
            months = days // 30
            remaining_days = days % 30
            return (months * self.monthly_rate) + (remaining_days * self.daily_rate)
        elif days >= 7 and self.weekly_rate:
            weeks = days // 7
            remaining_days = days % 7
            return (weeks * self.weekly_rate) + (remaining_days * self.daily_rate)
        else:
            return days * self.daily_rate


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        PAID = "PAID", "Paid"
        RENTED = "RENTED", "Rented"
        COMPLETED = "COMPLETED", "Completed"
        REJECTED = "REJECTED", "Rejected"
        CANCELLED = "CANCELLED", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    equipment = models.ForeignKey(Equipment, related_name="bookings", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="bookings", on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created = models.DateTimeField(auto_now_add=True)

    @property
    def duration(self):
        return (self.end_date - self.start_date).days + 1


class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.OneToOneField(Booking, related_name="payment", on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=120)
    provider_raw = models.JSONField(default=dict)      # gateway response
    paid_at = models.DateTimeField(default=timezone.now)