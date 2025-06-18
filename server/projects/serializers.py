# projects/serializers.py
from rest_framework import serializers
from .models import Project, Step, ProgressLog, Bill, Invoice, VRVideo


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


class ProjectSerializer(serializers.ModelSerializer):
    boq_file = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ("id",)


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
