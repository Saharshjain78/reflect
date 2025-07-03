import time
import logging
import threading
import pyautogui

logger = logging.getLogger('voice_assistant')

class TextInjector:
    """Class to handle text injection into active application"""
    
    def __init__(self):
        # Set pyautogui settings
        pyautogui.PAUSE = 0.01  # 10ms pause between pyautogui commands
        pyautogui.FAILSAFE = True  # Move mouse to corner to abort
    
    def inject_text(self, text, callback=None):
        """Inject text into the active application"""
        if not text:
            logger.warning("Empty text provided for injection")
            if callback:
                callback(False, "Empty text provided")
            return
        
        # Start injection in a separate thread
        thread = threading.Thread(
            target=self._inject_text_thread,
            args=(text, callback)
        )
        thread.daemon = True
        thread.start()
    
    def _inject_text_thread(self, text, callback):
        """Inject text in a separate thread"""
        try:
            logger.info(f"Injecting text: {len(text)} chars")
            
            # Give user a short pause to focus on the target application
            time.sleep(0.5)
            
            # Type the text
            pyautogui.write(text)
            
            logger.info("Text injection complete")
            
            # Call the callback with success
            if callback:
                callback(True, None)
        
        except Exception as e:
            error_msg = f"Error injecting text: {e}"
            logger.error(error_msg)
            
            # Call the callback with failure
            if callback:
                callback(False, error_msg)