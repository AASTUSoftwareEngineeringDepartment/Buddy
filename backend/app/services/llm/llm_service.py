import os
import google.generativeai as genai
from pydantic import BaseModel, create_model
import json
import logging
from typing import Dict, Any, Type, List
from app.config.settings import get_settings
from jsonschema import validate, ValidationError

# Add this import for structured output
from google.generativeai.types import GenerationConfig

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

settings = get_settings()

class LLMService:
    def __init__(self, model_name: str = "gemini-2.5-flash-preview-04-17"):
        """
        Initialize the LLM service with the specified model.
        
        Args:
            model_name: The name of the model to use. Defaults to Gemini 2.5 Flash.
        """
        self.model_name = model_name
        
        # Configure Gemini
        gemini_key = settings.GEMINI_API_KEY
        if not gemini_key:
            logger.error("No GEMINI_API_KEY found in settings")
            raise ValueError("GEMINI_API_KEY is required")
        
        try:
            genai.configure(api_key=gemini_key)
            # Initialize the model with safety settings
            generation_config = {
                "temperature": 0.7,
                "top_p": 1,
                "top_k": 1,
                "max_output_tokens": 2048,
            }
            
            safety_settings = [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
            ]
            
            self.model = genai.GenerativeModel(
                model_name=self.model_name,
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            self.client = genai
            logger.info(f"LLM model {model_name} initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize LLM model: {str(e)}")
            raise

    def _create_pydantic_model(self, schema: Dict[str, Any]) -> Type[BaseModel]:
        """
        Create a Pydantic model from a JSON schema.
        """
        if not isinstance(schema, dict) or "properties" not in schema:
            raise ValueError("Invalid schema format")

        fields = {}
        for field_name, field_schema in schema["properties"].items():
            field_type = str  # Default to string
            if field_schema.get("type") == "integer":
                field_type = int
            elif field_schema.get("type") == "number":
                field_type = float
            elif field_schema.get("type") == "boolean":
                field_type = bool
            elif field_schema.get("type") == "array":
                # Get the type of array items
                items_schema = field_schema.get("items", {})
                item_type = str  # Default to string
                if items_schema.get("type") == "integer":
                    item_type = int
                elif items_schema.get("type") == "number":
                    item_type = float
                elif items_schema.get("type") == "boolean":
                    item_type = bool
                field_type = List[item_type]
            
            required = field_name in schema.get("required", [])
            fields[field_name] = (field_type, ... if required else None)

        return create_model("DynamicModel", **fields)

    def _extract_json_from_text(self, text: str) -> str:
        """
        Extract JSON from text, handling various formats.
        """
        # Remove any markdown code blocks
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        
        # Find the first { and last }
        start = text.find("{")
        end = text.rfind("}")
        
        if start == -1 or end == -1:
            raise ValueError("No JSON object found in response")
            
        # Extract the JSON and clean it
        json_text = text[start:end + 1].strip()
        
        # Remove any remaining markdown or extra text
        if json_text.startswith("```"):
            json_text = json_text[3:]
        if json_text.endswith("```"):
            json_text = json_text[:-3]
            
        return json_text

    async def generate_json_content(
        self,
        prompt: str,
        json_schema: Dict[str, Any],
        temperature: float = 0.7,
        max_tokens: int = 2048,
        retry_count: int = 3
    ) -> Dict[str, Any]:
        """
        Generate content in a specific JSON format using Gemini and validate with Pydantic.

        Args:
            prompt: The prompt to send to the model
            json_schema: The schema that defines the expected JSON structure
            temperature: Controls randomness in the response (0.0 to 1.0)
            max_tokens: Maximum number of tokens to generate
            retry_count: Number of times to retry on failure

        Returns:
            The generated content as a dictionary matching the specified schema
        """
        last_error = None
        
        for attempt in range(retry_count):
            try:
                # Create Pydantic model from schema
                model_class = self._create_pydantic_model(json_schema)

                # Create example response
                example_response = {}
                for field_name, field_schema in json_schema["properties"].items():
                    example_response[field_name] = f"<{field_schema.get('description', 'value')}>"

                # Add JSON schema instructions to the prompt
                formatted_prompt = f"""
                You are a JSON generator that must follow these rules exactly:
                1. Generate ONLY a JSON object, nothing else
                2. The JSON must match this schema exactly:
                {json.dumps(json_schema, indent=2)}

                Format your response like this example:
                {json.dumps(example_response, indent=2)}

                The content should be based on this prompt:
                {prompt}

                Remember:
                - No text before or after the JSON
                - No markdown formatting (no ```json or ```)
                - No comments
                - Properly escape strings
                - Include all required fields
                - Single, valid JSON object only
                """

                # Generate the response
                logger.info(f"Attempt {attempt + 1}/{retry_count}: Generating content...")
                response = self.model.generate_content(
                    formatted_prompt,
                    generation_config={
                        "temperature": temperature,
                        "max_output_tokens": max_tokens,
                    }
                )
                
                if not response or not hasattr(response, 'text'):
                    raise ValueError(f"Invalid response format from model on attempt {attempt + 1}")
                
                response_text = response.text
                if not response_text:
                    raise ValueError(f"Empty response from model on attempt {attempt + 1}")
                
                logger.info(f"Raw response from model: {response_text}")
                
                # Extract and parse JSON
                try:
                    json_text = self._extract_json_from_text(response_text)
                    parsed_response = json.loads(json_text)
                    
                    # Validate with Pydantic
                    validated_response = model_class(**parsed_response).model_dump()
                    
                    # Additional validation for story content
                    if "story_body" in validated_response:
                        if len(validated_response["story_body"]) < 200:
                            raise ValueError("Story body is too short (minimum 200 characters)")
                    
                    logger.info(f"Successfully generated and validated JSON response: {json.dumps(validated_response, indent=2)}")
                    return validated_response
                    
                except json.JSONDecodeError as e:
                    last_error = f"Invalid JSON response on attempt {attempt + 1}: {str(e)}"
                    logger.warning(last_error)
                    logger.warning(f"Raw response: {response_text}")
                    continue
                except Exception as e:
                    last_error = f"Validation failed on attempt {attempt + 1}: {str(e)}"
                    logger.warning(last_error)
                    continue
                
            except Exception as e:
                last_error = f"Error on attempt {attempt + 1}: {str(e)}"
                logger.warning(last_error)
                continue
        
        # If we get here, all attempts failed
        raise ValueError(f"Failed to generate valid response after {retry_count} attempts. Last error: {last_error}")

    async def generate_content_with_structured_schema(
        self,
        system_instruction: str,
        query: str,
        response_schema: dict
    ) -> dict:
        """
        Generate content using Gemini's native structured output (JSON schema).
        Args:
            system_instruction: System prompt for the model
            query: User prompt
            response_schema: JSON schema for the response
        Returns:
            Parsed JSON response from the model
        """
        try:
            # Initialize the generative model with system instruction
            model = self.client.GenerativeModel(
                model_name=self.model_name,
                system_instruction=system_instruction
            )

            # Configure generation with structured output
            generation_config = GenerationConfig(
                response_mime_type="application/json",
                response_schema=response_schema
            )

            # Send the query (prompt)
            response = await model.generate_content_async(
                contents=query,
                generation_config=generation_config
            )

            # Return the parsed JSON response
            if hasattr(response, 'text'):
                return json.loads(response.text)
            elif hasattr(response, 'candidates') and response.candidates:
                # Fallback for some Gemini SDK versions
                return json.loads(response.candidates[0].content.parts[0].text)
            else:
                raise ValueError("No valid JSON response from Gemini model.")
                
        except Exception as e:
            logger.error(f"Error in generate_content_with_structured_schema: {str(e)}")
            raise

    async def generate_content_with_json_format(
        self,
        system_instruction: str,
        query: str,
        response_schema: dict
    ) -> str:
        """
        Generates content ensuring it adheres to a specified JSON schema.
        """
        try:
            # Create example response based on schema
            example_response = {}
            for field_name, field_schema in response_schema["properties"].items():
                if field_schema.get("type") == "array":
                    example_response[field_name] = []
                else:
                    example_response[field_name] = f"<{field_schema.get('description', 'value')}>"

            # Add JSON schema instructions to the prompt
            formatted_prompt = f"""
            You are a JSON generator that must follow these rules exactly:
            1. Generate ONLY a JSON object, nothing else
            2. The JSON must match this schema exactly:
            {json.dumps(response_schema, indent=2)}

            Format your response like this example:
            {json.dumps(example_response, indent=2)}

            The content should be based on this prompt:
            {query}

            Remember:
            - No text before or after the JSON
            - No markdown formatting (no ```json or ```)
            - No comments
            - Properly escape strings
            - Include all required fields
            - Single, valid JSON object only
            """

            # Generate the response
            response = self.model.generate_content(
                formatted_prompt,
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 2048,
                }
            )
            
            if not response or not hasattr(response, 'text'):
                raise ValueError("Invalid response format from model")
            
            response_text = response.text
            if not response_text:
                raise ValueError("Empty response from model")
            
            # Extract and parse JSON
            json_text = self._extract_json_from_text(response_text)
            parsed_response = json.loads(json_text)
            
            # Validate against schema
            validate(instance=parsed_response, schema=response_schema)
            
            return json_text

        except ValidationError as e:
            logger.error(f"Schema validation error: {str(e)}")
            raise ValueError(f"Invalid response format: {str(e)}")
        except Exception as e:
            logger.error(f"Error generating content: {str(e)}")
            raise ValueError(f"Failed to generate content: {str(e)}")
