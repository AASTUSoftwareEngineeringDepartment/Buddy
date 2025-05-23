import os
import json
import logging
from typing import List, Dict, Optional
from app.models.story.story import Story, StoryResponse, VocabularyWord
from app.utils.story_processing.pdf_processor import PDFProcessor
from app.services.llm.llm_service import LLMService
from app.services.image.image_service import ImageService
from app.repositories.story_repository import StoryRepository
from app.db.mongo import MongoDB
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class StoryService:
    def __init__(self):
        self.stories_dir = "stories"
        self.pdf_processor = PDFProcessor(self.stories_dir)
        self.llm_service = LLMService()
        self.image_service = ImageService()
        self.story_repository = StoryRepository()
        self.db = MongoDB.get_db()

    async def retrieve_relevant_stories(
        self,
        child_age: int,
        preferences: List[str],
        themes: List[str],
        moral_values: List[str]
    ) -> List[Dict]:
        """Retrieve relevant stories based on child's characteristics."""
        try:
            stories = self.pdf_processor.process_stories()
            if not stories:
                logger.info("No PDF stories found, using default template")
                return [{
                    'title': 'Default Story Template',
                    'content': 'Once upon a time, there was a brave child who went on an adventure.',
                    'relevance_score': 1
                }]
            
            relevant_stories = []
            for story in stories:
                score = 0
                if child_age >= 4 and child_age <= 8:
                    score += 1
                for theme in themes:
                    if theme.lower() in story['content'].lower():
                        score += 1
                for value in moral_values:
                    if value.lower() in story['content'].lower():
                        score += 1
                
                if score > 0:
                    relevant_stories.append({
                        **story,
                        'relevance_score': score
                    })
            
            return sorted(relevant_stories, key=lambda x: x['relevance_score'], reverse=True)
        except Exception as e:
            logger.error(f"Error retrieving stories: {str(e)}")
            return [{
                'title': 'Default Story Template',
                'content': 'Once upon a time, there was a brave child who went on an adventure.',
                'relevance_score': 1
            }]

    async def generate_personalized_story(
        self,
        child_id: str,
        parent_comment: Optional[str] = None,
        original_story: Optional[Story] = None
    ) -> Story:
        """
        Generate a personalized story for a child.
        If parent_comment and original_story are provided, it will regenerate the story with the parent's feedback.
        """
        try:
            # Get child's settings
            child_settings = await self.db["settings"].find_one({
                "child_id": child_id
            })

            # If settings don't exist, create default settings
            if not child_settings:
                logger.info(f"Creating default settings for child {child_id}")
                default_settings = {
                    "child_id": child_id,
                    "preferences": ["animals", "nature", "games"],
                    "themes": ["friendship", "adventure", "learning"],
                    "moral_values": ["kindness", "courage", "honesty"],
                    "favorite_animal": None,
                    "favorite_character": None,
                    "screen_time": 0,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                try:
                    await self.db["settings"].insert_one(default_settings)
                    child_settings = default_settings
                    logger.info(f"Default settings created for child {child_id}")
                except Exception as e:
                    logger.error(f"Failed to create default settings: {str(e)}")
                    raise ValueError(f"Failed to create default settings: {str(e)}")

            # Get child's info
            child = await self.db["children"].find_one({
                "child_id": child_id
            })

            if not child:
                raise ValueError("Child not found")

            # Get child's name from first_name and last_name
            child_name = f"{child.get('first_name', '')} {child.get('last_name', '')}".strip()
            if not child_name:
                child_name = child.get('nickname', 'the child')
            logger.info(f"Using child name: {child_name}")

            # Define the JSON schema for the story response
            story_schema = {
                "$schema": "http://json-schema.org/draft-07/schema#",
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The title of the story"
                    },
                    "content": {
                        "type": "string",
                        "description": "The main content of the story"
                    },
                    "image_url": {
                        "type": "string",
                        "description": "URL for the story's illustration (use an empty string if not available)"
                    }
                },
                "required": ["title", "content"],
                "additionalProperties": False
            }

            # Create system instruction
            system_instruction = f"""You are a children's story generator for young Ethiopian children. 
Your task is to create simple stories between 50-100 words that incorporate Ethiopian culture and values.

Follow these rules:
1. Keep the story between 50-100 words
2. Use simple English words and short sentences
3. Include clear moral lessons: {', '.join(child_settings.get('moral_values', []))}
4. Make the story fun and engaging
5. Use simple dialogue
6. Focus on one main event or lesson
7. Use words that a young child can understand
8. Keep the story structure simple: beginning, middle, end
9. Use repetition and simple patterns
10. Include the child's name ({child_name}) and favorite things naturally
11. Incorporate Ethiopian cultural elements
12. Include themes: {', '.join(child_settings.get('themes', []))}
13. Include preferences: {', '.join(child_settings.get('preferences', []))}

IMPORTANT: Make sure to:
- Keep the story between 50-100 words
- Format the response as valid JSON
- Close all JSON objects properly
- Do not include any additional properties in the response
- Ensure all required fields are present"""

            # Prepare the prompt based on whether this is a new story or an update
            if parent_comment and original_story:
                prompt = f"""Original story: {original_story.content}
Parent's comment: {parent_comment}
Please regenerate this story incorporating the parent's feedback while maintaining the same themes and moral values."""
            else:
                prompt = f"""Create a story (50-100 words) for {child_name} that is:
- Simple and easy to understand
- Uses short sentences and simple words
- Includes {child_name}'s favorite things: {', '.join(child_settings.get('preferences', []))}
- Teaches about: {', '.join(child_settings.get('moral_values', []))}
- Incorporates Ethiopian cultural elements
- Includes themes: {', '.join(child_settings.get('themes', []))}

Remember to:
- Keep the story between 50-100 words
- Format the response as valid JSON
- Close all JSON objects properly
- Do not include any additional properties
- Ensure all required fields are present"""

            # Generate story using LLM
            story_data = await self.llm_service.generate_json_content(
                prompt=f"{system_instruction}\n\n{prompt}",
                json_schema=story_schema
            )

            # Create story object
            story = Story(
                title=story_data["title"],
                content=story_data["content"],
                age_range="4-8",  # Default age range since it's not in settings
                themes=child_settings.get("themes", []),
                moral_values=child_settings.get("moral_values", []),
                image_url=story_data.get("image_url") or None,  # Set to None if not provided
                child_id=child_id
            )

            # Store the story
            stored_story = await self.story_repository.create_story(story)

            # Store vocabulary words if present in the response
            if "vocabulary_table" in story_data:
                vocabulary_words = [
                    VocabularyWord(
                        word=vocab["word"],
                        synonym=vocab["synonym"],
                        meaning=vocab.get("meaning", ""),  # Handle optional meaning field
                        related_words=vocab["related_words"],
                        story_id=stored_story.story_id,
                        child_id=child_id
                    )
                    for vocab in story_data["vocabulary_table"]
                ]
                await self.story_repository.create_vocabulary_words(vocabulary_words)

            return stored_story

        except ValueError as ve:
            logger.error(f"Value error in story generation: {str(ve)}")
            raise
        except Exception as e:
            logger.error(f"Error in story generation: {str(e)}")
            raise ValueError(f"Failed to generate story: {str(e)}")

    async def generate_personalized_story_using_rag(
        self,
        child_id: str,
        parent_comment: Optional[str] = None,
        original_story: Optional[Story] = None
    ) -> Story:
        """Generate a personalized story using RAG."""
        try:
            # Get child's settings
            child_settings = await self.db["settings"].find_one({
                "child_id": child_id
            })

            # If settings don't exist, create default settings
            if not child_settings:
                default_settings = {
                    "child_id": child_id,
                    "age_range": "4-8",
                    "themes": ["friendship", "adventure", "learning"],
                    "moral_values": ["kindness", "courage", "honesty"],
                    "preferences": ["animals", "nature", "games"]
                }
                await self.db["settings"].insert_one(default_settings)
                child_settings = default_settings

            # Get child's info
            child = await self.db["children"].find_one({
                "child_id": child_id
            })

            if not child:
                raise ValueError("Child not found")

            # Retrieve relevant stories
            relevant_stories = await self.retrieve_relevant_stories(
                int(child_settings.get("age_range", "4-8").split("-")[0]),
                child_settings.get("preferences", []),
                child_settings.get("themes", []),
                child_settings.get("moral_values", [])
            )

            # Define the JSON schema for the story response
            story_schema = {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The title of the story"
                    },
                    "story_body": {
                        "type": "string",
                        "description": "The main content of the story"
                    },
                    "image_url": {
                        "type": "string",
                        "description": "URL for the story's illustration"
                    },
                    "vocabulary_table": {
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
                                    "description": "One synonym of the key word"
                                },
                                "related_words": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "Three words that are contextually relevant to the story but NOT related to the main word. Must provide exactly three words."
                                }
                            },
                            "required": ["word", "synonym", "related_words"]
                        }
                    }
                },
                "required": ["title", "story_body", "image_url", "vocabulary_table"]
            }

            # Create system instruction
            system_instruction = """You are a children's story generator for young Ethiopian children (ages 4-8). Your task is to create simple stories between 50-100 words that incorporate Ethiopian culture, values, and vocabulary learning.

Follow these rules:
1. Keep the story between 50-100 words (not shorter, not longer)
2. Use simple English words and short sentences
3. Include clear moral lessons
4. Make the story fun and engaging
5. Use simple dialogue
6. Focus on one main event or lesson
7. Use words that a 4-8 year old can understand
8. Keep the story structure simple: beginning, middle, end
9. Use repetition and simple patterns
10. Include the child's name and favorite things naturally
11. Incorporate Ethiopian cultural elements (e.g., traditional foods, clothing, places, or customs)
12. Include 3-5 key vocabulary words that are:
    - Age-appropriate but slightly challenging
    - Relevant to the story's context
    - Not commonly used by young children
    - Important for language development
13. For each vocabulary word, provide:
    - ONE clear synonym that is also age-appropriate
    - THREE words that are:
        * Contextually relevant to the story
        * NOT related to the main word or its meaning
        * Help build vocabulary in different directions
        * Age-appropriate
14. Make sure the vocabulary words are naturally integrated into the story
15. Use Ethiopian names, places, and cultural references when appropriate"""

            # Prepare the prompt based on whether this is a new story or an update
            if parent_comment and original_story:
                prompt = f"""Original story: {original_story.content}
Parent's comment: {parent_comment}
Please regenerate this story incorporating the parent's feedback while maintaining the same themes and moral values."""
            else:
                prompt = f"""Create a story (50-100 words) for a {child_settings.get('age_range', '4-8')}-year-old Ethiopian child named {child['name']}.
The story should be:
- Simple and easy to understand
- Use short sentences and simple words
- Include {child['name']}'s favorite things: {', '.join(child_settings.get('preferences', []))}
- Teach about: {', '.join(child_settings.get('moral_values', []))}
- Incorporate Ethiopian cultural elements
- Include 3-5 key vocabulary words in a table format with:
  * One clear synonym
  * Three words that are contextually relevant to the story but NOT related to the main word

Keep the story between 50-100 words, perfect for a young child to understand and enjoy.

EXAMPLE STORIES FOR REFERENCE:
{chr(10).join([f'Example {i+1}: {story["title"]}{chr(10)}Summary: {story["content"][:100]}...' for i, story in enumerate(relevant_stories[:2])])}"""

            try:
                # Generate the story using the new structured output method
                story_data = await self.llm_service.generate_json_content(
                    prompt=f"{system_instruction}\n\n{prompt}",
                    json_schema=story_schema
                )
                
                logger.info(f"Generated story data: {story_data}")

                # Validate story length
                word_count = len(story_data.get("story_body", "").split())
                if word_count < 50 or word_count > 100:
                    logger.warning(f"Story length ({word_count} words) is not within 50-100 words, generating a new version")
                    # Generate a new version with specific length requirements
                    story_data = await self.llm_service.generate_json_content(
                        prompt=f"{system_instruction}\nIMPORTANT: The story MUST be between 50-100 words. Current length: {word_count} words.\n\n{prompt}",
                        json_schema=story_schema
                    )

                # Generate image for the story
                image_url = await self.image_service.generate_story_image({
                    "child_name": child["name"],
                    "age": int(child_settings.get("age_range", "4-8").split("-")[0]),
                    "preferences": child_settings.get("preferences", []),
                    "themes": child_settings.get("themes", []),
                    "moral_values": child_settings.get("moral_values", []),
                    "story_title": story_data.get("title", "Untitled"),
                    "story_summary": story_data.get("story_body", "")[:200]  # Send first 200 chars as summary
                })

                # Create story object
                story = Story(
                    title=story_data.get("title", "Untitled"),
                    content=story_data.get("story_body", ""),
                    age_range=child_settings.get("age_range", "4-8"),
                    themes=child_settings.get("themes", []),
                    moral_values=child_settings.get("moral_values", []),
                    image_url=image_url or None,  # Set to None if not provided
                    child_id=child_id
                )

                # Store the story
                stored_story = await self.story_repository.create_story(story)

                # Store vocabulary words if present in the response
                if "vocabulary_table" in story_data:
                    vocabulary_words = [
                        VocabularyWord(
                            word=vocab["word"],
                            synonym=vocab["synonym"],
                            meaning=vocab.get("meaning", ""),  # Handle optional meaning field
                            related_words=vocab["related_words"],
                            story_id=stored_story.story_id,
                            child_id=child_id
                        )
                        for vocab in story_data["vocabulary_table"]
                    ]
                    await self.story_repository.create_vocabulary_words(vocabulary_words)

                return stored_story

            except ValueError as ve:
                logger.error(f"Validation error in story generation: {str(ve)}")
                raise
            except Exception as e:
                logger.error(f"Error generating story with LLM: {str(e)}")
                raise

        except Exception as e:
            logger.error(f"Error in story generation: {str(e)}")
            raise 