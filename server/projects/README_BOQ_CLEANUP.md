# BOQ File Cleanup Documentation

This document explains the BOQ (Bill of Quantities) file cleanup functionality implemented in the SAAN HOMES project management system.

## Overview

When creating new projects with BOQ files, the system now automatically cleans up uploaded BOQ files after successful processing to save server storage space. The BOQ data is extracted and stored in the database, making the original file unnecessary.

## Features

### 1. Automatic Cleanup During Project Creation

- **Location**: `server/projects/views.py` - `ProjectViewSet.create()` method
- **When**: After successful BOQ parsing and step creation
- **What**: Removes both temporary and stored BOQ files
- **Safety**: Uses try-catch blocks to handle file access issues gracefully

### 2. Temporary File Cleanup

- **Location**: `server/projects/views.py` - `cleanup_old_temp_files()` function
- **Purpose**: Removes old temporary BOQ files from `temp_boq/` directory
- **Trigger**: Automatically called before processing new BOQ files
- **Age Limit**: Files older than 24 hours are removed

### 3. Django Management Command

- **Command**: `python manage.py cleanup_temp_boq`
- **Location**: `server/projects/management/commands/cleanup_temp_boq.py`
- **Purpose**: Manual cleanup of temporary BOQ files
- **Options**:
  - `--older-than N`: Remove files older than N hours (default: 24)
  - `--dry-run`: Show what would be deleted without actually deleting
  - `--force`: Delete all temp files regardless of age

## File Storage Structure

```
server/media/
├── boq/                    # Original BOQ files (cleaned up after processing)
├── temp_boq/              # Temporary BOQ files (cleaned up automatically)
├── projects/              # Project-related files
└── ...
```

## Cleanup Process Flow

1. **Project Creation Request**
   - User uploads BOQ file
   - System validates file format (.xlsx, .xls)

2. **Temporary File Creation**
   - BOQ file saved to `temp_boq/` directory with unique filename
   - Used for parsing and processing

3. **BOQ Processing**
   - File parsed to extract materials and steps
   - Project steps created in database
   - BOQ data stored in structured format

4. **Cleanup Phase**
   - Temporary file deleted from `temp_boq/`
   - Original BOQ file deleted from `boq/`
   - Database reference cleared
   - Old temp files (24+ hours) cleaned up

## Error Handling

The cleanup process includes comprehensive error handling:

- **File Access Issues**: Graceful handling of permission errors
- **Missing Files**: Safe handling when files don't exist
- **Database Errors**: Proper rollback if cleanup fails
- **Logging**: Detailed logging for debugging

## Usage Examples

### Automatic Cleanup
```python
# Happens automatically during project creation
# No manual intervention required
```

### Manual Cleanup via Management Command
```bash
# Show what would be deleted (dry run)
python manage.py cleanup_temp_boq --dry-run

# Delete files older than 24 hours
python manage.py cleanup_temp_boq --older-than 24

# Delete all temp files
python manage.py cleanup_temp_boq --force

# Delete files older than 48 hours
python manage.py cleanup_temp_boq --older-than 48
```

### Programmatic Cleanup
```python
from projects.views import cleanup_old_temp_files

# Clean up files older than 24 hours
stats = cleanup_old_temp_files(max_age_hours=24)
print(f"Deleted {stats['deleted']} files, freed {stats['size_freed']} bytes")
```

## Benefits

1. **Storage Optimization**: Prevents accumulation of large BOQ files
2. **Performance**: Reduces disk I/O and storage overhead
3. **Security**: Removes sensitive BOQ data after processing
4. **Maintenance**: Automated cleanup reduces manual maintenance
5. **Cost Savings**: Reduces cloud storage costs in production

## Monitoring

The system logs cleanup activities:

```
Temporary BOQ file deleted: /path/to/temp_boq/uuid_filename.xlsx
Stored BOQ file deleted after successful processing: /path/to/boq/filename.xlsx
Cleaned up 3 old temp files, freed 2048576 bytes
```

## Testing

A test script is available at `server/projects/test_cleanup.py` to verify cleanup functionality:

```bash
cd server
python -c "from projects.test_cleanup import test_cleanup_functionality; test_cleanup_functionality()"
```

## Configuration

The cleanup behavior can be configured by modifying:

- **Age Limit**: Change `max_age_hours` parameter (default: 24)
- **Cleanup Frequency**: Modify when `cleanup_old_temp_files()` is called
- **File Patterns**: Adjust file matching patterns in cleanup functions

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure Django has write access to media directory
2. **File Locked**: Files may be locked by other processes
3. **Path Issues**: Verify MEDIA_ROOT setting is correct

### Debug Mode

Enable detailed logging by setting Django's LOG_LEVEL to DEBUG:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'projects.views': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

## Future Enhancements

Potential improvements for the cleanup system:

1. **Scheduled Cleanup**: Add Celery task for periodic cleanup
2. **Metrics**: Track cleanup statistics and storage savings
3. **Notifications**: Alert administrators about cleanup activities
4. **Retention Policies**: Configurable retention periods per project type
5. **Backup Integration**: Optional backup before cleanup
