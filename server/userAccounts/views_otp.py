from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from .serializers import RegistrationSerializer
from utils.otp_utils import (
    generate_otp, 
    send_otp_email, 
    store_otp, 
    verify_otp, 
    is_otp_verified,
    mark_email_verified
)
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_otp(request):
    """
    Send OTP to email for verification
    """
    try:
        email = request.data.get('email', '').strip().lower()
        
        if not email:
            return Response(
                {'error': 'Email is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate email format
        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {'error': 'Please enter a valid email address'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'An account with this email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if username already exists (if provided)
        username = request.data.get('username', '').strip()
        if username and User.objects.filter(username=username).exists():
            return Response(
                {'error': 'An account with this username already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate and send OTP
        otp = generate_otp()
        
        if send_otp_email(email, otp):
            store_otp(email, otp, expiry_minutes=10)
            logger.info(f"OTP sent successfully to {email}")
            return Response(
                {'message': 'Verification code sent to your email'}, 
                status=status.HTTP_200_OK
            )
        else:
            logger.error(f"Failed to send OTP to {email}")
            return Response(
                {'error': 'Failed to send verification code. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        logger.error(f"Error in send_verification_otp: {str(e)}")
        return Response(
            {'error': 'An error occurred. Please try again.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_code(request):
    """
    Verify OTP code for email
    """
    try:
        email = request.data.get('email', '').strip().lower()
        otp = request.data.get('otp', '').strip()
        
        if not email or not otp:
            return Response(
                {'error': 'Email and OTP are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify OTP
        is_valid, message = verify_otp(email, otp)
        
        if is_valid:
            # Mark email as verified
            mark_email_verified(email, expiry_hours=24)
            logger.info(f"Email {email} verified successfully")
            return Response(
                {'message': 'Email verified successfully'}, 
                status=status.HTTP_200_OK
            )
        else:
            logger.warning(f"OTP verification failed for {email}: {message}")
            return Response(
                {'error': message}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.error(f"Error in verify_otp_code: {str(e)}")
        return Response(
            {'error': 'An error occurred. Please try again.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def register_with_verified_email(request):
    """
    Register user with verified email
    """
    try:
        email = request.data.get('email', '').strip().lower()
        
        if not email:
            return Response(
                {'error': 'Email is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if email is verified
        if not is_otp_verified(email):
            return Response(
                {'error': 'Email must be verified before registration'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'An account with this email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate registration data
        serializer = RegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            # Create user
            user = serializer.save()
            
            # Clear verification status after successful registration
            from django.core.cache import cache
            cache.delete(f"verified_{email}")
            
            logger.info(f"User registered successfully: {user.username} ({user.email})")
            return Response(
                {'message': 'Registration successful! You can now log in.'}, 
                status=status.HTTP_201_CREATED
            )
        else:
            logger.warning(f"Registration validation failed: {serializer.errors}")
            return Response(
                serializer.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.error(f"Error in register_with_verified_email: {str(e)}")
        return Response(
            {'error': 'An error occurred during registration. Please try again.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
