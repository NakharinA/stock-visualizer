import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_happy_path_200_with_symbol(client):
    response = client.get("/stock/AAPL", params={"period": "3mo"})
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "AAPL"
    assert len(data["ohlcv"]) > 0


def test_all_indicator_keys_present(client):
    response = client.get("/stock/AAPL", params={"period": "3mo"})
    assert response.status_code == 200
    indicators = response.json()["indicators"]
    expected_keys = ("ema20", "ema50", "macd", "rsi", "stoch_rsi", "fibonacci", "support_resistance", "fvg")
    for key in expected_keys:
        assert key in indicators, f"Missing indicator key: {key}"


def test_one_week_period_returns_few_bars(client):
    response = client.get("/stock/AAPL", params={"period": "1wk"})
    assert response.status_code == 200
    bars = response.json()["ohlcv"]
    assert 1 <= len(bars) <= 7


def test_ytd_period_returns_bars(client):
    response = client.get("/stock/AAPL", params={"period": "ytd"})
    assert response.status_code == 200
    bars = response.json()["ohlcv"]
    assert len(bars) > 0


def test_invalid_symbol_returns_404(client):
    response = client.get("/stock/XXXXINVALID999")
    assert response.status_code == 404
    assert "error" in response.json()


def test_invalid_period_returns_422(client):
    response = client.get("/stock/AAPL", params={"period": "99d"})
    assert response.status_code == 422


def test_ohlcv_bar_shape(client):
    response = client.get("/stock/AAPL", params={"period": "3mo"})
    assert response.status_code == 200
    bars = response.json()["ohlcv"]
    for bar in bars:
        for field in ("time", "open", "high", "low", "close", "volume"):
            assert field in bar, f"OHLCV bar missing field: {field}"
