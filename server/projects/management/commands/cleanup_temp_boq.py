"""
Django management command to clean up temporary BOQ files.

This command removes old temporary BOQ files from the temp_boq directory
that may have been left behind due to interrupted uploads or processing errors.

Usage:
    python manage.py cleanup_temp_boq
    python manage.py cleanup_temp_boq --older-than 24  # Remove files older than 24 hours
    python manage.py cleanup_temp_boq --dry-run        # Show what would be deleted without actually deleting
"""

import os
import time
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings


class Command(BaseCommand):
    help = 'Clean up temporary BOQ files from the temp_boq directory'

    def add_arguments(self, parser):
        parser.add_argument(
            '--older-than',
            type=int,
            default=24,
            help='Remove files older than specified hours (default: 24)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting files'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force deletion of all temp files regardless of age'
        )

    def handle(self, *args, **options):
        older_than_hours = options['older_than']
        dry_run = options['dry_run']
        force = options['force']
        
        # Get the temp_boq directory path
        temp_boq_dir = os.path.join(settings.MEDIA_ROOT, 'temp_boq')
        
        if not os.path.exists(temp_boq_dir):
            self.stdout.write(
                self.style.WARNING(f'Temp BOQ directory does not exist: {temp_boq_dir}')
            )
            return
        
        # Calculate cutoff time
        if force:
            cutoff_time = None
            self.stdout.write('Force mode: Will delete all temp files regardless of age')
        else:
            cutoff_time = datetime.now() - timedelta(hours=older_than_hours)
            self.stdout.write(f'Will delete files older than {older_than_hours} hours (before {cutoff_time.strftime("%Y-%m-%d %H:%M:%S")})')
        
        # Get all files in the temp_boq directory
        try:
            files = os.listdir(temp_boq_dir)
        except OSError as e:
            raise CommandError(f'Error reading temp_boq directory: {e}')
        
        if not files:
            self.stdout.write(self.style.SUCCESS('No temporary BOQ files found'))
            return
        
        deleted_count = 0
        total_size = 0
        errors = []
        
        for filename in files:
            file_path = os.path.join(temp_boq_dir, filename)
            
            # Skip directories
            if os.path.isdir(file_path):
                continue
            
            try:
                # Get file stats
                stat = os.stat(file_path)
                file_size = stat.st_size
                file_mtime = datetime.fromtimestamp(stat.st_mtime)
                
                # Check if file should be deleted
                should_delete = False
                if force:
                    should_delete = True
                elif cutoff_time and file_mtime < cutoff_time:
                    should_delete = True
                
                if should_delete:
                    total_size += file_size
                    
                    if dry_run:
                        self.stdout.write(f'[DRY RUN] Would delete: {filename} ({file_size} bytes, modified: {file_mtime.strftime("%Y-%m-%d %H:%M:%S")})')
                    else:
                        try:
                            os.remove(file_path)
                            deleted_count += 1
                            self.stdout.write(f'Deleted: {filename} ({file_size} bytes)')
                        except OSError as e:
                            error_msg = f'Error deleting {filename}: {e}'
                            errors.append(error_msg)
                            self.stdout.write(self.style.ERROR(error_msg))
                else:
                    self.stdout.write(f'Keeping: {filename} (modified: {file_mtime.strftime("%Y-%m-%d %H:%M:%S")})')
                    
            except OSError as e:
                error_msg = f'Error processing {filename}: {e}'
                errors.append(error_msg)
                self.stdout.write(self.style.ERROR(error_msg))
        
        # Summary
        if dry_run:
            self.stdout.write(
                self.style.SUCCESS(f'[DRY RUN] Would delete {len([f for f in files if os.path.isfile(os.path.join(temp_boq_dir, f))])} files, total size: {self._format_size(total_size)}')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Deleted {deleted_count} files, freed {self._format_size(total_size)} of space')
            )
            
            if errors:
                self.stdout.write(
                    self.style.WARNING(f'Encountered {len(errors)} errors during cleanup')
                )
        
        # Try to remove empty temp_boq directory
        try:
            if not os.listdir(temp_boq_dir):
                if not dry_run:
                    os.rmdir(temp_boq_dir)
                    self.stdout.write(f'Removed empty directory: {temp_boq_dir}')
                else:
                    self.stdout.write(f'[DRY RUN] Would remove empty directory: {temp_boq_dir}')
        except OSError:
            pass  # Directory not empty or permission issues
    
    def _format_size(self, size_bytes):
        """Convert bytes to human readable format"""
        if size_bytes == 0:
            return "0 B"
        
        size_names = ["B", "KB", "MB", "GB"]
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        
        return f"{size_bytes:.1f} {size_names[i]}"
