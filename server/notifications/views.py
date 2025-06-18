from rest_framework import viewsets, permissions
from rest_framework.filters import OrderingFilter, SearchFilter

from .models import ContactMessage, ProjectAlert, RentalRequest
from .serializers import (
    ContactMessageSerializer,
    ProjectAlertSerializer,
    RentalRequestSerializer,
)


# ──────────────────────────────────────────────
# Permissions
# ──────────────────────────────────────────────
class PublicCreateOrAdmin(permissions.BasePermission):
    """
    * Anyone can POST a contact message.
    * Only ADMIN or SUPERVISOR can list / retrieve / modify anything.
    """

    def has_permission(self, request, view):
        if request.method == "POST" and view.basename == "contactmessage":
            return True
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) in ("ADMIN", "SUPERVISOR")
        )


class IsAdminOrSupervisor(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) in ("ADMIN", "SUPERVISOR")
        )


# ──────────────────────────────────────────────
# ViewSets
# ──────────────────────────────────────────────
class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [PublicCreateOrAdmin]
    filter_backends = [OrderingFilter]
    ordering = ["-created"]
    
    def get_permissions(self):
        # anyone can POST a contact message
        if self.action == "create":
            return [permissions.AllowAny()]
        # but everything else (list, retrieve, etc.) needs admin/supervisor
        return [IsAdminOrSupervisor()]


class ProjectAlertViewSet(viewsets.ModelViewSet):
    queryset = ProjectAlert.objects.select_related("project").all()
    serializer_class = ProjectAlertSerializer
    permission_classes = [IsAdminOrSupervisor]
    filter_backends = [OrderingFilter]
    ordering = ["-created"]


class RentalRequestViewSet(viewsets.ModelViewSet):
    queryset = RentalRequest.objects.select_related("booking").all()
    serializer_class = RentalRequestSerializer
    permission_classes = [IsAdminOrSupervisor]
    filter_backends = [OrderingFilter]
    ordering = ["-created"]
