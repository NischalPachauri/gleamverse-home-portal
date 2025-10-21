import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:8081"
TIMEOUT = 30

# Assuming the API provides auth endpoints: /auth/register, /auth/login
# and book management endpoints: /books (POST to upload, DELETE to remove, GET to list)
# Also assuming token-based authentication with Bearer token

def test_content_upload_and_removal_functionality():
    # 1. Register a new user
    register_url = f"{BASE_URL}/auth/register"
    login_url = f"{BASE_URL}/auth/login"
    books_url = f"{BASE_URL}/books"

    user_email = "testuser_tc005@example.com"
    user_password = "TestPassword123!"

    headers_json = {"Content-Type": "application/json"}

    try:
        # Register user
        register_payload = {
            "email": user_email,
            "password": user_password
        }
        resp = requests.post(register_url, json=register_payload, headers=headers_json, timeout=TIMEOUT)
        assert resp.status_code in (200, 201), f"User registration failed: {resp.status_code}, {resp.text}"

        # Login user to get token
        login_payload = {
            "email": user_email,
            "password": user_password
        }
        resp = requests.post(login_url, json=login_payload, headers=headers_json, timeout=TIMEOUT)
        assert resp.status_code == 200, f"User login failed: {resp.status_code}, {resp.text}"
        login_data = resp.json()
        assert "access_token" in login_data, "No access_token in login response"
        token = login_data["access_token"]

        auth_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # --------- Upload a new book ---------
        upload_payload = {
            "title": "Test Book TC005",
            "author": "AI Assistant",
            "publisher": "OpenAI",
            "description": "A test book for content upload and removal functionality test case TC005.",
            # Assuming the API accepts an isbn or external_id field (optional)
            # and a file_url or base64 encoded file content; here we simulate with a URL
            "file_url": "https://example.com/testbook_tc005.pdf",
            "cover_image_url": "https://example.com/testbook_tc005_cover.jpg"
        }

        resp = requests.post(books_url, json=upload_payload, headers=auth_headers, timeout=TIMEOUT)
        assert resp.status_code in (200, 201), f"Book upload failed: {resp.status_code}, {resp.text}"
        book_data = resp.json()
        assert "id" in book_data, "Uploaded book response missing id"
        book_id = book_data["id"]

        # --------- Verify book appears in library ---------
        resp = requests.get(books_url, headers=auth_headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Failed to fetch book list: {resp.status_code}, {resp.text}"
        books_list = resp.json()
        assert isinstance(books_list, list), "Books list response is not a list"
        # Confirm uploaded book is in the list
        found = any(book.get("id") == book_id for book in books_list)
        assert found, "Uploaded book not found in the library list"

        # --------- Remove the uploaded book ---------
        delete_url = f"{books_url}/{book_id}"
        resp = requests.delete(delete_url, headers=auth_headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Failed to delete book: {resp.status_code}, {resp.text}"

        # --------- Verify book is removed from library ---------
        resp = requests.get(books_url, headers=auth_headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Failed to fetch book list after deletion: {resp.status_code}, {resp.text}"
        books_list_after_delete = resp.json()
        found_after_delete = any(book.get("id") == book_id for book in books_list_after_delete)
        assert not found_after_delete, "Deleted book still found in the library list"

    except RequestException as e:
        assert False, f"RequestException during test: {e}"

    finally:
        # Clean up: Try to delete the uploaded book if exists (in case deletion failed)
        try:
            if 'book_id' in locals():
                requests.delete(f"{books_url}/{book_id}", headers={"Authorization": f"Bearer {token}"}, timeout=TIMEOUT)
        except Exception:
            pass
        # Clean up: Delete the user if API provides such endpoint (optional)
        # Not implemented here due to no user deletion endpoint specified.

test_content_upload_and_removal_functionality()