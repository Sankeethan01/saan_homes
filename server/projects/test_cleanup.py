"""
Test script for BOQ file cleanup functionality.
This script can be run to test the cleanup functions without creating a full project.
"""

import os
import tempfile
import shutil
from datetime import datetime, timedelta
from django.conf import settings
from django.test import TestCase
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

# Import the cleanup function
from .views import cleanup_old_temp_files


def test_cleanup_functionality():
    """
    Test the cleanup functionality by creating temporary files and cleaning them up.
    """
    print("Testing BOQ file cleanup functionality...")
    
    # Create a temporary directory for testing
    test_dir = os.path.join(settings.MEDIA_ROOT, 'temp_boq_test')
    os.makedirs(test_dir, exist_ok=True)
    
    try:
        # Create some test files
        test_files = []
        for i in range(3):
            filename = f"test_boq_{i}.xlsx"
            file_path = os.path.join(test_dir, filename)
            
            # Create a dummy file
            with open(file_path, 'w') as f:
                f.write(f"Test BOQ file {i}")
            
            # Modify the file timestamp to make it old
            old_time = datetime.now() - timedelta(hours=25)  # 25 hours old
            timestamp = old_time.timestamp()
            os.utime(file_path, (timestamp, timestamp))
            
            test_files.append(file_path)
            print(f"Created test file: {filename}")
        
        # Test the cleanup function
        print("\nTesting cleanup function...")
        cleanup_stats = cleanup_old_temp_files(max_age_hours=24)
        
        print(f"Cleanup results:")
        print(f"  - Files deleted: {cleanup_stats['deleted']}")
        print(f"  - Size freed: {cleanup_stats['size_freed']} bytes")
        print(f"  - Errors: {len(cleanup_stats['errors'])}")
        
        if cleanup_stats['errors']:
            print("Errors encountered:")
            for error in cleanup_stats['errors']:
                print(f"  - {error}")
        
        # Verify files were deleted
        remaining_files = [f for f in os.listdir(test_dir) if os.path.isfile(os.path.join(test_dir, f))]
        print(f"\nRemaining files in test directory: {len(remaining_files)}")
        
        if len(remaining_files) == 0:
            print("✅ Cleanup test PASSED - All old files were deleted")
        else:
            print("❌ Cleanup test FAILED - Some files were not deleted")
            for file in remaining_files:
                print(f"  - {file}")
        
    finally:
        # Clean up test directory
        if os.path.exists(test_dir):
            shutil.rmtree(test_dir)
            print(f"\nCleaned up test directory: {test_dir}")


def test_management_command():
    """
    Test the Django management command for cleanup.
    """
    print("\nTesting Django management command...")
    
    # This would typically be run as: python manage.py cleanup_temp_boq --dry-run
    print("To test the management command, run:")
    print("  python manage.py cleanup_temp_boq --dry-run")
    print("  python manage.py cleanup_temp_boq --older-than 24")
    print("  python manage.py cleanup_temp_boq --force")


if __name__ == "__main__":
    # This script can be run directly for testing
    print("BOQ Cleanup Test Script")
    print("=" * 50)
    
    # Test the cleanup function
    test_cleanup_functionality()
    
    # Show management command usage
    test_management_command()
    
    print("\n" + "=" * 50)
    print("Test completed!")
