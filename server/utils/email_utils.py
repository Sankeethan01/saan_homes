"""
Email utility functions for SAAN HOMES Equipment Booking System
Handles sending email notifications for equipment booking workflow
"""

from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.auth import get_user_model
from equipments.models import Booking
from datetime import datetime, date
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


def send_equipment_booking_confirmation_email(booking):
    """
    Send equipment booking confirmation email to user when booking is created
    """
    try:
        subject = f"Equipment Booking Confirmation - {booking.equipment.name}"
        
        # Calculate total amount
        total_amount = booking.equipment.daily_rate * booking.duration
        
        # Render HTML template
        html_content = render_to_string('emails/equipment_booking_confirmation.html', {
            'booking': booking,
            'user_email': booking.user.email,
            'total_amount': total_amount,
        })
        
        # Create email message
        msg = EmailMultiAlternatives(
            subject=subject,
            body=f"Your equipment booking request for {booking.equipment.name} has been received and is being processed.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[booking.user.email]
        )
        msg.attach_alternative(html_content, "text/html")
        
        # Send email
        result = msg.send()
        
        if result:
            logger.info(f"Equipment booking confirmation email sent successfully to {booking.user.email}")
            return True
        else:
            logger.error(f"Failed to send equipment booking confirmation email to {booking.user.email}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending equipment booking confirmation email to {booking.user.email}: {str(e)}")
        return False


def send_equipment_booking_approved_email(booking):
    """
    Send equipment booking approved email to user when admin approves booking
    """
    try:
        subject = f"Equipment Booking Approved - {booking.equipment.name}"
        
        # Calculate total amount
        total_amount = booking.equipment.daily_rate * booking.duration
        
        # Build payment URL (you'll need to create this URL pattern)
        payment_url = f"{settings.FRONTEND_URL}/dashboard/me/rentals/pay/{booking.id}/"
        
        # Render HTML template
        html_content = render_to_string('emails/equipment_booking_approved.html', {
            'booking': booking,
            'user_email': booking.user.email,
            'total_amount': total_amount,
            'payment_url': payment_url,
        })
        
        # Create email message
        msg = EmailMultiAlternatives(
            subject=subject,
            body=f"Great news! Your equipment booking for {booking.equipment.name} has been approved. Please proceed with payment.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[booking.user.email]
        )
        msg.attach_alternative(html_content, "text/html")
        
        # Send email
        result = msg.send()
        
        if result:
            logger.info(f"Equipment booking approved email sent successfully to {booking.user.email}")
            return True
        else:
            logger.error(f"Failed to send equipment booking approved email to {booking.user.email}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending equipment booking approved email to {booking.user.email}: {str(e)}")
        return False


def send_equipment_booking_rejected_email(booking):
    """
    Send equipment booking rejected email to user when admin rejects booking
    """
    try:
        subject = f"Equipment Booking Update - {booking.equipment.name}"
        
        # Render HTML template
        html_content = render_to_string('emails/equipment_booking_rejected.html', {
            'booking': booking,
            'user_email': booking.user.email,
        })
        
        # Create email message
        msg = EmailMultiAlternatives(
            subject=subject,
            body=f"Your equipment booking request for {booking.equipment.name} could not be approved at this time.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[booking.user.email]
        )
        msg.attach_alternative(html_content, "text/html")
        
        # Send email
        result = msg.send()
        
        if result:
            logger.info(f"Equipment booking rejected email sent successfully to {booking.user.email}")
            return True
        else:
            logger.error(f"Failed to send equipment booking rejected email to {booking.user.email}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending equipment booking rejected email to {booking.user.email}: {str(e)}")
        return False


