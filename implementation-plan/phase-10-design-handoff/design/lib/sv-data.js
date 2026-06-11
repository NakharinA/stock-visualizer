/* Stock Visualizer — deterministic mock market data + indicator engine.
   All math is client-side here (the real app spec computes server-side).
   Exposes window.SV with: SYMBOLS, getName, getSeries, slice, sparkline, overviewRow */
(function () {
  'use strict';

  // ---- deterministic PRNG ----------------------------------------------------
  function hashStr(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 16777619); }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gaussFactory(rnd) {
    let spare = null;
    return function () {
      if (spare !== null) { const s = spare; spare = null; return s; }
      let u = 0, v = 0, s = 0;
      do { u = rnd() * 2 - 1; v = rnd() * 2 - 1; s = u * u + v * v; } while (s === 0 || s >= 1);
      const m = Math.sqrt(-2 * Math.log(s) / s);
      spare = v * m; return u * m;
    };
  }

  // ---- symbol registry -------------------------------------------------------
  const REGISTRY = {
    AAPL:  { name: 'Apple Inc.',            sector: 'Technology',      base: 198,  vol: 0.27, drift: 0.12 },
    NET:   { name: 'Cloudflare, Inc.',      sector: 'Technology',      base: 84,   vol: 0.55, drift: 0.18 },
    NVDA:  { name: 'NVIDIA Corporation',    sector: 'Semiconductors',  base: 134,  vol: 0.48, drift: 0.30 },
    TSLA:  { name: 'Tesla, Inc.',           sector: 'Automotive',      base: 248,  vol: 0.60, drift: 0.05 },
    MSFT:  { name: 'Microsoft Corp.',       sector: 'Technology',      base: 438,  vol: 0.24, drift: 0.14 },
    AMZN:  { name: 'Amazon.com, Inc.',      sector: 'Consumer',        base: 188,  vol: 0.32, drift: 0.13 },
    GOOGL: { name: 'Alphabet Inc.',         sector: 'Technology',      base: 176,  vol: 0.29, drift: 0.10 },
    META:  { name: 'Meta Platforms, Inc.',  sector: 'Technology',      base: 512,  vol: 0.37, drift: 0.16 },
    AMD:   { name: 'Advanced Micro Devices',sector: 'Semiconductors',  base: 162,  vol: 0.50, drift: 0.08 },
    SPY:   { name: 'SPDR S&P 500 ETF',      sector: 'Index ETF',       base: 548,  vol: 0.14, drift: 0.09 },
    QQQ:   { name: 'Invesco QQQ Trust',     sector: 'Index ETF',       base: 478,  vol: 0.18, drift: 0.12 },
    COIN:  { name: 'Coinbase Global',       sector: 'Financials',      base: 224,  vol: 0.70, drift: 0.05 }
  };
  const DEFAULT_WATCHLIST = ['AAPL', 'NET', 'NVDA', 'TSLA', 'MSFT', 'AMZN'];

  function meta(symbol) {
    const s = symbol.toUpperCase();
    if (REGISTRY[s]) return Object.assign({ symbol: s }, REGISTRY[s]);
    const h = hashStr(s);
    return {
      symbol: s,
      name: s + ' Holdings',
      sector: 'Equity',
      base: 40 + (h % 460),
      vol: 0.25 + ((h >> 8) % 45) / 100,
      drift: -0.05 + ((h >> 16) % 30) / 100
    };
  }
  function getName(symbol) { return meta(symbol).name; }

  // ---- business-day calendar -------------------------------------------------
  function businessDays(n, end) {
    // returns n 'YYYY-MM-DD' strings ending on/before `end` (Date), ascending
    const out = [];
    const d = new Date(end.getTime());
    while (out.length < n) {
      const day = d.getUTCDay();
      if (day !== 0 && day !== 6) out.push(fmt(d));
      d.setUTCDate(d.getUTCDate() - 1);
    }
    return out.reverse();
  }
  function fmt(d) {
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return d.getUTCFullYear() + '-' + m + '-' + day;
  }

  const NBARS = 680;
  const END = new Date(Date.UTC(2026, 5, 3)); // 2026-06-03
  const cache = {};

  function getSeries(symbol) {
    const s = symbol.toUpperCase();
    if (cache[s]) return cache[s];
    const m = meta(s);
    const rnd = mulberry32(hashStr(s));
    const gauss = gaussFactory(rnd);
    const dates = businessDays(NBARS, END);

    const bars = [];
    // start lower so a mild uptrend lands near `base`
    let price = m.base * (0.62 + rnd() * 0.12);
    const muD = m.drift / 252;
    const sigD = m.vol / Math.sqrt(252);
    const volBase = 8e6 + (hashStr(s + 'v') % 60) * 1e6;

    for (let i = 0; i < NBARS; i++) {
      const open = i === 0 ? price : bars[i - 1].close * (1 + gauss() * sigD * 0.25);
      const ret = muD + sigD * gauss();
      let close = open * Math.exp(ret);
      // occasional regime wobble for visual interest
      if (rnd() < 0.03) close *= 1 + (rnd() - 0.5) * 0.06;
      const span = Math.abs(close - open) + open * sigD * (0.4 + rnd() * 0.9);
      const high = Math.max(open, close) + span * rnd() * 0.8;
      const low = Math.min(open, close) - span * rnd() * 0.8;
      const move = Math.abs(close - open) / open;
      const volume = Math.round(volBase * (0.55 + rnd() * 0.9 + move * 18));
      bars.push({
        time: dates[i],
        open: r2(open), high: r2(high), low: r2(Math.max(low, 0.5)),
        close: r2(close), volume: volume
      });
      price = close;
    }

    // rescale so the final price lands near the symbol's realistic base
    const target = m.base * (0.9 + rnd() * 0.2);
    const factor = target / bars[bars.length - 1].close;
    for (const b of bars) {
      b.open = r2(b.open * factor); b.high = r2(b.high * factor);
      b.low = r2(b.low * factor); b.close = r2(b.close * factor);
    }

    const closes = bars.map(b => b.close);
    const highs = bars.map(b => b.high);
    const lows = bars.map(b => b.low);

    const ind = {
      ema20: ema(closes, 20), ema50: ema(closes, 50),
      ema100: ema(closes, 100), ema200: ema(closes, 200),
      rsi: rsi(closes, 14),
      macd: macd(closes, 12, 26, 9),
      stochRsi: stochRsi(closes, 14, 14, 3, 3)
    };
    const out = { meta: m, bars: bars, ind: ind, pivots: pivots(highs, lows, 6) };
    cache[s] = out;
    return out;
  }

  function r2(x) { return Math.round(x * 100) / 100; }

  // ---- indicators ------------------------------------------------------------
  function ema(values, period) {
    const k = 2 / (period + 1);
    const out = new Array(values.length).fill(null);
    let prev = null, sum = 0;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (v == null) { continue; }
      if (prev === null) {
        sum += v;
        if (i >= period - 1) { prev = sum / period; out[i] = prev; }
      } else { prev = v * k + prev * (1 - k); out[i] = prev; }
    }
    return out;
  }
  function emaSparse(values, period) {
    // ema over array that may contain leading nulls; seeds after `period` valid pts
    const k = 2 / (period + 1);
    const out = new Array(values.length).fill(null);
    let prev = null, count = 0, sum = 0;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (v == null) continue;
      count++;
      if (prev === null) {
        sum += v;
        if (count >= period) { prev = sum / period; out[i] = prev; }
      } else { prev = v * k + prev * (1 - k); out[i] = prev; }
    }
    return out;
  }
  function rsi(closes, period) {
    const out = new Array(closes.length).fill(null);
    let g = 0, l = 0;
    for (let i = 1; i < closes.length; i++) {
      const ch = closes[i] - closes[i - 1];
      const up = Math.max(ch, 0), dn = Math.max(-ch, 0);
      if (i <= period) {
        g += up; l += dn;
        if (i === period) { g /= period; l /= period; out[i] = 100 - 100 / (1 + (l === 0 ? 100 : g / l)); }
      } else {
        g = (g * (period - 1) + up) / period;
        l = (l * (period - 1) + dn) / period;
        const rs = l === 0 ? 100 : g / l;
        out[i] = 100 - 100 / (1 + rs);
      }
    }
    return out;
  }
  function macd(closes, fast, slow, signal) {
    const ef = ema(closes, fast), es = ema(closes, slow);
    const line = closes.map((_, i) => (ef[i] != null && es[i] != null) ? ef[i] - es[i] : null);
    const sig = emaSparse(line, signal);
    const hist = line.map((v, i) => (v != null && sig[i] != null) ? v - sig[i] : null);
    return { macd: line, signal: sig, hist: hist };
  }
  function stochRsi(closes, rsiP, stochP, kS, dS) {
    const r = rsi(closes, rsiP);
    const raw = new Array(closes.length).fill(null);
    for (let i = 0; i < closes.length; i++) {
      if (r[i] == null) continue;
      let lo = Infinity, hi = -Infinity, have = 0;
      for (let j = i - stochP + 1; j <= i; j++) {
        if (j < 0 || r[j] == null) continue;
        have++; if (r[j] < lo) lo = r[j]; if (r[j] > hi) hi = r[j];
      }
      if (have >= stochP) raw[i] = hi === lo ? 0 : ((r[i] - lo) / (hi - lo)) * 100;
    }
    const k = sma(raw, kS);
    const d = sma(k, dS);
    return { k: k, d: d };
  }
  function sma(values, period) {
    const out = new Array(values.length).fill(null);
    const buf = [];
    for (let i = 0; i < values.length; i++) {
      if (values[i] == null) { buf.length = 0; continue; }
      buf.push(values[i]); if (buf.length > period) buf.shift();
      if (buf.length === period) out[i] = buf.reduce((a, b) => a + b, 0) / period;
    }
    return out;
  }
  function pivots(highs, lows, k) {
    // swing highs/lows: local extrema with k bars on each side
    const res = [];
    for (let i = k; i < highs.length - k; i++) {
      let isHigh = true, isLow = true;
      for (let j = i - k; j <= i + k; j++) {
        if (highs[j] > highs[i]) isHigh = false;
        if (lows[j] < lows[i]) isLow = false;
      }
      if (isHigh) res.push({ i: i, price: highs[i], kind: 'r' });
      if (isLow) res.push({ i: i, price: lows[i], kind: 's' });
    }
    return res;
  }

  // ---- period slicing --------------------------------------------------------
  const PERIOD_BARS = { '1wk': 5, '1mo': 22, '3mo': 64, '6mo': 128, '1y': 252 };
  function sliceCount(full, period) {
    if (period === 'ytd') {
      const yr = full.bars[full.bars.length - 1].time.slice(0, 4);
      let n = 0;
      for (let i = full.bars.length - 1; i >= 0; i--) { if (full.bars[i].time.slice(0, 4) === yr) n++; else break; }
      return Math.max(n, 6);
    }
    return PERIOD_BARS[period] || 64;
  }

  function slice(symbol, period) {
    const full = getSeries(symbol);
    const n = Math.min(sliceCount(full, period), full.bars.length);
    const start = full.bars.length - n;
    const bars = full.bars.slice(start);
    const cut = (arr) => arr.slice(start);
    const ind = full.ind;
    const out = {
      meta: full.meta, period: period, bars: bars,
      ema20: cut(ind.ema20), ema50: cut(ind.ema50),
      ema100: cut(ind.ema100), ema200: cut(ind.ema200),
      rsi: cut(ind.rsi),
      macd: { macd: cut(ind.macd.macd), signal: cut(ind.macd.signal), hist: cut(ind.macd.hist) },
      stochRsi: { k: cut(ind.stochRsi.k), d: cut(ind.stochRsi.d) }
    };

    // fibonacci over visible window
    let hi = -Infinity, lo = Infinity;
    for (const b of bars) { if (b.high > hi) hi = b.high; if (b.low < lo) lo = b.low; }
    const ratios = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
    out.fib = { high: r2(hi), low: r2(lo), levels: ratios.map(r => ({ ratio: r, price: r2(hi - (hi - lo) * r) })) };

    // support/resistance: pivots within visible window, clustered
    const visPivots = full.pivots.filter(p => p.i >= start);
    out.sr = clusterLevels(visPivots, lo, hi);

    // fair value gaps within visible window
    out.fvg = [];
    for (let i = 2; i < bars.length; i++) {
      const a = bars[i - 2], c = bars[i];
      if (c.low > a.high) out.fvg.push({ type: 'bullish', top: c.low, bottom: a.high, time: c.time, fillTime: findFill(bars, i, a.high, true) });
      else if (c.high < a.low) out.fvg.push({ type: 'bearish', top: a.low, bottom: c.high, time: c.time, fillTime: findFill(bars, i, a.low, false) });
    }
    // keep most-recent, meaningful gaps
    out.fvg = out.fvg.filter(g => (g.top - g.bottom) / lo > 0.004).slice(-8);

    return out;
  }
  function findFill(bars, i, level, bull) {
    for (let j = i + 1; j < bars.length; j++) {
      if (bull && bars[j].low <= level) return bars[j].time;
      if (!bull && bars[j].high >= level) return bars[j].time;
    }
    return null;
  }
  function clusterLevels(pivs, lo, hi) {
    const tol = (hi - lo) * 0.012;
    const clusters = [];
    for (const p of pivs) {
      let placed = false;
      for (const c of clusters) {
        if (Math.abs(c.price - p.price) <= tol) {
          c.sum += p.price; c.count++; c.price = c.sum / c.count;
          if (p.kind === 'r') c.r++; else c.s++;
          placed = true; break;
        }
      }
      if (!placed) clusters.push({ price: p.price, sum: p.price, count: 1, r: p.kind === 'r' ? 1 : 0, s: p.kind === 's' ? 1 : 0 });
    }
    return clusters
      .filter(c => c.count >= 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(c => ({ price: r2(c.price), kind: c.r >= c.s ? 'resistance' : 'support', touches: c.count }))
      .sort((a, b) => b.price - a.price);
  }

  // ---- helpers for dashboard / overview --------------------------------------
  function sparkline(symbol, n) {
    const full = getSeries(symbol);
    return full.bars.slice(-(n || 40)).map(b => b.close);
  }
  function overviewRow(symbol) {
    const full = getSeries(symbol);
    const bars = full.bars;
    const last = bars[bars.length - 1];
    const prev = bars[bars.length - 2];
    const diff = r2(last.close - prev.close);
    return {
      symbol: full.meta.symbol,
      name: full.meta.name,
      sector: full.meta.sector,
      price: last.close,
      prevClose: prev.close,
      diff: diff,
      pct: r2((diff / prev.close) * 100),
      volume: last.volume,
      spark: bars.slice(-32).map(b => b.close)
    };
  }

  window.SV = {
    REGISTRY: REGISTRY,
    DEFAULT_WATCHLIST: DEFAULT_WATCHLIST,
    SYMBOLS: Object.keys(REGISTRY),
    meta: meta,
    getName: getName,
    getSeries: getSeries,
    slice: slice,
    sparkline: sparkline,
    overviewRow: overviewRow
  };
})();
