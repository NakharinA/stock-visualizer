import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_happy_path_returns_results(client):
    response = client.get("/search", params={"q": "apple"})
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_aapl_appears_in_apple_results(client):
    response = client.get("/search", params={"q": "apple"})
    assert response.status_code == 200
    symbols = [item["symbol"] for item in response.json()]
    assert "AAPL" in symbols


def test_result_items_have_correct_schema(client):
    response = client.get("/search", params={"q": "tesla"})
    assert response.status_code == 200
    for item in response.json():
        assert "symbol" in item
        assert "name" in item


def test_limit_parameter_is_respected(client):
    response = client.get("/search", params={"q": "microsoft", "limit": 3})
    assert response.status_code == 200
    assert len(response.json()) <= 3


def test_empty_query_returns_400(client):
    response = client.get("/search", params={"q": ""})
    assert response.status_code == 400


def test_missing_q_param_returns_400(client):
    # q defaults to "" → triggers the empty-query guard → 400
    response = client.get("/search")
    assert response.status_code == 400
