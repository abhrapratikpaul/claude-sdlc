import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Test Suite: File Type and Size Validation
 * Covers: AC-003, AC-004, AC-005 (FR-002), AC-006, AC-007 (FR-003)
 */

test.describe('FR-002: File Type Validation', () => {

  test.beforeAll(() => {
    // Create fixtures directory if it doesn't exist
    const fixturesDir = path.join(__dirname, '../fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Create a valid PDF test file (minimal PDF structure)
    const validPdf = path.join(fixturesDir, 'valid.pdf');
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000317 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
409
%%EOF`;
    fs.writeFileSync(validPdf, pdfContent);

    // Create a JPEG file
    const jpegFile = path.join(fixturesDir, 'image.jpg');
    const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    fs.writeFileSync(jpegFile, jpegHeader);

    // Create a text file
    const txtFile = path.join(fixturesDir, 'document.txt');
    fs.writeFileSync(txtFile, 'This is a text file, not a PDF');

    // Create a file with .pdf extension but wrong content
    const fakePdf = path.join(fixturesDir, 'fake.pdf');
    fs.writeFileSync(fakePdf, 'This is not really a PDF');
  });

  test('AC-003: System checks file extension matches .pdf (case-insensitive)', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Test with .txt file - should show error
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'document.txt'));

    // Verify error message appears
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toContainText('Invalid file type. Please select a PDF document.', { timeout: 2000 });
  });

  test('AC-004: System verifies MIME type is application/pdf', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Select JPEG file
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'image.jpg'));

    // Verify error message
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toContainText('Invalid file type. Please select a PDF document.', { timeout: 2000 });
  });

  test('AC-005: Invalid file type displays error message', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Select non-PDF file
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'document.txt'));

    // Verify exact error message
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toHaveText('Invalid file type. Please select a PDF document.', { timeout: 2000 });

    // Verify upload button remains disabled
    const uploadButton = page.locator('#uploadBtn');
    await expect(uploadButton).toBeDisabled();
  });

  test('Valid PDF file passes client-side validation', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Select valid PDF
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'valid.pdf'));

    // Verify filename displays
    const filenameDisplay = page.locator('#selectedFileName');
    await expect(filenameDisplay).toContainText('Selected: valid.pdf', { timeout: 2000 });

    // Verify upload button is enabled
    const uploadButton = page.locator('#uploadBtn');
    await expect(uploadButton).toBeEnabled();
  });
});

test.describe('FR-003: File Size Validation', () => {

  test.beforeAll(() => {
    const fixturesDir = path.join(__dirname, '../fixtures');

    // Create a small valid PDF (already created in FR-002)
    // Create a large file (simulating >50MB)
    const largePdf = path.join(fixturesDir, 'large.pdf');
    const size51MB = 51 * 1024 * 1024; // 51 MB
    const buffer = Buffer.alloc(size51MB);
    // Add minimal PDF header
    buffer.write('%PDF-1.4\n', 0);
    fs.writeFileSync(largePdf, buffer);
  });

  test('AC-006: System rejects files larger than 50 MB', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Select large file
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'large.pdf'));

    // Verify error message appears
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toContainText('File size exceeds 50 MB limit', { timeout: 2000 });
  });

  test('AC-007: File exceeding limit shows specific error message', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Select large file
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'large.pdf'));

    // Verify exact error message
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toHaveText('File size exceeds 50 MB limit. Please select a smaller file.', { timeout: 2000 });

    // Verify upload button remains disabled
    const uploadButton = page.locator('#uploadBtn');
    await expect(uploadButton).toBeDisabled();
  });
});
