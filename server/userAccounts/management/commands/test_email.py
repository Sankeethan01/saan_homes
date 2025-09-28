"""
Django management command to test email configuration
Usage: python manage.py test_email
"""

from django.core.management.base import BaseCommand
from utils.email_utils import test_email_configuration


class Command(BaseCommand):
    help = 'Test email configuration'

    def handle(self, *args, **options):
        self.stdout.write('Testing email configuration...')
        
        if test_email_configuration():
            self.stdout.write(
                self.style.SUCCESS('✅ Email configuration test successful!')
            )
        else:
            self.stdout.write(
                self.style.ERROR('❌ Email configuration test failed!')
            )
