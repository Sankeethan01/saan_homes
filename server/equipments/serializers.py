from rest_framework import serializers
from .models import Category, Equipment, Booking, Payment


class CategorySerializer(serializers.ModelSerializer):
    equipment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = "__all__"
    
    def get_equipment_count(self, obj):
        return obj.equipments.filter(availability_status='AVAILABLE').count()


class EquipmentSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    
    # Calculated fields for frontend
    is_available = serializers.ReadOnlyField()
    weekly_discount_percentage = serializers.ReadOnlyField()
    monthly_discount_percentage = serializers.ReadOnlyField()
    
    # Pricing display fields
    pricing = serializers.SerializerMethodField()
    specifications = serializers.SerializerMethodField()
    features = serializers.SerializerMethodField()
    rental_requirements = serializers.SerializerMethodField()
    
    class Meta:
        model = Equipment
        fields = "__all__"
    
    def get_pricing(self, obj):
        """Return structured pricing information"""
        pricing = {
            "daily_rate": float(obj.daily_rate),
            "weekly_rate": float(obj.weekly_rate) if obj.weekly_rate else None,
            "monthly_rate": float(obj.monthly_rate) if obj.monthly_rate else None,
            "security_deposit": float(obj.security_deposit),
            "late_return_fee": float(obj.late_return_fee),
        }
        
        # Add discount percentages if applicable
        if obj.weekly_rate:
            pricing["weekly_discount"] = obj.weekly_discount_percentage
        if obj.monthly_rate:
            pricing["monthly_discount"] = obj.monthly_discount_percentage
            
        return pricing
    
    def get_specifications(self, obj):
        """Return technical specifications"""
        specs = {}
        
        # Physical specs
        if obj.operating_weight:
            specs["operating_weight"] = obj.operating_weight
        if obj.engine_power:
            specs["engine_power"] = obj.engine_power
        if obj.blade_capacity:
            specs["blade_capacity"] = obj.blade_capacity
        if obj.fuel_capacity:
            specs["fuel_capacity"] = obj.fuel_capacity
        if obj.max_speed:
            specs["max_speed"] = obj.max_speed
            
        # Dimensions
        if any([obj.length, obj.width, obj.height]):
            specs["dimensions"] = {
                "length": obj.length,
                "width": obj.width,
                "height": obj.height
            }
            
        return specs
    
    def get_features(self, obj):
        """Return equipment features"""
        features = []
        
        if obj.gps_ready:
            features.append("GPS Ready")
        if obj.air_conditioning:
            features.append("Air Conditioning")
        if obj.hydraulic_system:
            features.append("Hydraulic System")
            
        return features
    
    def get_rental_requirements(self, obj):
        """Return rental requirements and restrictions"""
        return {
            "minimum_rental_period": obj.minimum_rental_period,
            "maximum_rental_period": obj.maximum_rental_period,
            "advance_booking_days": obj.advance_booking_days,
            "operator_license_required": obj.operator_license_required,
            "training_required": obj.training_required,
            "age_restriction": obj.age_restriction,
            "insurance_required": obj.insurance_required,
            "delivery_available": obj.delivery_available,
            "delivery_radius": obj.delivery_radius,
            "delivery_fee": float(obj.delivery_fee)
        }


class EquipmentDetailSerializer(EquipmentSerializer):
    """Extended serializer for detailed equipment view"""
    maintenance_info = serializers.SerializerMethodField()
    asset_info = serializers.SerializerMethodField()
    analytics = serializers.SerializerMethodField()
    
    def get_maintenance_info(self, obj):
        """Return maintenance and condition information"""
        return {
            "last_service_date": obj.last_service_date,
            "next_service_due": obj.next_service_due,
            "service_hours": obj.service_hours,
            "condition_rating": obj.condition_rating,
            "condition_display": obj.get_condition_rating_display()
        }
    
    def get_asset_info(self, obj):
        """Return asset management information"""
        return {
            "serial_number": obj.serial_number,
            "asset_tag": obj.asset_tag,
            "purchase_date": obj.purchase_date,
            "depreciation_value": float(obj.depreciation_value) if obj.depreciation_value else None,
            "current_location": obj.current_location,
            "pickup_location": obj.pickup_location
        }
    
    def get_analytics(self, obj):
        """Return rental analytics"""
        return {
            "total_rental_days": obj.total_rental_days,
            "total_revenue": float(obj.total_revenue),
            "popularity_score": obj.popularity_score
        }


class BookingSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    equipment_name = serializers.CharField(source="equipment.name", read_only=True)
    equipment_image = serializers.ImageField(source="equipment.image", read_only=True)
    equipment_daily_rate = serializers.DecimalField(source="equipment.daily_rate", max_digits=10, decimal_places=2, read_only=True)
    
    # Calculated fields
    duration = serializers.ReadOnlyField()
    total_cost = serializers.SerializerMethodField()
    
    # User information
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = ("id", "created", "status", "user")

    def validate(self, attrs):
        # Only validate dates if both are present (for partial updates)
        if "end_date" in attrs and "start_date" in attrs:
            if attrs["end_date"] < attrs["start_date"]:
                raise serializers.ValidationError("End date must be after start date.")
        elif "end_date" in attrs and not "start_date" in attrs:
            # If only end_date is being updated, check against existing start_date
            if self.instance and attrs["end_date"] < self.instance.start_date:
                raise serializers.ValidationError("End date must be after start date.")
        elif "start_date" in attrs and not "end_date" in attrs:
            # If only start_date is being updated, check against existing end_date
            if self.instance and self.instance.end_date < attrs["start_date"]:
                raise serializers.ValidationError("End date must be after start date.")
        return attrs
    
    def get_total_cost(self, obj):
        """Calculate total rental cost using equipment's pricing logic"""
        return float(obj.equipment.calculate_rental_cost(obj.duration))
    
    def get_user_name(self, obj):
        """Get user's full name"""
        if obj.user.first_name and obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return obj.user.username
    
    def get_user_email(self, obj):
        """Get user's email"""
        return obj.user.email


class PaymentSerializer(serializers.ModelSerializer):
    booking_id = serializers.UUIDField(source="booking.id", read_only=True)
    equipment_name = serializers.CharField(source="booking.equipment.name", read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ("id", "paid_at")
    
    def get_user_name(self, obj):
        """Get user's full name"""
        user = obj.booking.user
        if user.first_name and user.last_name:
            return f"{user.first_name} {user.last_name}"
        return user.username