# Architecture Document

**Project:** PDF Document Upload Web Interface  
**Jira Ticket:** EPMCDMETST-39200  
**Date:** 2026-05-13  
**Version:** 1.0  
**Status:** APPROVED FOR IMPLEMENTATION

## Executive Summary

This document describes the technical architecture for a web-based PDF document upload system. The architecture consists of three primary components: a lightweight HTML/JavaScript frontend, a Python Flask backend API, and local filesystem storage. The design prioritizes simplicity, testability, and alignment with the specified requirements while avoiding premature optimization.

## System Context

```
┌─────────────┐
│   Browser   │
│   (User)    │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────────────┐
│       Web Frontend (HTML/JS)        │
│  - File selection UI                │
│  - Client-side validation           │
│  - Progress tracking                │
│  - Error handling                   │
└──────┬──────────────────────────────┘
       │ HTTP POST /upload
       │ (multipart/form-data)
       ▼
┌─────────────────────────────────────┐
│    Backend API (Python Flask)       │
│  - Request handling                 │
│  - Server-side validation           │
│  - File storage                     │
│  - Error responses                  │
└──────┬──────────────────────────────┘
       │ Write file
       ▼
┌─────────────────────────────────────┐
│   File Storage (Local Filesystem)   │
│         upload/ directory           │
└─────────────────────────────────────┘
```

## Component Architecture

### Component 1: Web Frontend

**Location:** `dev/static/`  
**Technology:** HTML5 + Vanilla JavaScript  
**Responsibilities:**
- Render file selection UI with labeled button
- Validate file type (extension + MIME) client-side
- Validate file size (<50MB) client-side
- Display validation errors to user
- Transmit file to backend via XMLHttpRequest
- Track and display upload progress (0-100%)
- Handle success/error responses
- Provide retry mechanism on failure

**Key Files:**
- `index.html` - UI structure and layout
- `upload.js` - Upload logic and progress tracking
- `styles.css` - Basic styling

**Interface Contract:**
- **Outbound:** HTTP POST to `/upload` endpoint
  - Method: POST
  - Content-Type: multipart/form-data
  - Body: Form field `file` containing PDF binary data
  - Timeout: 120 seconds (2 minutes)

- **Inbound:** HTTP responses from backend
  - Success: 200 OK with JSON `{"message": "File uploaded successfully", "filename": "..."}`
  - Client error: 400 Bad Request with JSON `{"error": "..."}`
  - Server error: 500 Internal Server Error with JSON `{"error": "..."}`

**Non-Functional Characteristics:**
- No external dependencies (CDN-free for reliability)
- Keyboard accessible (Tab navigation, Enter/Space activation)
- Semantic HTML for screen reader compatibility
- UI response time <200ms for validation feedback

---

### Component 2: Backend API

**Location:** `dev/app.py`  
**Technology:** Python 3.11 + Flask  
**Responsibilities:**
- Expose `/upload` HTTP endpoint
- Parse multipart/form-data requests
- Validate file type (MIME type check)
- Validate file size (<50MB)
- Generate safe filename or overwrite existing
- Write file to `upload/` directory
- Return success/error JSON responses
- Handle exceptions gracefully

**Key Files:**
- `app.py` - Flask application and routes
- `requirements.txt` - Python dependencies (Flask)

**Interface Contract:**
- **Inbound:** HTTP POST to `/upload`
  - Method: POST
  - Content-Type: multipart/form-data
  - Body: File field named `file`
  - Constraints: Max 50MB, PDF only

- **Outbound:** HTTP responses
  - 200 OK: `{"message": "File uploaded successfully", "filename": "example.pdf"}`
  - 400 Bad Request: `{"error": "Invalid file type"}`
  - 400 Bad Request: `{"error": "File size exceeds 50 MB limit"}`
  - 400 Bad Request: `{"error": "No file provided"}`
  - 500 Internal Server Error: `{"error": "Internal server error"}`

