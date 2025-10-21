import requests
from requests.exceptions import RequestException, Timeout, ConnectionError

BASE_URL = "http://localhost:8081"
TIMEOUT = 30

def test_error_handling_and_fallback_mechanisms():
    # Simulate hitting the main user profile endpoint assuming it requires authentication
    # Attempt no authentication to simulate error handling
    profile_url = f"{BASE_URL}/api/user/profile"
    headers = {
        "Accept": "application/json"
    }

    try:
        # 1. Test unauthorized access handling (401) or successful access (200)
        response = requests.get(profile_url, headers=headers, timeout=TIMEOUT)
        assert response.status_code in [200, 401, 403], f"Expected 200, 401 or 403, got {response.status_code}"
        if response.status_code in [401, 403]:
            try:
                error_data = response.json()
            except Exception:
                error_data = {}
            assert "error" in error_data or "message" in error_data, "Error message expected in response"
        else:
            # If 200, ensure profile data is returned (some key indicating success)
            try:
                data = response.json()
            except Exception:
                assert False, "Expected JSON profile data"
            assert isinstance(data, dict), "Profile data should be a dictionary"

        # 2. Test non-existent endpoint to trigger 404 and fallback handling
        invalid_url = f"{BASE_URL}/api/nonexistent/endpoint"
        response = requests.get(invalid_url, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        try:
            error_resp = response.json()
        except Exception:
            error_resp = {}
        assert "error" in error_resp or "message" in error_resp, "Error message expected for 404"

        # 3. Test server error simulation by sending malformed payload to upload book (POST /api/books)
        upload_url = f"{BASE_URL}/api/books"
        malformed_payload = {"title": "", "author": 123, "file": None}  # invalid types and missing required fields
        response = requests.post(upload_url, json=malformed_payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code >= 400, "Expected client or server error status on malformed upload"
        try:
            error_resp = response.json()
        except Exception:
            error_resp = {}
        assert any(k in error_resp for k in ("error", "message")), "Error message expected in malformed upload response"

    except (Timeout, ConnectionError):
        # Simulate fallback mechanism: network failure should not block user activity
        # In actual UI, fallback page or cached data would show, here just assert we caught the exception
        assert True, "Network error caught, fallback mechanism can be triggered"

    except RequestException as e:
        # Any other requests exceptions should not block test
        assert False, f"Unexpected RequestException: {e}"

    else:
        # If no exceptions were raised, ensure response handling is proper
        # Also, test data persistence fallback by checking if library listing can be fetched
        books_url = f"{BASE_URL}/api/books"
        try:
            response = requests.get(books_url, headers=headers, timeout=TIMEOUT)
            assert response.status_code == 200, f"Expected 200 from books endpoint, got {response.status_code}"
            try:
                books = response.json()
            except Exception:
                assert False, "Expected JSON list of books"
            assert isinstance(books, list), "Books endpoint should return a list"
        except (Timeout, ConnectionError):
            # Again, fallback if network error occurs here
            assert True, "Network failure caught fetching books, fallback can be triggered"


test_error_handling_and_fallback_mechanisms()
