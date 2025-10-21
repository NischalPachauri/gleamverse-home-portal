import requests

BASE_URL = "http://localhost:8080"
LOGIN_ENDPOINT = f"{BASE_URL}/login"

def test_user_login_with_valid_credentials():
    # Use valid credentials (these should be valid in the test environment)
    login_payload = {
        "email": "testuser@example.com",
        "password": "SecurePass123"
    }
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(
            LOGIN_ENDPOINT,
            json=login_payload,
            headers=headers,
            timeout=30
        )
        # Assert status code 200 for successful login
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        # Check if response contains expected fields indicating successful authentication, e.g., token or user info
        json_response = response.json()
        assert isinstance(json_response, dict), "Response is not a JSON object"
        # Common keys returned on login success might be "token", "user", or similar. Check for at least one.
        assert ("token" in json_response) or ("user" in json_response), "Response missing authentication tokens or user info"
        # Optionally validate token is a non-empty string if present
        if "token" in json_response:
            token = json_response["token"]
            assert isinstance(token, str) and len(token) > 0, "Token is invalid"
        # If user info returned, verify expected fields
        if "user" in json_response:
            user = json_response["user"]
            assert isinstance(user, dict), "User field is not an object"
            assert "email" in user, "User info missing email"
            assert user["email"].lower() == login_payload["email"].lower(), "Returned user email does not match login email"
    except requests.exceptions.RequestException as e:
        assert False, f"Request to /login failed: {e}"

test_user_login_with_valid_credentials()