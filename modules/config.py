import os
import json
from dotenv import load_dotenv

class Config:
    """Configuration management for the Voice Assistant"""
    
    def __init__(self):
        # Load environment variables from .env file if it exists
        load_dotenv()
        
        # Default configuration values
        self.defaults = {
            "hotkey": "ctrl+alt+d",
            "chunk_duration": 5,  # seconds
            "sample_rate": 16000,
            "whisper_model": "small",
            "use_fp16": False,  # Set to False for compatibility with 4GB VRAM
            "gemini_model": "gemini-pro",
            "format_mode": "general",  # Options: general, email, bullets
            "gui_theme": "light",
            "log_level": "INFO"
        }
        
        # Try to load config from file, use defaults if not found
        self.config = self._load_config()
        
        # Ensure API key is set
        self._check_api_key()
    
    def _load_config(self):
        """Load configuration from config.json if it exists"""
        config_path = "config.json"
        config = self.defaults.copy()
        
        if os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    loaded_config = json.load(f)
                    config.update(loaded_config)
            except Exception as e:
                print(f"Error loading config: {e}")
        else:
            # Create default config file
            self._save_config(config)
            
        return config
    
    def _save_config(self, config):
        """Save configuration to config.json"""
        try:
            with open("config.json", 'w') as f:
                json.dump(config, f, indent=4)
        except Exception as e:
            print(f"Error saving config: {e}")
    
    def _check_api_key(self):
        """Check if Google API key is set"""
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            print("Warning: GOOGLE_API_KEY not found in environment variables")
            print("LLM formatting will not work without an API key")
    
    def get(self, key):
        """Get a configuration value"""
        return self.config.get(key, self.defaults.get(key))
    
    def set(self, key, value):
        """Set a configuration value and save to file"""
        self.config[key] = value
        self._save_config(self.config)
    
    def get_prompt_template(self):
        """Get the appropriate prompt template based on format mode"""
        format_mode = self.get("format_mode")
        
        templates = {
            "general": """
            You are a helpful assistant. Format the following raw transcribed text:
            - Add proper punctuation
            - Capitalize sentences
            - Remove filler words if any
            - Preserve the original intent and tone
            Text: "{transcribed_text}"
            """,
            
            "email": """
            Act as a professional assistant. Turn the following spoken notes into a formal email:
            - Add greetings, structure, and sign-off
            - Fix grammar and add bullet points if necessary
            - Maintain a polite tone
            Notes: "{transcribed_text}"
            """,
            
            "bullets": """
            Convert this transcribed text into a clean, readable bullet point list.
            Use sentence casing and clarity.
            Text: "{transcribed_text}"
            """
        }
        
        return templates.get(format_mode, templates["general"])