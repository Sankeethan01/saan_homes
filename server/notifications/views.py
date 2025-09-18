from rest_framework import viewsets, permissions
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

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
            and getattr(request.user, "role", None) in ("ADMIN", "SUPERVISOR","PUBLIC")
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
    filter_backends = [OrderingFilter, SearchFilter]
    search_fields = ["text", "project__name"]
    ordering = ["-created"]

    def perform_create(self, serializer):
        # Supervisors create alerts
        return serializer.save()

    def perform_update(self, serializer):
        # Admin can approve/reject alerts
        return serializer.save()

    def get_queryset(self):
        qs = super().get_queryset()
        # Include deleted for detail actions that operate on deleted rows
        if getattr(self, "action", None) in ("restore", "purge"):
            return qs
        only_deleted = self.request.query_params.get("only_deleted") in ("1", "true", "True")
        include_deleted = self.request.query_params.get("include_deleted") in ("1", "true", "True")
        if only_deleted:
            return qs.filter(is_deleted=True)
        if include_deleted:
            return qs
        return qs.filter(is_deleted=False)

    def destroy(self, request, *args, **kwargs):
        # Soft delete: set is_deleted=True
        instance = self.get_object()
        instance.delete()  # uses model.soft-delete override
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["POST"], url_path="restore")
    def restore(self, request, pk=None):
        instance = self.get_object()
        if instance.is_deleted:
            instance.is_deleted = False
            instance.deleted_at = None
            instance.save(update_fields=["is_deleted", "deleted_at"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=["DELETE"], url_path="purge")
    def purge(self, request, pk=None):
        instance = self.get_object()
        instance.hard_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["POST"], url_path="mark_all_read")
    def mark_all_read(self, request):
        qs = self.get_queryset()
        updated = qs.filter(is_read=False).update(is_read=True)
        return Response({"updated_count": updated}, status=status.HTTP_200_OK)


class RentalRequestViewSet(viewsets.ModelViewSet):
    queryset = RentalRequest.objects.select_related("booking").all()
    serializer_class = RentalRequestSerializer
    permission_classes = [IsAdminOrSupervisor]
    filter_backends = [OrderingFilter]
    ordering = ["-created"]
