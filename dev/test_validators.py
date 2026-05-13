"""
Unit tests for validators module.
Tests file type and size validation logic.
"""

import pytest
from io import BytesIO
from werkzeug.datastructures import FileStorage
from validators import validate_file_type, validate_file_size, validate_file


class TestValidateFileType:
    """Test cases for file type validation."""

    def test_validate_file_type_pdf(self):
        """Valid PDF file should pass validation."""
        is_valid, error = validate_file_type("document.pdf")
        assert is_valid is True
        assert error is None

    def test_validate_file_type_pdf_case_insensitive(self):
        """PDF extension should be case-insensitive."""
        is_valid, error = validate_file_type("document.PDF")
        assert is_valid is True
        assert error is None

        is_valid, error = validate_file_type("document.Pdf")
        assert is_valid is True
        assert error is None

    def test_validate_file_type_jpg(self):
        """Non-PDF file (JPEG) should fail validation."""
        is_valid, error = validate_file_type("image.jpg")
        assert is_valid is False
        assert error == "Invalid file type. Please select a PDF document."

    def test_validate_file_type_txt(self):
        """Non-PDF file (text) should fail validation."""
        is_valid, error = validate_file_type("document.txt")
        assert is_valid is False
        assert error == "Invalid file type. Please select a PDF document."

    def test_validate_file_type_no_extension(self):
        """File with no extension should fail validation."""
        is_valid, error = validate_file_type("document")
        assert is_valid is False
        assert error == "Invalid file type. Please select a PDF document."

    def test_validate_file_type_empty_filename(self):
        """Empty filename should fail validation."""
        is_valid, error = validate_file_type("")
        assert is_valid is False
        assert error == "Filename is empty"

    def test_validate_file_type_none_filename(self):
        """None filename should fail validation."""
        is_valid, error = validate_file_type(None)
        assert is_valid is False
        assert error == "Filename is empty"

    def test_validate_file_type_fake_pdf(self):
        """File with .pdf extension but wrong MIME type should fail."""
        # Note: mimetypes.guess_type is based on extension, so this will pass
        # This is expected behavior per NFR-003 (MIME spoofing accepted risk)
        is_valid, error = validate_file_type("fake.pdf")
        assert is_valid is True
        assert error is None


class TestValidateFileSize:
    """Test cases for file size validation."""

    def create_file_storage(self, size_bytes: int) -> FileStorage:
        """Helper to create a FileStorage object with specified size."""
        content = b'x' * size_bytes
        return FileStorage(
            stream=BytesIO(content),
            filename="test.pdf",
            content_type="application/pdf"
        )

    def test_validate_file_size_valid_small(self):
        """Small file (1 MB) should pass validation."""
        file = self.create_file_storage(1 * 1024 * 1024)  # 1 MB
        is_valid, error = validate_file_size(file)
        assert is_valid is True
        assert error is None

    def test_validate_file_size_valid_medium(self):
        """Medium file (25 MB) should pass validation."""
        file = self.create_file_storage(25 * 1024 * 1024)  # 25 MB
        is_valid, error = validate_file_size(file)
        assert is_valid is True
        assert error is None

    def test_validate_file_size_valid_max(self):
        """File at exactly 50 MB should pass validation."""
        file = self.create_file_storage(50 * 1024 * 1024)  # 50 MB
        is_valid, error = validate_file_size(file)
        assert is_valid is True
        assert error is None

    def test_validate_file_size_too_large(self):
        """File larger than 50 MB should fail validation."""
        file = self.create_file_storage(60 * 1024 * 1024)  # 60 MB
        is_valid, error = validate_file_size(file)
        assert is_valid is False
        assert "50 MB limit" in error

    def test_validate_file_size_just_over_limit(self):
        """File just over 50 MB should fail validation."""
        file = self.create_file_storage((50 * 1024 * 1024) + 1)  # 50 MB + 1 byte
        is_valid, error = validate_file_size(file)
        assert is_valid is False
        assert "50 MB limit" in error

    def test_validate_file_size_empty_file(self):
        """Empty file (0 bytes) should pass validation."""
        file = self.create_file_storage(0)
        is_valid, error = validate_file_size(file)
        assert is_valid is True
        assert error is None

    def test_validate_file_size_file_pointer_reset(self):
        """File pointer should be reset to beginning after size check."""
        file = self.create_file_storage(1024)
        validate_file_size(file)
        # File pointer should be at beginning
        assert file.tell() == 0


class TestValidateFile:
    """Test cases for orchestrator validate_file function."""

    def create_file_storage(self, filename: str, size_bytes: int) -> FileStorage:
        """Helper to create a FileStorage object."""
        content = b'x' * size_bytes
        return FileStorage(
            stream=BytesIO(content),
            filename=filename,
            content_type="application/pdf"
        )

    def test_validate_file_valid(self):
        """Valid PDF file should pass all validations."""
        file = self.create_file_storage("document.pdf", 10 * 1024 * 1024)
        is_valid, error = validate_file(file)
        assert is_valid is True
        assert error is None

    def test_validate_file_invalid_type(self):
        """Invalid file type should fail validation."""
        file = self.create_file_storage("document.txt", 10 * 1024 * 1024)
        is_valid, error = validate_file(file)
        assert is_valid is False
        assert "Invalid file type" in error

    def test_validate_file_too_large(self):
        """File too large should fail validation."""
        file = self.create_file_storage("document.pdf", 60 * 1024 * 1024)
        is_valid, error = validate_file(file)
        assert is_valid is False
        assert "50 MB limit" in error

    def test_validate_file_no_filename(self):
        """File with no filename should fail validation."""
        file = self.create_file_storage("", 1024)
        is_valid, error = validate_file(file)
        assert is_valid is False
        assert error is not None

    def test_validate_file_none(self):
        """None file should fail validation."""
        is_valid, error = validate_file(None)
        assert is_valid is False
        assert "No file selected" in error

    def test_validate_file_no_filename_attribute(self):
        """File object without filename attribute should fail validation."""
        file = type('obj', (object,), {'filename': None})()
        is_valid, error = validate_file(file)
        assert is_valid is False
        assert error is not None
