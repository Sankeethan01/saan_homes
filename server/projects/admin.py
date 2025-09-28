# projects/admin.py

from django.contrib import admin
from .models import Project, Step, ProgressLog, Bill, Invoice, InvoiceItem, VRVideo
from .models import ProjectMedia  # 👈 Add import at the top

@admin.register(ProjectMedia)
class ProjectMediaAdmin(admin.ModelAdmin):
    list_display = ("project", "media_type", "filename", "uploaded_by", "uploaded_at")
    list_filter = ("media_type", "uploaded_at", "uploaded_by")
    search_fields = ("filename", "title", "description", "project__name")


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
    list_display = ("invoice_number", "project", "status", "total", "created_at")
    list_filter = ("status", "created_at", "project")
    search_fields = ("invoice_number", "vendor", "client", "project__name", "step__title")


@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = ("invoice", "description", "quantity", "rate", "amount")
    list_filter = ("invoice__status", "created_at")
    search_fields = ("description", "invoice__invoice_number")


@admin.register(VRVideo)
class VRVideoAdmin(admin.ModelAdmin):
    list_display = ("project", "title", "uploaded")
    list_filter = ("uploaded",)
    search_fields = ("project__name", "title")