- **File System:**
  - Write to: `upload/<filename>`
  - Overwrite policy: Replace existing file with same name
  - Permissions: Standard OS permissions (no special ACLs)

**Non-Functional Characteristics:**
- Request timeout: 120 seconds
- Concurrent request handling (Flask WSGI server)
- Basic error logging to stdout/stderr
- No authentication/authorization (out of scope)

---

### Component 3: File Storage

**Location:** `upload/` directory (relative to app root)  
**Technology:** Local filesystem  
**Responsibilities:**
- Persist uploaded PDF files
- Overwrite files with duplicate names
- Provide read access for downstream processing

**Storage Schema:**
- Directory: `upload/`
- File naming: Original filename from user (sanitized if needed)
- Metadata: None (filesystem timestamps only)

**Non-Functional Characteristics:**
- No disk quota enforcement (monitoring required)
- No file versioning
- No automatic cleanup/archival

## Data Flow

### Happy Path: Successful Upload

```
User                Frontend              Backend              Filesystem
 |                     |                     |                      |
 |--Click "Choose"--->|                     |                      |
 |                     |                     |                      |
 |<--File Dialog------|                     |                      |
 |                     |                     |                      |
 |--Select file.pdf-->|                     |                      |
 |                     |                     |                      |
 |                     |--Validate ext----->|                      |
 |                     |    & MIME           |                      |
 |                     |    & size           |                      |
 |                     |                     |                      |
 |<--Progress 0%------|                     |                      |
 |                     |                     |                      |
 |                     |--POST /upload----->|                      |
 |                     |   (multipart)       |                      |
 |                     |                     |                      |
 |<--Progress 25%-----|                     |                      |
 |<--Progress 50%-----|                     |                      |
 |<--Progress 75%-----|                     |                      |
 |                     |                     |--Write file-------->|
 |                     |                     |                      |
 |                     |<--200 OK-----------|                      |
 |                     |   {"message"...}    |                      |
 |                     |                     |                      |
 |<--Progress 100%----|                     |                      |
 |<--Success msg------|                     |                      |
```

### Error Path: File Too Large

```
User                Frontend              Backend              Filesystem
 |                     |                     |                      |
 |--Select 60MB.pdf-->|                     |                      |
 |                     |                     |                      |
 |                     |--Validate size---->|                      |
 |                     |   (60MB > 50MB)     |                      |
 |                     |                     |                      |
 |<--Error message----|                     |                      |
 |  "File size exceeds |                     |                      |
 |   50 MB limit"      |                     |                      |
 |                     |                     |                      |
 | (Upload never sent to backend)            |                      |
```

### Error Path: Network Failure

```
User                Frontend              Backend              Filesystem
 |                     |                     |                      |
 |--Select file.pdf-->|                     |                      |
 |                     |                     |                      |
 |<--Progress 0%------|                     |                      |
 |                     |                     |                      |
 |                     |--POST /upload----->|                      |
 |                     |   (multipart)       |                      |
 |                     |                     |                      |
 |<--Progress 45%-----|                     |                      |
 |                     |                     |                      |
 |                     |  X-- Network ----  |                      |
 |                     |      failure        |                      |
 |                     |                     |                      |
 |<--Error message----|                     |                      |
 |  "Upload failed     |                     |                      |
 |   due to network    |                     |                      |
 |   error. Please     |                     |                      |
 |   try again."       |                     |                      |
 |                     |                     |                      |
 |<--Retry button-----|                     |                      |
```

## Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend | HTML5 + Vanilla JS | No build toolchain; instant dev cycle; native progress events (ADR-002, ADR-005) |
| HTTP Client | XMLHttpRequest | Native progress tracking support (ADR-005) |
| Backend Framework | Python Flask | Simpler than FastAPI for single-endpoint use case (ADR-001) |
| Python Version | 3.11+ | Type hints, improved error messages, required by Flask 3.x |
| File Storage | Local Filesystem | Meets requirements; no cloud complexity (ADR-003) |
| Verification Tests | Playwright + TypeScript | Required by SDLC Phase 7 |
| Unit Tests | pytest | Standard Python testing framework |

