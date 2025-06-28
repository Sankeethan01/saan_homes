# projects/serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from .models import Project, Step, ProgressLog, Bill, Invoice, VRVideo

User = get_user_model()


class ProgressLogSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    description = serializers.CharField(source='message')
    media = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source='created')
    type = serializers.SerializerMethodField()
    
    class Meta:
        model = ProgressLog
        fields = ["id", "stepId", "title", "description", "media", "timestamp", "type"]
        read_only_fields = ("id", "created")
    
    def get_title(self, obj):
        """Generate a title from the message"""
        if obj.message:
            return obj.message[:50] + "..." if len(obj.message) > 50 else obj.message
        return f"Progress Log - {obj.created.strftime('%Y-%m-%d')}"
    
    def get_media(self, obj):
        """Format media files for frontend"""
        if obj.media:
            return [{
                "id": str(obj.id),
                "url": obj.media.url,
                "type": obj.media_type.lower() if obj.media_type else "image",
                "filename": obj.media.name.split('/')[-1]
            }]
        return []
    
    def get_type(self, obj):
        """Get log type based on media"""
        if obj.media_type == "VIDEO":
            return "VIDEO"
        elif obj.media_type == "IMAGE":
            return "PHOTO"
        else:
            return "TEXT"
    
    def to_representation(self, instance):
        """Custom representation to include stepId"""
        data = super().to_representation(instance)
        data['stepId'] = str(instance.step.id)
        return data


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


class StepSerializer(serializers.ModelSerializer):
    logs = ProgressLogSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    bills = BillSerializer(many=True, read_only=True)
    
    class Meta:
        model = Step
        fields = "__all__"
        read_only_fields = ("id",)
    
    def get_progress(self, obj):
        """Calculate step progress based on completion"""
        if obj.is_approved:
            return 100
        elif obj.actual_completed:
            return 75
        else:
            return 0
    
    def get_status(self, obj):
        """Get step status"""
        if obj.is_approved:
            return "COMPLETED"
        elif obj.actual_completed:
            return "IN_PROGRESS"
        else:
            return "PENDING"


class SupervisorSerializer(serializers.ModelSerializer):
    """Serializer for supervisor details in projects"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class ProjectSerializer(serializers.ModelSerializer):
    boq_file = serializers.FileField(required=False, allow_null=True)
    steps = StepSerializer(many=True, read_only=True)
    
    # Computed fields for frontend
    progress = serializers.SerializerMethodField()
    current_step = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    budget = serializers.SerializerMethodField()
    
    # File fields with proper handling
    thumbnail = serializers.ImageField(required=False, allow_null=True)
    model_3d = serializers.FileField(required=False, allow_null=True)
    
    # Use SupervisorSerializer to include all supervisor details in the API response
    supervisor = SupervisorSerializer(read_only=True)
    supervisor_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ("id",)
    
    def get_progress(self, obj):
        """Calculate overall project progress based on completed steps"""
        # Use prefetched steps to avoid additional queries
        steps = obj.steps.all()
        total_steps = len(steps)
        if total_steps == 0:
            return 0
        
        completed_steps = sum(1 for step in steps if step.is_approved)
        return int((completed_steps / total_steps) * 100)
    
    def get_current_step(self, obj):
        """Get the current step in progress"""
        # Use prefetched steps to avoid additional queries
        steps = obj.steps.all()
        current_step = next((step for step in sorted(steps, key=lambda s: s.order) if not step.is_approved), None)
        return current_step.title if current_step else "Completed"
    
    def get_status(self, obj):
        """Get project status"""
        if obj.is_completed:
            return "COMPLETED"
        # Use prefetched steps to avoid additional queries
        steps = obj.steps.all()
        has_pending_steps = any(not step.is_approved for step in steps)
        return "IN_PROGRESS" if has_pending_steps else "PLANNING"
    
    def get_client(self, obj):
        """Get client information from project model"""
        if obj.client_name:
            return obj.client_name
        return "Not Specified"
    
    def get_budget(self, obj):
        """Calculate total budget from steps"""
        # Use prefetched steps to avoid additional queries
        steps = obj.steps.all()
        total_budget = sum(step.expected_budget or 0 for step in steps)
        return float(total_budget)

    def to_representation(self, instance):
        """Override to handle null supervisor gracefully"""
        data = super().to_representation(instance)
        if not instance.supervisor:
            data['supervisor'] = None
        return data

    def create(self, validated_data):
        supervisor_id = validated_data.pop('supervisor_id', None)
        project = super().create(validated_data)
        
        # Explicitly set the supervisor if provided
        if supervisor_id:
            try:
                supervisor = User.objects.get(id=supervisor_id)
                project.supervisor = supervisor
                project.save()
            except User.DoesNotExist:
                pass
                
        return project

    def update(self, instance, validated_data):
        supervisor_id = validated_data.pop('supervisor_id', None)
        instance = super().update(instance, validated_data)
        
        # Explicitly set the supervisor if provided
        if supervisor_id:
            try:
                supervisor = User.objects.get(id=supervisor_id)
                instance.supervisor = supervisor
                instance.save()
            except User.DoesNotExist:
                pass
                
        return instance


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