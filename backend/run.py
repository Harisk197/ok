#!/usr/bin/env python3
"""
Smart Legal & Insurance Document Assistant Backend
Run this script to start the FastAPI server with Ollama DeepSeek integration
"""

import uvicorn
import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

async def check_ollama():
    """Check if Ollama is running and DeepSeek model is available"""
    try:
        import httpx
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Check if Ollama is running
            response = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if response.status_code != 200:
                logger.error("❌ Ollama server is not running!")
                logger.info("Please start Ollama first: ollama serve")
                return False
            
            # Check if DeepSeek model is available
            models = response.json().get("models", [])
            model_names = [model["name"] for model in models]
            
            if settings.OLLAMA_MODEL not in model_names:
                logger.error(f"❌ DeepSeek model '{settings.OLLAMA_MODEL}' not found!")
                logger.info(f"Available models: {model_names}")
                logger.info(f"Please pull the model: ollama pull {settings.OLLAMA_MODEL}")
                return False
            
            logger.info(f"✅ Ollama is running with DeepSeek model: {settings.OLLAMA_MODEL}")
            return True
            
    except Exception as e:
        logger.error(f"❌ Failed to connect to Ollama: {e}")
        logger.info("Make sure Ollama is running: ollama serve")
        return False

def main():
    """Main entry point"""
    print("🚀 Starting Smart Legal Assistant Backend...")
    print(f"📍 API will be available at: http://{settings.API_HOST}:{settings.API_PORT}")
    print(f"📚 API Documentation: http://{settings.API_HOST}:{settings.API_PORT}/docs")
    print("=" * 60)
    
    # Check Ollama connection
    try:
        ollama_ok = asyncio.run(check_ollama())
        if not ollama_ok:
            print("⚠️  WARNING: Ollama not connected - AI features will not work!")
            print("   Please run: ollama serve")
            print("   Then run: ollama pull deepseek-r1:8b")
            print("=" * 60)
    except Exception as e:
        print(f"❌ Error checking Ollama: {e}")
    
    # Start the server
    try:
        print("🔥 Starting FastAPI server...")
        print("   Press Ctrl+C to stop")
        print("=" * 60)
        uvicorn.run(
            "app.main:app",
            host=settings.API_HOST,
            port=settings.API_PORT,
            reload=settings.DEBUG,
            log_level=settings.LOG_LEVEL.lower(),
            access_log=True,
            reload_dirs=["app"] if settings.DEBUG else None
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Server failed to start: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()