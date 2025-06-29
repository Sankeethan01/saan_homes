# projects/models.py
import uuid, os
from django.conf import settings
from django.db import models
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class Project(models.Model):
    # Project Type Choices
    class ProjectType(models.TextChoices):
        RESIDENTIAL = "RESIDENTIAL", "Residential"
        COMMERCIAL = "COMMERCIAL", "Commercial"
        INDUSTRIAL = "INDUSTRIAL", "Industrial"
        RENOVATION = "RENOVATION", "Renovation"
        INFRASTRUCTURE = "INFRASTRUCTURE", "Infrastructure"
        OTHER = "OTHER", "Other"
    
    # Priority Choices
    class Priority(models.TextChoices):
        HIGH = "HIGH", "High"
        MEDIUM = "MEDIUM", "Medium"
        LOW = "LOW", "Low"

    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    project_type = models.CharField(
        max_length=20, 
        choices=ProjectType.choices,
        default=ProjectType.RESIDENTIAL
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )
    
    # Dates
    start_date = models.DateField()
    estimated_end_date = models.DateField()
    
    # Location
    location = models.CharField(max_length=255, blank=True)
    address = models.TextField(blank=True)
    coordinates = models.CharField(max_length=100, blank=True)  # Format: "latitude,longitude"
    
    # Client Information
    client_name = models.CharField(max_length=200, blank=True)
    client_email = models.EmailField(blank=True)
    client_phone = models.CharField(max_length=20, blank=True)
    
    # Personnel
    supervisor = models.ForeignKey(
        User, null=True, blank=True,
        limit_choices_to={"role": "SUPERVISOR"},
        on_delete=models.SET_NULL
    )
    
    # Files
    boq_file = models.FileField(upload_to="boq/")
    
    # Optional Images and 3D Model
    thumbnail = models.ImageField(upload_to="projects/thumbnails/", null=True, blank=True)
    images = models.JSONField(default=list, blank=True)  # Store list of image paths
    model_3d = models.FileField(upload_to="projects/3d_models/", null=True, blank=True)
    
    # Timestamps
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    # Status flags
    is_completed = models.BooleanField(default=False)
    
    # Soft delete fields
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name
        
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
        
    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class Step(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, related_name="steps", on_delete=models.CASCADE)
    order = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    expected_materials = models.JSONField(blank=True, default=list)  # List of material descriptions
    expected_quantity = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    expected_budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    is_approved = models.BooleanField(default=False)          # admin gate
    actual_completed = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ("project", "order")
        ordering = ["order"]

    def __str__(self):
        return f"{self.project.name} – Step {self.order}"


class ProgressLog(models.Model):
    """
    Text + media log submitted by supervisor for a given step.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    step = models.ForeignKey(Step, related_name="logs", on_delete=models.CASCADE)
    supervisor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={"role": "SUPERVISOR"})
    message = models.TextField(blank=True)
    created = models.DateTimeField(default=timezone.now)

    class MediaType(models.TextChoices):
        IMAGE = "IMAGE", "Image"
        VIDEO = "VIDEO", "Video"

    media = models.FileField(upload_to="progress_media/", null=True, blank=True)
    media_type = models.CharField(max_length=10, choices=MediaType.choices, null=True, blank=True)


class Bill(models.Model):
    """
    Raw PDF + OCR result stored as JSON for comparison with BOQ.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    step = models.ForeignKey(Step, related_name="bills", on_delete=models.CASCADE)
    pdf = models.FileField(upload_to="bills/")
    ocr_data = models.JSONField(default=dict)           # {'items': [...], 'total': 123}
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False)


class Invoice(models.Model):
    """
    Editable draft invoice generated after a step; approved by admin.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    step = models.OneToOneField(Step, related_name="invoice", on_delete=models.CASCADE)
    data = models.JSONField(default=dict)               # flexible line-items
    is_approved = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)


class VRVideo(models.Model):
    """
    360° walkthrough attached to a project.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, related_name="vr_videos", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    video = models.FileField(upload_to="vr/")
    uploaded = models.DateTimeField(auto_now_add=True)


class SupervisorNote(models.Model):
    project = models.ForeignKey(Project, related_name='supervisor_notes', on_delete=models.CASCADE)
    supervisor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={"role": "SUPERVISOR"})
    note = models.TextField(blank=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("project", "supervisor")
        ordering = ["-updated"]

    def __str__(self):
        return f"Note by {self.supervisor} on {self.project}"
