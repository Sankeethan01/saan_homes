from rest_framework import serializers
from .models import Category, Equipment, Booking, Payment


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class EquipmentSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Equipment
        fields = "__all__"


class BookingSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    equipment_name = serializers.CharField(source="equipment.name", read_only=True)

    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = ("id", "created", "status", "user")

    def validate(self, attrs):
        if attrs["end_date"] < attrs["start_date"]:
            raise serializers.ValidationError("End date must be after start date.")
        return attrs



class PaymentSerializer(serializers.ModelSerializer):
    booking_id = serializers.UUIDField(source="booking.id", read_only=True)

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ("id", "paid_at")