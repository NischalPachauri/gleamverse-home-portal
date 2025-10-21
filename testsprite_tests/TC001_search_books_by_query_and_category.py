import requests

BASE_URL = "http://localhost:8080"
TIMEOUT = 30

def test_search_books_by_query_and_category():
    # Define test queries and categories
    test_cases = [
        {"query": "history", "category": None},
        {"query": "history", "category": "Historical Fiction"},
        {"query": "tolkien", "category": None},
        {"query": "science fiction", "category": "Sci-Fi"},
        {"query": "mystery", "category": "Thriller"},
    ]

    for case in test_cases:
        params = {"query": case["query"]}
        if case["category"]:
            params["category"] = case["category"]

        try:
            response = requests.get(f"{BASE_URL}/search", params=params, timeout=TIMEOUT)
            response.raise_for_status()
        except requests.RequestException as e:
            assert False, f"Request failed for params {params}: {e}"

        assert response.status_code == 200, f"Expected 200 OK but got {response.status_code} for params {params}"
        try:
            books = response.json()
        except ValueError:
            assert False, f"Response is not valid JSON for params {params}: {response.text}"

        assert isinstance(books, list), f"Response JSON is not a list for params {params}"

        # Verify each book matches query or category filter in title, author or description
        for book in books:
            # Check keys exist in book
            for key in ("title", "author", "description", "category"):
                assert key in book, f"Book missing expected field '{key}': {book}"

            title = book["title"].lower() if book["title"] else ""
            author = book["author"].lower() if book["author"] else ""
            description = book["description"].lower() if book["description"] else ""
            category = book["category"].lower() if book["category"] else ""

            query_lower = case["query"].lower()
            category_lower = case["category"].lower() if case["category"] else None

            # At least one of these fields (title, author, description) should contain the query
            query_match = (query_lower in title) or (query_lower in author) or (query_lower in description)
            assert query_match, f"Book does not match query '{case['query']}': {book}"

            # If category filter provided, book category must match (case insensitive)
            if category_lower:
                assert category == category_lower, f"Book category '{category}' does not match filter '{category_lower}': {book}"

test_search_books_by_query_and_category()