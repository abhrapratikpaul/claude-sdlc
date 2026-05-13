# Implementation Plan

**Project:** PDF Document Upload Web Interface  
**Jira Ticket:** EPMCDMETST-39200  
**Date:** 2026-05-13  
**Version:** 1.0  
**Status:** READY FOR IMPLEMENTATION

---

## Overview

This implementation plan provides a dependency-ordered, step-by-step guide for building the PDF document upload system. The plan addresses all requirements (34 acceptance criteria), architecture specifications (3 components, 5 ADRs), and design review findings (2 major, 3 minor).

**Total Steps:** 11  
**Organized into:** 4 Waves  
**Estimated Duration:** 2-3 days  
**Target Directory:** `dev/`

---

## Design Review Resolutions

| Finding | Resolution in Plan |
|---------|-------------------|
| DR-001: MIME validation unclear | Step 4: Use Python `mimetypes.guess_type()` |
| DR-002: Filename edge cases | Step 5: Reject empty/invalid filenames with 400 error |
| DR-004: CORS not addressed | Step 2: Add flask-cors to requirements.txt |
| DR-005: Progress throttling | Step 9: Use `requestAnimationFrame` for throttling |

---

## Wave 0: Foundation (Steps 1-2)

### Step 1: Project Structure and Directory Setup

**Description:** Create the directory structure for the Python backend and static frontend files.

**Dependencies:** None

**Files to Create:**
- `dev/` (directory)
- `dev/static/` (directory)
- `dev/upload/` (directory - for uploaded files)
- `dev/README.md`

**Actions:**
1. Create `dev/` directory at project root
2. Create `dev/static/` subdirectory for HTML/JS/CSS
3. Create `dev/upload/` subdirectory for file storage
4. Create `dev/README.md` with setup instructions

**Acceptance Criteria Coverage:**
- Infrastructure for FR-008 (File Storage)

**Validation:**
- Verify directories exist with correct structure
- Verify `upload/` has write permissions

---

### Step 2: Backend Configuration and Dependencies

**Description:** Set up Python environment with Flask, flask-cors, and testing dependencies.

**Dependencies:** Step 1

**Files to Create:**
- `dev/requirements.txt`
- `dev/.gitignore`
- `dev/config.py`

**Actions:**
1. Create `requirements.txt` with:
   ```
   Flask==3.0.0
   flask-cors==4.0.0
   pytest==7.4.3
   pytest-cov==4.1.0
   ```
2. Create `.gitignore` excluding `upload/`, `__pycache__`, `.pyc`, `.env`
3. Create `config.py` with Flask configuration:
   - `MAX_CONTENT_LENGTH = 50 * 1024 * 1024` (50MB)
   - `UPLOAD_FOLDER = 'upload'`
   - `ALLOWED_MIME_TYPE = 'application/pdf'`

**Acceptance Criteria Coverage:**
- NFR-001: Upload timeout (Flask timeout config)
- FR-003: File size limit (MAX_CONTENT_LENGTH)
- DR-004: CORS support

**Validation:**
- Run `pip install -r requirements.txt` successfully
- Verify Flask version 3.x installed
- Verify config.py has correct constants

---

## Wave 1: Backend Core (Steps 3-5)

### Step 3: Flask Application with /upload Endpoint

**Description:** Create the main Flask application with the `/upload` endpoint and error handling.

**Dependencies:** Step 2

**Files to Create:**
- `dev/app.py`

**Actions:**
1. Create Flask app instance with CORS enabled
2. Serve static files from `dev/static/` at root `/`
3. Define `/upload` POST endpoint:
   - Accept `multipart/form-data`
   - Extract `file` field from request
   - Return JSON responses (success/error)
4. Define error handlers for 400, 413 (file too large), 500
5. Add basic logging to stdout

**Acceptance Criteria Coverage:**
- FR-009: Backend API endpoint (AC-020, AC-021, AC-022)
- FR-006: Success confirmation (AC-013, AC-014)
- FR-007: Error handling (AC-015, AC-016)

**Key Implementation Details:**
```python
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Validation (calls modules from Steps 4-5)
    # Storage (calls module from Step 5)
    
    return jsonify({
        'message': 'File uploaded successfully',
        'filename': safe_filename
    }), 200
```

**Validation:**
- Run Flask dev server on port 5000
- Verify `/` serves static files
- Verify `/upload` returns 400 for missing file
- Verify CORS headers present in response

---

