import requests

BASE_URL = "http://localhost:8080"
TIMEOUT = 30

def test_open_pdf_reader_for_specific_book():
    try:
        # Search for books with a generic query to get at least one bookId
        search_resp = requests.get(
            f"{BASE_URL}/search",
            params={"query": "a"},  # broad query to get some results
            timeout=TIMEOUT
        )
        assert search_resp.status_code == 200, f"Failed to search books: {search_resp.status_code}"
        books = search_resp.json()
        assert isinstance(books, list) and len(books) > 0, "No books found in search response"
        book_id = books[0].get("id")
        assert book_id, "Book object missing 'id' field"

        # Open the PDF reader for the obtained bookId
        reader_resp = requests.get(f"{BASE_URL}/reader/{book_id}", timeout=TIMEOUT)
        assert reader_resp.status_code == 200, f"Failed to open PDF reader for bookId {book_id}"
        content_type = reader_resp.headers.get("Content-Type", "")
        assert "html" in content_type.lower(), "Unexpected Content-Type for PDF reader interface"

        html_content = reader_resp.text.lower()
        assert any(term in html_content for term in ["page", "zoom", "two-page", "reader"]), \
            "PDF reader interface HTML missing expected navigation or zoom terms"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    except AssertionError as e:
        assert False, str(e)

test_open_pdf_reader_for_specific_book()
