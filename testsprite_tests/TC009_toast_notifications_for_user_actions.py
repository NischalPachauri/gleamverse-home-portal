import requests
import uuid

BASE_URL = "http://localhost:8081"
TIMEOUT = 30

def test_toast_notifications_for_user_actions():
    # Common headers for JSON content
    headers = {"Content-Type": "application/json"}
    user_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    user_password = "TestPass123!"
    user_id = None
    book_id = None

    try:
        # 1. Register a new user - expect success toast notification implied by status 201
        register_payload = {
            "email": user_email,
            "password": user_password
        }
        reg_resp = requests.post(f"{BASE_URL}/auth/register", json=register_payload, headers=headers, timeout=TIMEOUT)
        assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
        user_id = reg_resp.json().get("user", {}).get("id")
        assert user_id, "User ID not returned after registration"

        # 2. Login the new user - expect success toast notification implied by status 200
        login_payload = {
            "email": user_email,
            "password": user_password
        }
        login_resp = requests.post(f"{BASE_URL}/auth/login", json=login_payload, headers=headers, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        access_token = login_resp.json().get("access_token")
        assert access_token, "No access token in login response"
        auth_headers = headers.copy()
        auth_headers["Authorization"] = f"Bearer {access_token}"

        # 3. Upload a new book to provoke a success toast notification
        book_payload = {
            "title": "Test Toast Notification Book",
            "author": "Test Author",
            "publisher": "Test Publisher",
            "description": "A book uploaded to test toast notifications",
            "file_url": "https://example.com/testbook.pdf"
        }
        upload_resp = requests.post(f"{BASE_URL}/books", json=book_payload, headers=auth_headers, timeout=TIMEOUT)
        assert upload_resp.status_code == 201, f"Book upload failed: {upload_resp.text}"
        book_id = upload_resp.json().get("id")
        assert book_id, "No book ID returned on upload"

        # 4. Trigger an error by uploading incomplete book data - expect error toast notification implied by 400 Bad Request
        incomplete_payload = {
            "title": ""
        }
        error_resp = requests.post(f"{BASE_URL}/books", json=incomplete_payload, headers=auth_headers, timeout=TIMEOUT)
        assert error_resp.status_code == 400, f"Expected 400 on invalid book upload, got {error_resp.status_code}"

        # 5. Update user theme preference to provoke a success toast notification on profile update
        theme_payload = {
            "theme_preference": "dark"
        }
        update_resp = requests.put(f"{BASE_URL}/users/{user_id}/preferences", json=theme_payload, headers=auth_headers, timeout=TIMEOUT)
        assert update_resp.status_code == 200, f"Updating theme preference failed: {update_resp.text}"

        # 6. Delete the uploaded book - expect success toast notification
        del_resp = requests.delete(f"{BASE_URL}/books/{book_id}", headers=auth_headers, timeout=TIMEOUT)
        assert del_resp.status_code == 204, f"Book deletion failed: {del_resp.text}"
        book_id = None  # book deleted

        # 7. Logout user (optional) - to complete user action flow if endpoint exists
        logout_resp = requests.post(f"{BASE_URL}/auth/logout", headers=auth_headers, timeout=TIMEOUT)
        assert logout_resp.status_code in (200, 204), f"Logout failed: {logout_resp.text}"

    finally:
        # Cleanup: Delete created user if possible
        if user_id and access_token:
            try:
                cleanup_headers = headers.copy()
                cleanup_headers["Authorization"] = f"Bearer {access_token}"
                requests.delete(f"{BASE_URL}/users/{user_id}", headers=cleanup_headers, timeout=TIMEOUT)
            except Exception:
                pass
        # Cleanup any leftover book if not deleted
        if book_id and user_id and access_token:
            try:
                cleanup_headers = headers.copy()
                cleanup_headers["Authorization"] = f"Bearer {access_token}"
                requests.delete(f"{BASE_URL}/books/{book_id}", headers=cleanup_headers, timeout=TIMEOUT)
            except Exception:
                pass

test_toast_notifications_for_user_actions()