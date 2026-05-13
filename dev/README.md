# PDF Document Upload System

## Overview
Web-based PDF document upload interface with real-time progress tracking and error handling.

## Features
- File selection interface with validation
- Client and server-side validation (type and size)
- Real-time upload progress tracking
- Error handling with retry mechanism
- Local filesystem storage

## Requirements
- Python 3.11+
- Flask 3.0.0
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## Setup Instructions

### 1. Install Dependencies
```bash
cd dev
pip install -r requirements.txt
```

### 2. Run the Application
```bash
python app.py
```

The server will start on `http://localhost:5000`

### 3. Access the Application
Open your web browser and navigate to:
```
http://localhost:5000
```

## Project Structure
```
dev/
├── app.py              # Flask application and /upload endpoint
├── config.py           # Flask configuration
├── validators.py       # File validation logic
├── storage.py          # File storage handler
├── requirements.txt    # Python dependencies
├── .gitignore         # Git exclusions
├── static/            # Frontend files
│   ├── index.html     # UI structure
│   ├── upload.js      # Upload logic
│   └── styles.css     # Styling
├── upload/            # Uploaded files storage
├── test_validators.py # Unit tests for validators
├── test_storage.py    # Unit tests for storage
└── README.md          # This file
```

## Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=dev --cov-report=term-missing

# Run specific test file
pytest test_validators.py
pytest test_storage.py
```

## Usage

### Upload a PDF File
1. Click "Choose PDF File" button
2. Select a PDF file from your local filesystem
3. Click "Upload File" button
4. Watch progress bar during upload
5. See success confirmation when complete

### File Requirements
- File type: PDF only (.pdf extension)
- Maximum size: 50 MB
- MIME type: application/pdf

### Error Handling
- Invalid file type: Error message displayed
- File too large: Error message displayed
- Network error: Error message with retry button
- Server error: Error message with retry button

## Configuration
Edit `config.py` to modify:
- `MAX_CONTENT_LENGTH`: Maximum file size (default: 50 MB)
- `UPLOAD_FOLDER`: Upload directory (default: 'upload')
- `ALLOWED_MIME_TYPE`: Allowed MIME type (default: 'application/pdf')

## Limitations
The following features are out of scope:
- Drag-and-drop file selection
- Multiple simultaneous file uploads
- File preview before upload
- Upload history or file management
- User authentication/authorization
- Virus/malware scanning
- Cloud storage integration
- Resumable uploads

## Development
- Backend: Python Flask
- Frontend: Vanilla JavaScript (no framework)
- Storage: Local filesystem
- Tests: pytest (backend), Playwright (end-to-end)

## Security Considerations
- Client and server-side validation (defense in depth)
- Filename sanitization using werkzeug.utils.secure_filename
- File size limits enforced
- MIME type validation
- No malware scanning (accepted risk per requirements)

## Troubleshooting

### Upload directory not found
The `upload/` directory is created automatically on first upload.

### File upload fails
- Check file size is under 50 MB
- Verify file is a valid PDF document
- Check network connection
- Try the retry button

### Server won't start
- Verify Python 3.11+ is installed
- Install dependencies: `pip install -r requirements.txt`
- Check port 5000 is not already in use

## License
Internal EPAM project for EPMCDMETST-39200
