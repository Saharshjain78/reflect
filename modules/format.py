import logging
import threading
import google.generativeai as genai

logger = logging.getLogger('voice_assistant')

class TextFormatter:
    """Class to handle text formatting using Google's Gemini API"""
    
    def __init__(self, config):
        self.config = config
        self.api_key = config.api_key
        self.model = config.get("gemini_model")
        
        # Configure Gemini
        if self.api_key:
            genai.configure(api_key=self.api_key)
    
    def format_text(self, text, callback=None):
        """Format transcribed text using Gemini"""
        if not text:
            logger.warning("Empty text provided for formatting")
            if callback:
                callback("", "Empty text provided")
            return ""
        
        if not self.api_key:
            logger.error("Google API key not found")
            if callback:
                callback(text, "API key not found. Using unformatted text.")
            return text
        
        try:
            logger.info("Sending text to Gemini for formatting")
            
            # Start formatting in a separate thread
            thread = threading.Thread(
                target=self._format_text_thread,
                args=(text, callback)
            )
            thread.daemon = True
            thread.start()
        
        except Exception as e:
            error_msg = f"Error in text formatting: {e}"
            logger.error(error_msg)
            
            if callback:
                callback(text, error_msg)
            
            return text
    
    def _format_text_thread(self, text, callback):
        """Format text in a separate thread"""
        try:
            # Get prompt template based on format mode
            prompt_template = self.config.get_prompt_template()
            prompt = prompt_template.format(transcribed_text=text)
            
            # Initialize Gemini model
            model = genai.GenerativeModel(self.model)
            
            # Generate formatted text
            response = model.generate_content(prompt)
            formatted_text = response.text.strip()
            
            logger.info("Text formatting complete")
            
            # Call the callback with the formatted text
            if callback:
                callback(formatted_text, None)
            
            return formatted_text
        
        except Exception as e:
            error_msg = f"Error in Gemini formatting: {e}"
            logger.error(error_msg)
            
            # Call the callback with the original text and error
            if callback:
                callback(text, error_msg)
            
            return text