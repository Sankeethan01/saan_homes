import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_public_registration_has_public_role(api_client):
    url = reverse("register")
    payload = {
        "username": "publicjoe",
        "email": "joe@example.com",
        "password": "StrongPass123!",
        "password2": "StrongPass123!",
    }
    resp = api_client.post(url, payload, format="json")
    assert resp.status_code == 201
    user = User.objects.get(username="publicjoe")
    assert user.role == User.Role.PUBLIC
