import os
import time
import threading
import logging
import numpy as np
import sounddevice as sd
from datetime import datetime
from pydub import AudioSegment
from pydub.playback import play

logger = logging.getLogger('voice_assistant')

class AudioRecorder:
    """Class to handle audio recording functionality"""
    
    def __init__(self, config):
        self.config = config
        self.recording = False
        self.chunk_duration = config.get("chunk_duration")  # seconds
        self.sample_rate = config.get("sample_rate")
        self.audio_thread = None
        self.callback = None
        self.recordings_dir = "recordings"
        
        # Create recordings directory if it doesn't exist
        os.makedirs(self.recordings_dir, exist_ok=True)
        
        # Initialize audio parameters
        self.channels = 1
        self.dtype = 'float32'
    
    def set_callback(self, callback):
        """Set callback function to be called when recording is complete"""
        self.callback = callback
    
    def start_recording(self):
        """Start recording audio in a separate thread"""
        if self.recording:
            return
        
        self.recording = True
        self.audio_thread = threading.Thread(target=self._record_audio)
        self.audio_thread.daemon = True
        self.audio_thread.start()
        
        logger.info("Recording started")
        
        # Play a subtle beep to indicate recording has started
        self._play_start_sound()
    
    def stop_recording(self):
        """Stop the current recording"""
        if not self.recording:
            return
        
        self.recording = False
        if self.audio_thread:
            self.audio_thread.join()
            self.audio_thread = None
        
        logger.info("Recording stopped")
        
        # Play a subtle beep to indicate recording has stopped
        self._play_stop_sound()
    
    def _record_audio(self):
        """Record audio for the specified duration"""
        frames = []
        
        def callback(indata, frames_count, time_info, status):
            if status:
                logger.warning(f"Audio status: {status}")
            frames.append(indata.copy())
        
        try:
            with sd.InputStream(
                samplerate=self.sample_rate,
                channels=self.channels,
                dtype=self.dtype,
                callback=callback
            ):
                # Continue recording while the flag is set
                while self.recording:
                    time.sleep(0.1)
            
            if not frames:
                logger.warning("No audio data recorded")
                return
            
            # Concatenate all audio frames
            audio_data = np.concatenate(frames, axis=0)
            
            # Generate unique filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = os.path.join(self.recordings_dir, f"recording_{timestamp}.wav")
            
            # Save audio to file
            import soundfile as sf
            sf.write(filename, audio_data, self.sample_rate)
            
            logger.info(f"Audio saved to {filename}")
            
            # Call the callback function with the filename
            if self.callback:
                self.callback(filename)
        
        except Exception as e:
            logger.error(f"Error recording audio: {e}")
    
    def _play_start_sound(self):
        """Play a subtle beep to indicate recording has started"""
        try:
            # Generate a simple sine wave beep
            sample_rate = 44100
            duration = 0.1  # 100 ms
            frequency = 800  # Hz
            t = np.linspace(0, duration, int(sample_rate * duration), False)
            beep = 0.5 * np.sin(2 * np.pi * frequency * t)
            
            # Play the beep
            sd.play(beep, sample_rate)
            sd.wait()
        except Exception as e:
            logger.error(f"Error playing start sound: {e}")
    
    def _play_stop_sound(self):
        """Play a subtle beep to indicate recording has stopped"""
        try:
            # Generate a simple sine wave beep with lower frequency
            sample_rate = 44100
            duration = 0.1  # 100 ms
            frequency = 400  # Hz
            t = np.linspace(0, duration, int(sample_rate * duration), False)
            beep = 0.5 * np.sin(2 * np.pi * frequency * t)
            
            # Play the beep
            sd.play(beep, sample_rate)
            sd.wait()
        except Exception as e:
            logger.error(f"Error playing stop sound: {e}")