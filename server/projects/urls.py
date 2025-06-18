from django.urls import include, path
from rest_framework.routers import DefaultRouter
from projects.views import (
    ProjectViewSet,
    StepViewSet,
    ProgressLogViewSet,
    BillViewSet,
    InvoiceViewSet,
    VRVideoViewSet,
)

router = DefaultRouter()
router.register(r"projects", ProjectViewSet)
router.register(r"steps", StepViewSet)
router.register(r"logs", ProgressLogViewSet)
router.register(r"bills", BillViewSet)
router.register(r"invoices", InvoiceViewSet)
router.register(r"vr-videos", VRVideoViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
