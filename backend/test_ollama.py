#!/usr/bin/env python3
"""
Test script to verify Ollama connection and DeepSeek model
Run this to debug Ollama issues
"""

import asyncio
import httpx
import json

async def test_ollama():
    """Test Ollama connection and model availability"""
    base_url = "http://localhost:11434"
    model = "deepseek-r1:8b"
    
    print("🔍 Testing Ollama Connection...")
    print(f"Base URL: {base_url}")
    print(f"Model: {model}")
    print("-" * 50)
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Test basic connection
            print("1. Testing basic connection...")
            response = await client.get(f"{base_url}/api/tags")
            print(f"   Status: {response.status_code}")
            
            if response.status_code != 200:
                print("❌ Ollama is not running!")
                print("   Please start Ollama with: ollama serve")
                return False
            
            # Check available models
            print("2. Checking available models...")
            models = response.json().get("models", [])
            model_names = [m["name"] for m in models]
            print(f"   Available models: {model_names}")
            
            if model not in model_names:
                print(f"❌ Model '{model}' not found!")
                print(f"   Please install with: ollama pull {model}")
                return False
            
            # Test model generation
            print("3. Testing model generation...")
            test_payload = {
                "model": model,
                "prompt": "Hello, how are you?",
                "stream": False
            }
            
            response = await client.post(
                f"{base_url}/api/generate",
                json=test_payload,
                timeout=30.0
            )
            
            print(f"   Generation status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   Response: {result.get('response', 'No response')[:100]}...")
                print("✅ Ollama is working correctly!")
                return True
            else:
                print(f"❌ Generation failed: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("   Make sure Ollama is running: ollama serve")
        return False

if __name__ == "__main__":
    asyncio.run(test_ollama())