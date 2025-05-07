import asyncio
import logging
from app.services.llm.llm_service import LLMService
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_story_generation():
    logger.info("Starting story generation test with structured output")
    
    try:
        # Initialize the LLM service
        llm_service = LLMService()
        logger.info("LLM service initialized")
        
        # Define the story schema
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
                }
            },
            "required": ["title", "story_body", "image_url"]
        }
        logger.info("Schema defined")

        # Define system instruction
        system_instruction = """
        You are a children's story generator. Your task is to create engaging, age-appropriate stories.
        Follow these rules:
        1. Create stories that are suitable for children
        2. Include clear moral lessons
        3. Use age-appropriate language
        4. Make the story engaging and fun
        5. Include dialogue and descriptions
        6. Ensure the story has a clear beginning, middle, and end
        """

        # Define the query (prompt)
        query = """
        Create a story with these details:
        - Child's name: Emma
        - Age: 6 years old
        - Preferences: animals, magic, adventures
        - Themes: friendship, courage
        - Moral values: kindness, honesty
        - Favorite animal: unicorn
        - Favorite character: princess

        The story should be engaging, age-appropriate, and include the child's preferences and favorite elements.
        Make sure to include:
        1. A clear beginning, middle, and end
        2. Dialogue between characters
        3. Descriptive language suitable for a 6-year-old
        4. A moral lesson about kindness or honesty
        5. The child's favorite animal (unicorn) and character (princess)
        """

        logger.info("Generating story with structured output...")
        
        # Generate the story using the new method
        result = llm_service.generate_content_with_structured_schema(
            system_instruction=system_instruction,
            query=query,
            response_schema=story_schema
        )
        
        # Print the result
        logger.info("Story generated successfully!")
        print("\nGenerated Story:")
        print(json.dumps(result, indent=2))
        
        # Validate the result structure
        assert "title" in result, "Missing title in response"
        assert "story_body" in result, "Missing story_body in response"
        assert "image_url" in result, "Missing image_url in response"
        
        # Validate content length
        assert len(result["story_body"]) > 200, "Story body is too short"
        assert len(result["title"]) > 0, "Title is empty"
        
        logger.info("All validations passed!")
        
    except AssertionError as ae:
        logger.error(f"Validation error: {str(ae)}")
        raise
    except Exception as e:
        logger.error(f"Error in story generation test: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        # Run the test
        asyncio.run(test_story_generation())
    except Exception as e:
        logger.error(f"Test failed: {str(e)}")
        raise 