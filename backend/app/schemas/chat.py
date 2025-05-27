from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    """Schema for chat request."""
    query: str
    n_chunks: Optional[int] = 3

class ChatResponse(BaseModel):
    """Schema for chat response."""
    response: str
    context_used: Optional[str] = None 