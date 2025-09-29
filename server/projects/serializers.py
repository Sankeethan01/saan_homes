# projects/serializers.py
from rest_framework import serializers
from .models import SupervisorNote
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from .models import Project, Step, ProgressLog, Bill, Invoice, InvoiceItem, VRVideo, SupervisorNote, ProgressLogMedia, ProjectMedia

User = get_user_model()


class ProgressLogMediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    
    class Meta:
        model = ProgressLogMedia
        fields = ['id', 'url', 'type', 'filename', 'file_size', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at', 'filename', 'file_size']
    
    def get_url(self, obj):
        if not obj.file:
            return None
        request = self.context.get('request')
        try:
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        except Exception:
            return obj.file.url
    
    def get_type(self, obj):
        return obj.media_type.lower()


class ProjectMediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()
    step_id = serializers.SerializerMethodField()
    step_title = serializers.SerializerMethodField()

    class Meta:
        model = ProjectMedia
        fields = [
            'id', 'project', 'step', 'file', 'media_type',
            'title', 'description', 'filename', 'file_size',
            'uploaded_by_name', 'uploaded_at',
            'url', 'type',
            'step_id', 'step_title',
            'is_submitted_to_admin',
            'is_deleted', 'deleted_at',
        ]
        read_only_fields = [
            'id', 'uploaded_at', 'filename', 'file_size', 'uploaded_by_name'
        ]

    def get_url(self, obj):
        if not obj.file:
            return None
        request = self.context.get('request')
        try:
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        except Exception:
            return obj.file.url

    def get_type(self, obj):
        return obj.media_type.lower()

    def get_uploaded_by_name(self, obj):
        return f"{obj.uploaded_by.first_name} {obj.uploaded_by.last_name}" if obj.uploaded_by else "Unknown"

    def get_step_id(self, obj):
        return str(obj.step.id) if obj.step else None

    def get_step_title(self, obj):
        return obj.step.title if obj.step else None

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        file = validated_data.get('file')

        validated_data['uploaded_by'] = user
        validated_data['filename'] = file.name if file else ''
        validated_data['file_size'] = file.size if file else 0

        return super().create(validated_data)



class ProgressLogSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    description = serializers.CharField(source='message')
    media = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source='created')
    type = serializers.SerializerMethodField()
      # Accept stepId in input and map to `step`
    stepId = serializers.PrimaryKeyRelatedField(
        source='step',
        queryset=Step.objects.all(),
        write_only=True
    )
    
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
        """Format media files for frontend - support both new and legacy media"""
        media_files = []
        
        # Add new media files
        for media in obj.media_files.all():
            media_files.append({
                "id": str(media.id),
                "url": media.file.url,
                "type": media.media_type.lower(),
                "filename": media.filename
            })
        
        # Add legacy media for backward compatibility
        if obj.media:
            media_files.append({
                "id": str(obj.id),
                "url": obj.media.url,
                "type": obj.media_type.lower() if obj.media_type else "image",
                "filename": obj.media.name.split('/')[-1]
            })
        
        return media_files
    
    def get_type(self, obj):
        """Get log type based on media"""
        if obj.media_files.exists():
            # Check if any media is video or VR
            if obj.media_files.filter(media_type__in=['VIDEO', 'VR']).exists():
                return "VIDEO"
            elif obj.media_files.filter(media_type='IMAGE').exists():
                return "PHOTO"
        
        # Legacy check
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
    file_size = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = "__all__"  # includes uploaded_by, file_size, uploaded_by_name
        read_only_fields = ("id", "uploaded_at", "verified", "uploaded_by")

    def get_file_size(self, obj):
        if obj.pdf and hasattr(obj.pdf, 'size'):
            try:
                return obj.pdf.size
            except Exception as e:
                # Handle any errors when accessing file
                print(f"Error getting file size for {obj.id}: {str(e)}")
                return None
        return None

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            name = f"{obj.uploaded_by.first_name} {obj.uploaded_by.last_name}".strip()
            return name if name else obj.uploaded_by.username
        return "Unknown"

    # Example: human-friendly filename
    def validate_pdf(self, file):
        if file.size > 10 * 1024 * 1024:          # 10 MB guard
            raise serializers.ValidationError("PDF is too large.")
        return file


