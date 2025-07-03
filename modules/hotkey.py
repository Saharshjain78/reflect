import logging
import keyboard

logger = logging.getLogger('voice_assistant')

class HotkeyManager:
    """Class to handle global hotkeys"""
    
    def __init__(self, toggle_callback, config):
        self.config = config
        self.toggle_callback = toggle_callback
        self.hotkey = config.get("hotkey")
        self.active = False
        
        # Register hotkey
        self.register_hotkey()
    
    def register_hotkey(self):
        """Register the global hotkey"""
        try:
            keyboard.add_hotkey(self.hotkey, self.on_hotkey_pressed)
            self.active = True
            logger.info(f"Hotkey registered: {self.hotkey}")
        except Exception as e:
            logger.error(f"Error registering hotkey: {e}")
    
    def on_hotkey_pressed(self):
        """Callback for when the hotkey is pressed"""
        logger.info(f"Hotkey pressed: {self.hotkey}")
        if self.toggle_callback:
            self.toggle_callback()
    
    def change_hotkey(self, new_hotkey):
        """Change the registered hotkey"""
        if self.active:
            keyboard.remove_hotkey(self.hotkey)
        
        self.hotkey = new_hotkey
        self.config.set("hotkey", new_hotkey)
        self.register_hotkey()
        logger.info(f"Hotkey changed to: {new_hotkey}")
    
    def stop(self):
        """Stop listening for hotkeys"""
        if self.active:
            keyboard.remove_hotkey(self.hotkey)
            self.active = False
            logger.info("Hotkey manager stopped")