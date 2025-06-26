# projects/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
class IsAdminOrSupervisorOrReadOnly(permissions.BasePermission):
    """
    Allow read access to authenticated users.
    Only allow write access to ADMIN or SUPERVISOR.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        if request.method in permissions.SAFE_METHODS:
            return True
            
        return request.user.role in ("ADMIN", "SUPERVISOR")


# ──────────────────────────────────────────────
# ViewSets
# ──────────────────────────────────────────────
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related('supervisor').all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["start_date", "estimated_end_date", "created"]
    ordering = ["-created"]

    @action(detail=False, methods=['get'])
    def supervisor_projects(self, request):
        """
        Get projects assigned to the current supervisor
        """
        if request.user.role != "SUPERVISOR":
            return Response(
                {"error": "Only supervisors can access this endpoint"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        projects = Project.objects.filter(supervisor=request.user)
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        """
        Filter projects based on user role
        """
        if self.action == 'supervisor_projects':
            return Project.objects.filter(supervisor=self.request.user)
        return super().get_queryset()


class StepViewSet(viewsets.ModelViewSet):
    queryset = Step.objects.select_related("project").all()
    serializer_class = StepSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title"]
    ordering_fields = ["order", "is_approved", "actual_completed"]
    ordering = ["order"]


class ProgressLogViewSet(viewsets.ModelViewSet):
    queryset = ProgressLog.objects.select_related("step", "supervisor").all()
    serializer_class = ProgressLogSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [OrderingFilter]
    ordering = ["-created"]

    def perform_create(self, serializer):
        """
        Automatically set the supervisor when creating a progress log
        """
        serializer.save(supervisor=self.request.user)


class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.select_related("step").all()
    serializer_class = BillSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [OrderingFilter]
    ordering = ["-uploaded_at"]


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related("step").all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [OrderingFilter]
    ordering = ["-created"]


class VRVideoViewSet(viewsets.ModelViewSet):
    queryset = VRVideo.objects.select_related("project").all()
    serializer_class = VRVideoSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [OrderingFilter]
    ordering = ["-uploaded"]
