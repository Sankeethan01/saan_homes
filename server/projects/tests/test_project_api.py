# projects/tests/test_project_api.py
import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from projects.models import Project, Step
from django.utils import timezone

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


@pytest.fixture
def supervisor_user(db):
    """Create a user with role='SUPERVISOR'."""
    user = User.objects.create_user(
        username="supervisor",
        password="supervisorpass",
        role="SUPERVISOR",
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


@pytest.mark.django_db
def test_supervisor_stats(api_client, supervisor_user):
    """Test the supervisor_stats endpoint"""
    api_client.force_authenticate(supervisor_user)
    
    # Create some test projects for the supervisor
    project1 = Project.objects.create(
        name="Test Project 1",
        start_date=timezone.now().date(),
        estimated_end_date=timezone.now().date() + timezone.timedelta(days=30),
        supervisor=supervisor_user,
        is_completed=False
    )
    
    project2 = Project.objects.create(
        name="Test Project 2",
        start_date=timezone.now().date() - timezone.timedelta(days=10),
        estimated_end_date=timezone.now().date() + timezone.timedelta(days=20),
        supervisor=supervisor_user,
        is_completed=True
    )
    
    # Create steps for project1
    step1 = Step.objects.create(
        project=project1,
        order=1,
        title="Step 1",
        is_approved=True
    )
    step2 = Step.objects.create(
        project=project1,
        order=2,
        title="Step 2",
        is_approved=False
    )
    
    # Test the endpoint
    url = reverse("project-supervisor-stats")
    response = api_client.get(url)
    
    assert response.status_code == 200
    data = response.data
    
    # Check basic stats
    assert data['total'] == 2
    assert data['ongoing'] == 1
    assert data['completed'] == 1
    assert data['upcoming'] == 0  # Both projects have started
    
    # Check project types
    assert 'RESIDENTIAL' in data['project_types']
    assert data['project_types']['RESIDENTIAL'] == 2
    
    # Check average progress (project1 has 1/2 steps completed = 50%, project2 has no steps = 0%)
    assert data['average_progress'] == 25.0
    
    # Check recent activities
    assert len(data['recent_activities']) == 2
