# Testing Documentation

## Overview
This document describes the testing strategy and results for the PDF Document Upload system.

## Testing Levels

### 1. Unit Tests (Backend)
**Framework:** pytest  
**Location:** `dev/test_*.py`  
**Coverage Target:** >80%

#### Test Files
- `test_validators.py` - File validation logic tests
- `test_storage.py` - File storage handler tests

#### Running Unit Tests
```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=dev --cov-report=term-missing

# Run specific test file
pytest test_validators.py -v
pytest test_storage.py -v

# Run specific test class
pytest test_validators.py::TestValidateFileType -v

# Run specific test
pytest test_validators.py::TestValidateFileType::test_validate_file_type_pdf -v
```

### 2. Integration Tests (Manual)
**Browser:** Chrome, Firefox, Safari, Edge  
**Location:** Manual testing via web interface

#### Test Scenarios

##### Happy Path
1. Start server: `python app.py`
2. Open browser: `http://localhost:5000`
3. Click "Choose PDF File"
4. Select valid 5 MB PDF
5. Verify filename displays
6. Click "Upload File"
7. Verify progress bar animates 0-100%
8. Verify success message appears
9. Verify file exists in `upload/` directory

##### Error Scenarios

**Invalid File Type (JPEG)**
1. Select .jpg file
2. Verify error message: "Invalid file type. Please select a PDF document."
3. Verify upload button remains disabled

**File Too Large (60 MB)**
1. Select 60 MB PDF
2. Verify error message: "File size exceeds 50 MB limit. Please select a smaller file."
3. Verify upload button remains disabled

**Network Error**
1. Select valid PDF
2. Stop Flask server
3. Click "Upload File"
4. Verify error message: "Upload failed due to network error. Please try again."
5. Verify retry button appears
6. Restart server
7. Click "Retry Upload"
8. Verify upload succeeds

### 3. Verification Tests (Playwright)
**Framework:** Playwright + TypeScript  
**Location:** `test-automation/` (created in SDLC Phase 7)

These tests will be created in Phase 7 (Verification) to validate all acceptance criteria.

## Test Coverage

### Functional Requirements Coverage

| Requirement | Unit Tests | Integration Tests | Playwright Tests |
|-------------|-----------|------------------|------------------|
| FR-001: File Selection | N/A | ✓ Manual | Phase 7 |
| FR-002: File Type Validation | ✓ test_validators.py | ✓ Manual | Phase 7 |
| FR-003: File Size Validation | ✓ test_validators.py | ✓ Manual | Phase 7 |
| FR-004: Upload Transmission | N/A | ✓ Manual | Phase 7 |
| FR-005: Progress Tracking | N/A | ✓ Manual | Phase 7 |
| FR-006: Success Confirmation | N/A | ✓ Manual | Phase 7 |
| FR-007: Error Handling | N/A | ✓ Manual | Phase 7 |
| FR-008: File Storage | ✓ test_storage.py | ✓ Manual | Phase 7 |
| FR-009: Backend API | ✓ (indirect) | ✓ Manual | Phase 7 |

### Design Review Findings Coverage

| Finding | Resolution | Tests |
|---------|-----------|-------|
| DR-001: MIME validation | Use mimetypes module | test_validators.py::TestValidateFileType |
| DR-002: Filename edge cases | Handle empty, unicode, no extension | test_storage.py::TestSaveFile |
| DR-004: CORS support | Added flask-cors | Manual browser testing |
| DR-005: Progress throttling | requestAnimationFrame | Manual browser testing |

## Accessibility Testing

### Keyboard Navigation
- Tab through all interactive elements
- Activate buttons with Enter/Space
- Verify focus indicators visible (2px outline)

### Screen Reader Testing (Optional)
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS)

### WCAG 2.1 Level AA Compliance
- Semantic HTML elements
- ARIA labels and roles
- Keyboard accessibility
- Focus management
- Color contrast

## Browser Compatibility

### Target Browsers
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Test Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| File selection | Manual | Manual | Manual | Manual |
| Validation | Manual | Manual | Manual | Manual |
| Upload | Manual | Manual | Manual | Manual |
| Progress | Manual | Manual | Manual | Manual |
| Error handling | Manual | Manual | Manual | Manual |
| Retry | Manual | Manual | Manual | Manual |

## Performance Testing

### UI Response Time (NFR-005)
- Validation feedback: <200ms
- Button interactions: <200ms
- Progress updates: ≥1 Hz (once per second)

### Upload Timeout (NFR-001)
- Timeout: 120 seconds (2 minutes)
- Verified with network throttling

## Security Testing

### File Validation
- Extension check (client and server)
- MIME type check (client and server)
- File size limit enforcement

### Filename Sanitization
- Path traversal prevention (../)
- Unicode/emoji handling
- Special character handling
- Empty filename rejection

### Known Limitations (Accepted Risks)
- MIME type spoofing possible (per NFR-003)
- No virus/malware scanning
- No authentication/authorization

## Test Data

### Valid Test Files
- `small.pdf` - 1 MB valid PDF
- `medium.pdf` - 25 MB valid PDF
- `large.pdf` - 50 MB valid PDF (at limit)

### Invalid Test Files
- `too_large.pdf` - 60 MB PDF (over limit)
- `image.jpg` - JPEG image
- `document.txt` - Text file
- `no_extension` - File with no extension
- `empty.pdf` - 0 byte file

## Test Results

### Unit Test Results
```
Run: pytest --cov=dev --cov-report=term-missing
```

**Expected Results:**
- All tests pass
- Code coverage >80%
- No warnings or errors

### Integration Test Results

**Status:** To be executed in Step 11 of implementation plan

**Test Environment:**
- OS: Windows 11
- Browser: Chrome 123
- Python: 3.11+
- Flask: 3.0.0

**Results:** (To be filled after manual testing)
- [ ] Happy path test passed
- [ ] Invalid file type test passed
- [ ] File too large test passed
- [ ] Network error test passed
- [ ] Retry mechanism test passed
- [ ] Browser compatibility tests passed
- [ ] Keyboard navigation tests passed

## Defects and Issues

### Open Issues
None at this time.

### Resolved Issues
None at this time.

## Continuous Testing

### Pre-commit Checks
1. Run unit tests: `pytest`
2. Check code coverage: `pytest --cov=dev`
3. Verify no lint errors

### CI/CD Integration (Future)
- Automated unit tests on commit
- Automated Playwright tests on PR
- Coverage reporting

## Test Maintenance

### Adding New Tests
1. Add test cases to appropriate test file
2. Follow existing naming conventions
3. Update this documentation
4. Ensure test passes locally before committing

### Updating Existing Tests
1. Update test code
2. Verify all related tests still pass
3. Update documentation if behavior changes

## References

- Requirements: `requirements.md`
- Architecture: `architecture.md`
- Implementation Plan: `impl-plan.md`
- Design Review: `design-review.md`

---

**Document Status:** COMPLETE  
**Last Updated:** 2026-05-13  
**Next Update:** After manual integration testing (Step 11)
