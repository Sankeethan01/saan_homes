from django.contrib.auth import get_user_model
from rest_framework import viewsets, generics, permissions
from rest_framework.filters import OrderingFilter, SearchFilter
from .serializers import RegistrationSerializer, UserSerializer

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

