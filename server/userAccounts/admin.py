from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (_("Personal info"), {
            "fields": (
                "first_name", "last_name", "email",
                "phone", "date_of_birth", "address"  # ✅ Added fields
            )
        }),
        (_("Roles"), {"fields": ("role",)}),
        (_("Permissions"), {
            "fields": (
                "is_active",
                "is_staff",
                "is_superuser",
                "groups",
                "user_permissions",
            )
        }),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "username", "password1", "password2",
                "role", "first_name", "last_name", "email",
                "phone", "date_of_birth", "address", "profile_image"  # ✅ Added fields here too
            ),
        }),
    )

    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_superuser", "is_active")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("username",)
