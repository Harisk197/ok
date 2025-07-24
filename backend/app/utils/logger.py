import logging
import sys
from typing import Optional
from app.config import settings

def get_logger(name: Optional[str] = None) -> logging.Logger:
    """Get configured logger instance"""
    
    logger = logging.getLogger(name or __name__)
    
    # Avoid adding multiple handlers
    if logger.handlers:
        return logger
    
    # Set log level
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    logger.setLevel(log_level)
    
    # Create console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    handler.setFormatter(formatter)
    
    # Add handler to logger
    logger.addHandler(handler)
    
    return logger