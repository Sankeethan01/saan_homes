import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from portfolio.models import Service

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    u = User.objects.create_user(
        username="admin",
        password="adminpass",
        role="ADMIN",
        is_staff=True,
        is_superuser=True,
    )
    return u


@pytest.mark.django_db
def test_service_create(api_client, admin_user):
    api_client.force_authenticate(admin_user)
    url = reverse("service-list")  # router name auto-generated
    payload = {"title": "Civil Engineering", "description": "All civil works"}
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 201
    assert Service.objects.filter(title="Civil Engineering").exists()


@pytest.mark.django_db
def test_service_read_no_auth(api_client):
    Service.objects.create(title="Plumbing", description="Pipes & fittings")
    url = reverse("service-list")
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.data[0]["title"] == "Plumbing"
