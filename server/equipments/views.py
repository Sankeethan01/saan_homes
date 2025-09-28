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
from django.db.models import Q
import uuid
from utils.email_utils import (
    send_equipment_booking_confirmation_email,
    send_equipment_booking_status_update_email
)


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

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def chatbot_recommendations(self, request):
        """
        Chatbot endpoint to get equipment recommendations based on user requirements
        """
        try:
            # Get user requirements from request
            requirements = request.data
            
            # Start with all available equipment
            queryset = Equipment.objects.filter(availability_status='AVAILABLE')
            
            # Filter by category if specified
            if 'category' in requirements:
                queryset = queryset.filter(category__slug=requirements['category'])
            
            # Filter by project type/usage
            if 'project_type' in requirements:
                project_type = requirements['project_type'].lower()
                if 'construction' in project_type or 'building' in project_type:
                    queryset = queryset.filter(category__name__icontains='construction')
                elif 'excavation' in project_type or 'digging' in project_type:
                    queryset = queryset.filter(name__icontains='excavator')
                elif 'concrete' in project_type or 'mixing' in project_type:
                    queryset = queryset.filter(name__icontains='mixer')
                elif 'landscaping' in project_type or 'garden' in project_type:
                    queryset = queryset.filter(Q(name__icontains='mower') | Q(name__icontains='trimmer'))
            
            # Filter by budget range
            if 'max_budget' in requirements:
                max_budget = float(requirements['max_budget'])
                queryset = queryset.filter(daily_rate__lte=max_budget)
            
            # Filter by rental duration for best pricing
            if 'duration' in requirements:
                duration = int(requirements['duration'])
                if duration >= 30:
                    # Prioritize equipment with monthly rates
                    queryset = queryset.filter(monthly_rate__isnull=False)
                elif duration >= 7:
                    # Prioritize equipment with weekly rates
                    queryset = queryset.filter(weekly_rate__isnull=False)
            
            # Filter by location/delivery requirements
            if 'needs_delivery' in requirements and requirements['needs_delivery']:
                queryset = queryset.filter(delivery_available=True)
            
            # Filter by special requirements
            if 'operator_license' in requirements and not requirements['operator_license']:
                queryset = queryset.filter(operator_license_required=False)
            
            # Order by popularity and condition
            queryset = queryset.order_by('-popularity_score', '-condition_rating')[:5]
            
            # Serialize the results
            serializer = EquipmentSerializer(queryset, many=True)
            
            return Response({
                'recommendations': serializer.data,
                'count': queryset.count(),
                'message': f'Found {queryset.count()} equipment options matching your requirements'
            })
            
        except Exception as e:
            return Response(
                {'error': 'Unable to process request', 'details': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def chatbot_categories(self, request):
        """
        Get all equipment categories for chatbot options
        """
        categories = Category.objects.all().order_by('name')
        return Response([{
            'id': cat.id,
            'name': cat.name,
            'slug': cat.slug,
            'equipment_count': cat.equipments.filter(availability_status='AVAILABLE').count()
        } for cat in categories])

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def chatbot_project_types(self, request):
        """
        Get common project types for chatbot options
        """
        project_types = [
            {'id': 'construction', 'name': 'Construction & Building', 'description': 'Building construction, renovation'},
            {'id': 'excavation', 'name': 'Excavation & Earthwork', 'description': 'Digging, trenching, site preparation'},
            {'id': 'concrete', 'name': 'Concrete Work', 'description': 'Concrete mixing, pouring, finishing'},
            {'id': 'landscaping', 'name': 'Landscaping & Gardening', 'description': 'Lawn care, garden maintenance'},
            {'id': 'demolition', 'name': 'Demolition', 'description': 'Structure demolition, debris removal'},
            {'id': 'road_work', 'name': 'Road Work', 'description': 'Road construction, paving, maintenance'},
            {'id': 'utility', 'name': 'Utility Work', 'description': 'Electrical, plumbing, HVAC installation'}
        ]
        return Response(project_types)


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related("equipment", "user").all()
    serializer_class = BookingSerializer
    permission_classes = [AuthenticatedPostOrAdmin]
    filter_backends = [OrderingFilter]
    ordering = ["-created"]

    def get_queryset(self):
        """Allow filtering by equipment or user"""
        queryset = super().get_queryset()
        equipment_id = self.request.query_params.get('equipment')
        user_id = self.request.query_params.get('user')
        
        if equipment_id:
            queryset = queryset.filter(equipment_id=equipment_id)
            
        if user_id:
            # Check if user_id is a valid UUID before filtering
            try:
                # Try to parse the user_id as UUID to validate it
                uuid_obj = uuid.UUID(user_id)
                queryset = queryset.filter(user_id=uuid_obj)
            except (ValueError, TypeError):
                # If user_id is not a valid UUID, return empty queryset
                # instead of raising an error
                return queryset.none()
            
        return queryset

    # Automatically assign booking.user = request.user on create
    def perform_create(self, serializer):
        booking = serializer.save(user=self.request.user)
        
        # Create a rental request notification for admins
        RentalRequest.objects.create(
            booking=booking,
            is_handled=False
        )
        
        # Send booking confirmation email to user
        try:
            send_equipment_booking_confirmation_email(booking)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send booking confirmation email: {str(e)}")

    def perform_update(self, serializer):
        """Handle status updates and create notifications"""
        old_status = self.get_object().status
        booking = serializer.save()
        
        # If status changed, send email notifications
        if old_status != booking.status:
            try:
                send_equipment_booking_status_update_email(booking, old_status)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send status update email: {str(e)}")

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
            old_status = booking.status
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
            
            # Send email notification
            try:
                send_equipment_booking_status_update_email(booking, old_status)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send payment confirmation email: {str(e)}")
            
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
            
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminOrSupervisor])
    def approve(self, request, pk=None):
        """Allow admins to approve pending bookings"""
        try:
            booking = self.get_object()
            
            # Check if booking is in pending status
            if booking.status != Booking.Status.PENDING:
                return Response(
                    {"error": "Only pending bookings can be approved"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update status to approved
            old_status = booking.status
            booking.status = Booking.Status.APPROVED
            booking.save()
            
            # Send email notification
            try:
                send_equipment_booking_status_update_email(booking, old_status)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send approval email: {str(e)}")
            
            return Response(
                {"message": "Booking approved successfully", "status": booking.status},
                status=status.HTTP_200_OK
            )
            
        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminOrSupervisor])
    def reject(self, request, pk=None):
        """Allow admins to reject pending bookings"""
        try:
            booking = self.get_object()
            
            # Check if booking is in pending status
            if booking.status != Booking.Status.PENDING:
                return Response(
                    {"error": "Only pending bookings can be rejected"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update status to rejected
            old_status = booking.status
            booking.status = Booking.Status.REJECTED
            booking.save()
            
            # Send email notification
            try:
                send_equipment_booking_status_update_email(booking, old_status)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send rejection email: {str(e)}")
            
            return Response(
                {"message": "Booking rejected successfully", "status": booking.status},
                status=status.HTTP_200_OK
            )
            
        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminOrSupervisor])
    def mark_rented(self, request, pk=None):
        """Allow admins to mark a booking as rented (equipment handed over)"""
        try:
            booking = self.get_object()
            
            # Check if booking is in paid status
            if booking.status != Booking.Status.PAID:
                return Response(
                    {"error": "Only paid bookings can be marked as rented"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update status to rented
            old_status = booking.status
            booking.status = Booking.Status.RENTED
            booking.save()
            
            # Send email notification
            try:
                send_equipment_booking_status_update_email(booking, old_status)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send equipment handed over email: {str(e)}")
            
            return Response(
                {"message": "Booking marked as rented successfully", "status": booking.status},
                status=status.HTTP_200_OK
            )
            
        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminOrSupervisor])
    def complete(self, request, pk=None):
        """Allow admins to mark a booking as completed (equipment returned)"""
        try:
            booking = self.get_object()
            
            # Check if booking is in rented status
            if booking.status != Booking.Status.RENTED:
                return Response(
                    {"error": "Only rented bookings can be marked as completed"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update status to completed
            old_status = booking.status
            booking.status = Booking.Status.COMPLETED
            booking.save()
            
            # Send email notification
            try:
                send_equipment_booking_status_update_email(booking, old_status)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send equipment returned email: {str(e)}")
            
            return Response(
                {"message": "Booking marked as completed successfully", "status": booking.status},
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