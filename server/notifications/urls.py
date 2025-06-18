from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    ContactMessageViewSet,
    ProjectAlertViewSet,
    RentalRequestViewSet,
)

router = DefaultRouter()
router.register(r"contact-messages", ContactMessageViewSet)
router.register(r"project-alerts", ProjectAlertViewSet)
router.register(r"rental-requests", RentalRequestViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
