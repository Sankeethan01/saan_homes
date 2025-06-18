from django.contrib import admin
from .models import ContactMessage, ProjectAlert, RentalRequest


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("subject", "name", "email", "created")
    list_filter = ("created",)
    search_fields = ("subject", "name", "email")


@admin.register(ProjectAlert)
class ProjectAlertAdmin(admin.ModelAdmin):
    list_display = ("project", "text", "is_read", "created")
    list_filter = ("is_read", "created")
    search_fields = ("text", "project__name")
    autocomplete_fields = ("project",)


@admin.register(RentalRequest)
class RentalRequestAdmin(admin.ModelAdmin):
    list_display = ("booking", "is_handled", "created")
    list_filter = ("is_handled", "created")
    search_fields = ("booking__id", "booking__equipment__name")
    autocomplete_fields = ("booking",)
