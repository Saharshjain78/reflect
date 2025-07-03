import os
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, StringVar, BooleanVar
import threading
import logging

logger = logging.getLogger('voice_assistant')

class VoiceAssistantUI:
    """Tkinter UI for the Voice Assistant"""
    
    def __init__(self, root, config):
        self.root = root
        self.config = config
        self.recorder = None
        self.transcriber = None
        self.formatter = None
        self.injector = None
        
        # UI state variables
        self.is_recording = BooleanVar(value=False)
        self.status_text = StringVar(value="Ready")
        self.format_mode = StringVar(value=config.get("format_mode"))
        
        # Configure the root window
        self.setup_root()
        
        # Create UI elements
        self.create_widgets()
        
        # Apply styles
        self.apply_styles()
    
    def setup_root(self):
        """Configure the root window"""
        self.root.title("Voice-First Work Assistant")
        self.root.geometry("600x500")
        self.root.minsize(500, 400)
        
        # Configure grid
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=0)  # Header
        self.root.rowconfigure(1, weight=1)  # Content
        self.root.rowconfigure(2, weight=0)  # Status bar
    
    def create_widgets(self):
        """Create all UI widgets"""
        # Create header frame
        self.create_header()
        
        # Create main content frame
        self.create_content()
        
        # Create status bar
        self.create_status_bar()
    
    def create_header(self):
        """Create the header section"""
        header_frame = ttk.Frame(self.root, padding="8")
        header_frame.grid(row=0, column=0, sticky="ew")
        
        # Title label
        title_label = ttk.Label(
            header_frame,
            text="Voice-First Work Assistant",
            font=("Segoe UI", 16, "bold")
        )
        title_label.pack(side=tk.LEFT, padx=8)
        
        # Format mode selector
        format_frame = ttk.Frame(header_frame)
        format_frame.pack(side=tk.RIGHT, padx=8)
        
        format_label = ttk.Label(format_frame, text="Format:")
        format_label.pack(side=tk.LEFT, padx=(0, 4))
        
        format_combo = ttk.Combobox(
            format_frame,
            textvariable=self.format_mode,
            values=["general", "email", "bullets"],
            width=10,
            state="readonly"
        )
        format_combo.pack(side=tk.LEFT)
        format_combo.bind("<<ComboboxSelected>>", self.on_format_changed)
    
    def create_content(self):
        """Create the main content section"""
        content_frame = ttk.Frame(self.root, padding="8")
        content_frame.grid(row=1, column=0, sticky="nsew")
        
        # Configure content grid
        content_frame.columnconfigure(0, weight=1)
        content_frame.columnconfigure(1, weight=1)
        content_frame.rowconfigure(0, weight=0)  # Labels
        content_frame.rowconfigure(1, weight=1)  # Text areas
        
        # Transcribed text section
        transcribed_label = ttk.Label(
            content_frame,
            text="Transcribed Text",
            font=("Segoe UI", 11)
        )
        transcribed_label.grid(row=0, column=0, sticky="w", padx=8, pady=(0, 4))
        
        self.transcribed_text = scrolledtext.ScrolledText(
            content_frame,
            wrap=tk.WORD,
            height=10,
            font=("Segoe UI", 10)
        )
        self.transcribed_text.grid(
            row=1, column=0, sticky="nsew", padx=8, pady=(0, 8)
        )
        
        # Formatted text section
        formatted_label = ttk.Label(
            content_frame,
            text="Formatted Text",
            font=("Segoe UI", 11)
        )
        formatted_label.grid(row=0, column=1, sticky="w", padx=8, pady=(0, 4))
        
        self.formatted_text = scrolledtext.ScrolledText(
            content_frame,
            wrap=tk.WORD,
            height=10,
            font=("Segoe UI", 10)
        )
        self.formatted_text.grid(
            row=1, column=1, sticky="nsew", padx=8, pady=(0, 8)
        )
        
        # Buttons frame
        buttons_frame = ttk.Frame(content_frame, padding=(8, 0))
        buttons_frame.grid(row=2, column=0, columnspan=2, sticky="ew")
        
        # Record button
        self.record_button = ttk.Button(
            buttons_frame,
            text="Start Recording (Ctrl+Alt+D)",
            command=self.toggle_recording,
            width=25
        )
        self.record_button.pack(side=tk.LEFT, padx=8, pady=8)
        
        # Type text button
        self.type_button = ttk.Button(
            buttons_frame,
            text="Type Formatted Text",
            command=self.type_formatted_text,
            width=20
        )
        self.type_button.pack(side=tk.LEFT, padx=8, pady=8)
        
        # Clear button
        self.clear_button = ttk.Button(
            buttons_frame,
            text="Clear All",
            command=self.clear_all,
            width=10
        )
        self.clear_button.pack(side=tk.RIGHT, padx=8, pady=8)
    
    def create_status_bar(self):
        """Create the status bar"""
        status_frame = ttk.Frame(self.root, relief=tk.SUNKEN, padding=(8, 4))
        status_frame.grid(row=2, column=0, sticky="ew")
        
        # Status indicator
        self.status_indicator = ttk.Label(
            status_frame,
            text="●",
            foreground="green",
            font=("Segoe UI", 10)
        )
        self.status_indicator.pack(side=tk.LEFT, padx=(0, 4))
        
        # Status text
        status_label = ttk.Label(
            status_frame,
            textvariable=self.status_text,
            font=("Segoe UI", 9)
        )
        status_label.pack(side=tk.LEFT)
        
        # Hotkey info
        hotkey_label = ttk.Label(
            status_frame,
            text=f"Hotkey: {self.config.get('hotkey')}",
            font=("Segoe UI", 9)
        )
        hotkey_label.pack(side=tk.RIGHT)
    
    def apply_styles(self):
        """Apply styles to the UI elements"""
        # Create and configure ttk styles
        style = ttk.Style()
        
        # Configure TButton style
        style.configure(
            "TButton",
            font=("Segoe UI", 10),
            padding=6
        )
        
        # Configure TLabel style
        style.configure(
            "TLabel",
            font=("Segoe UI", 10)
        )
        
        # Configure TFrame style
        style.configure(
            "TFrame",
            background="#f5f5f5"
        )
    
    def set_components(self, recorder, transcriber, formatter, injector):
        """Set the components used by the UI"""
        self.recorder = recorder
        self.transcriber = transcriber
        self.formatter = formatter
        self.injector = injector
        
        # Set callback for recorder
        self.recorder.set_callback(self.on_recording_complete)
    
    def toggle_recording(self):
        """Toggle recording state"""
        if not self.is_recording.get():
            # Start recording
            self.start_recording()
        else:
            # Stop recording
            self.stop_recording()
    
    def start_recording(self):
        """Start recording audio"""
        if not self.recorder:
            self.update_status("Error: Recorder not initialized", "red")
            return
        
        self.is_recording.set(True)
        self.update_status("Recording...", "red")
        self.record_button.config(text="Stop Recording")
        
        # Start recording in a separate thread
        self.recorder.start_recording()
    
    def stop_recording(self):
        """Stop recording audio"""
        if not self.recorder:
            return
        
        self.is_recording.set(False)
        self.update_status("Processing...", "orange")
        self.record_button.config(text="Start Recording (Ctrl+Alt+D)")
        
        # Stop recording
        self.recorder.stop_recording()
    
    def on_recording_complete(self, audio_file):
        """Callback when recording is complete"""
        # Update UI
        self.update_status("Transcribing...", "blue")
        
        # Start transcription in a separate thread
        threading.Thread(
            target=self.transcribe_audio,
            args=(audio_file,),
            daemon=True
        ).start()
    
    def transcribe_audio(self, audio_file):
        """Transcribe the recorded audio"""
        if not self.transcriber:
            self.update_status("Error: Transcriber not initialized", "red")
            return
        
        # Transcribe audio
        self.transcriber.transcribe(audio_file, self.on_transcription_complete)
    
    def on_transcription_complete(self, text, error):
        """Callback when transcription is complete"""
        if error:
            self.update_status(f"Transcription error: {error}", "red")
            return
        
        # Update transcribed text
        self.transcribed_text.delete(1.0, tk.END)
        self.transcribed_text.insert(tk.END, text)
        
        # Update UI
        self.update_status("Formatting...", "blue")
        
        # Format the transcribed text
        self.formatter.format_text(text, self.on_formatting_complete)
    
    def on_formatting_complete(self, formatted_text, error):
        """Callback when formatting is complete"""
        if error:
            self.update_status(f"Formatting error: {error}", "red")
        else:
            self.update_status("Ready", "green")
        
        # Update formatted text
        self.formatted_text.delete(1.0, tk.END)
        self.formatted_text.insert(tk.END, formatted_text)
    
    def type_formatted_text(self):
        """Type the formatted text into the active application"""
        # Get the formatted text
        formatted_text = self.formatted_text.get(1.0, tk.END).strip()
        
        if not formatted_text:
            messagebox.showwarning(
                "Empty Text",
                "There is no formatted text to type."
            )
            return
        
        # Update UI
        self.update_status("Injecting text...", "blue")
        
        # Inject the text
        self.injector.inject_text(formatted_text, self.on_injection_complete)
    
    def on_injection_complete(self, success, error):
        """Callback when text injection is complete"""
        if error:
            self.update_status(f"Injection error: {error}", "red")
        else:
            self.update_status("Text injected successfully", "green")
            
            # Reset status after a delay
            self.root.after(3000, lambda: self.update_status("Ready", "green"))
    
    def on_format_changed(self, event):
        """Handle format mode change"""
        new_mode = self.format_mode.get()
        self.config.set("format_mode", new_mode)
        logger.info(f"Format mode changed to: {new_mode}")
    
    def clear_all(self):
        """Clear all text fields"""
        self.transcribed_text.delete(1.0, tk.END)
        self.formatted_text.delete(1.0, tk.END)
        self.update_status("Ready", "green")
    
    def update_status(self, text, color):
        """Update the status text and indicator"""
        self.status_text.set(text)
        self.status_indicator.config(foreground=color)
    
    def start(self):
        """Start the application"""
        # Update UI to initial state
        self.update_status("Ready", "green")
        
        # Center window on screen
        self.center_window()
    
    def center_window(self):
        """Center the window on the screen"""
        self.root.update_idletasks()
        
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        
        self.root.geometry(f"{width}x{height}+{x}+{y}")