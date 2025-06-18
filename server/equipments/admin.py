from django.contrib import admin
from .models import Category, Equipment, Booking, Payment


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "daily_rate")
    list_filter = ("category",)
    search_fields = ("name",)
    autocomplete_fields = ("category",)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("equipment", "user", "start_date", "end_date", "status")
    list_filter = ("status", "start_date", "end_date")
    autocomplete_fields = ("equipment", "user")
    search_fields = ("equipment__name", "user__username")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("booking", "amount", "transaction_id", "paid_at")
    autocomplete_fields = ("booking",)
