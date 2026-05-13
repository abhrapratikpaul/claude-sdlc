/**
 * PDF Upload Interface - Client-side Logic
 * Handles file selection, validation, upload transmission, and progress tracking.
 */

// DOM element references
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const uploadBtn = document.getElementById('uploadBtn');
const selectedFileName = document.getElementById('selectedFileName');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const messageArea = document.getElementById('messageArea');
const retryBtn = document.getElementById('retryBtn');

// Constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const UPLOAD_TIMEOUT = 120000; // 2 minutes (120 seconds)

// Progress throttling (resolves DR-005)
let lastProgressUpdate = 0;

/**
 * Initialize event listeners
 */
function init() {
    selectFileBtn.addEventListener('click', handleSelectFile);
    fileInput.addEventListener('change', handleFileChange);
    uploadBtn.addEventListener('click', handleUpload);
    retryBtn.addEventListener('click', handleRetry);
}

/**
 * Open file selection dialog
 */
function handleSelectFile() {
    fileInput.click();
}

/**
 * Handle file selection and validation
 */
function handleFileChange() {
    const file = fileInput.files[0];

    if (!file) {
        return;
    }

    // Clear previous messages
    clearMessages();

    // Validate file type - extension check
    if (!file.name.toLowerCase().endsWith('.pdf')) {
        showError('Invalid file type. Please select a PDF document.');
        resetFileInput();
        return;
    }

    // Validate file type - MIME type check
    if (file.type !== 'application/pdf') {
        showError('Invalid file type. Please select a PDF document.');
        resetFileInput();
        return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        showError('File size exceeds 50 MB limit. Please select a smaller file.');
        resetFileInput();
        return;
    }

    // Display selected filename
    selectedFileName.textContent = `Selected: ${file.name}`;

    // Enable upload button
    uploadBtn.disabled = false;
}

/**
 * Handle upload button click
 */
function handleUpload() {
    const file = fileInput.files[0];

    if (!file) {
        showError('No file selected');
        return;
    }

    // Disable upload button during upload
    uploadBtn.disabled = true;

    // Clear previous messages
    clearMessages();

    // Perform upload
    uploadFile(file);
}

/**
 * Upload file to server with progress tracking
 */
function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    // Set timeout (NFR-001: 2 minutes)
    xhr.timeout = UPLOAD_TIMEOUT;

    // Progress tracking (FR-005)
    xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);

            // Throttle progress updates using requestAnimationFrame (resolves DR-005)
            const now = Date.now();
            if (now - lastProgressUpdate > 100) { // Update max 10 times per second
                requestAnimationFrame(() => {
                    progressBar.value = percentComplete;
                    progressText.textContent = `${percentComplete}%`;
                });
                lastProgressUpdate = now;
            }

            // Show progress container
            progressContainer.hidden = false;
        }
    };

    // Upload complete
    xhr.onload = function() {
        // Hide progress container
        progressContainer.hidden = true;

        if (xhr.status === 200) {
            // Success (FR-006)
            try {
                const response = JSON.parse(xhr.responseText);
                showSuccess(`File uploaded successfully! Filename: ${response.filename}`);
                resetFileInput();
            } catch (e) {
                showError('Upload completed but response was invalid.');
            }
        } else {
            // Error response from server (FR-007)
            try {
                const response = JSON.parse(xhr.responseText);
                showError(response.error || 'Upload failed. Please try again.');
            } catch (e) {
                if (xhr.status === 413) {
                    showError('File size exceeds 50 MB limit. Please select a smaller file.');
                } else if (xhr.status >= 500) {
                    showError('Upload failed due to server error. Please try again later.');
                } else {
                    showError('Upload failed. Please try again.');
                }
            }
            showRetryButton();
        }

        // Re-enable upload button
        uploadBtn.disabled = false;
    };

    // Network error (FR-007)
    xhr.onerror = function() {
        progressContainer.hidden = true;
        showError('Upload failed due to network error. Please try again.');
        showRetryButton();
        uploadBtn.disabled = false;
    };

    // Timeout error (NFR-001, FR-007)
    xhr.ontimeout = function() {
        progressContainer.hidden = true;
        showError('Upload failed due to network error. Please try again.');
        showRetryButton();
        uploadBtn.disabled = false;
    };

    // Send request
    xhr.open('POST', '/upload');
    xhr.send(formData);
}

/**
 * Handle retry button click
 */
function handleRetry() {
    const file = fileInput.files[0];

    if (!file) {
        showError('No file selected');
        return;
    }

    // Hide retry button
    retryBtn.hidden = true;

    // Clear messages
    clearMessages();

    // Retry upload
    uploadFile(file);
}

/**
 * Display success message
 */
function showSuccess(message) {
    messageArea.textContent = message;
    messageArea.className = 'message-area success';
}

/**
 * Display error message
 */
function showError(message) {
    messageArea.textContent = message;
    messageArea.className = 'message-area error';
}

/**
 * Clear all messages
 */
function clearMessages() {
    messageArea.textContent = '';
    messageArea.className = 'message-area';
}

/**
 * Show retry button
 */
function showRetryButton() {
    retryBtn.hidden = false;
}

/**
 * Reset file input and UI state
 */
function resetFileInput() {
    fileInput.value = '';
    selectedFileName.textContent = '';
    uploadBtn.disabled = true;
    retryBtn.hidden = true;
    progressContainer.hidden = true;
    progressBar.value = 0;
    progressText.textContent = '0%';
}

// Initialize application
init();
