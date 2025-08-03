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
            logger.info(f"Testing Ollama connection to {self.base_url}")
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                logger.info(f"Ollama response status: {response.status_code}")
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    model_names = [model["name"] for model in models]
                    logger.info(f"Available models: {model_names}")
                    
                    if self.model in model_names:
                        logger.info(f"✅ DeepSeek model '{self.model}' is available")
                        return True
                    else:
                        logger.warning(f"⚠️ Model '{self.model}' not found. Available models: {model_names}")
                        return False
                else:
                    logger.error(f"Ollama API returned status {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Ollama connection failed: {e}")
            logger.error(f"Connection error type: {type(e)}")
            return False
    
    async def stream_chat(
        self, 
        message: str, 
        context: str = "", 
        history: List[Dict[str, Any]] = None
    ) -> AsyncGenerator[str, None]:
        """Stream chat response from Ollama DeepSeek model"""
        try:
            logger.info("=== OLLAMA STREAM_CHAT START ===")
            logger.info(f"Message length: {len(message)}")
            logger.info(f"Context length: {len(context)}")
            logger.info(f"History items: {len(history) if history else 0}")
            
            # Build the prompt with legal document context
            system_prompt = self._build_system_prompt()
            full_prompt = self._build_full_prompt(message, context, history)
            logger.info(f"Full prompt length: {len(full_prompt)} characters")
            logger.info(f"System prompt length: {len(system_prompt)} characters")
            
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
                    "stop": ["Human:", "User:", "Assistant:"],
                }
            }
            
            logger.info(f"=== OLLAMA REQUEST ===")
            logger.info(f"Model: {self.model}")
            logger.info(f"URL: {self.base_url}/api/generate")
            logger.info(f"Payload keys: {list(payload.keys())}")
            
            # Test connection first
            logger.info("Testing Ollama connection before streaming...")
            connection_ok = await self.test_connection()
            logger.info(f"Connection test result: {connection_ok}")
            
            if not connection_ok:
                logger.error("Ollama connection test failed")
                raise Exception("Ollama service is not available. Please ensure Ollama is running and the DeepSeek model is installed.")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info("=== MAKING OLLAMA HTTP REQUEST ===")
                async with client.stream(
                    "POST",
                    f"{self.base_url}/api/generate",
                    json=payload
                ) as response:
                    logger.info(f"HTTP Status: {response.status_code}")
                    logger.info(f"Response headers: {dict(response.headers)}")
                    
                    if response.status_code != 200:
                        error_text = await response.aread()
                        error_msg = f"Ollama API error {response.status_code}: {error_text.decode()}"
                        logger.error(error_msg)
                        raise Exception(error_msg)
                    
                    total_tokens = 0
                    logger.info("=== READING STREAM RESPONSE ===")
                    async for line in response.aiter_lines():
                        if line.strip():
                            try:
                                chunk = json.loads(line)
                                
                                if "response" in chunk:
                                    total_tokens += 1
                                    if total_tokens <= 5 or total_tokens % 50 == 0:  # Log first 5 and every 50th
                                        logger.debug(f"Token {total_tokens}: {repr(chunk['response'])}")
                                    yield chunk["response"]
                                
                                if "error" in chunk:
                                    error_msg = chunk["error"]
                                    logger.error(f"Ollama returned error: {error_msg}")
                                    raise Exception(f"Ollama error: {error_msg}")
                                
                                if chunk.get("done", False):
                                    logger.info(f"=== STREAM COMPLETED ===")
                                    logger.info(f"Total tokens: {total_tokens}")
                                    break
                                    
                            except json.JSONDecodeError:
                                logger.warning(f"JSON parse error: {repr(line)}")
                                continue
                                
        except Exception as e:
            logger.error(f"=== OLLAMA STREAMING FAILED ===")
            logger.error(f"Error: {e}")
            logger.error(f"Stream error type: {type(e).__name__}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            # Provide specific error messages
            error_str = str(e).lower()
            if "connection" in error_str or "connect" in error_str:
                error_msg = "Cannot connect to Ollama. Please run 'ollama serve' to start the service."
            elif "timeout" in error_str:
                error_msg = "Ollama is taking too long to respond. The model might be loading."
            elif "model" in error_str:
                error_msg = f"Model '{self.model}' not found. Please run 'ollama pull {self.model}'"
            elif "not available" in error_str:
                error_msg = str(e)
            else:
                error_msg = f"Ollama error: {str(e)}"
            
            logger.error(f"Yielding error message: {error_msg}")
            yield error_msg
    
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
                    logger.error(f"Ollama API error: {response.status_code}")
                    raise Exception(f"Ollama API error: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"Simple response generation failed: {e}")
            return f"Error generating response: {str(e)}"