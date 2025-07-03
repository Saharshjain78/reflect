import os
import sys
import threading
import time
from datetime import datetime
import tkinter as tk
from tkinter import ttk, messagebox

# Import modules
from modules.config import Config
from modules.logger import setup_logger
from modules.record import AudioRecorder
from modules.transcribe import Transcriber
from modules.format import TextFormatter
from modules.inject import TextInjector
from modules.ui import VoiceAssistantUI
from modules.hotkey import HotkeyManager

def resource_path(relative_path):
    """Get absolute path to resource, works for dev and for PyInstaller"""
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

def create_dirs():
    """Create necessary directories"""
    os.makedirs('.logs', exist_ok=True)
    os.makedirs('recordings', exist_ok=True)

def main():
    # Create necessary directories
    create_dirs()
    
    # Setup logging
    logger = setup_logger()
    logger.info("Starting Voice-First Work Assistant")
    
    # Load configuration
    config = Config()
    
    # Initialize components
    recorder = AudioRecorder(config)
    transcriber = Transcriber(config)
    formatter = TextFormatter(config)
    injector = TextInjector()
    
    # Create the application window
    root = tk.Tk()
    app = VoiceAssistantUI(root, config)
    
    # Setup hotkey manager
    hotkey_manager = HotkeyManager(
        toggle_callback=app.toggle_recording,
        config=config
    )
    
    # Connect components to UI
    app.set_components(recorder, transcriber, formatter, injector)
    
    # Start the application
    app.start()
    root.protocol("WM_DELETE_WINDOW", lambda: on_close(root, hotkey_manager))
    root.mainloop()

def on_close(root, hotkey_manager):
    """Handle application closure"""
    hotkey_manager.stop()
    root.destroy()
    sys.exit(0)

if __name__ == "__main__":
    main()