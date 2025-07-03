# Voice-First Work Assistant (Windows MVP)

A voice-first productivity assistant for Windows that converts real-time speech into formatted text and types it into any active application. This MVP supports offline transcription and cloud-based intelligent formatting.

## Features

- **Hotkey Toggle**: Press `Ctrl + Alt + D` to start/stop voice dictation
- **Voice Input Capture**: Records 5-10s voice chunks in real-time
- **Offline Transcription**: Uses Whisper for local speech recognition
- **Smart Formatting**: Applies intelligent formatting via Google's Gemini API
- **Text Injection**: Types formatted text into the currently active application
- **Simple GUI**: Displays both transcribed and formatted text

## Requirements

- Windows 10/11
- Python 3.9+ (bundled with the executable)
- NVIDIA GPU with 4GB+ VRAM recommended for optimal performance

## Installation

### Option 1: Download the Executable (Recommended)

1. Download the latest release from the Releases section
2. Extract the ZIP file to a folder of your choice
3. Run `VoiceAssistant.exe`

### Option 2: Run from Source

1. Clone this repository
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Create a `.env` file with your Google API key (see `.env.example`)
4. Run the application:
   ```
   python main.py
   ```

## Configuration

The application can be configured by editing the `config.json` file:

```json
{
    "hotkey": "ctrl+alt+d",
    "chunk_duration": 5,
    "sample_rate": 16000,
    "whisper_model": "small",
    "use_fp16": false,
    "gemini_model": "gemini-pro",
    "format_mode": "general",
    "gui_theme": "light",
    "log_level": "INFO"
}
```

## Format Modes

The application supports several formatting modes:

- **General**: Adds proper punctuation, capitalizes sentences, and removes filler words
- **Email**: Formats text as a professional email with greetings and sign-off
- **Bullets**: Converts speech into a clean, readable bullet point list

## API Key

To use the smart formatting features, you need a Google API key:

1. Create a `.env` file in the application directory
2. Add your API key: `GOOGLE_API_KEY=your_key_here`

## Usage

1. Start the application
2. Press `Ctrl + Alt + D` to start recording
3. Speak clearly into your microphone
4. Press `Ctrl + Alt + D` again to stop recording
5. Wait for transcription and formatting to complete
6. Click "Type Formatted Text" to insert the text into the active application

## Performance Notes

- The application uses the Whisper `small` model by default
- For machines with less than 4GB VRAM, consider using the `base` model
- First-time startup may be slow as the Whisper model is downloaded

## Logs

Logs are saved in the `.logs` directory with the current date as the filename.

## License

MIT