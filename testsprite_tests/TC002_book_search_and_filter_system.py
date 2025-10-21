import requests

BASE_URL = "http://localhost:8081"
TIMEOUT = 30

def test_book_search_and_filter_system():
    headers = {
        "Content-Type": "application/json"
    }

    # Define search queries
    search_queries = [
        {"title": "Harry Potter"},
        {"author": "J.K. Rowling"},
        {"publisher": "Bloomsbury"}
    ]

    # Test search by title, author, publisher
    for query in search_queries:
        try:
            response = requests.get(
                f"{BASE_URL}/books/search",
                headers=headers,
                params=query,
                timeout=TIMEOUT
            )
            assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"
            assert 'application/json' in response.headers.get('Content-Type', ''), "Response content type is not JSON"
            data = response.json()
            assert isinstance(data, list), "Response data should be a list"
            for book in data:
                if "title" in query:
                    assert query["title"].lower() in book.get("title", "").lower()
                if "author" in query:
                    authors = book.get("authors", [])
                    assert isinstance(authors, list), "'authors' should be a list"
                    assert any(query["author"].lower() in a.lower() for a in authors)
                if "publisher" in query:
                    assert query["publisher"].lower() in book.get("publisher", "").lower()
        except requests.exceptions.RequestException as e:
            assert False, f"Request failed: {e}"
        except ValueError as e:
            assert False, f"Response JSON decoding failed: {e}"

    # Test real-time filtering simulation with category browsing
    categories = ["Fantasy", "Science Fiction", "Mystery"]
    for category in categories:
        try:
            response = requests.get(
                f"{BASE_URL}/books/category/{category}",
                headers=headers,
                timeout=TIMEOUT
            )
            assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"
            assert 'application/json' in response.headers.get('Content-Type', ''), "Response content type is not JSON"
            books = response.json()
            assert isinstance(books, list), "Books response should be a list"
            for book in books:
                categories_of_book = book.get("categories", [])
                assert isinstance(categories_of_book, list), "'categories' should be a list"
                assert any(category.lower() == c.lower() for c in categories_of_book)
        except requests.exceptions.RequestException as e:
            assert False, f"Request failed: {e}"
        except ValueError as e:
            assert False, f"Response JSON decoding failed: {e}"

test_book_search_and_filter_system()