class StepSerializer(serializers.ModelSerializer):
    logs = ProgressLogSerializer(many=True, read_only=True)
    status = serializers.SerializerMethodField()
    bills = BillSerializer(many=True, read_only=True)
    invoices = serializers.SerializerMethodField()
    
    class Meta:
        model = Step
        fields = "__all__"
        read_only_fields = ("id",)
    
    def get_invoices(self, obj):
        """Get invoice data for this step if it exists"""
        try:
            if hasattr(obj, 'invoices'):
                invoices = obj.invoices.all()
                return [{
                    'id': invoice.id,
                    'invoice_number': invoice.invoice_number,
                    'status': invoice.status,
                    'total': invoice.total,
                    'created_at': invoice.created_at
                } for invoice in invoices]
        except Exception:
            pass
        return []
    
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


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing projects"""
    progress = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    current_step = serializers.SerializerMethodField()
    supervisor = SupervisorSerializer(read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'start_date', 'estimated_end_date', 
                  'is_completed', 'supervisor', 'created', 'updated', 
                  'progress', 'status', 'current_step', 'project_type', 'priority']
    
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


class ProjectSerializer(serializers.ModelSerializer):
    boq_file = serializers.FileField(required=False, allow_null=True)
    steps = StepSerializer(many=True, read_only=True)
    media_files = ProjectMediaSerializer(many=True, read_only=True)
    
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
        try:
            # Use prefetched steps to avoid additional queries
            steps = obj.steps.all()
            total_steps = len(steps)
            if total_steps == 0:
                return 0
            
            completed_steps = sum(1 for step in steps if step.is_approved)
            return int((completed_steps / total_steps) * 100)
        except Exception:
            return 0
    
    def get_current_step(self, obj):
        """Get the current step in progress"""
        try:
            # Use prefetched steps to avoid additional queries
            steps = obj.steps.all()
            current_step = next((step for step in sorted(steps, key=lambda s: s.order) if not step.is_approved), None)
            return current_step.title if current_step else "Completed"
        except Exception:
            return "Unknown"
    
    def get_status(self, obj):
        """Get project status"""
        try:
            if obj.is_completed:
                return "COMPLETED"
            # Use prefetched steps to avoid additional queries
            steps = obj.steps.all()
            has_pending_steps = any(not step.is_approved for step in steps)
            return "IN_PROGRESS" if has_pending_steps else "PLANNING"
        except Exception:
            return "UNKNOWN"
    
    def get_client(self, obj):
        """Get client information from project model"""
        if obj.client_name:
            return obj.client_name
        return "Not Specified"
    
    def get_budget(self, obj):
        """Calculate total budget from steps"""
        try:
            # Use prefetched steps to avoid additional queries
            steps = obj.steps.all()
            total_budget = sum(step.expected_budget or 0 for step in steps)
            return float(total_budget)
        except Exception:
            return 0.0

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
    project_name = serializers.CharField(source="step.project.name", read_only=True)
    project_id = serializers.UUIDField(source="step.project.id", read_only=True)
    step_order = serializers.IntegerField(source="step.order", read_only=True)
    
    # Bill information
    related_bills = serializers.SerializerMethodField()
    
    # Computed fields
    total_amount = serializers.SerializerMethodField()
    line_items_count = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'bill', 'project', 'step',
            'invoice_number', 'date', 'vendor', 'client',
            'subtotal', 'tax', 'total',
            'ocr_confidence', 'ocr_text',
            'status', 'created_at', 'updated_at',
            'sent_to_admin_at', 'approved_by_admin_at',
            'created_by', 'approved_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'approved_by_admin_at', 'approved_by']

    def get_related_bills(self, obj):
        """Get related bills for this invoice using prefetched relation when available"""
        try:
            bills_qs = getattr(obj.step, 'bills', None)
            if bills_qs is not None:
                bills = bills_qs.all()
            else:
                from .models import Bill
                bills = Bill.objects.filter(step=obj.step)
        except Exception:
            from .models import Bill
            bills = Bill.objects.filter(step=obj.step)
        
        return [
            {
                'id': str(bill.id),
                'pdf': bill.pdf.url if bill.pdf else None,
                'uploaded_at': bill.uploaded_at,
                'uploaded_by': bill.uploaded_by.get_full_name() if bill.uploaded_by else "Unknown",
                'is_submitted_to_admin': bill.is_submitted_to_admin,
                'ocr_total': bill.ocr_data.get('total', 0) if bill.ocr_data else 0
            }
            for bill in bills
        ]

    def get_total_amount(self, obj):
        """Get total amount from data or calculate from line items"""
        # Prefer explicit amount if it is a positive number or a numeric string
        amount_value = obj.data.get('amount')
        try:
            if amount_value is not None:
                numeric_amount = float(amount_value)
                if numeric_amount > 0:
                    return numeric_amount
        except (TypeError, ValueError):
            pass

        # Calculate from line items, coercing strings to numbers and using qty * rate when needed
        total = 0.0
        for item in obj.data.get('line_items', []) or []:
            item_amount = item.get('amount', 0)
            try:
                total += float(item_amount)
                continue
            except (TypeError, ValueError):
                pass

            # Fallback: amount = quantity * rate
            try:
                quantity = float(item.get('quantity', 1) or 1)
                rate = float(item.get('rate', 0) or 0)
                total += quantity * rate
            except (TypeError, ValueError):
                continue

        return total

    def get_line_items_count(self, obj):
        """Get count of line items"""
        line_items = obj.data.get('line_items', [])
        return len(line_items)

    def get_status_display(self, obj):
        """Get human-readable status"""
        status = obj.data.get('status', 'DRAFT')
        status_map = {
            'DRAFT': 'Draft',
            'SUBMITTED': 'Submitted to Admin',
            'APPROVED': 'Approved by Admin',
            'REJECTED': 'Rejected by Admin',
            'PAID': 'Paid'
        }
        return status_map.get(status, status)


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

class SupervisorNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupervisorNote
        fields = '__all__'
        read_only_fields = ['supervisor']


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['id', 'description', 'quantity', 'rate', 'amount']
        read_only_fields = ['id']


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    step_title = serializers.CharField(source='step.title', read_only=True)
    bill_id = serializers.CharField(source='bill.id', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'bill_id', 'project', 'step', 'project_name', 'step_title',
            'invoice_number', 'date', 'vendor', 'client',
            'subtotal', 'tax', 'total',
            'ocr_confidence', 'ocr_text',
            'status', 'created_at', 'updated_at',
            'sent_to_admin_at', 'approved_by_admin_at',
            'created_by', 'created_by_name', 'approved_by', 'approved_by_name',
            'items'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'sent_to_admin_at', 
            'approved_by_admin_at', 'created_by', 'approved_by'
        ]

    def create(self, validated_data):
        # Extract items data
        items_data = self.context.get('items_data', [])
        
        # Create invoice
        invoice = Invoice.objects.create(**validated_data)
        
        # Create invoice items
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        
        return invoice

    def update(self, instance, validated_data):
        # Extract items data
        items_data = self.context.get('items_data', [])
        
        # Update invoice
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update items if provided
        if items_data:
            # Delete existing items
            instance.items.all().delete()
            
            # Create new items
            for item_data in items_data:
                InvoiceItem.objects.create(invoice=instance, **item_data)
        
        return instance