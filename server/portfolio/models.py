# portfolio/models.py
import uuid
from django.db import models


class Service(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=150)
    description = models.TextField()
    icon = models.ImageField(upload_to="services/")           # optional
    show_on_landing = models.BooleanField(default=False)      # for landing page visibility


class Testimonial(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    text = models.TextField()
    avatar = models.ImageField(upload_to="testimonials/", blank=True)
    show_on_landing = models.BooleanField(default=False)      # for landing page visibility


class FeaturedProject(models.Model):
    PROJECT_CHOICES = [("upcoming", "Upcoming"), ("ongoing", "Ongoing"), ("completed", "Completed")]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, null=True)
    category = models.CharField(max_length=20, choices=PROJECT_CHOICES)
    teaser_image = models.ImageField(upload_to="featured_projects/")
