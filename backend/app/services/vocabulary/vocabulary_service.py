from typing import List, Optional, Dict
from app.models.story.story import VocabularyWord
from app.services.llm.llm_service import LLMService
from app.repositories.story_repository import StoryRepository
import logging
import json

logger = logging.getLogger(__name__)

class VocabularyService:
    def __init__(self):
        self.llm_service = LLMService()
        self.story_repository = StoryRepository()

    async def generate_vocabulary_words(
        self,
        text: str,
        child_id: str,
        story_id: str,
        age_range: str,
        difficulty_level: str,
        num_words: int = 5
    ) -> List[VocabularyWord]:
        """
        Generate vocabulary words from a given text.
        
        Args:
            text: The text to generate vocabulary words from
            child_id: The ID of the child
            story_id: The ID of the story
            age_range: The age range of the child (e.g., "4-6", "7-9", "10-12")
            difficulty_level: The difficulty level (easy, medium, hard)
            num_words: Number of vocabulary words to generate (default: 5)
            
        Returns:
            List of VocabularyWord objects
        """
        try:
            # Define the JSON schema for vocabulary generation
            vocabulary_schema = {
                "type": "object",
                "properties": {
                    "vocabulary_words": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "word": {
                                    "type": "string",
                                    "description": "The key vocabulary word"
                                },
                                "synonym": {
                                    "type": "string",
                                    "description": "One clear synonym that is age-appropriate"
                                },
                                "meaning": {
                                    "type": "string",
                                    "description": "A short, simple explanation of the word's meaning"
                                },
                                "related_words": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "Three words that are contextually relevant to the story but NOT related to the main word"
                                }
                            },
                            "required": ["word", "synonym", "meaning", "related_words"]
                        }
                    }
                },
                "required": ["vocabulary_words"]
            }

            # Create system instruction
            system_instruction = f"""You are a vocabulary generator for children aged {age_range} years old.
Your task is to identify and explain {num_words} key vocabulary words from the given text.

Follow these rules:
1. Select words that are:
   - Age-appropriate but slightly challenging
   - Important for language development
   - Naturally occurring in the text
   - Not too common or too rare
2. For each word, provide:
   - ONE clear synonym that is also age-appropriate
   - A simple, child-friendly meaning
   - THREE related words that are:
     * Contextually relevant to the story
     * NOT related to the main word or its meaning
     * Help build vocabulary in different directions
     * Age-appropriate
3. Keep explanations simple and clear
4. Use examples that children can relate to
5. Avoid complex definitions
6. Make it fun and engaging

IMPORTANT: The response must be a valid JSON object with a 'vocabulary_words' array containing exactly {num_words} word objects."""

            # Create the prompt
            prompt = f"""Generate {num_words} vocabulary words from this text for a {age_range}-year-old child:

Text:
{text}

The vocabulary words should be:
- {difficulty_level} difficulty level
- Age-appropriate for {age_range} years old
- Educational and clear
- Fun and engaging
- Include a clear synonym and meaning
- Include three contextually relevant but unrelated words

Remember to:
- Keep explanations simple
- Use child-friendly language
- Make it fun and engaging
- Ensure all words are naturally used in the text
- Return exactly {num_words} vocabulary words"""

            # Generate vocabulary using LLM service
            try:
                response_text = await self.llm_service.generate_content_with_json_format(
                    system_instruction=system_instruction,
                    query=prompt,
                    response_schema=vocabulary_schema
                )

                # Parse the response string into a dictionary
                response_dict = json.loads(response_text)

                # Create VocabularyWord objects
                vocabulary_words = [
                    VocabularyWord(
                        word=word["word"],
                        synonym=word["synonym"],
                        meaning=word["meaning"],
                        related_words=word["related_words"],
                        story_id=story_id,
                        child_id=child_id
                    )
                    for word in response_dict["vocabulary_words"]
                ]

                # Store vocabulary words
                await self.story_repository.create_vocabulary_words(vocabulary_words)

                return vocabulary_words

            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {str(e)}")
                raise ValueError(f"Invalid JSON response: {str(e)}")
            except KeyError as e:
                logger.error(f"Missing required field in response: {str(e)}")
                raise ValueError(f"Invalid response format: missing {str(e)}")
            except Exception as e:
                logger.error(f"Error generating vocabulary words: {str(e)}")
                raise ValueError(f"Failed to generate vocabulary words: {str(e)}")

        except Exception as e:
            logger.error(f"Error generating vocabulary words: {str(e)}")
            raise ValueError(f"Failed to generate vocabulary words: {str(e)}")

    async def get_child_vocabulary_words(self, child_id: str) -> List[Dict]:
        """Get all vocabulary words for a specific child with story titles."""
        return await self.story_repository.get_child_vocabulary_words(child_id)

    async def get_vocabulary_words_by_story(self, story_id: str) -> List[VocabularyWord]:
        """Get all vocabulary words for a specific story."""
        cursor = self.story_repository.vocabulary_collection.find({"story_id": story_id})
        words = await cursor.to_list(length=None)
        return [VocabularyWord(**word) for word in words] 