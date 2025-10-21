import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:8081"
TIMEOUT = 30


def test_theme_management_and_persistence():
    register_url = f"{BASE_URL}/auth/register"
    login_url = f"{BASE_URL}/auth/login"
    theme_url = f"{BASE_URL}/user/theme"

    # User credentials for testing
    user_email = "testthemeuser@example.com"
    user_password = "TestPassword123!"

    headers = {"Content-Type": "application/json"}

    try:
        # Register user
        reg_payload = {"email": user_email, "password": user_password}
        reg_resp = requests.post(register_url, json=reg_payload, headers=headers, timeout=TIMEOUT)
        # If already registered, registration might fail or return 409, handle both cases
        assert reg_resp.status_code in (201, 409), f"Registration failed: {reg_resp.text}"

        # Login user
        login_payload = {"email": user_email, "password": user_password}
        login_resp = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        auth_token = login_resp.json().get("access_token")
        assert auth_token, "No access_token received on login"

        auth_headers = {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }

        # 1. Check default theme preference (assume it returns current theme)
        get_theme_resp = requests.get(theme_url, headers=auth_headers, timeout=TIMEOUT)
        assert get_theme_resp.status_code in (200, 204), f"Get theme failed: {get_theme_resp.text}"
        if get_theme_resp.status_code == 204 or not get_theme_resp.content:
            original_theme = "light"
        else:
            theme_data = get_theme_resp.json()
            assert "theme" in theme_data, "Theme key missing in response"
            original_theme = theme_data["theme"]
            assert original_theme in ("light", "dark"), f"Invalid initial theme: {original_theme}"

        # 2. Toggle the theme to the opposite
        new_theme = "dark" if original_theme == "light" else "light"
        toggle_payload = {"theme": new_theme}
        set_theme_resp = requests.put(theme_url, json=toggle_payload, headers=auth_headers, timeout=TIMEOUT)
        assert set_theme_resp.status_code == 200, f"Set theme failed: {set_theme_resp.text}"

        # Verify the theme was updated by getting it again
        get_theme_resp_after_set = requests.get(theme_url, headers=auth_headers, timeout=TIMEOUT)
        assert get_theme_resp_after_set.status_code == 200, f"Get theme after set failed: {get_theme_resp_after_set.text}"
        theme_data_after_set = get_theme_resp_after_set.json()
        assert theme_data_after_set.get("theme") == new_theme, f"Theme not updated correctly: {theme_data_after_set}"

        # 3. Authenticate again simulating a new session and verify theme persistence
        login_resp2 = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        assert login_resp2.status_code == 200, f"Second login failed: {login_resp2.text}"
        auth_token2 = login_resp2.json().get("access_token")
        assert auth_token2, "No access_token received on second login"

        auth_headers2 = {
            "Authorization": f"Bearer {auth_token2}",
            "Content-Type": "application/json"
        }
        get_theme_resp2 = requests.get(theme_url, headers=auth_headers2, timeout=TIMEOUT)
        assert get_theme_resp2.status_code == 200, f"Get theme after relogin failed: {get_theme_resp2.text}"
        theme_data2 = get_theme_resp2.json()
        assert theme_data2.get("theme") == new_theme, "Theme preference not persisted across sessions"

    except RequestException as e:
        assert False, f"RequestException occurred: {e}"

    finally:
        # Cleanup: delete user if API allows (assuming DELETE /auth/user for cleanup)
        user_delete_url = f"{BASE_URL}/auth/user"
        if 'auth_token' in locals():
            try:
                del_resp = requests.delete(user_delete_url, headers={"Authorization": f"Bearer {auth_token}"}, timeout=TIMEOUT)
                assert del_resp.status_code in (200, 204), f"User cleanup failed: {del_resp.text}"
            except Exception:
                pass


test_theme_management_and_persistence()
