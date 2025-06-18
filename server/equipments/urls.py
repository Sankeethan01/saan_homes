from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    EquipmentViewSet,
    BookingViewSet,
    PaymentViewSet,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet)
router.register(r"equipment", EquipmentViewSet)
router.register(r"bookings", BookingViewSet)
router.register(r"payments", PaymentViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
