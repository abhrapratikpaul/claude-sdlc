"""
File storage module for PDF upload system.
Handles file saving with sanitization and edge case handling.
"""

import os
from typing import Tuple
from werkzeug.utils import secure_filename


def save_file(file, upload_folder: str) -> Tuple[bool, str, str]:
    """
    Save uploaded file to the designated upload folder with filename sanitization.

    Handles edge cases (resolves DR-002):
    - Empty filename after sanitization
    - File with no extension
    - Unicode/emoji stripped by secure_filename
    - Creates upload directory if it doesn't exist

    Args:
        file: FileStorage object from Flask request
        upload_folder: Directory path where file should be saved

    Returns:
        Tuple of (success: bool, safe_filename: str or None, error_message: str or None)
    """
    original_filename = file.filename

    if not original_filename:
        return False, None, "No file selected"

    # Sanitize filename using werkzeug's secure_filename
    safe_filename = secure_filename(original_filename)

    # Edge case: empty filename after sanitization (e.g., "....." or unicode only)
    if not safe_filename or safe_filename == '':
        return False, None, "Invalid filename. Please use alphanumeric characters."

    # Edge case: no extension or not .pdf
    if not safe_filename.lower().endswith('.pdf'):
        return False, None, "Filename must end with .pdf extension."

    # Ensure upload directory exists
    try:
        os.makedirs(upload_folder, exist_ok=True)
    except OSError as e:
        return False, None, f"Failed to create upload directory: {str(e)}"

    # Save file (overwrites if exists per FR-008 AC-019)
    try:
        filepath = os.path.join(upload_folder, safe_filename)
        file.save(filepath)
    except Exception as e:
        return False, None, f"Failed to save file: {str(e)}"

    return True, safe_filename, None
