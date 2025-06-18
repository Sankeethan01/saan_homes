# projects/admin.py

from django.contrib import admin
from .models import Project, Step, ProgressLog, Bill, Invoice, VRVideo


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "supervisor",
        "start_date",
        "estimated_end_date",
        "is_completed",
    )
    list_filter = ("is_completed", "supervisor", "start_date", "estimated_end_date")
    search_fields = ("name", "description")   # ← required for autocomplete_fields in notifications admin


@admin.register(Step)
class StepAdmin(admin.ModelAdmin):
    list_display = ("project", "order", "title", "is_approved", "actual_completed")
    list_filter = ("is_approved",)
    search_fields = ("title", "project__name")


@admin.register(ProgressLog)
class ProgressLogAdmin(admin.ModelAdmin):
    list_display = ("step", "supervisor", "created")
    list_filter = ("created",)
    search_fields = ("step__title", "supervisor__username")


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ("step", "uploaded_at", "verified")
    list_filter = ("verified", "uploaded_at")
    search_fields = ("step__title",)


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("step", "is_approved", "created")
    list_filter = ("is_approved", "created")
    search_fields = ("step__title",)


@admin.register(VRVideo)
class VRVideoAdmin(admin.ModelAdmin):
    list_display = ("project", "title", "uploaded")
    list_filter = ("uploaded",)
    search_fields = ("project__name", "title")