## Architecture Decision Records (ADRs)

### ADR-001: Use Flask instead of FastAPI

**Context:** Requirements specify Python backend; both Flask and FastAPI are viable.

**Decision:** Use Flask.

**Rationale:**
- Simpler for single-endpoint application
- Less boilerplate than FastAPI async patterns
- Mature ecosystem and documentation
- Synchronous model sufficient for file uploads

**Consequences:**
- No automatic OpenAPI schema generation
- No native async support (not needed for this use case)
- Slightly slower than FastAPI (negligible for file I/O bound workload)

---

### ADR-002: Use Vanilla JavaScript instead of React/Vue

**Context:** Requirements specify single standalone page; modern frameworks add complexity.

**Decision:** Use Vanilla JavaScript (no framework).

**Rationale:**
- No build toolchain required (npm, webpack, etc.)
- Faster development iteration
- No bundle size concerns
- Simpler deployment (static files only)
- Easier verification testing (no framework-specific selectors)

**Consequences:**
- No reactive UI state management (manual DOM manipulation)
- Less developer familiarity in larger teams
- No component reusability (acceptable for single-page app)

---

### ADR-003: Use Local Filesystem Storage

**Context:** Requirements specify local `upload/` directory; cloud storage not required.

**Decision:** Use local filesystem with `upload/` directory.

**Rationale:**
- Meets requirements exactly
- Zero external dependencies
- Simplest implementation
- No network latency for storage
- No cloud credentials/configuration needed

**Consequences:**
- No horizontal scalability (single server)
- No automatic redundancy/backup
- Disk space management required
- Not suitable for production multi-server deployments

---

### ADR-004: Validate on Client and Server

**Context:** File validation (type, size) can occur client-side or server-side.

**Decision:** Validate on both client and server ("defense in depth").

**Rationale:**
- Client validation provides immediate feedback (better UX)
- Server validation prevents bypass (security)
- Requirements specify error messages for validation failures
- Minimal code duplication

**Consequences:**
- Validation logic must be kept consistent
- Slightly more complex than single-layer validation
- Better security and user experience

---

### ADR-005: Use XMLHttpRequest over Fetch API

**Context:** Both XMLHttpRequest and Fetch API can send files via HTTP.

**Decision:** Use XMLHttpRequest.

**Rationale:**
- Native progress event support (`xhr.upload.onprogress`)
- No polyfill/wrapper needed for progress tracking
- Requirements mandate progress indicator (FR-005)
- Fetch API progress tracking requires complex ReadableStream processing

**Consequences:**
- Older API (less modern syntax)
- Cannot use async/await directly (callback-based)
- Acceptable trade-off for built-in progress events

## Security Considerations

1. **File Type Validation:**
   - Client: Check file extension (`.pdf`)
   - Client: Check MIME type (`application/pdf`)
   - Server: Re-check MIME type (defense in depth)
   - **Limitation:** MIME type spoofing possible; accepted risk (no malware scanning per NFR-003)

2. **File Size Limits:**
   - Client: Reject files >50MB before upload
   - Server: Enforce 50MB limit (Flask `MAX_CONTENT_LENGTH` config)
   - **Mitigation:** Prevents DoS via large file uploads

3. **Filename Handling:**
   - Backend will sanitize filenames to prevent directory traversal (`../`, absolute paths)
   - Use `werkzeug.utils.secure_filename()` utility

4. **Error Information Disclosure:**
   - Server errors return generic "Internal server error" message
   - Detailed errors logged server-side only (not sent to client)

5. **Out of Scope (per NFR-003):**
   - No virus/malware scanning
   - No authentication/authorization
   - No CSRF protection (no session state)

## Performance Characteristics

