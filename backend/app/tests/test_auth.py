import pytest
from app.core.auth import create_access_token, verify_token
from datetime import datetime, timedelta
from jose import JWTError

def test_create_access_token():
    # Test data
    data = {"sub": "test@example.com"}
    expires_delta = timedelta(minutes=30)
    
    # Create token
    token = create_access_token(data, expires_delta)
    
    # Verify token is created
    assert token is not None
    assert isinstance(token, str)
    assert len(token) > 0

def test_verify_valid_token():
    # Test data
    data = {"sub": "test@example.com"}
    expires_delta = timedelta(minutes=30)
    
    # Create token
    token = create_access_token(data, expires_delta)
    
    # Verify token
    payload = verify_token(token)
    assert payload is not None
    assert payload["sub"] == data["sub"]

def test_verify_expired_token():
    # Test data
    data = {"sub": "test@example.com"}
    expires_delta = timedelta(microseconds=1)  # Very short expiration
    
    # Create token
    token = create_access_token(data, expires_delta)
    
    # Wait for token to expire
    import time
    time.sleep(0.1)
    
    # Verify token raises exception
    with pytest.raises(JWTError):
        verify_token(token)

def test_verify_invalid_token():
    # Test with invalid token
    invalid_token = "invalid.token.here"
    
    # Verify token raises exception
    with pytest.raises(JWTError):
        verify_token(invalid_token)

def test_token_payload_structure():
    # Test data
    data = {
        "sub": "test@example.com",
        "name": "Test User",
        "role": "user"
    }
    expires_delta = timedelta(minutes=30)
    
    # Create token
    token = create_access_token(data, expires_delta)
    
    # Verify token
    payload = verify_token(token)
    assert payload is not None
    assert "sub" in payload
    assert "exp" in payload
    assert "iat" in payload
    assert payload["sub"] == data["sub"]

def test_token_expiration_time():
    # Test data
    data = {"sub": "test@example.com"}
    expires_delta = timedelta(minutes=30)
    
    # Create token
    token = create_access_token(data, expires_delta)
    
    # Verify token
    payload = verify_token(token)
    assert payload is not None
    
    # Check expiration time
    exp_time = datetime.fromtimestamp(payload["exp"])
    iat_time = datetime.fromtimestamp(payload["iat"])
    time_diff = exp_time - iat_time
    
    # Allow for small time differences due to processing
    assert abs(time_diff.total_seconds() - expires_delta.total_seconds()) < 2 