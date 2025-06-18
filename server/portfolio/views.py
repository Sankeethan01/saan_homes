from rest_framework import viewsets, permissions
from rest_framework.filters import OrderingFilter, SearchFilter

from .models import Service, Testimonial, FeaturedProject
from .serializers import (
    ServiceSerializer,
    TestimonialSerializer,
    FeaturedProjectSerializer,
)


class ReadOnlyOrAdmin(permissions.IsAdminUser):
    """
    • SAFE (GET / HEAD / OPTIONS) → anyone.
    • POST / PUT / PATCH / DELETE → only ADMIN or SUPERVISOR.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) in ("ADMIN", "SUPERVISOR")
        )


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [ReadOnlyOrAdmin]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title"]
    ordering = ["title"]


class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [ReadOnlyOrAdmin]
    filter_backends = [OrderingFilter]
    ordering = ["name"]


class FeaturedProjectViewSet(viewsets.ModelViewSet):
    queryset = FeaturedProject.objects.select_related("project").all()
    serializer_class = FeaturedProjectSerializer
    permission_classes = [ReadOnlyOrAdmin]
    filter_backends = [OrderingFilter]
    ordering = ["-id"]
