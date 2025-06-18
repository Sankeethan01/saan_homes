import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from equipments.models import Category, Equipment, Booking

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username="admin", password="adminpass", role="ADMIN", is_staff=True, is_superuser=True
    )


@pytest.fixture
def public_user(db):
    return User.objects.create_user(username="jane", password="123456", role="PUBLIC")


@pytest.fixture
def category(db):
    return Category.objects.create(name="Excavators", slug="excavators")


@pytest.fixture
def equipment(category):
    return Equipment.objects.create(
        category=category,
        name="Mini Excavator",
        description="Compact excavator for small sites",
        daily_rate=500,
    )


# ──────────────────────────────────────────────
# Category & Equipment (admin-only POST)
# ──────────────────────────────────────────────
@pytest.mark.django_db
def test_equipment_create_admin(api_client, admin_user, category):
    api_client.force_authenticate(admin_user)
    url = reverse("equipment-list")
    payload = {
        "category": category.id,
        "name": "Bulldozer",
        "description": "Heavy duty dozer",
        "daily_rate": 800,
    }
    resp = api_client.post(url, payload, format="json")
    assert resp.status_code == 201


# ──────────────────────────────────────────────
# Booking (public create)
# ──────────────────────────────────────────────
@pytest.mark.django_db
def test_booking_create_public(api_client, public_user, equipment):
    api_client.force_authenticate(public_user)
    url = reverse("booking-list")
    payload = {
        "equipment": equipment.id,
        "start_date": "2025-08-10",
        "end_date": "2025-08-12",
        "notes": "Need operator included",
    }
    resp = api_client.post(url, payload, format="json")
    assert resp.status_code == 201
    assert Booking.objects.filter(user=public_user).exists()
