from rest_framework import serializers
from .models import ContactMessage, ProjectAlert, RentalRequest


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"
        read_only_fields = ("id", "created")


class ProjectAlertSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = ProjectAlert
        fields = "__all__"
        read_only_fields = ("id", "created")


class RentalRequestSerializer(serializers.ModelSerializer):
    booking_id = serializers.UUIDField(source="booking.id", read_only=True)

    class Meta:
        model = RentalRequest
        fields = "__all__"
        read_only_fields = ("id", "created")
