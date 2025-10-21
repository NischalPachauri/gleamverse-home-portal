import requests

BASE_URL = "http://localhost:8081"
TIMEOUT = 30

def test_navigation_system_and_home_button_functionality():
    session = requests.Session()
    session.headers.update({'Accept': 'application/json'})

    # Validate that the home endpoint responds correctly
    home_resp = session.get(f"{BASE_URL}/", timeout=TIMEOUT)
    assert home_resp.status_code == 200, f"Home page status {home_resp.status_code}, expected 200"
    assert len(home_resp.text) > 0, "Home page content is empty"

    # Validate a known valid route (e.g., /books might be a main resource)
    books_resp = session.get(f"{BASE_URL}/books", timeout=TIMEOUT)
    assert books_resp.status_code == 200, f"/books status {books_resp.status_code}, expected 200"
    books_json = None
    try:
        books_json = books_resp.json()
    except Exception:
        assert False, "/books response is not valid JSON"
    assert isinstance(books_json, list), "/books expected to return a list"

    # Validate navigation to a user profile endpoint if protected requires auth: test unauthorized access
    profile_resp = session.get(f"{BASE_URL}/profile", timeout=TIMEOUT, allow_redirects=False)
    # It may redirect to login or deny access without authentication
    assert profile_resp.status_code in {401, 302, 403}, f"Unauthenticated /profile returned {profile_resp.status_code}, expected 401/302/403"

    # Validate error page response for known error endpoint or simulate error
    error_resp = session.get(f"{BASE_URL}/error", timeout=TIMEOUT)
    assert error_resp.status_code in {400, 404, 500}, f"/error endpoint status {error_resp.status_code}, expected 4xx or 5xx"

    # Validate 404 fallback for a non-existing random URL
    random_url = f"{BASE_URL}/this-route-does-not-exist-12345"
    not_found_resp = session.get(random_url, timeout=TIMEOUT)
    assert not_found_resp.status_code == 404, f"404 fallback returned {not_found_resp.status_code}, expected 404"
    assert "not found" in not_found_resp.text.lower() or "404" in not_found_resp.text.lower(), "404 page content invalid"

    # Test Home button / Go Home functionality by simulating access from unknown page to home
    # Since the backend is API only, verify that '/' is stable and usable as home endpoint
    go_home_resp = session.get(f"{BASE_URL}/", timeout=TIMEOUT)
    assert go_home_resp.status_code == 200, f"Go Home (/) returned status {go_home_resp.status_code}, expected 200"

test_navigation_system_and_home_button_functionality()
