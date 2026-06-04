import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_happy_path_two_symbols(client):
    response = client.get("/overview", params={"symbols": "AAPL,TSLA"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_correct_schema_fields(client):
    response = client.get("/overview", params={"symbols": "AAPL"})
    assert response.status_code == 200
    item = response.json()[0]
    for field in ("symbol", "price", "diff_value", "diff_pct"):
        assert field in item, f"Overview item missing field: {field}"


def test_price_is_positive(client):
    response = client.get("/overview", params={"symbols": "AAPL"})
    assert response.status_code == 200
    assert response.json()[0]["price"] > 0


def test_diff_signs_are_consistent(client):
    """diff_value and diff_pct must have the same sign (both positive, both negative, or both zero)."""
    response = client.get("/overview", params={"symbols": "AAPL"})
    assert response.status_code == 200
    item = response.json()[0]
    assert (item["diff_value"] >= 0) == (item["diff_pct"] >= 0)


def test_missing_symbols_param_returns_error(client):
    response = client.get("/overview")
    assert response.status_code in (400, 422)
