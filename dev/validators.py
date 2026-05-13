"""
File validation module for PDF upload system.
Provides functions to validate file type and size.
"""

import mimetypes
import os
from typing import Tuple


def validate_file_type(filename: str) -> Tuple[bool, str]:
    """
    Validate that the file is a PDF based on extension and MIME type.

    Uses Python's mimetypes module to guess MIME type from filename.
    This approach is sufficient given NFR-003 accepts MIME spoofing risk.

    Args:
        filename: Name of the file to validate

    Returns:
        Tuple of (is_valid: bool, error_message: str or None)
    """
    if not filename:
        return False, "Filename is empty"

    # Check extension (case-insensitive)
    if not filename.lower().endswith('.pdf'):
        return False, "Invalid file type. Please select a PDF document."

    # Check MIME type using mimetypes module (resolves DR-001)
    mime_type, _ = mimetypes.guess_type(filename)
    if mime_type != 'application/pdf':
        return False, "Invalid file type. Please select a PDF document."

    return True, None


def validate_file_size(file, max_size: int = 50 * 1024 * 1024) -> Tuple[bool, str]:
    """
    Validate that the file size does not exceed the maximum allowed size.

    Args:
        file: FileStorage object from Flask request
        max_size: Maximum allowed file size in bytes (default: 50 MB)

    Returns:
        Tuple of (is_valid: bool, error_message: str or None)
    """
    # Get file size by seeking to end (C-002: use try-finally for safety)
    try:
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
    finally:
        # Always reset file pointer to beginning for subsequent operations
        file.seek(0)

    if file_size > max_size:
        size_mb = max_size / (1024 * 1024)
        return False, f"File size exceeds {int(size_mb)} MB limit. Please select a smaller file."

    return True, None


def validate_file(file) -> Tuple[bool, str]:
    """
    Orchestrator function to validate both file type and size.

    Args:
        file: FileStorage object from Flask request

    Returns:
        Tuple of (is_valid: bool, error_message: str or None)
        Returns the first validation error encountered, or (True, None) if all pass.
    """
    filename = file.filename if file else None

    if not filename:
        return False, "No file selected"

    # Validate file type (extension)
    is_valid_type, type_error = validate_file_type(filename)
    if not is_valid_type:
        return False, type_error

    # M-001: Validate MIME type from request content_type (server-side)
    if hasattr(file, 'content_type') and file.content_type:
        if file.content_type != 'application/pdf':
            return False, "Invalid file type. Please select a PDF document."

    # Validate file size
    is_valid_size, size_error = validate_file_size(file)
    if not is_valid_size:
        return False, size_error

    return True, None
