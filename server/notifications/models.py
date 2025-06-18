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
    """
    E.g. 'Step 3 awaiting approval', 'Invoice mismatch', etc.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    created = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)


class RentalRequest(models.Model):
    """
    Mirrors pending bookings but survives even if booking is deleted (recycle bin).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey("equipments.Booking", on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    is_handled = models.BooleanField(default=False)
