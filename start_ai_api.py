
#!/usr/bin/env python3
"""
Startup script for NFT AI Prediction API
"""

import os
import sys
import subprocess

def main():
    print("🚀 Starting NFT AI Prediction API...")
    
    # Change to backend directory
    os.chdir('backend')
    
    # Start Flask AI API
    try:
        subprocess.run([
            sys.executable, 
            'ai_api.py'
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting AI API: {e}")
        return 1
    except KeyboardInterrupt:
        print("\n⏹️  AI API stopped by user")
        return 0
    
    return 0

if __name__ == "__main__":
    exit(main())
