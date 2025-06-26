# projects/serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from .models import Project, Step, ProgressLog, Bill, Invoice, VRVideo

User = get_user_model()


class ProgressLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressLog
        fields = "__all__"
        read_only_fields = ("id", "created")


class StepSerializer(serializers.ModelSerializer):
    logs = ProgressLogSerializer(many=True, read_only=True)

    class Meta:
        model = Step
        fields = "__all__"          # or list what you need
        read_only_fields = ("id",)


class SupervisorSerializer(serializers.ModelSerializer):
    """Serializer for supervisor details in projects"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class ProjectSerializer(serializers.ModelSerializer):
    boq_file = serializers.FileField(required=False, allow_null=True)
    supervisor = SupervisorSerializer(read_only=True)
    supervisor_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ("id",)

    def to_representation(self, instance):
        """Override to handle null supervisor gracefully"""
        data = super().to_representation(instance)
        if not instance.supervisor:
            data['supervisor'] = None
        return data

    def create(self, validated_data):
        supervisor_id = validated_data.pop('supervisor_id', None)
        if supervisor_id:
            validated_data['supervisor_id'] = supervisor_id
        return super().create(validated_data)

    def update(self, instance, validated_data):
        supervisor_id = validated_data.pop('supervisor_id', None)
        if supervisor_id:
            validated_data['supervisor_id'] = supervisor_id
        return super().update(instance, validated_data)


class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = "__all__"
        read_only_fields = ("id", "uploaded_at", "verified")

    # Example: human-friendly filename
    def validate_pdf(self, file):
        if file.size > 10 * 1024 * 1024:          # 10 MB guard
            raise serializers.ValidationError("PDF is too large.")
        return file


class InvoiceSerializer(serializers.ModelSerializer):
    # expose step title for convenience
    step_title = serializers.CharField(source="step.title", read_only=True)

    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = ("id", "created", "is_approved")


class VRVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VRVideo
        fields = "__all__"
        read_only_fields = ("id", "uploaded")


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields =   ['first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'address', 'profile_image']
        read_only_fields = ['id', 'username', 'role', 'department', 'position', 'employee_id', 'join_date']

class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value