| Metric | Target | Method |
|--------|--------|--------|
| UI Response Time | <200ms | Client validation is synchronous JS |
| Upload Timeout | 120 seconds | XMLHttpRequest timeout property |
| Progress Update Frequency | ≥1 Hz (once/sec) | `onprogress` event throttling |
| Server Response Time | <2 seconds | File write is disk I/O bound |
| Concurrent Uploads | 10+ | Flask WSGI default worker pool |

## Scalability Considerations

**Current Design:**
- Single-server deployment
- Local filesystem storage
- No load balancing

**Future Scalability (Out of Scope):**
- Cloud storage (S3, Azure Blob) for multi-server deployments
- Load balancer for horizontal scaling
- Database for upload metadata tracking
- Async task queue for post-upload processing

## Testing Strategy

### Unit Tests (pytest)
- Backend validation logic (file type, size)
- Filename sanitization
- Error response formatting

### Integration Tests (Playwright)
- End-to-end upload flow (AC-001 through AC-017)
- File selection UI
- Client validation error messages
- Progress tracking
- Success confirmation
- Error handling and retry

## Deployment Architecture

**Development:**
```
Flask dev server (localhost:5000)
├── app.py
├── static/
│   ├── index.html
│   ├── upload.js
│   └── styles.css
└── upload/ (auto-created)
```

**Production (Out of Scope):**
- Use production WSGI server (gunicorn, uWSGI)
- Reverse proxy (nginx, Apache)
- HTTPS termination
- Disk monitoring and alerting

## Open Questions

1. **Filename Strategy:** Should backend generate UUID filenames instead of overwriting originals? (Assumed: overwrite per user clarification)

2. **MIME Detection Library:** Use Python `mimetypes` module or `python-magic` library? (Recommendation: `mimetypes` for simplicity)

3. **Production Deployment:** What is the target production environment? (Assumed: out of scope for current phase)

4. **WCAG Testing:** Should Playwright tests include automated accessibility checks? (Recommendation: yes, using `@axe-core/playwright`)

## Requirements Traceability

| Requirement ID | Architecture Component | Implementation Notes |
|----------------|----------------------|---------------------|
| FR-001 | Frontend UI | `<input type="file">` element |
| FR-002 | Frontend + Backend | Client: JS validation; Server: MIME check |
| FR-003 | Frontend + Backend | Client: `file.size` check; Server: Flask `MAX_CONTENT_LENGTH` |
| FR-004 | Frontend HTTP Client | XMLHttpRequest with `multipart/form-data` |
| FR-005 | Frontend Progress Tracking | `xhr.upload.onprogress` event handler |
| FR-006 | Frontend UI | Display backend success response |
| FR-007 | Frontend Error Handling | Try/catch + retry button |
| FR-008 | Backend Storage | Write to `upload/` directory |
| FR-009 | Backend API | Flask route `/upload` |
| NFR-001 | Frontend HTTP Client | `xhr.timeout = 120000` |
| NFR-002 | Frontend UI | Semantic HTML, keyboard nav |
| NFR-003 | Frontend + Backend | Dual validation (no virus scan) |
| NFR-004 | Frontend UI | Single HTML page |
| NFR-005 | Frontend UI | Synchronous validation <200ms |
| NFR-006 | Frontend UI | Standard HTML5/ES6 |

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Large file timeout on slow connections | High | Medium | 2-minute timeout buffer; client validation rejects >50MB early |
| Disk space exhaustion | High | Low | Add disk monitoring; document cleanup procedures |
| Concurrent upload race conditions | Medium | Low | Flask WSGI handles concurrency; OS atomic file writes |
| Client validation bypass | Medium | Medium | Mandatory server-side re-validation |
| MIME type spoofing | Low | High | Accepted risk per NFR-003 (no malware scanning) |

---

**Document Status:** APPROVED FOR IMPLEMENTATION  
**Next Phase:** Design Review (design-review.md)  
**Implementation Phase:** Phase 5 (impl-plan.md prerequisite)
