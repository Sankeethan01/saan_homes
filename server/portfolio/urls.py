from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceViewSet,
    TestimonialViewSet,
    FeaturedProjectViewSet,
)

router = DefaultRouter()
router.register(r"services", ServiceViewSet)
router.register(r"testimonials", TestimonialViewSet)
router.register(r"featured-projects", FeaturedProjectViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
