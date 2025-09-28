from django.urls import include, path
from .views import ProfileView
from rest_framework.routers import DefaultRouter
from .views import RegistrationView, UserViewSet
from .views import ChangePasswordView
from .views_otp import send_verification_otp, verify_otp_code, register_with_verified_email

router = DefaultRouter()
router.register(r"users", UserViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("register/", RegistrationView.as_view(), name="register"),
    path("profile/", ProfileView.as_view(), name='profile'),
   # path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
    path("profile/change-password/", ChangePasswordView.as_view(), name="change-password"),
    
    # OTP Verification endpoints
    path("send-otp/", send_verification_otp, name="send-otp"),
    path("verify-otp/", verify_otp_code, name="verify-otp"),
    path("register-verified/", register_with_verified_email, name="register-verified"),

]
