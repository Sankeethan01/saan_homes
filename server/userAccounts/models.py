# accounts/models.py
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        SUPERVISOR = "SUPERVISOR", "Site Supervisor"
        PUBLIC = "PUBLIC", "Public User"   # equipment-rental customer

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PUBLIC)

    def is_admin(self):
        return self.role == self.Role.ADMIN

    def is_supervisor(self):
        return self.role == self.Role.SUPERVISOR
