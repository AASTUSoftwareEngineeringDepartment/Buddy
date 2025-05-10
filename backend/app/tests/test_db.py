import pytest
from app.db.mongo import MongoDB
import mongomock
from unittest.mock import patch
from datetime import datetime

@pytest.fixture(autouse=True)
async def setup_database():
    # Mock MongoDB connection
    with patch('app.db.mongo.MongoDB.client', mongomock.MongoClient()):
        await MongoDB.connect_to_db()
        yield
        await MongoDB.close_db_connection()

async def test_create_user():
    user_data = {
        "email": "test@example.com",
        "password": "hashed_password",
        "name": "Test User",
        "created_at": datetime.utcnow()
    }
    
    result = await MongoDB.create_user(user_data)
    assert result is not None
    assert result["email"] == user_data["email"]
    assert result["name"] == user_data["name"]

async def test_find_user():
    # First create a user
    user_data = {
        "email": "test@example.com",
        "password": "hashed_password",
        "name": "Test User",
        "created_at": datetime.utcnow()
    }
    await MongoDB.create_user(user_data)
    
    # Then try to find the user
    found_user = await MongoDB.find_user({"email": "test@example.com"})
    assert found_user is not None
    assert found_user["email"] == user_data["email"]
    assert found_user["name"] == user_data["name"]

async def test_create_story():
    story_data = {
        "title": "Test Story",
        "story_body": "Once upon a time...",
        "image_url": "https://example.com/image.jpg",
        "user_id": "test_user_id",
        "created_at": datetime.utcnow()
    }
    
    result = await MongoDB.create_story(story_data)
    assert result is not None
    assert result["title"] == story_data["title"]
    assert result["story_body"] == story_data["story_body"]

async def test_get_user_stories():
    # First create a story
    story_data = {
        "title": "Test Story",
        "story_body": "Once upon a time...",
        "image_url": "https://example.com/image.jpg",
        "user_id": "test_user_id",
        "created_at": datetime.utcnow()
    }
    await MongoDB.create_story(story_data)
    
    # Then get all stories for the user
    stories = await MongoDB.get_user_stories("test_user_id")
    assert isinstance(stories, list)
    assert len(stories) > 0
    assert stories[0]["title"] == story_data["title"]

async def test_update_user():
    # First create a user
    user_data = {
        "email": "test@example.com",
        "password": "hashed_password",
        "name": "Test User",
        "created_at": datetime.utcnow()
    }
    created_user = await MongoDB.create_user(user_data)
    
    # Update the user
    update_data = {"name": "Updated Name"}
    result = await MongoDB.update_user(created_user["_id"], update_data)
    assert result is not None
    assert result["name"] == "Updated Name"

async def test_delete_story():
    # First create a story
    story_data = {
        "title": "Test Story",
        "story_body": "Once upon a time...",
        "image_url": "https://example.com/image.jpg",
        "user_id": "test_user_id",
        "created_at": datetime.utcnow()
    }
    created_story = await MongoDB.create_story(story_data)
    
    # Delete the story
    result = await MongoDB.delete_story(created_story["_id"])
    assert result is True
    
    # Verify story is deleted
    stories = await MongoDB.get_user_stories("test_user_id")
    assert len(stories) == 0 