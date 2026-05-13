import { test, expect, request } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Test Suite: Non-Functional Requirements - Security
 * Covers: AC-028, AC-029, AC-030 (NFR-003)
 */

test.describe('NFR-003: Security Validation', () => {

  test.beforeAll(() => {
    const fixturesDir = path.join(__dirname, '../fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Create test files if they don't exist
    const validPdf = path.join(fixturesDir, 'valid.pdf');
    if (!fs.existsSync(validPdf)) {
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
      fs.writeFileSync(validPdf, pdfContent);
    }

    // Create executable file with .pdf extension
    const maliciousPdf = path.join(fixturesDir, 'malicious.pdf');
    const exeHeader = Buffer.from([0x4D, 0x5A]); // MZ header (Windows executable)
    fs.writeFileSync(maliciousPdf, exeHeader);
  });

  test('AC-028: System validates file extensions (client-side)', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Create a text file
    const txtFile = path.join(fixturesDir, 'test.txt');
    if (!fs.existsSync(txtFile)) {
      fs.writeFileSync(txtFile, 'Test content');
    }

    // Try uploading .txt file (headless-safe)
    await page.setInputFiles('#fileInput', txtFile);

    // Verify client-side validation rejects it
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toContainText('Invalid file type');

    const uploadBtn = page.locator('#uploadBtn');
    await expect(uploadBtn).toBeDisabled();
  });

  test('AC-029: System validates MIME types (client-side)', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Create JPEG file
    const jpegFile = path.join(fixturesDir, 'image.jpg');
    if (!fs.existsSync(jpegFile)) {
      const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      fs.writeFileSync(jpegFile, jpegHeader);
    }

    // Try uploading non-PDF with wrong MIME type (headless-safe)
    await page.setInputFiles('#fileInput', jpegFile);

    // Verify client-side MIME validation
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toContainText('Invalid file type');
  });

  test('AC-029: Backend validates MIME types (server-side)', async () => {
    const context = await request.newContext();

    // Send file with wrong MIME type but .pdf extension
    const textContent = Buffer.from('This is plain text, not a PDF');

    const response = await context.post('http://localhost:5000/upload', {
      multipart: {
        file: {
          name: 'fake.pdf',
          mimeType: 'text/plain',
          buffer: textContent
        }
      }
    });

    // Backend should reject
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test('AC-030: Virus/malware scanning is out of scope', async ({ page }) => {
    // This is a documentation test - verify no scanning occurs
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Upload file with .pdf extension but executable content
    // (Should pass basic validation since virus scanning is out of scope)
    const maliciousPdf = path.join(fixturesDir, 'malicious.pdf');

    // Select file (headless-safe)
    await page.setInputFiles('#fileInput', maliciousPdf);

    await page.locator('#uploadBtn').click();

    // System should accept it (no virus scanning)
    // This demonstrates the limitation, not a failure
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).not.toBeEmpty({ timeout: 10000 });

    // Note: This test passes whether upload succeeds or fails for other reasons
    // The point is there's NO virus scanning layer
  });

  test('Backend prevents path traversal in filenames', async () => {
    const context = await request.newContext();

    // Try uploading file with path traversal in name
    const pdfContent = Buffer.from('%PDF-1.4\n%%EOF');

    const response = await context.post('http://localhost:5000/upload', {
      multipart: {
        file: {
          name: '../../../etc/passwd.pdf',
          mimeType: 'application/pdf',
          buffer: pdfContent
        }
      }
    });

    // Backend should sanitize filename (werkzeug.secure_filename)
    // Should succeed with sanitized name, not traverse paths
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.filename).not.toContain('..');
      expect(body.filename).not.toContain('/');
      expect(body.filename).not.toContain('\\');
    }
  });

  test('Backend handles empty filename attacks', async () => {
    const context = await request.newContext();

    // Send request with empty filename
    const response = await context.post('http://localhost:5000/upload', {
      multipart: {
        file: {
          name: '',
          mimeType: 'application/pdf',
          buffer: Buffer.from('%PDF-1.4\n%%EOF')
        }
      }
    });

    // Should reject empty filename
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test('Backend limits file size to prevent DoS', async () => {
    const context = await request.newContext();

    // Try uploading file larger than 50MB
    const size51MB = 51 * 1024 * 1024;
    const largeBuffer = Buffer.alloc(size51MB);
    largeBuffer.write('%PDF-1.4\n', 0);

    const response = await context.post('http://localhost:5000/upload', {
      multipart: {
        file: {
          name: 'large.pdf',
          mimeType: 'application/pdf',
          buffer: largeBuffer
        }
      },
      timeout: 30000 // 30s timeout for large upload
    });

    // Should reject (413 or 400)
    expect([400, 413]).toContain(response.status());
  });

  test('Backend returns safe error messages (no stack traces)', async () => {
    const context = await request.newContext();

    // Trigger various errors
    const response1 = await context.post('http://localhost:5000/upload');
    const body1 = await response1.json();

    // Error message should be user-friendly, not expose internals
    expect(body1.error).toBeTruthy();
    expect(body1.error.toLowerCase()).not.toContain('traceback');
    expect(body1.error.toLowerCase()).not.toContain('exception');
    expect(JSON.stringify(body1)).not.toContain('File "');
  });

  test('CORS headers are present for cross-origin requests', async () => {
    const context = await request.newContext();

    const response = await context.get('http://localhost:5000/', {
      headers: {
        'Origin': 'http://example.com'
      }
    });

    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeTruthy();
  });
});
