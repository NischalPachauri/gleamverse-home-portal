import requests

BASE_URL = "http://localhost:8080"
TIMEOUT = 30

# Assuming authentication is required, login to get a token (adjust credentials as needed)
def authenticate():
    login_url = f"{BASE_URL}/login"
    credentials = {
        "email": "testuser@example.com",
        "password": "TestPassword123!"
    }
    resp = requests.post(login_url, json=credentials, timeout=TIMEOUT)
    resp.raise_for_status()
    json_resp = resp.json()
    token = json_resp.get("token") or json_resp.get("access_token")
    assert token, "Authentication token not found in login response"
    return token

# use a dummy book id for testing status update since create book API is not in PRD

def test_update_book_reading_status():
    token = authenticate()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Dummy book ID to test status update - replace with real book ID in actual tests
    book_id = "dummy-book-id"
    url = f"{BASE_URL}/book/{book_id}/status"
    allowed_statuses = ["Planning to read", "Reading", "On hold", "Completed"]

    for status in allowed_statuses:
        payload = {"status": status}
        response = requests.put(url, json=payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Failed to update status to '{status}': {response.text}"

    # Test invalid status returns error
    invalid_payload = {"status": "InvalidStatus"}
    invalid_response = requests.put(url, json=invalid_payload, headers=headers, timeout=TIMEOUT)
    assert invalid_response.status_code != 200, "API accepted invalid status value"


test_update_book_reading_status()
