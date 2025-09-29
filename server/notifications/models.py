# notifications/models.py
from django.db import models
import uuid


class ContactMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=150)
    message = models.TextField()
    created = models.DateTimeField(auto_now_add=True)


class ProjectAlert(models.Model):
    ALERT_TYPES = [
        ("info", "Info"),
        ("warning", "Warning"),
        ("error", "Error"),
        ("success", "Success"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    """
    E.g. 'Step 3 awaiting approval', 'Invoice mismatch', etc.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, null=True)
    text = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=ALERT_TYPES, default="info")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    # Soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.project.name} - {self.text}"

    # Soft delete by default
    def delete(self, using=None, keep_parents=False):
        if not self.is_deleted:
            from django.utils import timezone
            self.is_deleted = True
            self.deleted_at = timezone.now()
            self.save(update_fields=["is_deleted", "deleted_at"])
        else:
            super().delete(using=using, keep_parents=keep_parents)

    # Force permanent delete
    def hard_delete(self):
        return super().delete()


class RentalRequest(models.Model):
    """
    Mirrors pending bookings but survives even if booking is deleted (recycle bin).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey("equipments.Booking", on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    is_handled = models.BooleanField(default=False)
