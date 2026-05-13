"""
Unit tests for storage module.
Tests file saving with sanitization and edge case handling.
"""

import pytest
import os
import shutil
from io import BytesIO
from werkzeug.datastructures import FileStorage
from storage import save_file


class TestSaveFile:
    """Test cases for save_file function."""

    # Test upload directory
    TEST_UPLOAD_DIR = 'test_upload'

    def setup_method(self):
        """Set up test environment before each test."""
        # Clean up test directory if it exists
        if os.path.exists(self.TEST_UPLOAD_DIR):
            shutil.rmtree(self.TEST_UPLOAD_DIR)

    def teardown_method(self):
        """Clean up test environment after each test."""
        # Remove test directory
        if os.path.exists(self.TEST_UPLOAD_DIR):
            shutil.rmtree(self.TEST_UPLOAD_DIR)

    def create_file_storage(self, filename: str, content: bytes = b'test content') -> FileStorage:
        """Helper to create a FileStorage object."""
        return FileStorage(
            stream=BytesIO(content),
            filename=filename,
            content_type="application/pdf"
        )

    def test_save_file_success(self):
        """Valid file should be saved successfully."""
        file = self.create_file_storage("document.pdf")
        success, safe_filename, error = save_file(file, self.TEST_UPLOAD_DIR)

        assert success is True
        assert safe_filename == "document.pdf"
        assert error is None

        # Verify file exists
        filepath = os.path.join(self.TEST_UPLOAD_DIR, safe_filename)
        assert os.path.exists(filepath)

        # Verify content
        with open(filepath, 'rb') as f:
            assert f.read() == b'test content'

    def test_save_file_creates_directory(self):
        """Upload directory should be created if it doesn't exist."""
        assert not os.path.exists(self.TEST_UPLOAD_DIR)

        file = self.create_file_storage("document.pdf")
        success, safe_filename, error = save_file(file, self.TEST_UPLOAD_DIR)

        assert success is True
        assert os.path.exists(self.TEST_UPLOAD_DIR)
        assert os.path.isdir(self.TEST_UPLOAD_DIR)

    def test_save_file_empty_filename(self):
        """Empty filename should return error (resolves DR-002)."""
        file = self.create_file_storage("")
        success, safe_filename, error = save_file(file, self.TEST_UPLOAD_DIR)

        assert success is False
        assert safe_filename is None
        assert "No file selected" in error

    def test_save_file_unicode_filename(self):
        """Unicode/emoji in filename should be stripped (resolves DR-002)."""
        file = self.create_file_storage("📄_report_文档.pdf")
        success, safe_filename, error = save_file(file, self.TEST_UPLOAD_DIR)

        assert success is True
        # secure_filename strips unicode characters
        assert safe_filename == "report_.pdf"
        assert error is None

    def test_save_file_only_special_chars(self):
        """Filename with only special chars should return error (resolves DR-002)."""
        file = self.create_file_storage(".....")
        success, safe_filename, error = save_file(file, self.TEST_UPLOAD_DIR)

        assert success is False
        assert safe_filename is None
        assert "Invalid filename" in error

    def test_save_file_no_extension(self):
        """File with no extension should return error (resolves DR-002)."""
        file = self.create_file_storage("document")
        success, safe_filename, error = save_file(file, self.TEST_UPLOAD_DIR)

        assert success is False
        assert safe_filename is None
        assert ".pdf extension" in error

    def test_save_file_wrong_extension(self):
        """File with wrong extension should return error."""
        file = self.create_file_storage("document.txt")
        success, safe_filename, error = save_file(file, self.TEST_UPLOAD_DIR)

        assert success is False
        assert safe_filename is None
        assert ".pdf extension" in error

    def test_save_file_overwrite(self):
        """Second save with same filename should overwrite (FR-008 AC-019)."""
        # Save first file
        file1 = self.create_file_storage("document.pdf", b'first content')
        success1, safe_filename1, error1 = save_file(file1, self.TEST_UPLOAD_DIR)
        assert success1 is True

        # Save second file with same name
        file2 = self.create_file_storage("document.pdf", b'second content')
        success2, safe_filename2, error2 = save_file(file2, self.TEST_UPLOAD_DIR)
        assert success2 is True
        assert safe_filename2 == safe_filename1

        # Verify second content overwrote first
        filepath = os.path.join(self.TEST_UPLOAD_DIR, safe_filename2)
        with open(filepath, 'rb') as f:
            content = f.read()
            assert content == b'second content'
            assert content != b'first content'

    def test_save_file_multiple_files(self):
        """Multiple different files should be saved successfully."""
        file1 = self.create_file_storage("document1.pdf", b'content1')
        file2 = self.create_file_storage("document2.pdf", b'content2')
        file3 = self.create_file_storage("document3.pdf", b'content3')

        success1, _, _ = save_file(file1, self.TEST_UPLOAD_DIR)
        success2, _, _ = save_file(file2, self.TEST_UPLOAD_DIR)
        success3, _, _ = save_file(file3, self.TEST_UPLOAD_DIR)

        assert success1 is True
        assert success2 is True
        assert success3 is True

        # Verify all files exist
        assert os.path.exists(os.path.join(self.TEST_UPLOAD_DIR, "document1.pdf"))
        assert os.path.exists(os.path.join(self.TEST_UPLOAD_DIR, "document2.pdf"))
        assert os.path.exists(os.path.join(self.TEST_UPLOAD_DIR, "document3.pdf"))

    def test_save_file_sanitization(self):
        """Filename should be sanitized (path traversal prevention)."""
        file = self.create_file_storage("../../../etc/passwd.pdf")
        success, safe_filename, error = save_file(file, self.TEST_UPLOAD_DIR)

        assert success is True
        # secure_filename removes path components
        assert safe_filename == "etc_passwd.pdf"
        assert ".." not in safe_filename
        assert "/" not in safe_filename

        # Verify file is saved in upload directory only
        filepath = os.path.join(self.TEST_UPLOAD_DIR, safe_filename)
        assert os.path.exists(filepath)
        assert self.TEST_UPLOAD_DIR in filepath

    def test_save_file_spaces_in_filename(self):
        """Filename with spaces should be handled correctly."""
        file = self.create_file_storage("my document.pdf")
        success, safe_filename, error = save_file(file, self.TEST_UPLOAD_DIR)

        assert success is True
        assert safe_filename == "my_document.pdf"  # secure_filename converts spaces to underscores
        assert error is None

    def test_save_file_long_filename(self):
        """Very long filename should be handled."""
        long_name = "a" * 200 + ".pdf"
        file = self.create_file_storage(long_name)
        success, safe_filename, error = save_file(file, self.TEST_UPLOAD_DIR)

        assert success is True
        assert safe_filename.endswith(".pdf")
        assert error is None

    def test_save_file_case_insensitive_extension(self):
        """Extension check should be case-insensitive."""
        file1 = self.create_file_storage("document.PDF")
        success1, _, error1 = save_file(file1, self.TEST_UPLOAD_DIR)
        assert success1 is True

        file2 = self.create_file_storage("document2.Pdf")
        success2, _, error2 = save_file(file2, self.TEST_UPLOAD_DIR)
        assert success2 is True

        file3 = self.create_file_storage("document3.pDf")
        success3, _, error3 = save_file(file3, self.TEST_UPLOAD_DIR)
        assert success3 is True
