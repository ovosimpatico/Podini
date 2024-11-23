import os
from typing import Optional, List, Dict, Any
import requests

# Constants for Coqui TTS API
COQUI_API_URL = "http://[::1]:5002"

# Available voices in Coqui TTS
AVAILABLE_VOICES = [
    'Claribel Dervla', 'Daisy Studious', 'Gracie Wise',
    'Tammie Ema', 'Alison Dietlinde', 'Ana Florence',
    'Annmarie Nele', 'Asya Anara', 'Brenda Stern',
    'Gitta Nikolina', 'Henriette Usha', 'Sofia Hellen',
    'Tammy Grit', 'Tanja Adelina', 'Vjollca Johnnie',
    'Andrew Chipper', 'Badr Odhiambo', 'Dionisio Schuyler',
    'Royston Min', 'Viktor Eka', 'Abrahan Mack',
    'Adde Michal', 'Baldur Sanjin', 'Craig Gutsy',
    'Damien Black', 'Gilberto Mathias', 'Ilkin Urbano',
    'Kazuhiko Atallah', 'Ludvig Milivoj', 'Suad Qasim',
    'Torcull Diarmuid', 'Viktor Menelaos', 'Zacharie Aimilios',
    'Nova Hogarth', 'Maja Ruoho', 'Uta Obando',
    'Lidiya Szekeres', 'Chandra MacFarland', 'Szofi Granger',
    'Camilla Holmström', 'Lilya Stainthorpe', 'Zofija Kendrick',
    'Narelle Moon', 'Barbora MacLean', 'Alexandra Hisakawa',
    'Alma María', 'Rosemary Okafor', 'Ige Behringer',
    'Filip Traverse', 'Damjan Chapman', 'Wulf Carlevaro',
    'Aaron Dreschner', 'Kumar Dahl', 'Eugenio Mataracı',
    'Ferran Simen', 'Xavier Hayasaka', 'Luis Moray',
    'Marcos Rudaski'
]

# Default voices for different roles (these work for all languages)
DEFAULT_HOST_VOICE = "Damien Black"
DEFAULT_GUEST_VOICE = "Sofia Hellen"

def generate_speech(text: str, speaker_name: Optional[str] = None, language: str = "en") -> bytes:
    """
    Generate speech using Coqui TTS API
    """
    # Use default host voice if no speaker specified
    speaker = speaker_name if speaker_name in AVAILABLE_VOICES else DEFAULT_HOST_VOICE

    params = {
        "text": text,
        "speaker_id": speaker,
        "language_id": language,
        "style_wav": ""
    }

    response = requests.get(f"{COQUI_API_URL}/api/tts", params=params)

    if response.status_code == 200:
        return response.content

    raise Exception(f"Error calling Coqui TTS API: {response.status_code} - {response.text}")

def get_available_voices() -> List[Dict[str, Any]]:
    """
    Return a list of available Coqui voices
    """
    return [{"name": voice, "gender": "female" if voice in AVAILABLE_VOICES[:15] else "male"}
            for voice in AVAILABLE_VOICES]

def save_audio(audio_content: bytes, filename: str) -> str:
    """Save audio content to a WAV file"""
    os.makedirs("audios", exist_ok=True)
    filepath = f"audios/{filename}"
    with open(filepath, "wb") as f:
        f.write(audio_content)
    return filepath