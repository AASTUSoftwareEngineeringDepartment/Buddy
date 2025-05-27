from fastapi import APIRouter, Depends, HTTPException
from app.services.llm.chat_service import ChatService
from app.schemas.chat import ChatRequest, ChatResponse
from app.api.v1.dependencies.auth import get_current_user, require_role
from app.models.enums import UserRole
import logging

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)

@router.post("/ask", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: tuple[str, UserRole] = Depends(get_current_user)
):
    """
    Chat with AI using relevant chunks as context.
    Only accessible by children.
    
    Args:
        request: Chat request containing query and optional number of chunks
        current_user: Current user tuple (user_id, role)
        
    Returns:
        ChatResponse containing AI response and used context
    """
    try:
        user_id, user_role = current_user
        
        # Verify that the user is a child
        if user_role != UserRole.CHILD:
            raise HTTPException(
                status_code=403,
                detail="Only children can use the chat feature"
            )
        
        # Initialize chat service
        chat_service = ChatService()
        
        # Get response from chat service
        result = await chat_service.chat_with_context(
            query=request.query,
            child_id=user_id,
            n_chunks=request.n_chunks
        )
        
        return ChatResponse(
            response=result["response"],
            context_used=result["context_used"]
        )
        
    except ValueError as ve:
        logger.error(f"Value error in chat: {str(ve)}")
        raise HTTPException(
            status_code=400,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat request: {str(e)}"
        ) 