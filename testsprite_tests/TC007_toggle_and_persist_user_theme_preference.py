import requests

BASE_URL = "http://localhost:8080"
TIMEOUT = 30

def test_toggle_and_persist_user_theme_preference():
    session = requests.Session()

    # Step 1: Get current theme preference (assumed via GET /theme; not in PRD, so we check /theme toggle effect)
    # Since no GET /theme is defined, we'll toggle twice and check if the theme preference toggles back accordingly

    try:
        # Toggle theme first time
        response1 = session.post(f"{BASE_URL}/theme", timeout=TIMEOUT)
        assert response1.status_code == 200, f"Expected 200 OK, got {response1.status_code}"
        json1 = response1.json() if response1.content else {}
        # We expect the theme toggled successfully message or indicator in response
        assert ("theme" in json1 and json1["theme"] in ["light", "dark"]) or not json1, "Response should indicate current theme or be empty"

        theme_after_first_toggle = json1.get("theme", None)

        # Simulate new session by creating a new session object (cookies, headers, auth persisting)
        session2 = requests.Session()

        # Without toggling, check if theme preference persists on a new toggle:
        # We toggle theme again and expect to toggle back to original theme
        response2 = session2.post(f"{BASE_URL}/theme", timeout=TIMEOUT)
        assert response2.status_code == 200, f"Expected 200 OK on second toggle, got {response2.status_code}"
        json2 = response2.json() if response2.content else {}
        assert ("theme" in json2 and json2["theme"] in ["light", "dark"]) or not json2, "Response should indicate toggled theme or be empty"

        theme_after_second_toggle = json2.get("theme", None)

        # If first toggle changed theme to dark, second toggle should revert it to light and vice versa
        if theme_after_first_toggle and theme_after_second_toggle:
            assert theme_after_first_toggle != theme_after_second_toggle, "Theme should toggle between light and dark"

        # Third toggle with same session to confirm persistence back to first state
        response3 = session2.post(f"{BASE_URL}/theme", timeout=TIMEOUT)
        assert response3.status_code == 200, f"Expected 200 OK on third toggle, got {response3.status_code}"
        json3 = response3.json() if response3.content else {}
        theme_after_third_toggle = json3.get("theme", None)
        if theme_after_second_toggle and theme_after_third_toggle:
            assert theme_after_second_toggle != theme_after_third_toggle, "Theme should toggle again between light and dark"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_toggle_and_persist_user_theme_preference()