def send_equipment_payment_confirmed_email(booking):
    """
    Send equipment payment confirmed email to user when payment is processed
    """
    try:
        subject = f"Payment Confirmed - Equipment Ready - {booking.equipment.name}"
        
        # Calculate total amount
        total_amount = booking.equipment.daily_rate * booking.duration
        
        # Render HTML template
        html_content = render_to_string('emails/equipment_payment_confirmed.html', {
            'booking': booking,
            'user_email': booking.user.email,
            'total_amount': total_amount,
        })
        
        # Create email message
        msg = EmailMultiAlternatives(
            subject=subject,
            body=f"Your payment has been confirmed for {booking.equipment.name}. The equipment is ready for pickup/delivery.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[booking.user.email]
        )
        msg.attach_alternative(html_content, "text/html")
        
        # Send email
        result = msg.send()
        
        if result:
            logger.info(f"Equipment payment confirmed email sent successfully to {booking.user.email}")
            return True
        else:
            logger.error(f"Failed to send equipment payment confirmed email to {booking.user.email}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending equipment payment confirmed email to {booking.user.email}: {str(e)}")
        return False


def send_equipment_handed_over_email(booking):
    """
    Send equipment handed over email to user when equipment is given to user
    """
    try:
        subject = f"Equipment Handed Over - {booking.equipment.name}"
        
        # Calculate days remaining
        today = date.today()
        days_remaining = (booking.end_date - today).days
        
        # Render HTML template
        html_content = render_to_string('emails/equipment_handed_over.html', {
            'booking': booking,
            'user_email': booking.user.email,
            'days_remaining': days_remaining,
        })
        
        # Create email message
        msg = EmailMultiAlternatives(
            subject=subject,
            body=f"Your equipment {booking.equipment.name} has been successfully handed over. Please return it by {booking.end_date.strftime('%B %d, %Y')}.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[booking.user.email]
        )
        msg.attach_alternative(html_content, "text/html")
        
        # Send email
        result = msg.send()
        
        if result:
            logger.info(f"Equipment handed over email sent successfully to {booking.user.email}")
            return True
        else:
            logger.error(f"Failed to send equipment handed over email to {booking.user.email}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending equipment handed over email to {booking.user.email}: {str(e)}")
        return False


def send_equipment_returned_email(booking):
    """
    Send equipment returned email to user when equipment is returned
    """
    try:
        subject = f"Equipment Returned Successfully - {booking.equipment.name}"
        
        # Calculate total amount
        total_amount = booking.equipment.daily_rate * booking.duration
        
        # Render HTML template
        html_content = render_to_string('emails/equipment_returned.html', {
            'booking': booking,
            'user_email': booking.user.email,
            'total_amount': total_amount,
        })
        
        # Create email message
        msg = EmailMultiAlternatives(
            subject=subject,
            body=f"Thank you for returning {booking.equipment.name}. We hope you had a great experience with SAAN HOMES!",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[booking.user.email]
        )
        msg.attach_alternative(html_content, "text/html")
        
        # Send email
        result = msg.send()
        
        if result:
            logger.info(f"Equipment returned email sent successfully to {booking.user.email}")
            return True
        else:
            logger.error(f"Failed to send equipment returned email to {booking.user.email}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending equipment returned email to {booking.user.email}: {str(e)}")
        return False


def send_equipment_booking_status_update_email(booking, old_status):
    """
    Send equipment booking status update email to user when status changes
    This function determines which specific email to send based on the new status
    """
    try:
        if booking.status == 'APPROVED':
            return send_equipment_booking_approved_email(booking)
        elif booking.status == 'REJECTED':
            return send_equipment_booking_rejected_email(booking)
        elif booking.status == 'PAID':
            return send_equipment_payment_confirmed_email(booking)
        elif booking.status == 'RENTED':
            return send_equipment_handed_over_email(booking)
        elif booking.status == 'COMPLETED':
            return send_equipment_returned_email(booking)
        else:
            logger.info(f"No specific email template for status: {booking.status}")
            return True
            
    except Exception as e:
        logger.error(f"Error sending equipment booking status update email: {str(e)}")
        return False


def test_email_configuration():
    """
    Test email configuration by sending a test email
    """
    try:
        result = send_mail(
            subject='SAAN HOMES - Email Configuration Test',
            message='This is a test email to verify email configuration is working properly.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],  # Send to the configured email
            fail_silently=False,
        )
        
        if result:
            logger.info("Email configuration test successful")
            return True
        else:
            logger.error("Email configuration test failed")
            return False
            
    except Exception as e:
        logger.error(f"Email configuration test error: {str(e)}")
        return False
