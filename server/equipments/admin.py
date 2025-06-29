from django.contrib import admin
from .models import Category, Equipment, Booking, Payment


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "equipment_count")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "description")
    fields = ("name", "slug", "description", "icon")
    
    def equipment_count(self, obj):
        return obj.equipments.count()
    equipment_count.short_description = "Equipment Count"


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = (
        "name", "category", "availability_status", "daily_rate", 
        "weekly_rate", "monthly_rate", "is_featured", "condition_rating"
    )
    list_filter = (
        "category", "availability_status", "is_featured", 
        "condition_rating", "gps_ready", "air_conditioning", 
        "delivery_available", "operator_license_required"
    )
    search_fields = ("name", "description", "serial_number", "asset_tag")
    autocomplete_fields = ("category",)
    list_editable = ("availability_status", "is_featured")
    
    fieldsets = (
        ("Basic Information", {
            "fields": ("name", "description", "category", "image", "additional_images")
        }),
        ("Pricing", {
            "fields": (
                "daily_rate", "weekly_rate", "monthly_rate", 
                "security_deposit", "late_return_fee"
            )
        }),
        ("Status & Availability", {
            "fields": ("availability_status", "is_featured")
        }),
        ("Technical Specifications", {
            "fields": (
                "operating_weight", "engine_power", "blade_capacity",
                "fuel_capacity", "max_speed", "length", "width", "height"
            ),
            "classes": ("collapse",)
        }),
        ("Features", {
            "fields": ("gps_ready", "air_conditioning", "hydraulic_system"),
            "classes": ("collapse",)
        }),
        ("Operational Details", {
            "fields": (
                "current_location", "pickup_location", "delivery_available",
                "delivery_radius", "delivery_fee"
            ),
            "classes": ("collapse",)
        }),
        ("Maintenance & Condition", {
            "fields": (
                "condition_rating", "last_service_date", "next_service_due", 
                "service_hours"
            ),
            "classes": ("collapse",)
        }),
        ("Asset Management", {
            "fields": (
                "serial_number", "asset_tag", "purchase_date", 
                "depreciation_value"
            ),
            "classes": ("collapse",)
        }),
        ("Rental Requirements", {
            "fields": (
                "minimum_rental_period", "maximum_rental_period", 
                "advance_booking_days", "operator_license_required",
                "training_required", "age_restriction", "insurance_required"
            ),
            "classes": ("collapse",)
        }),
        ("Documentation", {
            "fields": ("manual_url", "certification_documents"),
            "classes": ("collapse",)
        }),
        ("Analytics (Read Only)", {
            "fields": (
                "total_rental_days", "total_revenue", "popularity_score",
                "created_at", "updated_at"
            ),
            "classes": ("collapse",)
        }),
    )
    
    readonly_fields = (
        "total_rental_days", "total_revenue", "popularity_score",
        "created_at", "updated_at"
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "equipment", "user", "start_date", "end_date", 
        "duration", "status", "total_cost", "created"
    )
    list_filter = ("status", "start_date", "end_date", "equipment__category")
    autocomplete_fields = ("equipment", "user")
    search_fields = (
        "equipment__name", "user__username", "user__email",
        "user__first_name", "user__last_name"
    )
    readonly_fields = ("duration", "total_cost", "created")
    
    fieldsets = (
        ("Booking Details", {
            "fields": ("equipment", "user", "start_date", "end_date", "notes")
        }),
        ("Status & Costs", {
            "fields": ("status", "duration", "total_cost")
        }),
        ("Timestamps", {
            "fields": ("created",),
            "classes": ("collapse",)
        }),
    )
    
    def duration(self, obj):
        return f"{obj.duration} days"
    duration.short_description = "Duration"
    
    def total_cost(self, obj):
        return f"${obj.equipment.calculate_rental_cost(obj.duration):,.2f}"
    total_cost.short_description = "Total Cost"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('equipment', 'user')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "booking", "amount", "transaction_id", "paid_at", 
        "equipment_name", "user_name"
    )
    list_filter = ("paid_at",)
    autocomplete_fields = ("booking",)
    search_fields = (
        "booking__equipment__name", "booking__user__username",
        "transaction_id"
    )
    readonly_fields = ("paid_at",)
    
    def equipment_name(self, obj):
        return obj.booking.equipment.name
    equipment_name.short_description = "Equipment"
    
    def user_name(self, obj):
        user = obj.booking.user
        if user.first_name and user.last_name:
            return f"{user.first_name} {user.last_name}"
        return user.username
    user_name.short_description = "Customer"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'booking__equipment', 'booking__user'
        )
