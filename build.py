import sys
import os
import shutil
import subprocess
import zipfile
from datetime import datetime

def create_executable():
    """Create executable using auto-py-to-exe"""
    print("Building Voice-First Work Assistant executable...")
    
    # Create build directory if it doesn't exist
    os.makedirs("build", exist_ok=True)
    
    # Create dist directory if it doesn't exist
    os.makedirs("dist", exist_ok=True)
    
    # Build command for auto-py-to-exe
    build_cmd = [
        "auto-py-to-exe",
        "--output-dir=dist",
        "--file=main.py",
        "--onefile",
        "--name=VoiceAssistant",
        "--icon=NONE",
        "--add-data=config.json;.",
        "--hidden-import=whisper",
        "--hidden-import=numpy",
        "--hidden-import=openai",
        "--hidden-import=pyautogui",
        "--hidden-import=keyboard",
        "--hidden-import=pydub"
    ]
    
    try:
        # Run auto-py-to-exe
        subprocess.run(build_cmd, check=True)
        print("Build completed successfully!")
        
        # Create a ZIP archive
        create_release_package()
    
    except subprocess.CalledProcessError as e:
        print(f"Error building executable: {e}")
        sys.exit(1)

def create_release_package():
    """Create a release package with all necessary files"""
    print("Creating release package...")
    
    # Create release directory if it doesn't exist
    os.makedirs("release", exist_ok=True)
    
    # Get current date for version
    version = datetime.now().strftime("%Y%m%d")
    release_filename = f"VoiceAssistant_v{version}.zip"
    release_path = os.path.join("release", release_filename)
    
    # Create a ZIP file
    with zipfile.ZipFile(release_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add executable
        zipf.write(os.path.join("dist", "VoiceAssistant.exe"), "VoiceAssistant.exe")
        
        # Add README
        zipf.write("README.md", "README.md")
        
        # Add config.json
        zipf.write("config.json", "config.json")
        
        # Add .env.example
        zipf.write(".env.example", ".env.example")
    
    print(f"Release package created: {release_path}")

if __name__ == "__main__":
    create_executable()