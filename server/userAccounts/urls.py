from django.urls import include, path
from .views import ProfileView
from rest_framework.routers import DefaultRouter
from .views import RegistrationView, UserViewSet
from .views import ChangePasswordView

router = DefaultRouter()
router.register(r"users", UserViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("register/", RegistrationView.as_view(), name="register"),
    path("profile/", ProfileView.as_view(), name='profile'),
   # path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
    path("profile/change-password/", ChangePasswordView.as_view(), name="change-password"),

]
