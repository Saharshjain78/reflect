import os
import logging
import threading
import whisper
import torch

logger = logging.getLogger('voice_assistant')

class Transcriber:
    """Class to handle transcription using Whisper"""
    
    def __init__(self, config):
        self.config = config
        self.model = None
        self.model_name = config.get("whisper_model")
        self.use_fp16 = config.get("use_fp16")
        self.model_thread = None
        self.model_loaded = False
        
        # Start loading the model in a separate thread
        self._load_model_async()
    
    def _load_model_async(self):
        """Load the Whisper model in a background thread"""
        if self.model_thread is None:
            self.model_thread = threading.Thread(target=self._load_model)
            self.model_thread.daemon = True
            self.model_thread.start()
    
    def _load_model(self):
        """Load the Whisper model"""
        try:
            logger.info(f"Loading Whisper model: {self.model_name}")
            
            # Check GPU availability
            device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Using device: {device}")
            
            # Set fp16 to False for compatibility with 4GB VRAM
            self.model = whisper.load_model(
                self.model_name,
                device=device,
                download_root="models"
            )
            
            self.model_loaded = True
            logger.info("Whisper model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading Whisper model: {e}")
    
    def ensure_model_loaded(self):
        """Ensure the model is loaded before transcription"""
        if not self.model_loaded:
            if self.model_thread and self.model_thread.is_alive():
                logger.info("Waiting for Whisper model to load...")
                self.model_thread.join()
            else:
                self._load_model()
    
    def transcribe(self, audio_file, callback=None):
        """Transcribe audio file using Whisper"""
        if not os.path.exists(audio_file):
            logger.error(f"Audio file not found: {audio_file}")
            if callback:
                callback("", "Audio file not found")
            return
        
        try:
            # Ensure model is loaded
            self.ensure_model_loaded()
            
            logger.info(f"Transcribing: {audio_file}")
            
            # Perform transcription with fp16=False for compatibility
            result = self.model.transcribe(
                audio_file,
                fp16=self.use_fp16
            )
            
            # Extract transcribed text
            transcribed_text = result["text"].strip()
            
            logger.info(f"Transcription complete: {len(transcribed_text)} chars")
            logger.info(f"Transcribed text: {transcribed_text}")
            
            # Call the callback with the transcribed text
            if callback:
                callback(transcribed_text, None)
            
            return transcribed_text
        
        except Exception as e:
            error_msg = f"Error transcribing audio: {e}"
            logger.error(error_msg)
            
            if callback:
                callback("", error_msg)
            
            return ""