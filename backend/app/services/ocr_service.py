"""OCR service for extracting text from medication images."""
import io
import re
from typing import List, Optional
from PIL import Image

# Try to import pytesseract, fall back to mock if not available
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False


class OCRService:
    """Service for OCR processing of medication images."""

    def __init__(self):
        self.tesseract_available = TESSERACT_AVAILABLE

    def extract_text(self, image_data: bytes) -> str:
        """Extract text from an image.

        Args:
            image_data: Raw image bytes

        Returns:
            Extracted text from the image
        """
        if not self.tesseract_available:
            # Return mock data for development
            return self._mock_extract()

        try:
            image = Image.open(io.BytesIO(image_data))
            # Use pytesseract to extract text
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            raise OCRError(f"Failed to extract text from image: {str(e)}")

    def parse_medications_from_text(self, text: str) -> List[dict]:
        """Parse medication information from extracted text.

        Args:
            text: Raw text extracted from OCR

        Returns:
            List of parsed medication dictionaries
        """
        medications = []
        lines = text.strip().split('\n')

        # Common medication patterns
        # Pattern: Drug name strength dose frequency
        med_pattern = re.compile(
            r'^([A-Za-z][A-Za-z\s\-]+?)[\s,]+(\d+(?:\.\d+)?(?:mg|mcg|g|ml|mL|units?|IU)?)'
            r'(?:[\s,]+(.+))?$',
            re.IGNORECASE
        )

        for line in lines:
            line = line.strip()
            if not line or len(line) < 3:
                continue

            # Try to match the pattern
            match = med_pattern.match(line)
            if match:
                drug_name = match.group(1).strip()
                strength = match.group(2).strip() if match.group(2) else None
                directions = match.group(3).strip() if match.group(3) else None

                medications.append({
                    'drug_name': drug_name,
                    'strength': strength,
                    'directions': directions,
                    'raw_text': line,
                    'confidence': 0.85,
                })
            else:
                # Try simpler parsing - just extract what looks like a drug name
                words = line.split()
                if words and len(words[0]) > 2:
                    medications.append({
                        'drug_name': words[0],
                        'strength': words[1] if len(words) > 1 else None,
                        'directions': ' '.join(words[2:]) if len(words) > 2 else None,
                        'raw_text': line,
                        'confidence': 0.5,
                    })

        return medications

    def _mock_extract(self) -> str:
        """Return mock OCR data for development."""
        return """Metformin 500mg twice daily with food
Atorvastatin 20mg once daily at night
Amlodipine 5mg once daily in the morning
Pantoprazole 40mg once daily before breakfast
Aspirin 100mg once daily with food"""


class OCRError(Exception):
    """Exception raised for OCR processing errors."""
    pass
