# accounts/models.py
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import FileExtensionValidator
from django.contrib import admin






class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        SUPERVISOR = "SUPERVISOR", "Site Supervisor"
        PUBLIC = "PUBLIC", "Public User"   # equipment-rental customer

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PUBLIC)

    #  # New fields for profile update
    phone = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(
    upload_to="profile_images/",
    blank=True,
    null=True,
    validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])]
)


    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.Role.ADMIN
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