### Step 4: File Validation Module

**Description:** Implement file type and size validation logic (addresses DR-001).

**Dependencies:** Step 2

**Files to Create:**
- `dev/validators.py`

**Actions:**
1. Create `validate_file_type(filename)` function:
   - Use `mimetypes.guess_type(filename)` (resolves DR-001)
   - Check MIME type is `application/pdf`
   - Return (is_valid: bool, error_message: str)
2. Create `validate_file_size(file)` function:
   - Read file size using `file.seek(0, os.SEEK_END)`
   - Check size <= 50MB (50 * 1024 * 1024 bytes)
   - Reset file pointer to start
   - Return (is_valid: bool, error_message: str)
3. Create `validate_file(file)` orchestrator function:
   - Call both validation functions
   - Return first validation error or None

**Acceptance Criteria Coverage:**
- FR-002: File type validation (AC-003, AC-004, AC-005)
- FR-003: File size validation (AC-006, AC-007)
- DR-001: MIME validation approach clarified

**Key Implementation Details:**
```python
import mimetypes

def validate_file_type(filename):
    mime_type, _ = mimetypes.guess_type(filename)
    if mime_type != 'application/pdf':
        return False, "Invalid file type. Please select a PDF document."
    return True, None
```

**Validation:**
- Unit test: `test_validate_file_type_pdf()` passes
- Unit test: `test_validate_file_type_non_pdf()` fails validation
- Unit test: `test_validate_file_size_valid()` passes
- Unit test: `test_validate_file_size_too_large()` fails validation

---

### Step 5: File Storage Handler

**Description:** Implement file storage logic with sanitization and edge case handling (addresses DR-002).

**Dependencies:** Step 2

**Files to Create:**
- `dev/storage.py`

**Actions:**
1. Create `save_file(file, upload_folder)` function:
   - Sanitize filename using `werkzeug.utils.secure_filename()`
   - Handle edge cases (resolves DR-002):
     - Empty filename after sanitization → return error
     - File with no extension → return error
     - Unicode/emoji stripped → proceed with sanitized name
   - Check if `upload_folder` exists, create if not
   - Save file with `file.save(os.path.join(upload_folder, safe_filename))`
   - Overwrite existing files (per user clarification)
   - Return (success: bool, safe_filename: str, error_message: str)

**Acceptance Criteria Coverage:**
- FR-008: File storage (AC-018, AC-019)
- DR-002: Filename sanitization edge cases

**Key Implementation Details:**
```python
from werkzeug.utils import secure_filename
import os

def save_file(file, upload_folder):
    original_filename = file.filename
    safe_filename = secure_filename(original_filename)
    
    # Edge case: empty filename after sanitization
    if not safe_filename or safe_filename == '':
        return False, None, "Invalid filename"
    
    # Edge case: no extension or not .pdf
    if not safe_filename.lower().endswith('.pdf'):
        return False, None, "Filename must end with .pdf"
    
    # Ensure upload directory exists
    os.makedirs(upload_folder, exist_ok=True)
    
    # Save file (overwrites if exists)
    filepath = os.path.join(upload_folder, safe_filename)
    file.save(filepath)
    
    return True, safe_filename, None
```

**Validation:**
- Unit test: `test_save_file_success()` creates file in upload/
- Unit test: `test_save_file_empty_filename()` returns error
- Unit test: `test_save_file_unicode_filename()` sanitizes correctly
- Unit test: `test_save_file_no_extension()` returns error
- Manual test: Upload file twice, verify overwrite behavior

---

## Wave 2: Frontend (Steps 6-9)

### Step 6: HTML UI Structure

**Description:** Create the HTML page with file selection UI and semantic accessibility.

**Dependencies:** Step 1

**Files to Create:**
- `dev/static/index.html`

**Actions:**
1. Create HTML5 boilerplate with semantic structure
2. Add `<input type="file" id="fileInput" accept=".pdf">` (hidden)
3. Add `<button id="selectFileBtn">Choose PDF File</button>` (visible)
4. Add `<div id="selectedFileName">` for displaying selected file
5. Add `<button id="uploadBtn">Upload File</button>` (initially disabled)
6. Add `<div id="progressContainer">` with `<progress>` element (hidden)
7. Add `<div id="messageArea">` for success/error messages
8. Add `<button id="retryBtn">Retry Upload</button>` (hidden)
9. Link `styles.css` and `upload.js`
10. Add ARIA labels and keyboard navigation attributes

