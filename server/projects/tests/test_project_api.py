# projects/tests/test_project_api.py
import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


# ───────────────────────────────────
# Re-usable fixtures
# ───────────────────────────────────
@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    """Create a user with role='ADMIN' and is_staff=True so they can log in."""
    user = User.objects.create_user(
        username="admin",
        password="adminpass",
        role="ADMIN",
        is_staff=True,
        is_superuser=True,
    )
    return user


# ───────────────────────────────────
# The actual test
# ───────────────────────────────────
@pytest.mark.django_db
def test_project_create(api_client, admin_user):
    api_client.force_authenticate(admin_user)

    url = reverse("project-list")  # corresponds to router.register("projects", …)
    payload = {
        "name": "Demo",
        "start_date": "2025-07-01",
        "estimated_end_date": "2025-09-30",
    }

    response = api_client.post(url, payload, format="json")

    assert response.status_code == 201
    assert response.data["name"] == "Demo"
