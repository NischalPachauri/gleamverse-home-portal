import requests
import time

BASE_URL = "http://localhost:8081"
TIMEOUT = 30

def test_responsive_design_backend_focus():
    # Because responsive design is a front-end behavior, we focus on backend API functionality which supports front-end features
    # Validate user login, book search, reading list management, content upload/removal, theme persistence via API
    # This indirectly supports responsive UI by verifying backend is stable and supports required flows across devices

    login_url = f"{BASE_URL}/api/auth/login"
    books_url = f"{BASE_URL}/api/books"
    reading_list_url = f"{BASE_URL}/api/reading-list"
    theme_url = f"{BASE_URL}/api/user/theme"
    upload_url = f"{BASE_URL}/api/books/upload"
    headers = {'Content-Type': 'application/json'}

    # Using a pre-existing test user (must exist in the system beforehand for testing)
    user_payload = {
        "email": "testuser@example.com",
        "password": "TestPass123!"
    }

    # Login
    response = requests.post(login_url, json=user_payload, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 200, f"Login failed: {response.text}"
    auth_token = response.json().get("accessToken")
    assert auth_token, "No access token returned on login"

    auth_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    }

    book_id = None

    try:
        # Step 2: Search books by title (simulate real-time filter)
        params = {"search": "Harry Potter"}
        response = requests.get(books_url, headers=auth_headers, params=params, timeout=TIMEOUT)
        assert response.status_code == 200, f"Book search failed: {response.text}"
        books = response.json()
        assert isinstance(books, list), "Books response is not a list"
        if books:
            book_id = books[0].get("id")

        # Step 3: Add book to personal reading list (if any book found)
        if book_id:
            reading_list_payload = {
                "bookId": book_id,
                "shelf": "Plan to Read"
            }
            response = requests.post(reading_list_url, json=reading_list_payload, headers=auth_headers, timeout=TIMEOUT)
            assert response.status_code in (200,201), f"Failed to add book to reading list: {response.text}"

            # Verify persistence by fetching reading list
            response = requests.get(reading_list_url, headers=auth_headers, timeout=TIMEOUT)
            assert response.status_code == 200, f"Fetching reading list failed: {response.text}"
            reading_list = response.json()
            assert any(item.get("bookId") == book_id for item in reading_list), "Book not in reading list"

        # Step 4: Update user theme preference and verify persistence
        theme_payload = {"theme": "dark"}
        response = requests.put(theme_url, json=theme_payload, headers=auth_headers, timeout=TIMEOUT)
        assert response.status_code in (200,204), f"Updating theme preference failed: {response.text}"

        # Retrieve theme to verify persistence
        response = requests.get(theme_url, headers=auth_headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Getting theme preference failed: {response.text}"
        theme_data = response.json()
        assert theme_data.get("theme") == "dark", "Theme preference was not persisted correctly"

        # Step 5: Upload a new book (simulate minimal book upload)
        upload_payload = {
            "title": f"Test Book {int(time.time())}",
            "author": "Test Author",
            "publisher": "Test Publisher",
            "description": "Test description for a responsive design test case.",
            # Typically would include file upload, simplified here as metadata only
        }
        response = requests.post(upload_url, json=upload_payload, headers=auth_headers, timeout=TIMEOUT)
        assert response.status_code in (200,201), f"Book upload failed: {response.text}"
        uploaded_book = response.json()
        uploaded_book_id = uploaded_book.get("id")
        assert uploaded_book_id, "Uploaded book ID missing"

        # Step 6: Remove the uploaded book
        delete_url = f"{books_url}/{uploaded_book_id}"
        response = requests.delete(delete_url, headers=auth_headers, timeout=TIMEOUT)
        assert response.status_code in (200,204), f"Failed to delete uploaded book: {response.text}"

    finally:
        # Cleanup: If book was added to reading list, remove it
        if book_id:
            # Get reading list to find entries to remove
            response = requests.get(reading_list_url, headers=auth_headers, timeout=TIMEOUT)
            if response.status_code == 200:
                reading_list = response.json()
                for item in reading_list:
                    if item.get("bookId") == book_id:
                        remove_url = f"{reading_list_url}/{item.get('id')}"
                        requests.delete(remove_url, headers=auth_headers, timeout=TIMEOUT)

test_responsive_design_backend_focus()
