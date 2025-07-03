# Reflect - Personal Scrapbook & Voice Assistant

A comprehensive personal productivity application combining an interactive React scrapbook creator with a voice-first work assistant for Windows.

## Features

### Scrapbook Creator (React Frontend)
- **Interactive Scrapbook Creation**: Create beautiful memory collages with drag-and-drop functionality
- **Multiple Aspect Ratios**: Support for 16:9, 4:3, 1:1, 9:16, and 3:4 layouts
- **Media Support**: Upload and arrange images, videos, and audio files
- **Touch Gestures**: Mobile-friendly with swipe controls for rotation and scaling
- **Customizable Frames**: Various frame styles including vintage, polaroid, circle, and rounded
- **Background Customization**: Multiple background colors and custom color picker
- **Save & Download**: Local storage auto-save and high-quality PNG download
- **Original Aspect Ratio**: Option to maintain original proportions for uploads

### Voice Assistant (Python Backend)
- **Hotkey Toggle**: Press `Ctrl + Alt + D` to start/stop voice dictation
- **Voice Input Capture**: Records 5-10s voice chunks in real-time
- **Offline Transcription**: Uses Whisper for local speech recognition
- **Smart Formatting**: Applies intelligent formatting via Google's Gemini API
- **Text Injection**: Types formatted text into the currently active application
- **Simple GUI**: Displays both transcribed and formatted text

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Python 3.9+, Whisper, Google Gemini API
- **Icons**: Lucide React
- **Build Tools**: Vite, PostCSS

## Requirements

- **For React App**: Node.js 16+, npm/yarn
- **For Voice Assistant**: Windows 10/11, Python 3.9+
- **Hardware**: NVIDIA GPU with 4GB+ VRAM recommended for optimal performance

## Installation & Setup

### React Scrapbook App

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:5173 in your browser

### Voice Assistant

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Create a `.env` file with your Google API key (see `.env.example`)
3. Run the voice assistant:
   ```bash
   python main.py
   ```

## Configuration

The voice assistant can be configured by editing the `config.json` file:

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

The voice assistant supports several formatting modes:

- **General**: Adds proper punctuation, capitalizes sentences, and removes filler words
- **Email**: Formats text as a professional email with greetings and sign-off
- **Bullets**: Converts speech into a clean, readable bullet point list

## Usage

### Scrapbook Creator
1. Navigate to the scrapbook page in the React app
2. Click "Add Image" or "Add Video" to upload media
3. Drag items to position them on your scrapbook
4. Use control buttons to rotate, scale, or delete items
5. Customize frames and colors for selected items
6. Save your work or download as a high-quality image

### Voice Assistant
1. Start the Python application
2. Press `Ctrl + Alt + D` to start recording
3. Speak clearly into your microphone
4. Press `Ctrl + Alt + D` again to stop recording
5. Wait for transcription and formatting to complete
6. Click "Type Formatted Text" to insert the text into the active application

## API Key Setup

To use the smart formatting features, you need a Google API key:

1. Create a `.env` file in the application directory
2. Add your API key: `GOOGLE_API_KEY=your_key_here`

## Performance Notes

- The voice assistant uses the Whisper `small` model by default
- For machines with less than 4GB VRAM, consider using the `base` model
- First-time startup may be slow as the Whisper model is downloaded
- React app includes responsive design for both desktop and mobile devices

## Project Structure

```
├── src/                    # React frontend source
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages
│   ├── contexts/          # React contexts
│   └── utils/             # Utility functions
├── modules/               # Python voice assistant modules
├── public/                # Static assets
├── recordings/            # Voice recordings (gitignored)
└── models/                # AI models (gitignored)
```

## Logs

Voice assistant logs are saved in the `.logs` directory with the current date as the filename.

## License

MIT
