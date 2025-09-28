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

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Send OTP to email for password reset using username
    """
    try:
        username = request.data.get('username', '').strip()
        
        if not username:
            return Response(
                {'error': 'Username is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find user by username
        try:
            user = User.objects.get(username=username)
            email = user.email
        except User.DoesNotExist:
            return Response(
                {'error': 'No account found with this username'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not email:
            return Response(
                {'error': 'No email address found for this account'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate and send OTP
        otp = generate_otp()
        
        if send_otp_email(email, otp):
            store_otp(email, otp, expiry_minutes=10)
            logger.info(f"Password reset OTP sent successfully to {email} for username {username}")
            return Response(
                {
                    'message': 'Verification code sent to your email',
                    'email': email  # Return email for frontend display
                }, 
                status=status.HTTP_200_OK
            )
        else:
            logger.error(f"Failed to send password reset OTP to {email}")
            return Response(
                {'error': 'Failed to send verification code. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        logger.error(f"Error in forgot_password: {str(e)}")
        return Response(
            {'error': 'An error occurred. Please try again.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_otp(request):
    """
    Verify OTP code for password reset using username
    """
    try:
        username = request.data.get('username', '').strip()
        otp = request.data.get('otp', '').strip()
        
        if not username or not otp:
            return Response(
                {'error': 'Username and OTP are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find user by username to get email
        try:
            user = User.objects.get(username=username)
            email = user.email
        except User.DoesNotExist:
            return Response(
                {'error': 'No account found with this username'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify OTP
        is_valid, message = verify_otp(email, otp)
        
        if is_valid:
            # Mark email as verified for password reset
            mark_email_verified(email, expiry_hours=1)  # 1 hour for password reset
            logger.info(f"Email {email} verified for password reset for username {username}")
            return Response(
                {'message': 'Email verified successfully'}, 
                status=status.HTTP_200_OK
            )
        else:
            logger.warning(f"Password reset OTP verification failed for {email}: {message}")
            return Response(
                {'error': message}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.error(f"Error in verify_reset_otp: {str(e)}")
        return Response(
            {'error': 'An error occurred. Please try again.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Reset password with verified username
    """
    try:
        username = request.data.get('username', '').strip()
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')
        
        if not username or not new_password or not confirm_password:
            return Response(
                {'error': 'Username, new password, and confirm password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find user by username to get email
        try:
            user = User.objects.get(username=username)
            email = user.email
        except User.DoesNotExist:
            return Response(
                {'error': 'No account found with this username'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if email is verified for password reset
        if not is_otp_verified(email):
            return Response(
                {'error': 'Email must be verified before password reset'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if passwords match
        if new_password != confirm_password:
            return Response(
                {'error': 'Passwords do not match'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password strength
        from django.contrib.auth.password_validation import validate_password
        try:
            validate_password(new_password)
        except ValidationError as e:
            return Response(
                {'error': 'Password does not meet requirements', 'details': list(e.messages)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update user password
        user.set_password(new_password)
        user.save()
        
        # Clear verification status after successful password reset
        from django.core.cache import cache
        cache.delete(f"verified_{email}")
        
        logger.info(f"Password reset successfully for user: {user.username} ({user.email})")
        return Response(
            {'message': 'Password reset successfully'}, 
            status=status.HTTP_200_OK
        )
            
    except Exception as e:
        logger.error(f"Error in reset_password: {str(e)}")
        return Response(
            {'error': 'An error occurred during password reset. Please try again.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
