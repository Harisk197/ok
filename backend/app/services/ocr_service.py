import os
import asyncio
from typing import Optional
import pytesseract
from PIL import Image
import PyPDF2
import io

from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

class OCRService:
    def __init__(self):
        # Set Tesseract command path if specified
        if settings.TESSERACT_CMD and os.path.exists(settings.TESSERACT_CMD):
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
    
    def is_available(self) -> bool:
        """Check if OCR service is available"""
        try:
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False
    
    async def extract_text(self, file_path: str) -> str:
        """Extract text from document using OCR"""
        try:
            file_ext = file_path.split('.')[-1].lower()
            
            if file_ext == 'pdf':
                return await self._extract_from_pdf(file_path)
            elif file_ext in ['jpg', 'jpeg', 'png']:
                return await self._extract_from_image(file_path)
            else:
                logger.warning(f"Unsupported file type for OCR: {file_ext}")
                return ""
                
        except Exception as e:
            logger.error(f"OCR extraction failed for {file_path}: {e}")
            return f"Error extracting text: {str(e)}"
    
    async def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            text_content = []
            
            # Run PDF extraction in thread pool to avoid blocking
            def extract_pdf_text():
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    
                    for page_num, page in enumerate(pdf_reader.pages):
                        try:
                            page_text = page.extract_text()
                            if page_text.strip():
                                text_content.append(f"--- Page {page_num + 1} ---")
                                text_content.append(page_text)
                        except Exception as e:
                            logger.warning(f"Failed to extract text from page {page_num + 1}: {e}")
                            continue
                
                return "\n".join(text_content)
            
            # Run in thread pool
            loop = asyncio.get_event_loop()
            extracted_text = await loop.run_in_executor(None, extract_pdf_text)
            
            # If PDF text extraction failed or returned little text, try OCR on PDF pages
            if len(extracted_text.strip()) < 100:
                logger.info("PDF text extraction yielded little content, attempting OCR...")
                return await self._ocr_pdf_pages(file_path)
            
            logger.info(f"✅ Extracted {len(extracted_text)} characters from PDF")
            return extracted_text
            
        except Exception as e:
            logger.error(f"PDF text extraction failed: {e}")
            return f"PDF processing error: {str(e)}"
    
    async def _extract_from_image(self, file_path: str) -> str:
        """Extract text from image file using OCR"""
        try:
            def ocr_image():
                image = Image.open(file_path)
                
                # Convert to RGB if necessary
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Perform OCR
                text = pytesseract.image_to_string(
                    image,
                    config='--oem 3 --psm 6'  # OCR Engine Mode 3, Page Segmentation Mode 6
                )
                
                return text.strip()
            
            # Run OCR in thread pool
            loop = asyncio.get_event_loop()
            extracted_text = await loop.run_in_executor(None, ocr_image)
            
            logger.info(f"✅ OCR extracted {len(extracted_text)} characters from image")
            return extracted_text
            
        except Exception as e:
            logger.error(f"Image OCR failed: {e}")
            return f"Image OCR error: {str(e)}"
    
    async def _ocr_pdf_pages(self, file_path: str) -> str:
        """Convert PDF pages to images and perform OCR"""
        try:
            # This would require pdf2image library for production use
            # For now, return a placeholder
            logger.warning("PDF OCR not fully implemented - would need pdf2image library")
            return "PDF OCR requires additional setup with pdf2image library"
            
        except Exception as e:
            logger.error(f"PDF OCR failed: {e}")
            return f"PDF OCR error: {str(e)}"
    
    def preprocess_image(self, image_path: str) -> str:
        """Preprocess image for better OCR results"""
        try:
            # This could include image enhancement techniques
            # For now, return the original path
            return image_path
        except Exception as e:
            logger.error(f"Image preprocessing failed: {e}")
            return image_path