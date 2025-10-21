import requests
import uuid

BASE_URL = "http://localhost:8081"
TIMEOUT = 30

# Replace these with valid test user credentials or create dynamically if API supports registration
TEST_USER_EMAIL = "testuser@example.com"
TEST_USER_PASSWORD = "TestPass123!"

headers = {
    "Content-Type": "application/json",
}

def register_user():
    url = f"{BASE_URL}/auth/register"
    payload = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
    }
    resp = requests.post(url, json=payload, timeout=TIMEOUT, headers=headers)
    resp.raise_for_status()
    return resp.json()

def login_user():
    url = f"{BASE_URL}/auth/login"
    payload = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
    }
    resp = requests.post(url, json=payload, timeout=TIMEOUT, headers=headers)
    resp.raise_for_status()
    data = resp.json()
    assert "access_token" in data, "Login response missing access_token"
    return data["access_token"]

def create_book(token):
    url = f"{BASE_URL}/books"
    book_data = {
        "title": f"Test Book {uuid.uuid4()}",
        "author": "Test Author",
        "publisher": "Test Publisher",
        "description": "Test description for book shelving.",
        "categories": ["Test"],
        # Add other required fields if needed
    }
    h = {**headers, "Authorization": f"Bearer {token}"}
    resp = requests.post(url, json=book_data, timeout=TIMEOUT, headers=h)
    resp.raise_for_status()
    book = resp.json()
    assert "id" in book, "Created book missing id"
    return book["id"]

def delete_book(token, book_id):
    url = f"{BASE_URL}/books/{book_id}"
    h = {**headers, "Authorization": f"Bearer {token}"}
    resp = requests.delete(url, timeout=TIMEOUT, headers=h)
    # Allow delete to fail silently if already deleted
    if resp.status_code not in (200,204,404):
        resp.raise_for_status()

def add_book_to_shelf(token, book_id, shelf):
    url = f"{BASE_URL}/user/shelves"
    payload = {
        "book_id": book_id,
        "shelf": shelf  # Expected values: Plan to Read, Reading, On Hold, Completed
    }
    h = {**headers, "Authorization": f"Bearer {token}"}
    resp = requests.post(url, json=payload, timeout=TIMEOUT, headers=h)
    resp.raise_for_status()
    data = resp.json()
    assert data.get("book_id") == book_id
    assert data.get("shelf") == shelf

def get_user_shelves(token):
    url = f"{BASE_URL}/user/shelves"
    h = {**headers, "Authorization": f"Bearer {token}"}
    resp = requests.get(url, timeout=TIMEOUT, headers=h)
    resp.raise_for_status()
    return resp.json()

def test_personal_reading_list_management():
    # Register test user (ignore if already exists)
    try:
        register_user()
    except requests.HTTPError as e:
        if e.response.status_code != 409:  # 409 Conflict if user exists
            raise

    token = login_user()

    # Create a test book to bookmark
    book_id = create_book(token)

    shelves = ["Plan to Read", "Reading", "On Hold", "Completed"]

    try:
        # Add the book to each shelf, then verify persistence
        for shelf in shelves:
            add_book_to_shelf(token, book_id, shelf)

            # Verify shelf contains the book with correct status
            shelves_data = get_user_shelves(token)
            # shelves_data assumed to be list of {"book_id":..., "shelf":...}
            match = next((item for item in shelves_data if item["book_id"] == book_id), None)
            assert match is not None, f"Book id {book_id} not found in shelves data"
            assert match["shelf"] == shelf, f"Expected shelf '{shelf}', got '{match['shelf']}'"

            # Simulate new session by re-login and check persistence
            new_token = login_user()
            shelves_data_new = get_user_shelves(new_token)
            match_new = next((item for item in shelves_data_new if item["book_id"] == book_id), None)
            assert match_new is not None, "Book missing on subsequent session"
            assert match_new["shelf"] == shelf, "Shelf state did not persist across sessions"
    finally:
        # Cleanup: remove book from shelves and delete book
        url_remove = f"{BASE_URL}/user/shelves/{book_id}"
        h = {**headers, "Authorization": f"Bearer {token}"}
        requests.delete(url_remove, timeout=TIMEOUT, headers=h)
        delete_book(token, book_id)

test_personal_reading_list_management()
