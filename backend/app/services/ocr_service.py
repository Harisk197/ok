import os
import asyncio
from typing import Optional
import pytesseract
from PIL import Image
import PyPDF2
import io
import fitz  # PyMuPDF for better PDF handling
from pdf2image import convert_from_path
import tempfile

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
            
            # First try PyMuPDF for better text extraction
            def extract_with_pymupdf():
                try:
                    doc = fitz.open(file_path)
                    full_text = []
                    
                    for page_num in range(len(doc)):
                        page = doc.load_page(page_num)
                        page_text = page.get_text()
                        
                        if page_text.strip():
                            full_text.append(f"--- Page {page_num + 1} ---")
                            full_text.append(page_text)
                    
                    doc.close()
                    return "\n".join(full_text)
                except Exception as e:
                    logger.warning(f"PyMuPDF extraction failed: {e}")
                    return ""
            
            # Run PDF extraction in thread pool to avoid blocking
            def extract_pdf_text():
                # Try PyMuPDF first
                pymupdf_text = extract_with_pymupdf()
                if len(pymupdf_text.strip()) > 100:
                    return pymupdf_text
                
                # Fallback to PyPDF2
                logger.info("Falling back to PyPDF2 extraction")
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
            return f"Error extracting text from PDF: {str(e)}. This might be a scanned document that requires OCR processing."
    
    async def _extract_from_image(self, file_path: str) -> str:
        """Extract text from image file using OCR"""
        try:
            def ocr_image():
                image = Image.open(file_path)
                
                # Convert to RGB if necessary
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Preprocess image for better OCR
                image = self._preprocess_image_for_ocr(image)
                
                # Perform OCR
                text = pytesseract.image_to_string(
                    image,
                    config='--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,;:!?()-[]{}"\''
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
            def pdf_to_images_ocr():
                # Convert PDF to images
                images = convert_from_path(file_path, dpi=200)
                extracted_texts = []
                
                for i, image in enumerate(images):
                    try:
                        # Preprocess image
                        processed_image = self._preprocess_image_for_ocr(image)
                        
                        # Perform OCR
                        text = pytesseract.image_to_string(
                            processed_image,
                            config='--oem 3 --psm 6'
                        )
                        
                        if text.strip():
                            extracted_texts.append(f"--- Page {i + 1} ---")
                            extracted_texts.append(text.strip())
                            
                    except Exception as e:
                        logger.warning(f"OCR failed for page {i + 1}: {e}")
                        continue
                
                return "\n".join(extracted_texts)
            
            # Run in thread pool
            loop = asyncio.get_event_loop()
            extracted_text = await loop.run_in_executor(None, pdf_to_images_ocr)
            
            logger.info(f"✅ PDF OCR extracted {len(extracted_text)} characters")
            return extracted_text
            
        except Exception as e:
            logger.error(f"PDF OCR failed: {e}")
            return f"PDF OCR error: {str(e)}"
    
    def _preprocess_image_for_ocr(self, image: Image.Image) -> Image.Image:
        """Preprocess image for better OCR results"""
        try:
            # Convert to grayscale
            if image.mode != 'L':
                image = image.convert('L')
            
            # Enhance contrast and sharpness
            from PIL import ImageEnhance, ImageFilter
            
            # Enhance contrast
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(1.5)
            
            # Enhance sharpness
            enhancer = ImageEnhance.Sharpness(image)
            image = enhancer.enhance(2.0)
            
            # Apply slight blur to reduce noise
            image = image.filter(ImageFilter.MedianFilter(size=3))
            
            return image
            
        except Exception as e:
            logger.warning(f"Image preprocessing failed: {e}")
            return image
    
    def extract_legal_clauses(self, text: str) -> list:
        """Extract legal clauses from text using improved regex patterns"""
        import re
        
        clauses = []
        
        # Enhanced patterns for legal clause detection
        clause_patterns = [
            # Numbered clauses: 12.2, 15.4, etc.
            r'(\d+\.\d+)\s*[:\-\.]?\s*([A-Z][^.]*(?:\.[^.]*)*\.)',
            # Section clauses: Section 12, Section IV, etc.
            r'(Section\s+(?:\d+|[IVX]+))\s*[:\-\.]?\s*([A-Z][^.]*(?:\.[^.]*)*\.)',
            # Article clauses: Article IV, Article 12, etc.
            r'(Article\s+(?:[IVX]+|\d+))\s*[:\-\.]?\s*([A-Z][^.]*(?:\.[^.]*)*\.)',
            # Lettered clauses: (a), (b), etc.
            r'(\([a-z]\))\s*([A-Z][^.]*(?:\.[^.]*)*\.)',
            # Paragraph clauses: Para 12, Paragraph 5, etc.
            r'((?:Para|Paragraph)\s+\d+)\s*[:\-\.]?\s*([A-Z][^.]*(?:\.[^.]*)*\.)',
        ]
        
        for pattern in clause_patterns:
            matches = re.finditer(pattern, text, re.MULTILINE | re.IGNORECASE)
            for match in matches:
                clause_number = match.group(1).strip()
                clause_text = match.group(2).strip()
                
                # Filter out very short or very long matches
                if 20 <= len(clause_text) <= 500:
                    clauses.append({
                        "number": clause_number,
                        "text": clause_text,
                        "confidence": 0.8,
                        "type": self._classify_clause_type(clause_text)
                    })
        
        # Remove duplicates and limit results
        seen_texts = set()
        unique_clauses = []
        for clause in clauses:
            if clause["text"] not in seen_texts:
                seen_texts.add(clause["text"])
                unique_clauses.append(clause)
        
        return unique_clauses[:15]  # Limit to first 15 clauses
    
    def _classify_clause_type(self, text: str) -> str:
        """Classify clause type based on content"""
        text_lower = text.lower()
        
        # Critical clause indicators
        critical_keywords = [
            'terminate', 'termination', 'cancel', 'cancellation', 'penalty', 'fee',
            'liability', 'damages', 'breach', 'default', 'void', 'null',
            'forfeit', 'loss', 'exclude', 'exclusion', 'limitation'
        ]
        
        # Supportive clause indicators
        supportive_keywords = [
            'benefit', 'coverage', 'protection', 'right', 'entitle', 'guarantee',
            'refund', 'compensation', 'reimbursement', 'support', 'assistance'
        ]
        
        if any(keyword in text_lower for keyword in critical_keywords):
            return "critical"
        elif any(keyword in text_lower for keyword in supportive_keywords):
            return "supportive"
        else:
            return "neutral"