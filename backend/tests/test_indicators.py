import numpy as np
import pandas as pd
import pytest

from services.indicators import (
    calc_ema,
    calc_fibonacci,
    calc_fvg,
    calc_macd,
    calc_rsi,
    calc_stoch_rsi,
    calc_support_resistance,
)


def make_df(n: int, seed: int = 42) -> pd.DataFrame:
    """Synthetic OHLCV DataFrame with n bars using a seeded RNG for reproducibility."""
    rng = np.random.default_rng(seed)
    close = 100.0 + np.cumsum(rng.normal(0, 1, n))
    high = close + rng.uniform(0.5, 2.0, n)
    low = close - rng.uniform(0.5, 2.0, n)
    open_ = close + rng.normal(0, 0.5, n)
    volume = rng.integers(1_000_000, 10_000_000, n).astype(float)
    dates = pd.date_range("2024-01-01", periods=n, freq="D")
    return pd.DataFrame({
        "Date": dates.strftime("%Y-%m-%d"),
        "Open": open_,
        "High": high,
        "Low": low,
        "Close": close,
        "Volume": volume,
    })


class TestCalcEma:
    def test_happy_path_length(self):
        df = make_df(250)
        result = calc_ema(df, 20)
        # min_periods=20 drops first 19 rows; valid values = 250 - 19 = 231
        assert len(result) == 231

    def test_insufficient_data_returns_empty(self):
        df = make_df(5)
        result = calc_ema(df, 20)
        assert result == []

    def test_constant_prices_equal_constant(self):
        """EMA of a constant price series must equal that constant at every point."""
        df = make_df(250)
        df["Close"] = 100.0
        result = calc_ema(df, 20)
        assert len(result) == 231
        for point in result:
            assert abs(point["value"] - 100.0) < 1e-6

    def test_each_point_has_time_and_value(self):
        df = make_df(250)
        result = calc_ema(df, 20)
        for point in result:
            assert "time" in point
            assert "value" in point


class TestCalcMacd:
    def test_happy_path_returns_three_arrays(self):
        df = make_df(250)
        result = calc_macd(df)
        assert "macd" in result
        assert "signal" in result
        assert "histogram" in result

    def test_arrays_equal_length(self):
        df = make_df(250)
        result = calc_macd(df)
        assert len(result["macd"]) == len(result["signal"]) == len(result["histogram"])

    def test_all_values_finite(self):
        df = make_df(250)
        result = calc_macd(df)
        for key in ("macd", "signal", "histogram"):
            for point in result[key]:
                assert point["value"] is not None
                assert np.isfinite(point["value"])


class TestCalcRsi:
    def test_values_bounded_0_to_100(self):
        df = make_df(250)
        result = calc_rsi(df, 14)
        assert len(result) > 0
        for point in result:
            assert 0 <= point["value"] <= 100

    def test_overbought_signal_on_consecutive_up_days(self):
        """Monotonically rising prices should push RSI above 70."""
        n = 60
        df = make_df(n)
        df["Close"] = [100.0 + i for i in range(n)]
        result = calc_rsi(df, 14)
        assert any(p["value"] > 70 for p in result)


class TestCalcStochRsi:
    def test_k_and_d_bounded_0_to_100(self):
        df = make_df(250)
        result = calc_stoch_rsi(df)
        for point in result["k"]:
            assert 0 <= point["value"] <= 100
        for point in result["d"]:
            assert 0 <= point["value"] <= 100

    def test_k_and_d_lengths_match(self):
        df = make_df(250)
        result = calc_stoch_rsi(df)
        assert len(result["k"]) == len(result["d"])


class TestCalcFibonacci:
    def test_level_values_match_known_prices(self):
        """With close prices 50–99, the 0, 0.5, and 1.0 levels must be exact."""
        df = make_df(50)
        df["Close"] = [float(i) for i in range(50, 100)]
        low_price, high_price = 50.0, 99.0
        result = calc_fibonacci(df)
        assert abs(result["levels"]["0"] - low_price) < 1e-3
        assert abs(result["levels"]["1.0"] - high_price) < 1e-3
        assert abs(result["levels"]["0.5"] - (low_price + (high_price - low_price) * 0.5)) < 1e-3

    def test_all_seven_levels_present(self):
        df = make_df(50)
        result = calc_fibonacci(df)
        expected = {"0", "0.236", "0.382", "0.5", "0.618", "0.786", "1.0"}
        assert set(result["levels"].keys()) == expected


class TestCalcSupportResistance:
    def test_returns_a_list(self):
        df = make_df(100)
        result = calc_support_resistance(df)
        assert isinstance(result, list)

    def test_levels_within_price_range(self):
        df = make_df(100)
        result = calc_support_resistance(df)
        if result:
            min_price = float(df["Close"].min())
            max_price = float(df["Close"].max())
            for level in result:
                assert min_price <= level <= max_price


class TestCalcFvg:
    def _make_fvg_df(self, h0, l0, h1, l1, h2, l2) -> pd.DataFrame:
        """Minimal 3-candle DataFrame for FVG detection."""
        return pd.DataFrame({
            "Date": ["2024-01-01", "2024-01-02", "2024-01-03"],
            "Open":   [h0 - 0.5, h1 - 0.5, h2 - 0.5],
            "High":   [h0, h1, h2],
            "Low":    [l0, l1, l2],
            "Close":  [h0 - 0.5, h1 - 0.5, h2 - 0.5],
            "Volume": [1e6, 1e6, 1e6],
        })

    def test_bullish_fvg_detected(self):
        # lows[2]=105 > highs[0]=100 → bullish gap
        df = self._make_fvg_df(100, 90, 110, 100, 115, 105)
        result = calc_fvg(df)
        assert len(result) == 1
        assert result[0]["type"] == "bullish"

    def test_bearish_fvg_detected(self):
        # highs[2]=80 < lows[0]=90 → bearish gap
        df = self._make_fvg_df(100, 90, 95, 85, 80, 70)
        result = calc_fvg(df)
        assert len(result) == 1
        assert result[0]["type"] == "bearish"

    def test_no_fvg_in_flat_overlapping_market(self):
        # All candles overlap — no gap exists
        df = self._make_fvg_df(101, 99, 101, 99, 101, 99)
        result = calc_fvg(df)
        assert result == []
