from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter, SearchFilter
from .models import Category, Equipment, Booking, Payment
from .serializers import (
    CategorySerializer,
    EquipmentSerializer,
    EquipmentDetailSerializer,
    BookingSerializer,
    PaymentSerializer,
)
from notifications.models import RentalRequest


# ──────────────────────────────────────────────
# Permissions
# ──────────────────────────────────────────────
class IsAdminOrSupervisor(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) in ("ADMIN", "SUPERVISOR")
        )


class AuthenticatedPostOrAdmin(permissions.BasePermission):
    """
    • Anyone authenticated can GET/POST bookings.
    • PUT/PATCH/DELETE require ADMIN or SUPERVISOR.
    """

    def has_permission(self, request, view):
        if request.method in ("GET", "POST"):
            return request.user.is_authenticated
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) in ("ADMIN", "SUPERVISOR")
        )


# ──────────────────────────────────────────────
# ViewSets
# ──────────────────────────────────────────────
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  # Allow public read access
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name"]
    ordering = ["name"]


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.select_related("category").all()
    serializer_class = EquipmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "description", "category__name"]
    ordering_fields = ["daily_rate", "name"]
    ordering = ["name"]

    def get_serializer_class(self):
        """Use detailed serializer for individual equipment retrieval"""
        if self.action == 'retrieve':
            return EquipmentDetailSerializer
        return EquipmentSerializer

    def get_queryset(self):
        """Override to handle random ordering"""
        queryset = super().get_queryset()
        ordering = self.request.query_params.get('ordering')
        
        # Handle random ordering with '?' parameter
        if ordering == '?':
            return queryset.order_by('?')
        
        return queryset

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def bookings(self, request, pk=None):
        """Get all active bookings for this equipment to check availability"""
        equipment = self.get_object()
        
        # Get all active bookings (not cancelled or rejected)
        active_bookings = Booking.objects.filter(
            equipment=equipment,
            status__in=['PENDING', 'APPROVED', 'PAID']
        ).values('id', 'start_date', 'end_date', 'status')
        
        return Response(list(active_bookings))


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related("equipment", "user").all()
    serializer_class = BookingSerializer
    permission_classes = [AuthenticatedPostOrAdmin]
    filter_backends = [OrderingFilter]
    ordering = ["-created"]

    def get_queryset(self):
        """Allow filtering by equipment for availability checking"""
        queryset = super().get_queryset()
        equipment_id = self.request.query_params.get('equipment')
        
        if equipment_id:
            queryset = queryset.filter(equipment_id=equipment_id)
            
        return queryset

    # Automatically assign booking.user = request.user on create
    def perform_create(self, serializer):
        booking = serializer.save(user=self.request.user)
        
        # Create a rental request notification for admins
        RentalRequest.objects.create(
            booking=booking,
            is_handled=False
        )

    def perform_update(self, serializer):
        """Handle status updates and create notifications"""
        old_status = self.get_object().status
        booking = serializer.save()
        
        # If status changed, create appropriate notifications
        if old_status != booking.status:
            if booking.status == 'APPROVED':
                # Notify customer that booking is approved
                pass  # For now, we'll handle this in frontend
            elif booking.status == 'REJECTED':
                # Notify customer that booking is rejected
                pass  # For now, we'll handle this in frontend

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def pay(self, request, pk=None):
        """Allow users to pay for their own approved bookings"""
        try:
            booking = self.get_object()
            
            # Check if user owns this booking
            if booking.user != request.user:
                return Response(
                    {"error": "You can only pay for your own bookings"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if booking is in approved status
            if booking.status != Booking.Status.APPROVED:
                return Response(
                    {"error": "Only approved bookings can be paid"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # TODO: Integrate with actual payment gateway here
            # For now, just update the status
            booking.status = Booking.Status.PAID
            booking.save()
            
            # Create a payment record
            total_amount = booking.equipment.daily_rate * booking.duration
            Payment.objects.create(
                booking=booking,
                amount=total_amount,
                transaction_id=f"MANUAL-{booking.id}",
                provider_raw={
                    "card_name": request.data.get("card_name"),
                    "card_number": "XXXX-XXXX-XXXX-" + request.data.get("card_number", "")[-4:],
                    "payment_method": "card"
                }
            )
            
            return Response(
                {"message": "Payment processed successfully", "status": booking.status},
                status=status.HTTP_200_OK
            )
            
        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        """Allow users to cancel their own pending bookings"""
        try:
            booking = self.get_object()
            
            # Check if user owns this booking
            if booking.user != request.user:
                return Response(
                    {"error": "You can only cancel your own bookings"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if booking is in pending status
            if booking.status != Booking.Status.PENDING:
                return Response(
                    {"error": "Only pending bookings can be cancelled"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update status to cancelled
            booking.status = Booking.Status.CANCELLED
            booking.save()
            
            return Response(
                {"message": "Booking cancelled successfully", "status": booking.status},
                status=status.HTTP_200_OK
            )
            
        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related("booking").all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAdminOrSupervisor]
    filter_backends = [OrderingFilter]
    ordering = ["-paid_at"]