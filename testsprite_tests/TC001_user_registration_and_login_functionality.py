import requests
import uuid

BASE_URL = "http://localhost:8081"
TIMEOUT = 30


def test_user_registration_and_login_functionality():
    session = requests.Session()
    # Use JSON content headers
    headers = {"Content-Type": "application/json"}

    # Generate unique user info for registration to avoid conflicts
    unique_suffix = str(uuid.uuid4())[:8]
    email = f"testuser_{unique_suffix}@example.com"
    password = "TestPassword123!"
    username = f"testuser_{unique_suffix}"

    user_id = None
    access_token = None

    try:
        # 1. Register user
        register_payload = {
            "email": email,
            "password": password
            # Removed username from registration payload as likely not accepted
        }
        # Assume registration endpoint is /auth/register
        reg_resp = session.post(
            f"{BASE_URL}/auth/register",
            json=register_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
        reg_data = reg_resp.json()
        # Registration probably returns user object with id and email but no username
        assert "user" in reg_data and "id" in reg_data["user"], "Registration response missing user ID"
        user_id = reg_data["user"]["id"]

        # 2. Login user
        login_payload = {
            "email": email,
            "password": password
        }
        # Assume login endpoint is /auth/login
        login_resp = session.post(
            f"{BASE_URL}/auth/login",
            json=login_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        assert "access_token" in login_data, "Login response missing access token"
        access_token = login_data["access_token"]
        # login_data should contain the user object
        assert login_data.get("user", {}).get("email") == email, "Logged in user email mismatch"

        # Setup Authorization header for authenticated requests
        auth_headers = {
            "Authorization": f"Bearer {access_token}"
        }

        # 3. Retrieve user profile
        # Assume user profile endpoint is /profile (returns current user profile)
        profile_resp = session.get(
            f"{BASE_URL}/profile",
            headers={**headers, **auth_headers},
            timeout=TIMEOUT,
        )
        assert profile_resp.status_code == 200, f"Profile retrieval failed: {profile_resp.text}"
        profile_data = profile_resp.json()
        assert profile_data.get("id") == user_id, "Profile user ID mismatch"
        assert profile_data.get("email") == email, "Profile email mismatch"
        # Username may be optional or missing if not set at registration
        assert "username" in profile_data, "Profile missing username"

        # 4. Check reading history is accessible (should exist, even if initially empty)
        # Assuming reading history is part of profile under "reading_history"
        reading_history = profile_data.get("reading_history")
        assert reading_history is not None, "Reading history missing from profile"
        assert isinstance(reading_history, list), "Reading history should be a list"

        # 5. Add a reading history entry (simulate reading activity)
        # Assume endpoint POST /profile/reading-history to add book reading
        history_entry_payload = {
            "book_id": "harry_potter_1",  # a known book ID expected from system
            "progress": 15  # e.g., pages read or percent completed
        }
        add_history_resp = session.post(
            f"{BASE_URL}/profile/reading-history",
            json=history_entry_payload,
            headers={**headers, **auth_headers},
            timeout=TIMEOUT,
        )
        assert add_history_resp.status_code == 200, f"Adding reading history failed: {add_history_resp.text}"

        # 6. Retrieve profile again and check reading history persistence
        profile_resp_2 = session.get(
            f"{BASE_URL}/profile",
            headers={**headers, **auth_headers},
            timeout=TIMEOUT,
        )
        assert profile_resp_2.status_code == 200, f"Profile retrieval failed: {profile_resp_2.text}"
        profile_data_2 = profile_resp_2.json()
        reading_history_2 = profile_data_2.get("reading_history")
        assert any(
            entry.get("book_id") == "harry_potter_1" and entry.get("progress") == 15
            for entry in reading_history_2
        ), "Reading history entry not persisted"

    finally:
        # Cleanup: delete the created test user if user_id is known
        if user_id:
            # Assume DELETE /users/{id} with admin or token support to clean test user
            # If user deletion requires auth, use access token, else no auth
            try:
                session.delete(
                    f"{BASE_URL}/users/{user_id}",
                    headers={**headers, **({"Authorization": f"Bearer {access_token}"} if access_token else {})},
                    timeout=TIMEOUT,
                )
            except Exception:
                pass


test_user_registration_and_login_functionality()
