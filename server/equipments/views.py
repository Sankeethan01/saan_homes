from rest_framework import viewsets, permissions
from rest_framework.filters import OrderingFilter, SearchFilter
from .models import Category, Equipment, Booking, Payment
from .serializers import (
    CategorySerializer,
    EquipmentSerializer,
    BookingSerializer,
    PaymentSerializer,
)


# ──────────────────────────────────────────────
# Permissions
# ──────────────────────────────────────────────
class IsAdminOrSupervisor(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) in ("ADMIN", "SUPERVISOR")
        )


class AuthenticatedPostOrAdmin(permissions.BasePermission):
    """
    • Anyone authenticated can GET/POST bookings.
    • PUT/PATCH/DELETE require ADMIN or SUPERVISOR.
    """

    def has_permission(self, request, view):
        if request.method in ("GET", "POST"):
            return request.user.is_authenticated
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) in ("ADMIN", "SUPERVISOR")
        )


# ──────────────────────────────────────────────
# ViewSets
# ──────────────────────────────────────────────
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrSupervisor]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name"]
    ordering = ["name"]


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.select_related("category").all()
    serializer_class = EquipmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "description", "category__name"]
    ordering_fields = ["daily_rate", "name"]
    ordering = ["name"]


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related("equipment", "user").all()
    serializer_class = BookingSerializer
    permission_classes = [AuthenticatedPostOrAdmin]
    filter_backends = [OrderingFilter]
    ordering = ["-created"]

    # Automatically assign booking.user = request.user on create
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related("booking").all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAdminOrSupervisor]
    filter_backends = [OrderingFilter]
    ordering = ["-paid_at"]
