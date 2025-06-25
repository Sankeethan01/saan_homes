from django.contrib.auth import get_user_model
from rest_framework import viewsets, generics, permissions
from rest_framework.filters import OrderingFilter, SearchFilter
from .serializers import RegistrationSerializer, UserSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from django.contrib.auth.password_validation import validate_password, ValidationError

User = get_user_model()


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) == "ADMIN"
        )


class UserViewSet(viewsets.ModelViewSet):
    """
    • Only ADMINs can list / create / edit / delete users.
    • Authenticated users can retrieve or update **their own** profile (`/api/users/me/` extra action below).
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    parser_classes = (MultiPartParser, FormParser)  # Support file uploads
    permission_classes = [IsAdmin]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering = ["username"]

    # ---------- extra helper for /me ----------
    from rest_framework.decorators import action
    from rest_framework.response import Response
    from rest_framework import status

    @action(detail=False, methods=["get", "patch"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        if request.method == "GET":
            serializer = self.get_serializer(request.user)
            return self.Response(serializer.data)

        # PATCH
        serializer = self.get_serializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return self.Response(serializer.data, status=self.status.HTTP_200_OK)
    

class RegistrationView(generics.CreateAPIView):
    """
    POST here to register as PUBLIC user.
    """
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    def get(self, request):
     user = request.user
     profile = getattr(user, 'profile', None)  # safer access

     return Response({
    "firstName": user.first_name,
    "lastName": user.last_name,
    "email": user.email,
    "phone": user.phone or '',
    "dateOfBirth": user.date_of_birth.isoformat() if user.date_of_birth else '',
    "address": user.address or '',
    "profileImage": user.profile_image.url if user.profile_image else '',
    "department": profile.department if profile else '',
    "position": profile.position if profile else '',
    "employeeId": profile.employee_id if profile else '',
    "joinDate": profile.join_date if profile else '',
    })

    def put(self, request):
        user = request.user
        data = request.data

        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.email = data.get("email", user.email)
        user.phone = data.get("phone", user.phone)
        user.date_of_birth = data.get("date_of_birth", user.date_of_birth)
        user.address = data.get("address", user.address)

        if "profile_image" in data:
            user.profile_image = data["profile_image"]

        user.save()
        return Response({"message": "Profile updated successfully."})
    
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        
        current_password = request.data.get("currentPassword")
        new_password = request.data.get("newPassword")

        if not user.check_password(current_password):
            return Response({"detail": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        if not new_password or len(new_password) < 6:
            return Response({"detail": "New password is too short."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)
