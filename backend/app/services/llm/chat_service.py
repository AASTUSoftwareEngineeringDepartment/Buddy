from typing import List, Dict, Optional
from app.config.settings import get_settings
from app.services.vector_store import VectorStore
from app.services.llm.llm_service import LLMService
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

class ChatService:
    def __init__(self):
        self.vector_store = VectorStore()
        self.llm_service = LLMService()
        
    async def get_relevant_chunks(self, query: str, n_results: int = 3) -> List[Dict]:
        """Get relevant chunks from vector store for context."""
        try:
            chunks = self.vector_store.search_chunks(query, n_results=n_results)
            return chunks
        except Exception as e:
            logger.error(f"Error getting relevant chunks: {str(e)}")
            return []

    def format_context(self, chunks: List[Dict]) -> str:
        """Format chunks into context for the model."""
        context = "Here is some relevant information:\n\n"
        for chunk in chunks:
            context += f"From {chunk['metadata']['book_title']}, page {chunk['metadata']['page_number']}:\n"
            context += f"{chunk['content']}\n\n"
        return context

    async def chat_with_context(
        self,
        query: str,
        child_id: str,
        n_chunks: int = 3
    ) -> Dict[str, str]:
        """
        Chat with Gemini using relevant chunks as context.
        
        Args:
            query: The child's question
            child_id: The child's ID for tracking
            n_chunks: Number of relevant chunks to use as context
            
        Returns:
            Dict containing the response and used context
        """
        try:
            # Get relevant chunks
            chunks = await self.get_relevant_chunks(query, n_results=n_chunks)
            
            if not chunks:
                # If no relevant chunks found, just answer the question
                prompt = f"""You are a helpful educational assistant for children. 
                Keep your answers simple and child-friendly.
                
                Child's question: {query}"""
                
                response = await self.llm_service.generate_json_content(
                    prompt=prompt,
                    json_schema={
                        "type": "object",
                        "properties": {
                            "response": {
                                "type": "string",
                                "description": "The answer to the child's question"
                            }
                        },
                        "required": ["response"]
                    }
                )
                return {
                    "response": response["response"],
                    "context_used": None
                }
            
            # Format context
            context = self.format_context(chunks)
            
            # Create prompt with context
            prompt = f"""You are a helpful educational assistant for children. 
            Use the following information to help answer the child's question.
            If the information doesn't help answer the question, you can use your general knowledge.
            Keep your answers simple and child-friendly.

            Context:
            {context}

            Child's question: {query}"""
            
            # Generate response using LLM service
            response = await self.llm_service.generate_json_content(
                prompt=prompt,
                json_schema={
                    "type": "object",
                    "properties": {
                        "response": {
                            "type": "string",
                            "description": "The answer to the child's question"
                        }
                    },
                    "required": ["response"]
                }
            )
            
            return {
                "response": response["response"],
                "context_used": context
            }
            
        except Exception as e:
            logger.error(f"Error in chat_with_context: {str(e)}")
            raise ValueError(f"Failed to generate response: {str(e)}") 