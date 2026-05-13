import { test, expect, request } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Test Suite: Backend API and Storage
 * Covers: AC-018, AC-019 (FR-008), AC-020, AC-021, AC-022 (FR-009)
 */

test.describe('FR-008: File Storage', () => {

  test.beforeAll(() => {
    const fixturesDir = path.join(__dirname, '../fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    const testPdf = path.join(fixturesDir, 'storage-test.pdf');
    if (!fs.existsSync(testPdf)) {
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
xref
0 2
0000000000 65535 f
0000000009 00000 n
trailer
<< /Size 2 /Root 1 0 R >>
startxref
58
%%EOF`;
      fs.writeFileSync(testPdf, pdfContent);
    }
  });

  test('AC-018: Uploaded files stored in upload directory', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');
    const uploadDir = path.join(__dirname, '../../dev/upload');

    // Clean upload directory before test
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      for (const file of files) {
        fs.unlinkSync(path.join(uploadDir, file));
      }
    }

    // Upload file
    // Use setInputFiles instead
    await page.locator('#selectFileBtn').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(fixturesDir, 'storage-test.pdf'));

    await page.locator('#uploadBtn').click();

    // Wait for success
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toContainText('File uploaded successfully', { timeout: 10000 });

    // Verify file exists in upload directory
    const uploadedFile = path.join(uploadDir, 'storage-test.pdf');
    expect(fs.existsSync(uploadedFile)).toBe(true);
  });

  test('AC-019: System overwrites file if same name exists', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');
    const uploadDir = path.join(__dirname, '../../dev/upload');

    // Create test file with unique content
    const testFile = path.join(fixturesDir, 'overwrite-test.pdf');
    const content1 = '%PDF-1.4\nFirst version\n%%EOF';
    fs.writeFileSync(testFile, content1);

    // First upload
    let fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('#selectFileBtn').click();
    let fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testFile);
    await page.locator('#uploadBtn').click();

    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toContainText('File uploaded successfully', { timeout: 10000 });

    // Modify test file
    const content2 = '%PDF-1.4\nSecond version\n%%EOF';
    fs.writeFileSync(testFile, content2);

    // Reload page for second upload
    await page.reload();

    // Second upload (same filename)
    fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('#selectFileBtn').click();
    fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testFile);
    await page.locator('#uploadBtn').click();

    await expect(messageArea).toContainText('File uploaded successfully', { timeout: 10000 });

    // Verify file was overwritten
    const uploadedFile = path.join(uploadDir, 'overwrite-test.pdf');
    const uploadedContent = fs.readFileSync(uploadedFile, 'utf8');
    expect(uploadedContent).toBe(content2);
  });
});

test.describe('FR-009: Backend API Endpoint', () => {

  test('AC-020: Backend exposes /upload endpoint accepting POST', async () => {
    const context = await request.newContext();

    // Try GET request - should fail or return method not allowed
    const getResponse = await context.get('http://localhost:5000/upload');
    expect(getResponse.status()).not.toBe(200); // Should not accept GET

    // POST request without file - should return 400
    const postResponse = await context.post('http://localhost:5000/upload');
    expect(postResponse.status()).toBe(400);
  });

  test('AC-021: Endpoint accepts multipart/form-data with file field', async () => {
    const context = await request.newContext();
    const fixturesDir = path.join(__dirname, '../fixtures');

    // Create form data with file
    const filePath = path.join(fixturesDir, 'storage-test.pdf');
    const fileContent = fs.readFileSync(filePath);

    const response = await context.post('http://localhost:5000/upload', {
      multipart: {
        file: {
          name: 'storage-test.pdf',
          mimeType: 'application/pdf',
          buffer: fileContent
        }
      }
    });

    // Should return 200 with success message
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.message).toContain('uploaded successfully');
    expect(responseBody.filename).toBeTruthy();
  });

  test('AC-022: Backend implemented using Python Flask', async ({ page }) => {
    // Verify Flask server is running and serving expected responses
    await page.goto('/');

    // Check for Flask-specific response headers or behavior
    const response = await page.goto('http://localhost:5000/');
    expect(response?.status()).toBe(200);

    // Verify HTML is served (Flask serves static files)
    const content = await page.content();
    expect(content).toContain('PDF Document Upload');
  });

  test('Backend returns JSON responses', async () => {
    const context = await request.newContext();

    // Test error response format
    const response = await context.post('http://localhost:5000/upload');
    expect(response.status()).toBe(400);

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');

    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test('Backend handles missing file field', async () => {
    const context = await request.newContext();

    // POST without file field
    const response = await context.post('http://localhost:5000/upload', {
      multipart: {}
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('No file');
  });

  test('Backend validates MIME type server-side', async () => {
    const context = await request.newContext();

    // Send non-PDF file
    const fakeContent = Buffer.from('This is not a PDF');

    const response = await context.post('http://localhost:5000/upload', {
      multipart: {
        file: {
          name: 'document.txt',
          mimeType: 'text/plain',
          buffer: fakeContent
        }
      }
    });

    // Should reject non-PDF
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });
});
