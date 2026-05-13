"""
Flask application for PDF document upload system.
Provides /upload endpoint and serves static frontend files.
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import logging

from config import Config
from validators import validate_file
from storage import save_file

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='static')
app.config.from_object(Config)

# Enable CORS for development flexibility (resolves DR-004)
CORS(app)


@app.route('/')
def index():
    """
    Serve the main HTML page.
    """
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    """
    Handle PDF file upload.

    Accepts multipart/form-data with 'file' field.
    Validates file type and size.
    Saves file to upload directory.

    Returns:
        JSON response with success message and filename, or error message.
        Status codes: 200 (success), 400 (validation error), 500 (server error)
    """
    logger.info("Upload request received")

    # Check if file field is present
    if 'file' not in request.files:
        logger.warning("No file field in request")
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    # Check if filename is empty (M-004: handle None and empty string)
    if not file.filename:
        logger.warning("Empty filename in request")
        return jsonify({'error': 'No file selected'}), 400

    # Validate file (type and size)
    is_valid, error_message = validate_file(file)
    if not is_valid:
        logger.warning(f"Validation failed: {error_message}")
        return jsonify({'error': error_message}), 400

    # Save file to upload directory
    success, safe_filename, storage_error = save_file(file, app.config['UPLOAD_FOLDER'])
    if not success:
        logger.error(f"Storage failed: {storage_error}")
        return jsonify({'error': storage_error}), 500

    logger.info(f"File uploaded successfully: {safe_filename}")
    return jsonify({
        'message': 'File uploaded successfully',
        'filename': safe_filename
    }), 200


@app.errorhandler(413)
def request_entity_too_large(error):
    """
    Handle 413 Request Entity Too Large error (file exceeds Flask MAX_CONTENT_LENGTH).
    """
    max_size_mb = app.config['MAX_CONTENT_LENGTH'] / (1024 * 1024)
    logger.warning(f"File size exceeds {int(max_size_mb)} MB limit")
    return jsonify({
        'error': f'File size exceeds {int(max_size_mb)} MB limit. Please select a smaller file.'
    }), 413


@app.errorhandler(400)
def bad_request(error):
    """
    Handle 400 Bad Request errors.
    """
    return jsonify({'error': 'Bad request'}), 400


@app.errorhandler(500)
def internal_server_error(error):
    """
    Handle 500 Internal Server Error.
    """
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Ensure upload directory exists (C-001: validate path for security)
    upload_folder = os.path.abspath(app.config['UPLOAD_FOLDER'])
    app_dir = os.path.abspath('.')
    if not upload_folder.startswith(app_dir):
        raise ValueError(f"Upload folder must be within application directory. Got: {upload_folder}")
    os.makedirs(upload_folder, exist_ok=True)
    logger.info(f"Upload directory: {upload_folder}")

    # Run Flask development server
    logger.info("Starting Flask development server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
