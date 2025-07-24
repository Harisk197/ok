import httpx
import json
import asyncio
from typing import AsyncGenerator, List, Dict, Any, Optional
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT
        
    async def test_connection(self) -> bool:
        """Test connection to Ollama server"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    model_names = [model["name"] for model in models]
                    
                    if self.model in model_names:
                        logger.info(f"✅ DeepSeek model '{self.model}' is available")
                        return True
                    else:
                        logger.warning(f"⚠️ Model '{self.model}' not found. Available models: {model_names}")
                        return False
                return False
        except Exception as e:
            logger.error(f"❌ Ollama connection failed: {e}")
            return False
    
    async def stream_chat(
        self, 
        message: str, 
        context: str = "", 
        history: List[Dict[str, Any]] = None
    ) -> AsyncGenerator[str, None]:
        """Stream chat response from Ollama DeepSeek model"""
        try:
            # Build the prompt with legal document context
            system_prompt = self._build_system_prompt()
            full_prompt = self._build_full_prompt(message, context, history)
            
            payload = {
                "model": self.model,
                "prompt": full_prompt,
                "system": system_prompt,
                "stream": True,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "top_k": 40,
                    "num_predict": 2048,
                }
            }
            
            logger.info(f"🤖 Sending request to DeepSeek model: {self.model}")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/api/generate",
                    json=payload
                ) as response:
                    if response.status_code != 200:
                        error_text = await response.aread()
                        raise Exception(f"Ollama API error: {response.status_code} - {error_text}")
                    
                    async for line in response.aiter_lines():
                        if line.strip():
                            try:
                                chunk = json.loads(line)
                                if "response" in chunk:
                                    yield chunk["response"]
                                
                                if chunk.get("done", False):
                                    logger.info("✅ DeepSeek response completed")
                                    break
                                    
                            except json.JSONDecodeError:
                                continue
                                
        except Exception as e:
            logger.error(f"❌ Ollama streaming failed: {e}")
            yield f"I apologize, but I'm having trouble connecting to the AI service. Error: {str(e)}"
    
    def _build_system_prompt(self) -> str:
        """Build system prompt for legal document analysis"""
        return """You are a specialized AI legal assistant with expertise in analyzing legal and insurance documents. Your role is to:

1. **Analyze Legal Documents**: Carefully examine contracts, policies, and legal agreements
2. **Provide Clear Explanations**: Break down complex legal language into understandable terms
3. **Identify Key Clauses**: Highlight important terms, conditions, and potential risks
4. **Answer Specific Questions**: Respond to user queries about their documents with precision
5. **Maintain Professional Tone**: Use clear, professional language appropriate for legal matters

**Guidelines:**
- Always base your responses on the provided document content
- Cite specific clause numbers when referencing document sections
- Explain legal implications in plain language
- Highlight both benefits and potential risks
- If information is unclear or missing, state this explicitly
- Never provide legal advice - only document analysis and explanation
- Be thorough but concise in your responses

**Response Format:**
- Start with a direct answer to the user's question
- Reference specific clauses or sections when applicable
- Explain the implications in simple terms
- Mention any important related information from the documents"""

    def _build_full_prompt(
        self, 
        message: str, 
        context: str = "", 
        history: List[Dict[str, Any]] = None
    ) -> str:
        """Build the complete prompt with context and history"""
        prompt_parts = []
        
        # Add document context if available
        if context:
            prompt_parts.append("**DOCUMENT CONTEXT:**")
            prompt_parts.append(context)
            prompt_parts.append("\n" + "="*50 + "\n")
        
        # Add conversation history if available
        if history:
            prompt_parts.append("**CONVERSATION HISTORY:**")
            for msg in history[-5:]:  # Last 5 messages for context
                role = "User" if msg.get("role") == "user" else "Assistant"
                prompt_parts.append(f"{role}: {msg.get('content', '')}")
            prompt_parts.append("\n" + "="*50 + "\n")
        
        # Add current user question
        prompt_parts.append("**CURRENT QUESTION:**")
        prompt_parts.append(message)
        
        # Add instruction for response
        prompt_parts.append("\n**Please provide a detailed analysis based on the document context above:**")
        
        return "\n".join(prompt_parts)
    
    async def generate_simple_response(self, prompt: str) -> str:
        """Generate a simple non-streaming response"""
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 1024,
                }
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("response", "No response generated")
                else:
                    raise Exception(f"Ollama API error: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"Simple response generation failed: {e}")
            return f"Error generating response: {str(e)}"