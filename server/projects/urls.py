from django.urls import include, path
from rest_framework.routers import DefaultRouter
from userAccounts.views import ProfileView
from projects.views import (
    ProjectViewSet,
    StepViewSet,
    ProgressLogViewSet,
    BillViewSet,
    InvoiceViewSet,
    VRVideoViewSet,
    SupervisorNoteViewSet,
    ProgressLogMediaViewSet,
    ProjectMediaViewSet,
)

router = DefaultRouter()
router.register(r"steps", StepViewSet)
router.register(r"logs", ProgressLogViewSet)
router.register(r"bills", BillViewSet)
router.register(r"invoices", InvoiceViewSet)
router.register(r"vr-videos", VRVideoViewSet)
router.register(r"supervisor-notes", SupervisorNoteViewSet, basename="supervisornote")
router.register(r"progress-media", ProgressLogMediaViewSet)
router.register(r"project-media", ProjectMediaViewSet)
router.register(r"", ProjectViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path('api/profile/', ProfileView.as_view()),
    
]
