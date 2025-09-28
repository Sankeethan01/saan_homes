import random
import string
from datetime import datetime, timedelta
from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def generate_otp(length=6):
    """Generate a random OTP of specified length"""
    return ''.join(random.choices(string.digits, k=length))

def send_otp_email(email, otp):
    """Send OTP verification email"""
    try:
        # Email subject
        subject = "SAAN Homes - Email Verification Code"
        
        # Render HTML template
        html_content = render_to_string('emails/otp_verification.html', {
            'otp': otp,
            'email': email,
            'frontend_url': settings.FRONTEND_URL,
        })
        
        # Create email message
        msg = EmailMultiAlternatives(
            subject=subject,
            body=f"Your verification code is: {otp}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email]
        )
        msg.attach_alternative(html_content, "text/html")
        
        # Send email
        msg.send()
        
        logger.info(f"OTP email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending OTP email to {email}: {str(e)}")
        return False

def store_otp(email, otp, expiry_minutes=10):
    """Store OTP in cache with expiry"""
    cache_key = f"otp_{email}"
    cache.set(cache_key, otp, timeout=expiry_minutes * 60)
    logger.info(f"OTP stored for {email} with {expiry_minutes} minutes expiry")

def verify_otp(email, provided_otp):
    """Verify OTP for given email"""
    cache_key = f"otp_{email}"
    stored_otp = cache.get(cache_key)
    
    if stored_otp is None:
        logger.warning(f"No OTP found for {email}")
        return False, "OTP has expired or doesn't exist"
    
    if stored_otp == provided_otp:
        # Remove OTP after successful verification
        cache.delete(cache_key)
        logger.info(f"OTP verified successfully for {email}")
        return True, "OTP verified successfully"
    else:
        logger.warning(f"Invalid OTP provided for {email}")
        return False, "Invalid OTP"

def is_otp_verified(email):
    """Check if email is verified (OTP was successfully verified)"""
    cache_key = f"verified_{email}"
    return cache.get(cache_key, False)

def mark_email_verified(email, expiry_hours=24):
    """Mark email as verified for a certain period"""
    cache_key = f"verified_{email}"
    cache.set(cache_key, True, timeout=expiry_hours * 60 * 60)
    logger.info(f"Email {email} marked as verified for {expiry_hours} hours")