**Acceptance Criteria Coverage:**
- FR-001: File selection interface (AC-001, AC-002)
- NFR-002: Web accessibility (AC-025, AC-026, AC-027)
- NFR-004: UI simplicity (AC-031, AC-032)

**Key Implementation Details:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Upload</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <main>
        <h1>PDF Document Upload</h1>
        <input type="file" id="fileInput" accept=".pdf" hidden aria-label="Select PDF file">
        <button id="selectFileBtn" type="button">Choose PDF File</button>
        <div id="selectedFileName" role="status"></div>
        <button id="uploadBtn" type="button" disabled>Upload File</button>
        <div id="progressContainer" hidden>
            <progress id="progressBar" value="0" max="100"></progress>
            <span id="progressText">0%</span>
        </div>
        <div id="messageArea" role="alert"></div>
        <button id="retryBtn" type="button" hidden>Retry Upload</button>
    </main>
    <script src="upload.js"></script>
</body>
</html>
```

**Validation:**
- Verify HTML5 validation passes
- Verify all interactive elements have labels
- Verify keyboard navigation works (Tab, Enter, Space)
- Test with screen reader (NVDA/JAWS) if available

---

### Step 7: CSS Styling

**Description:** Style the UI for clarity and usability.

**Dependencies:** Step 6

**Files to Create:**
- `dev/static/styles.css`

**Actions:**
1. Style layout (centered container, max-width 600px)
2. Style buttons with clear hover/focus states
3. Style progress bar with visible fill
4. Style message area with distinct colors:
   - Success messages: green background
   - Error messages: red background
5. Style disabled button state
6. Add focus indicators for keyboard navigation (2px outline)
7. Ensure minimum 44x44px touch targets for buttons

**Acceptance Criteria Coverage:**
- NFR-002: Accessibility (visible focus indicators)
- NFR-005: Performance (simple CSS, no animations >200ms)

**Validation:**
- Verify buttons have clear hover/focus states
- Verify focus indicators visible
- Verify touch targets meet 44x44px minimum
- Test in Chrome, Firefox, Safari, Edge

---

### Step 8: JavaScript Upload Logic and Validation

**Description:** Implement file selection, client-side validation, and upload transmission.

**Dependencies:** Step 6

**Files to Create/Modify:**
- `dev/static/upload.js`

**Actions:**
1. Add event listener: "Choose PDF File" button opens file dialog
2. On file selection:
   - Display filename in `#selectedFileName`
   - Enable "Upload File" button
   - Validate file type (extension and MIME type)
   - Validate file size (<50MB)
   - Display validation errors in `#messageArea`
3. On "Upload File" click:
   - Create `XMLHttpRequest` (not Fetch, per ADR-005)
   - Set 120-second timeout (NFR-001)
   - Prepare `FormData` with file
   - POST to `/upload`
   - Call progress handler (implemented in Step 9)
4. Handle responses:
   - Success (200): Display success message with filename
   - Error (400/500): Display error message
   - Timeout: Display "Upload failed due to network error"

**Acceptance Criteria Coverage:**
- FR-001: File selection (AC-001, AC-002)
- FR-002: File type validation (AC-003, AC-004, AC-005)
- FR-003: File size validation (AC-006, AC-007)
- FR-004: Upload transmission (AC-008, AC-009)
- NFR-001: Upload timeout (AC-023, AC-024)

**Key Implementation Details:**
```javascript
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const uploadBtn = document.getElementById('uploadBtn');

selectFileBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
        showError('Invalid file type. Please select a PDF document.');
        return;
    }
    if (file.type !== 'application/pdf') {
        showError('Invalid file type. Please select a PDF document.');
        return;
    }
    
    // Validate file size
    if (file.size > 50 * 1024 * 1024) {
        showError('File size exceeds 50 MB limit. Please select a smaller file.');
        return;
    }
    
    // Show filename and enable upload
    document.getElementById('selectedFileName').textContent = `Selected: ${file.name}`;
    uploadBtn.disabled = false;
});

uploadBtn.addEventListener('click', uploadFile);

function uploadFile() {
    const file = fileInput.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    const xhr = new XMLHttpRequest();
    xhr.timeout = 120000; // 2 minutes
    
    // Progress handler implemented in Step 9
    
    xhr.open('POST', '/upload');
    xhr.send(formData);
}
```

**Validation:**
- Select PDF: filename displays, upload button enables
- Select non-PDF: error message displays
- Select 60MB PDF: error message displays
- Upload valid PDF: request sent to backend

