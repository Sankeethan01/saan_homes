# projects/views.py
from rest_framework import viewsets, permissions
from rest_framework.filters import OrderingFilter, SearchFilter

from .models import (
    Project,
    Step,
    ProgressLog,
    Bill,
    Invoice,
    VRVideo,
)
from .serializers import (
    ProjectSerializer,
    StepSerializer,
    ProgressLogSerializer,
    BillSerializer,
    InvoiceSerializer,
    VRVideoSerializer,
)


# ──────────────────────────────────────────────
# Permissions
# ──────────────────────────────────────────────
class IsAdminOrSupervisor(permissions.BasePermission):
    """
    Allow access to authenticated users whose role is ADMIN or SUPERVISOR.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) in ("ADMIN", "SUPERVISOR")
        )


# ──────────────────────────────────────────────
# ViewSets
# ──────────────────────────────────────────────
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrSupervisor]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["start_date", "estimated_end_date", "created"]
    ordering = ["-created"]


class StepViewSet(viewsets.ModelViewSet):
    queryset = Step.objects.select_related("project").all()
    serializer_class = StepSerializer
    permission_classes = [IsAdminOrSupervisor]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title"]
    ordering_fields = ["order", "is_approved", "actual_completed"]
    ordering = ["order"]


class ProgressLogViewSet(viewsets.ModelViewSet):
    queryset = ProgressLog.objects.select_related("step", "supervisor").all()
    serializer_class = ProgressLogSerializer
    permission_classes = [IsAdminOrSupervisor]
    filter_backends = [OrderingFilter]
    ordering = ["-created"]


class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.select_related("step").all()
    serializer_class = BillSerializer
    permission_classes = [IsAdminOrSupervisor]
    filter_backends = [OrderingFilter]
    ordering = ["-uploaded_at"]


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related("step").all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAdminOrSupervisor]
    filter_backends = [OrderingFilter]
    ordering = ["-created"]


class VRVideoViewSet(viewsets.ModelViewSet):
    queryset = VRVideo.objects.select_related("project").all()
    serializer_class = VRVideoSerializer
    permission_classes = [IsAdminOrSupervisor]
    filter_backends = [OrderingFilter]
    ordering = ["-uploaded"]
