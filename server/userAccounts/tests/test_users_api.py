import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username="boss", password="secret", role="ADMIN", is_staff=True, is_superuser=True
    )


@pytest.fixture
def normal_user(db):
    return User.objects.create_user(username="jane", password="password", role="PUBLIC")


# ─────────────── Admin CRUD ───────────────
@pytest.mark.django_db
def test_admin_can_create_user(api_client, admin_user):
    api_client.force_authenticate(admin_user)
    url = reverse("user-list")
    payload = {
        "username": "john",
        "password": "VerySecret123",
        "password2": "VerySecret123",
        "role": "SUPERVISOR",
    }
    resp = api_client.post(url, payload, format="json")
    assert resp.status_code == 201
    assert User.objects.filter(username="john").exists()


# ─────────────── /me endpoint ───────────────
@pytest.mark.django_db
def test_user_can_read_own_profile(api_client, normal_user):
    api_client.force_authenticate(normal_user)
    url = reverse("user-me")
    resp = api_client.get(url)
    assert resp.status_code == 200
    assert resp.data["username"] == normal_user.username
