import os
import json
import logging
from typing import List, Dict, Optional
from app.models.story.story import Story, StoryRequest, StoryResponse, VocabularyWord
from app.utils.story_processing.pdf_processor import PDFProcessor
from app.services.llm.llm_service import LLMService
from app.services.image.image_service import ImageService
from app.repositories.story_repository import StoryRepository

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

    async def generate_personalized_story(self, request: StoryRequest, child_id: Optional[str] = None) -> StoryResponse:
        """Generate a personalized story using RAG."""
        try:
            # Retrieve relevant stories
            relevant_stories = await self.retrieve_relevant_stories(
                request.age,
                request.preferences,
                request.themes,
                request.moral_values
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
15. Use Ethiopian names, places, and cultural references when appropriate

Example vocabulary table format:
[
    {
        "word": "brave",
        "synonym": "courageous",
        "related_words": ["mountain", "river", "forest"]  # Words from the story context, not related to bravery
    },
    {
        "word": "adventure",
        "synonym": "journey",
        "related_words": ["friend", "map", "treasure"]  # Words from the story context, not related to adventure
    }
]"""

            # Create the query
            query = f"""Create a story (50-100 words) for a {request.age}-year-old Ethiopian child named {request.child_name}.
The story should be:
- Simple and easy to understand
- Use short sentences and simple words
- Include {request.child_name}'s favorite things: {', '.join(request.preferences)}
- Teach about: {', '.join(request.moral_values)}
- Include their favorite animal: {request.favorite_animal or 'an animal'}
- Feature their favorite character: {request.favorite_character or 'a friendly character'}
- Incorporate Ethiopian cultural elements
- Include 3-5 key vocabulary words in a table format with:
  * One clear synonym
  * Three words that are contextually relevant to the story but NOT related to the main word

Keep the story between 50-100 words, perfect for a young child to understand and enjoy.

EXAMPLE STORIES FOR REFERENCE:
{chr(10).join([f'Example {i+1}: {story["title"]}{chr(10)}Summary: {story["content"][:100]}...' for i, story in enumerate(relevant_stories[:2])])}"""

            try:
                # Generate the story using the new structured output method
                story_data = await self.llm_service.generate_content_with_structured_schema(
                    system_instruction=system_instruction,
                    query=query,
                    response_schema=story_schema
                )
                
                logger.info(f"Generated story data: {story_data}")

                # Validate story length
                word_count = len(story_data.get("story_body", "").split())
                if word_count < 50 or word_count > 100:
                    logger.warning(f"Story length ({word_count} words) is not within 50-100 words, generating a new version")
                    # Generate a new version with specific length requirements
                    story_data = await self.llm_service.generate_content_with_structured_schema(
                        system_instruction=system_instruction + f"\nIMPORTANT: The story MUST be between 50-100 words. Current length: {word_count} words.",
                        query=query + f"\nIMPORTANT: Make the story between 50-100 words. Current length: {word_count} words.",
                        response_schema=story_schema
                    )

                # Generate image for the story
                image_url = await self.image_service.generate_story_image({
                    "child_name": request.child_name,
                    "age": request.age,
                    "preferences": request.preferences,
                    "themes": request.themes,
                    "moral_values": request.moral_values,
                    "favorite_animal": request.favorite_animal,
                    "favorite_character": request.favorite_character,
                    "story_title": story_data.get("title", "Untitled"),
                    "story_summary": story_data.get("story_body", "")[:200]  # Send first 200 chars as summary
                })

                # Build the response with all required fields
                story_response = StoryResponse(
                    title=story_data.get("title", "Untitled"),
                    story_body=story_data.get("story_body", ""),
                    image_url=image_url,
                    vocabulary_table=story_data.get("vocabulary_table", [])
                )

                # If child_id is provided, store the story in the database
                if child_id:
                    # Create and store the story
                    story = Story(
                        title=story_response.title,
                        content=story_response.story_body,
                        age_range=f"{request.age}-{request.age + 2}",
                        themes=request.themes,
                        moral_values=request.moral_values,
                        image_url=story_response.image_url,
                        child_id=child_id
                    )
                    await self.story_repository.create_story(story)

                    # Create and store vocabulary words
                    vocabulary_words = [
                        VocabularyWord(
                            word=vocab["word"],
                            synonym=vocab["synonym"],
                            related_words=vocab["related_words"],
                            story_id=story.story_id,
                            child_id=child_id
                        )
                        for vocab in story_data.get("vocabulary_table", [])
                    ]
                    await self.story_repository.create_vocabulary_words(vocabulary_words)

                return story_response
            except ValueError as ve:
                logger.error(f"Validation error in story generation: {str(ve)}")
                raise
            except Exception as e:
                logger.error(f"Error generating story with LLM: {str(e)}")
                raise

        except Exception as e:
            logger.error(f"Error in story generation: {str(e)}")
            # Return a more detailed default story if generation fails
            return StoryResponse(
                title=f"{request.child_name}'s Magical Adventure",
                story_body=f"""
                Once upon a time, in a land filled with {', '.join(request.preferences)}, there lived a brave and kind child named {request.child_name}. 
                
                One sunny morning, {request.child_name} woke up to find a magical map on their bedside table. The map showed a path through the Enchanted Forest, where a great adventure awaited. {request.child_name} packed a small bag with their favorite things and set off on their journey.
                
                As they walked through the forest, they met many interesting creatures. There was a wise old owl who taught them about {request.moral_values[0]}, and a playful squirrel who showed them the importance of {request.moral_values[1]}. Along the way, they helped a lost {request.favorite_animal or 'rabbit'} find its way home, learning about friendship and courage.
                
                The journey wasn't always easy. {request.child_name} faced challenges that tested their bravery and kindness. But with each challenge, they grew stronger and wiser. They learned that true strength comes from helping others and staying true to one's values.
                
                Finally, after many adventures, {request.child_name} reached the end of their journey. They had made new friends, learned important lessons about {', '.join(request.moral_values)}, and discovered the magic that comes from being kind and brave. As they returned home, they knew this was just the beginning of many more adventures to come.
                
                The end.
                """,
                image_url=None
            ) 