---

### Step 9: Progress Tracking and Error Handling

**Description:** Implement real-time progress tracking, error handling, and retry mechanism (addresses DR-005).

**Dependencies:** Step 8

**Files to Modify:**
- `dev/static/upload.js`

**Actions:**
1. Add `xhr.upload.onprogress` handler:
   - Calculate percentage: `(event.loaded / event.total) * 100`
   - Throttle updates using `requestAnimationFrame` (resolves DR-005)
   - Update progress bar value and text
   - Show progress container
2. Add `xhr.onload` handler:
   - Parse JSON response
   - If 200: Display success message
   - If 400/500: Display error message
   - Hide progress container
   - Show retry button on error
3. Add `xhr.onerror` handler:
   - Display "Upload failed due to network error. Please try again."
   - Show retry button
4. Add `xhr.ontimeout` handler:
   - Display "Upload failed due to network error. Please try again."
   - Show retry button
5. Add retry button click handler:
   - Hide retry button
   - Clear messages
   - Re-call `uploadFile()` (reuses selected file)

**Acceptance Criteria Coverage:**
- FR-005: Upload progress (AC-010, AC-011, AC-012)
- FR-006: Success confirmation (AC-013, AC-014)
- FR-007: Error handling and retry (AC-015, AC-016, AC-017)
- DR-005: Progress throttling with requestAnimationFrame

**Key Implementation Details:**
```javascript
let lastProgressUpdate = 0;

xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        
        // Throttle with requestAnimationFrame (resolves DR-005)
        const now = Date.now();
        if (now - lastProgressUpdate > 100) { // Update max 10 times/second
            requestAnimationFrame(() => {
                document.getElementById('progressBar').value = percentComplete;
                document.getElementById('progressText').textContent = `${percentComplete}%`;
            });
            lastProgressUpdate = now;
        }
        
        document.getElementById('progressContainer').hidden = false;
    }
};

xhr.onload = () => {
    document.getElementById('progressContainer').hidden = true;
    
    if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        showSuccess(`File uploaded successfully! Filename: ${response.filename}`);
    } else {
        const response = JSON.parse(xhr.responseText);
        showError(response.error || 'Upload failed. Please try again.');
        showRetryButton();
    }
};

xhr.onerror = () => {
    document.getElementById('progressContainer').hidden = true;
    showError('Upload failed due to network error. Please try again.');
    showRetryButton();
};

xhr.ontimeout = () => {
    document.getElementById('progressContainer').hidden = true;
    showError('Upload failed due to network error. Please try again.');
    showRetryButton();
};

document.getElementById('retryBtn').addEventListener('click', () => {
    document.getElementById('retryBtn').hidden = true;
    clearMessages();
    uploadFile(); // Reuses fileInput.files[0]
});
```

**Validation:**
- Upload valid PDF: progress bar updates 0% → 100%
- Simulate network error: error message + retry button appear
- Click retry: upload re-attempts without re-selecting file
- Upload completes: success message shows filename

---

## Wave 3: Integration & Testing (Steps 10-11)

### Step 10: Backend Unit Tests

**Description:** Write pytest unit tests for validation and storage modules.

**Dependencies:** Steps 4-5

**Files to Create:**
- `dev/test_validators.py`
- `dev/test_storage.py`

**Actions:**
1. Write tests for `validators.py`:
   - `test_validate_file_type_pdf()`: Valid PDF passes
   - `test_validate_file_type_jpg()`: JPEG fails validation
   - `test_validate_file_type_no_extension()`: No extension fails
   - `test_validate_file_size_valid()`: 10MB file passes
   - `test_validate_file_size_too_large()`: 60MB file fails
2. Write tests for `storage.py`:
   - `test_save_file_success()`: File created in upload/
   - `test_save_file_empty_filename()`: Returns error
   - `test_save_file_unicode()`: Unicode stripped correctly
   - `test_save_file_overwrite()`: Second save overwrites first
3. Run `pytest --cov=dev --cov-report=term-missing`

**Acceptance Criteria Coverage:**
- Validates FR-002 (file type validation)
- Validates FR-003 (file size validation)
- Validates FR-008 (file storage)
- Validates DR-002 (edge case handling)

**Validation:**
- All tests pass
- Code coverage >80%
- No test warnings or errors

---

### Step 11: Integration Testing and Smoke Tests

