# User Story: EPMCDMETST-39200

**Title:** Users can upload a single PDF document through the UI

**Priority:** Low  
**Status:** Open  
**Created:** 2026-04-17  
**Jira Link:** https://jiraeu.epam.com/browse/EPMCDMETST-39200

---

## Story

As a user,  
I want to upload a PDF document through an intuitive interface,  
SO THAT I can begin the document processing pipeline.

---

## Acceptance Criteria

### Primary Requirements

1. **File Selection**  
   Given the upload page is open, when the user clicks "Choose File", then a file dialog appears allowing PDF selection.

2. **File Upload**  
   Given a PDF file is selected, when the user clicks "Upload", then the file is transmitted to the server with a success message.

3. **Upload Confirmation**  
   Given a file is uploaded, when the upload completes, then a confirmation shows the document name and upload timestamp.

4. **Invalid File Type Validation**  
   Given invalid file types are selected, when upload is attempted, then an error message displays stating "Only PDF files are allowed".

5. **File Size Validation**  
   Given the file size exceeds the limit (e.g., 50MB), when upload is attempted, then an error message displays with the size restriction.

### Additional Requirements

6. **Upload Progress Indicator**  
   Given the file is being uploaded, when the progress bar is visible, then it shows real-time upload percentage.

7. **Retry on Failure**  
   Given a file upload fails due to network, when the error is shown, then a "Retry" button is available.

---

## Labels
- AI-Generated

---

## Notes
- This is a Jira ticket from the EPAM-CDME-TEST project
- Focus is on single PDF upload functionality with comprehensive validation and error handling
