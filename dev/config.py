"""
Flask configuration for PDF upload application.
"""

import os

# Maximum file size: 50 MB
MAX_CONTENT_LENGTH = 50 * 1024 * 1024

# Upload directory
UPLOAD_FOLDER = 'upload'

# Allowed MIME type
ALLOWED_MIME_TYPE = 'application/pdf'

# Request timeout (2 minutes = 120 seconds)
REQUEST_TIMEOUT = 120

# Flask configuration
class Config:
    """Flask application configuration."""

    MAX_CONTENT_LENGTH = MAX_CONTENT_LENGTH
    UPLOAD_FOLDER = UPLOAD_FOLDER
    ALLOWED_MIME_TYPE = ALLOWED_MIME_TYPE
