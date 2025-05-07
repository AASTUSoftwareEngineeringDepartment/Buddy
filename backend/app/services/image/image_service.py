import aiohttp
import logging
from typing import Dict, Optional
from app.config.settings import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

settings = get_settings()

class ImageService:
    def __init__(self):
        self.image_generator_uri = settings.IMAGE_GENERATOR_URI
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Buddy-App/1.0"
        }

    async def generate_story_image(self, story_data: Dict) -> Optional[str]:
        """
        Generate an image for the story using the image generator service.
        
        Args:
            story_data: Dictionary containing story details and child information
            
        Returns:
            URL of the generated image or None if generation fails
        """
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                async with session.post(
                    self.image_generator_uri,
                    json=story_data,
                    timeout=aiohttp.ClientTimeout(total=30)  # 30 seconds timeout
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        if result.get("status") == "success":
                            return result.get("image_url")
                    elif response.status == 403:
                        logger.error("Permission denied by image generator service")
                        return None
                    else:
                        error_text = await response.text()
                        logger.error(f"Failed to generate image: {response.status} - {error_text}")
                        return None
        except aiohttp.ClientError as e:
            logger.error(f"Network error while generating image: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error generating image: {str(e)}")
            return None 