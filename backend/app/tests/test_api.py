import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.mongo import MongoDB
import mongomock
import asyncio
from unittest.mock import patch

client = TestClient(app)

@pytest.fixture(autouse=True)
async def setup_database():
    # Mock MongoDB connection
    with patch('app.db.mongo.MongoDB.client', mongomock.MongoClient()):
        yield

def test_register_and_verify_otp(monkeypatch):
    # Step 1: Initiate registration
    registration_payload = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User"
    }
    response = client.post("/auth/register", json=registration_payload)
    assert response.status_code == 200
    data = response.json()
    assert "message" in data

    # Step 2: Simulate OTP verification
    # Monkeypatch OTPService to always accept '123456' as OTP and return registration data
    from app.services.otp_service import OTPService
    monkeypatch.setattr(OTPService, "verify_otp_and_get_registration_data", lambda self, email, otp: registration_payload)
    verify_payload = {"email": "test@example.com", "otp": "123456"}
    response = client.post("/auth/verify-otp", json=verify_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "user_id" in data
    assert "role" in data
    return data["access_token"], registration_payload["username"], registration_payload["password"]

def test_login_user(monkeypatch):
    # Register and verify OTP first
    token, username, password = test_register_and_verify_otp(monkeypatch)
    # Now login
    login_payload = {"username": username, "password": password}
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "user_id" in data
    assert "role" in data
    return data["access_token"]

def test_create_story(monkeypatch):
    # Register and verify OTP first
    token, username, password = test_register_and_verify_otp(monkeypatch)
    # Create a story as a child (simulate child role if needed)
    story_payload = {
        "title": "A Magical Day",
        "prompt": "A story about a unicorn and a princess.",
        "age": 6,
        "preferences": ["animals", "magic"],
        "themes": ["friendship", "courage"],
        "moral_values": ["kindness", "honesty"],
        "favorite_animal": "unicorn",
        "favorite_character": "princess"
    }
    response = client.post(
        "/stories/generate",
        headers={"Authorization": f"Bearer {token}"},
        json=story_payload
    )
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert "story_body" in data
    assert "image_url" in data

def test_get_stories(monkeypatch):
    # Register and verify OTP first
    token, username, password = test_register_and_verify_otp(monkeypatch)
    # Create a story first
    story_payload = {
        "title": "A Magical Day",
        "prompt": "A story about a unicorn and a princess.",
        "age": 6,
        "preferences": ["animals", "magic"],
        "themes": ["friendship", "courage"],
        "moral_values": ["kindness", "honesty"],
        "favorite_animal": "unicorn",
        "favorite_character": "princess"
    }
    client.post(
        "/stories/generate",
        headers={"Authorization": f"Bearer {token}"},
        json=story_payload
    )
    # Now get stories
    response = client.get(
        "/stories/my-stories",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_invalid_token():
    response = client.get(
        "/stories/my-stories",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401

def test_missing_token():
    response = client.get("/stories/my-stories")
    assert response.status_code == 401 