import requests

BASE_URL = "http://localhost:8080"
TIMEOUT = 30

def test_retrieve_top_books_for_carousel_display():
    url = f"{BASE_URL}/top-books"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        # Assert status code 200 OK
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        data = response.json()
        # Assert response is a list
        assert isinstance(data, list), "Response is not a list"
        # Assert list is not empty (assuming there should be some top books)
        assert len(data) > 0, "Top books list is empty"
        # Check each book for required fields including author information
        for book in data:
            assert isinstance(book, dict), "Book item is not a dictionary"
            # Required keys in each book (at minimum)
            expected_keys = {"id", "title", "author"}
            missing_keys = expected_keys - book.keys()
            assert not missing_keys, f"Missing keys in book item: {missing_keys}"
            # Author info should be a non-empty string or object with name
            author = book["author"]
            # Author can be a string (name) or a dict containing author info
            assert author is not None, "Author info is None"
            if isinstance(author, dict):
                assert "name" in author and author["name"], "Author dict missing 'name' or it is empty"
            elif isinstance(author, str):
                assert author.strip(), "Author string is empty"
            else:
                assert False, f"Author field has unexpected type: {type(author)}"
        # Additional: check if carousel supports infinite looping - can only infer from data length > 1 for looping
        assert len(data) > 1, "Top books list too short for infinite looping carousel"
    except requests.RequestException as e:
        assert False, f"Request to /top-books failed: {str(e)}"

test_retrieve_top_books_for_carousel_display()