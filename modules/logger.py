import os
import logging
from datetime import datetime

def setup_logger():
    """Setup logger configuration"""
    # Create logs directory if it doesn't exist
    os.makedirs('.logs', exist_ok=True)
    
    # Get current date for log file name
    current_date = datetime.now().strftime("%Y-%m-%d")
    log_file = os.path.join('.logs', f"{current_date}.txt")
    
    # Configure logger
    logger = logging.getLogger('voice_assistant')
    logger.setLevel(logging.INFO)
    
    # Create file handler
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.INFO)
    
    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # Create formatter and add it to the handlers
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

def get_logger():
    """Get the logger instance"""
    return logging.getLogger('voice_assistant')