**Description:** Perform manual integration testing of the full upload workflow.

**Dependencies:** Steps 3-9

**Files to Create:**
- `dev/TESTING.md` (test results documentation)

**Actions:**
1. Start Flask dev server: `python app.py`
2. Open browser to `http://localhost:5000`
3. Test happy path:
   - Click "Choose PDF File" → file dialog opens
   - Select valid 5MB PDF → filename displays
   - Click "Upload File" → progress bar animates 0-100%
   - Verify success message appears
   - Verify file exists in `dev/upload/` directory
4. Test validation errors:
   - Select .jpg file → error message displays
   - Select 60MB PDF → error message displays
5. Test error handling:
   - Stop Flask server
   - Attempt upload → network error displays
   - Click retry button → upload re-attempts
6. Test browser compatibility:
   - Chrome, Firefox, Safari, Edge (latest 2 versions)
7. Test keyboard navigation:
   - Tab through all elements
   - Activate buttons with Enter/Space
8. Document results in `TESTING.md`

**Acceptance Criteria Coverage:**
- All 34 acceptance criteria (end-to-end validation)

**Validation:**
- All manual tests pass
- No console errors in browser
- File uploads successfully in all tested browsers
- Keyboard navigation works completely

---

## Dependency Graph

```
Step 1 (Project Setup)
  │
  └──> Step 2 (Backend Config)
         │
         ├──> Step 3 (Flask App) ──────┐
         │                              │
         ├──> Step 4 (Validators) ──────┤
         │                              ├──> Step 10 (Backend Tests)
         └──> Step 5 (Storage) ─────────┤                │
                │                       │                │
                └──> Step 6 (HTML) ──┐  │                │
                       │             │  │                │
                       ├──> Step 7 (CSS)                 │
                       │             │  │                │
                       └──> Step 8 (JS Upload) ──┐       │
                                     │           │       │
                                     └──> Step 9 (Progress) ─┐
                                                 │           │
                                                 └──> Step 11 (Integration Tests)
```

---

## File Manifest

| File Path | Purpose | Created in Step |
|-----------|---------|----------------|
| `dev/requirements.txt` | Python dependencies | 2 |
| `dev/.gitignore` | Git exclusions | 2 |
| `dev/config.py` | Flask configuration | 2 |
| `dev/app.py` | Flask application | 3 |
| `dev/validators.py` | File validation logic | 4 |
| `dev/storage.py` | File storage handler | 5 |
| `dev/static/index.html` | Frontend UI | 6 |
| `dev/static/styles.css` | Frontend styling | 7 |
| `dev/static/upload.js` | Upload logic | 8-9 |
| `dev/test_validators.py` | Unit tests | 10 |
| `dev/test_storage.py` | Unit tests | 10 |
| `dev/TESTING.md` | Test results | 11 |
| `dev/README.md` | Setup instructions | 1 |

---

## Success Criteria

Implementation is complete when:

1. ✅ All 11 steps executed successfully
2. ✅ All pytest unit tests pass with >80% coverage
3. ✅ Manual integration tests pass in 4 browsers
4. ✅ All 34 acceptance criteria validated
5. ✅ Design review findings (DR-001, DR-002, DR-004, DR-005) resolved
6. ✅ No console errors or warnings
7. ✅ File uploads successfully and is stored in `dev/upload/`
8. ✅ Keyboard navigation works completely
9. ✅ Ready for Phase 6 (Review) and Phase 7 (Verification)

---

## Known Limitations and Out of Scope

The following are explicitly OUT OF SCOPE per requirements:
- Drag-and-drop file selection
- Multiple simultaneous file uploads
- File preview before upload
- Upload history or file management
- User authentication/authorization
- Virus/malware scanning
- Cloud storage integration
- Resumable uploads
- Production deployment configuration

---

## Next Steps After Implementation

1. **Phase 6: Review**
   - Run `@sdlc-step-06-review` to perform structured code review
   - Address Critical/Major findings before Phase 7

2. **Phase 7: Verification**
   - Run `@sdlc-step-07-verify` to generate Playwright tests
   - Verify all acceptance criteria pass automated tests

3. **Phase 8: Pull Request**
   - Run `@sdlc-step-08-pr` to create GitHub PR
   - Include test evidence and reviewer checklist

---

**Document Status:** READY FOR IMPLEMENTATION  
**Next Phase:** Implementation (Phase 5)  
**Implementation Agent:** `@sdlc-step-05-implementation`
