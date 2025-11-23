"""Transcription service for converting audio to text using OpenAI Whisper."""
import io
import re
from typing import List, Optional
from app.core.config import settings

# Try to import openai
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class TranscriptionService:
    """Service for audio transcription using OpenAI Whisper."""

    def __init__(self):
        self.openai_available = OPENAI_AVAILABLE and bool(settings.OPENAI_API_KEY)
        if self.openai_available:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def transcribe_audio(self, audio_data: bytes, filename: str = "audio.webm") -> str:
        """Transcribe audio to text.

        Args:
            audio_data: Raw audio bytes
            filename: Original filename (for format detection)

        Returns:
            Transcribed text
        """
        if not self.openai_available:
            # Return mock data for development
            return self._mock_transcribe()

        try:
            # Create a file-like object
            audio_file = io.BytesIO(audio_data)
            audio_file.name = filename

            # Use Whisper API
            transcript = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="en",
                prompt="Medication list transcription: drug names, dosages, frequencies",
            )

            return transcript.text
        except Exception as e:
            raise TranscriptionError(f"Failed to transcribe audio: {str(e)}")

    def parse_medications_from_transcript(self, text: str) -> List[dict]:
        """Parse medication information from transcribed text.

        Args:
            text: Transcribed text from audio

        Returns:
            List of parsed medication dictionaries
        """
        medications = []

        # Clean up the text
        text = text.strip()

        # Split on common separators
        # People often say "and", "also", "then", or just pause
        segments = re.split(r'[,\.\n]|\band\b|\balso\b|\bthen\b', text, flags=re.IGNORECASE)

        for segment in segments:
            segment = segment.strip()
            if not segment or len(segment) < 3:
                continue

            med = self._parse_single_medication(segment)
            if med:
                medications.append(med)

        return medications

    def _parse_single_medication(self, text: str) -> Optional[dict]:
        """Parse a single medication from text.

        Args:
            text: Text segment containing one medication

        Returns:
            Parsed medication dictionary or None
        """
        text = text.strip()
        if not text:
            return None

        # Common spoken patterns
        # "metformin 500 milligrams twice a day"
        # "atorvastatin 20 mg once daily"
        # "amlodipine 5 milligrams in the morning"

        # Extract drug name (usually first word or first few words)
        words = text.split()
        if not words:
            return None

        drug_name = words[0]

        # Look for strength
        strength = None
        strength_pattern = re.compile(
            r'(\d+(?:\.\d+)?)\s*(mg|milligrams?|mcg|micrograms?|g|grams?|ml|milliliters?|units?|iu)',
            re.IGNORECASE
        )
        strength_match = strength_pattern.search(text)
        if strength_match:
            amount = strength_match.group(1)
            unit = strength_match.group(2).lower()
            # Normalize units
            unit_map = {
                'milligrams': 'mg', 'milligram': 'mg',
                'micrograms': 'mcg', 'microgram': 'mcg',
                'grams': 'g', 'gram': 'g',
                'milliliters': 'mL', 'milliliter': 'mL',
                'units': 'units', 'unit': 'units',
            }
            unit = unit_map.get(unit, unit)
            strength = f"{amount}{unit}"

        # Look for frequency
        frequency = None
        freq_patterns = [
            (r'once\s+(a\s+)?daily', 'once daily'),
            (r'twice\s+(a\s+)?daily', 'twice daily'),
            (r'three\s+times\s+(a\s+)?day', 'three times daily'),
            (r'four\s+times\s+(a\s+)?day', 'four times daily'),
            (r'every\s+morning', 'every morning'),
            (r'every\s+night', 'every night'),
            (r'at\s+night', 'at night'),
            (r'in\s+the\s+morning', 'in the morning'),
            (r'with\s+food', 'with food'),
            (r'before\s+(meals?|food|breakfast)', 'before meals'),
            (r'after\s+(meals?|food)', 'after meals'),
            (r'as\s+needed', 'as needed'),
            (r'prn', 'as needed'),
        ]

        directions_parts = []
        for pattern, replacement in freq_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                directions_parts.append(replacement)

        directions = ', '.join(directions_parts) if directions_parts else None

        return {
            'drug_name': drug_name.capitalize(),
            'strength': strength,
            'directions': directions,
            'raw_text': text,
            'confidence': 0.75,
        }

    def _mock_transcribe(self) -> str:
        """Return mock transcription data for development."""
        return (
            "Metformin 500 milligrams twice daily with food, "
            "atorvastatin 20 milligrams once daily at night, "
            "amlodipine 5 milligrams once daily in the morning"
        )


class TranscriptionError(Exception):
    """Exception raised for transcription errors."""
    pass
