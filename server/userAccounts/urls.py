from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import RegistrationView, UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("register/", RegistrationView.as_view(), name="register"),
]
