"""
Django management command to test email configuration and diagnose issues
Usage: python manage.py test_email_config
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.mail import send_mail
import os


class Command(BaseCommand):
    help = 'Test email configuration and diagnose issues'

    def handle(self, *args, **options):
        self.stdout.write('🔍 Testing email configuration...\n')
        
        # Check environment variables
        self.stdout.write('📋 Environment Variables:')
        email_user = os.getenv('EMAIL_HOST_USER', '')
        email_pass = os.getenv('EMAIL_HOST_PASSWORD', '')
        
        self.stdout.write(f'  EMAIL_HOST_USER: {"✅ Set" if email_user else "❌ Not set"}')
        self.stdout.write(f'  EMAIL_HOST_PASSWORD: {"✅ Set" if email_pass else "❌ Not set"}')
        
        # Check Django settings
        self.stdout.write('\n📋 Django Email Settings:')
        self.stdout.write(f'  EMAIL_BACKEND: {settings.EMAIL_BACKEND}')
        self.stdout.write(f'  EMAIL_HOST: {settings.EMAIL_HOST}')
        self.stdout.write(f'  EMAIL_PORT: {settings.EMAIL_PORT}')
        self.stdout.write(f'  EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}')
        self.stdout.write(f'  EMAIL_HOST_USER: {"✅ Set" if settings.EMAIL_HOST_USER else "❌ Not set"}')
        self.stdout.write(f'  EMAIL_HOST_PASSWORD: {"✅ Set" if settings.EMAIL_HOST_PASSWORD else "❌ Not set"}')
        self.stdout.write(f'  DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}')
        
        # Test email sending
        if email_user and email_pass:
            self.stdout.write('\n📧 Testing email sending...')
            try:
                result = send_mail(
                    subject='SAAN HOMES - Email Test',
                    message='This is a test email to verify configuration.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email_user],
                    fail_silently=False,
                )
                
                if result:
                    self.stdout.write(self.style.SUCCESS('✅ Email sent successfully!'))
                else:
                    self.stdout.write(self.style.ERROR('❌ Email sending failed'))
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Email error: {str(e)}'))
                
                # Provide specific solutions based on error
                if 'Authentication Required' in str(e):
                    self.stdout.write('\n🔧 Solution for Authentication Error:')
                    self.stdout.write('  1. Enable 2-Factor Authentication on Gmail')
                    self.stdout.write('  2. Generate App Password (not regular password)')
                    self.stdout.write('  3. Use App Password in EMAIL_HOST_PASSWORD')
                    self.stdout.write('  4. Make sure EMAIL_HOST_USER is your full Gmail address')
                    
                elif 'Connection refused' in str(e):
                    self.stdout.write('\n🔧 Solution for Connection Error:')
                    self.stdout.write('  1. Check internet connection')
                    self.stdout.write('  2. Try different port (465 for SSL)')
                    self.stdout.write('  3. Check firewall settings')
                    
        else:
            self.stdout.write('\n⚠️  Email credentials not configured.')
            self.stdout.write('📝 To fix this:')
            self.stdout.write('  1. Create/update .env file in server directory')
            self.stdout.write('  2. Add EMAIL_HOST_USER=your-email@gmail.com')
            self.stdout.write('  3. Add EMAIL_HOST_PASSWORD=your-app-password')
            self.stdout.write('  4. Restart Django server')
