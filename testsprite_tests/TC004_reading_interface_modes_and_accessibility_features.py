import requests
import json

BASE_URL = "http://localhost:8081"
TIMEOUT = 30

# Assuming these are the expected reading interface modes and accessibility features supported
EXPECTED_MODES = {
    "single_page": True,
    "two_page": True,
    "full_screen": True,
    "page_curling_animation": True,
    "text_magnification": True,
    "text_to_speech": True,
}

def authenticate_user():
    # Dummy user credentials for testing auth flows - update as appropriate
    credentials = {
        "email": "testuser@example.com",
        "password": "TestPassword123!"
    }
    login_url = f"{BASE_URL}/auth/login"
    resp = requests.post(login_url, json=credentials, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    assert "access_token" in data and data["access_token"], "Login failed or no access token received"
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    return headers

def create_test_book(headers):
    # Minimal payload to create a book to test reading interface endpoints
    create_url = f"{BASE_URL}/books"
    payload = {
        "title": "Test Book for Reading Interface",
        "author": "Test Author",
        "publisher": "Test Publisher",
        "description": "Book to test reading interface modes and features",
        "pdf_url": "https://example.com/testbook.pdf",
    }
    resp = requests.post(create_url, json=payload, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    book = resp.json()
    assert "id" in book, "Book creation response missing id"
    return book["id"]

def delete_test_book(book_id, headers):
    delete_url = f"{BASE_URL}/books/{book_id}"
    resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
    # Ignore 404 on delete but assert other failures
    if resp.status_code not in (204, 404):
        resp.raise_for_status()

def test_reading_interface_modes_and_accessibility_features():
    headers = authenticate_user()

    book_id = create_test_book(headers)
    try:
        # Endpoint to get reading interface config/features for the book
        reading_features_url = f"{BASE_URL}/books/{book_id}/reading-interface"
        resp = requests.get(reading_features_url, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        features = resp.json()

        # Validate the response contains all expected modes and features enabled
        for feature, expected in EXPECTED_MODES.items():
            assert feature in features, f"Missing feature '{feature}' in reading interface response"
            assert features[feature] == expected, f"Feature '{feature}' expected={expected} but got {features[feature]}"

        # Additional checks could be made here per API schema, e.g. type checks:
        assert isinstance(features["single_page"], bool)
        assert isinstance(features["two_page"], bool)
        assert isinstance(features["full_screen"], bool)
        assert isinstance(features["page_curling_animation"], bool)
        assert isinstance(features["text_magnification"], bool)
        assert isinstance(features["text_to_speech"], bool)
        
    finally:
        delete_test_book(book_id, headers)

test_reading_interface_modes_and_accessibility_features()