import requests
import uuid

BASE_URL = "http://localhost:8080"
REGISTER_ENDPOINT = f"{BASE_URL}/register"
TIMEOUT = 30

def test_user_registration_with_required_details():
    # Generate unique email to avoid duplication conflicts in repeated tests
    unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    password = "TestPassword123!"
    name = "Test User"

    payload = {
        "email": unique_email,
        "password": password,
        "name": name
    }
    headers = {
        "Content-Type": "application/json"
    }

    # Register user
    response = requests.post(REGISTER_ENDPOINT, json=payload, headers=headers, timeout=TIMEOUT)
    try:
        # Assert status code 200 for successful registration
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        # Attempt to parse JSON response
        response_json = response.json()
        # Verify response has expected fields (at minimum an id or user data)
        assert isinstance(response_json, dict), "Response is not a JSON object"

        # Check that user id or confirmation is present to confirm creation
        # Possible keys: "id", "userId", "message", or similar
        keys = response_json.keys()
        has_id = any(k.lower() in ["id", "userid", "user_id", "userId"] for k in keys)
        has_message = any("success" in str(v).lower() for v in response_json.values())
        assert has_id or has_message, "Response does not confirm successful registration"

    except ValueError:
        assert False, "Response is not valid JSON"

test_user_registration_with_required_details()