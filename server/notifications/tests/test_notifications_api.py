import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from notifications.models import ContactMessage

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username="admin",
        password="adminpass",
        role="ADMIN",
        is_staff=True,
        is_superuser=True,
    )


# ──────────────────────────────────────────────
# ContactMessage tests
# ──────────────────────────────────────────────
@pytest.mark.django_db
def test_contact_message_public_post(api_client):
    url = reverse("contactmessage-list")
    payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "subject": "Hello",
        "message": "Great site!",
    }
    resp = api_client.post(url, payload, format="json")
    assert resp.status_code == 201
    assert ContactMessage.objects.filter(email="jane@example.com").exists()


@pytest.mark.django_db
def test_contact_message_list_requires_admin(api_client):
    url = reverse("contactmessage-list")
    resp = api_client.get(url)
    assert resp.status_code == 401  # unauthenticated users get 401

    admin = User.objects.create_user(
        username="boss", password="bosspass", role="ADMIN", is_staff=True, is_superuser=True
    )
    api_client.force_authenticate(admin)
    resp = api_client.get(url)
    assert resp.status_code == 200
