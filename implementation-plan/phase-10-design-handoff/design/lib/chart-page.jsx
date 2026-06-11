/* Stock Chart page — Lightweight Charts candles, zoom-only, overlays, oscillator subpanel.
   Exposes window.ChartPage */
(function () {
  'use strict';
  const { Icon, Delta, fmtPrice, fmtSigned, fmtPct, fmtCompact } = window.SVUI;
  const LC = window.LightweightCharts;

  const PERIODS = [
    { key: 'ytd', label: 'YTD' }, { key: '1y', label: '1Y' }, { key: '6mo', label: '6M' },
    { key: '3mo', label: '3M' }, { key: '1mo', label: '1M' }, { key: '1wk', label: '1W' }
  ];
  const EMA_DEFS = [
    { key: 'ema20', label: 'EMA 20', color: '#f5a623' },
    { key: 'ema50', label: 'EMA 50', color: '#4da6ff' },
    { key: 'ema100', label: 'EMA 100', color: '#c678dd' },
    { key: 'ema200', label: 'EMA 200', color: '#d7dae0' }
  ];
  const OSC = [{ key: 'macd', label: 'MACD' }, { key: 'rsi', label: 'RSI' }, { key: 'stoch', label: 'Stoch RSI' }];
  const UP = '#2ebd85', DOWN = '#f6465d', ACCENT = '#ff7a18';

  const baseLayout = {
    localization: { locale: 'en-US' },
    layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#9aa0ac', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 },
    grid: { vertLines: { color: 'rgba(255,255,255,0.035)' }, horzLines: { color: 'rgba(255,255,255,0.045)' } },
    crosshair: {
      mode: 0,
      vertLine: { color: 'rgba(255,255,255,0.28)', width: 1, style: 2, labelBackgroundColor: '#2a2d36' },
      horzLine: { color: 'rgba(255,255,255,0.28)', width: 1, style: 2, labelBackgroundColor: '#2a2d36' }
    },
    rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
    timeScale: { borderColor: 'rgba(255,255,255,0.08)', fixLeftEdge: true, fixRightEdge: true, rightOffset: 2, minBarSpacing: 2 },
    handleScroll: { mouseWheel: false, pressedMouseMove: false, horzTouchDrag: false, vertTouchDrag: false },
    handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true, axisDoubleClickReset: true },
    autoSize: true
  };

  function lineData(bars, arr) {
    const o = [];
    for (let i = 0; i < bars.length; i++) if (arr[i] != null) o.push({ time: bars[i].time, value: arr[i] });
    return o;
  }

  function ChartPage(props) {
    const symbol = props.symbol;
    const navigate = props.navigate;
    const { useState, useEffect, useRef, useMemo, useCallback } = React;

    const [period, setPeriod] = useState(() => localStorage.getItem('sv.period') || '6mo');
    const [tog, setTog] = useState(() => {
      try { const s = JSON.parse(localStorage.getItem('sv.tog')); if (s) return s; } catch (e) {}
      return { ema20: true, ema50: true, ema100: false, ema200: false, fibo: false, sr: true, fvg: true, macd: true, rsi: false, stoch: false };
    });
    const [tab, setTab] = useState('macd');
    const [hover, setHover] = useState(null);

    const data = useMemo(() => window.SV.slice(symbol, period), [symbol, period]);
    const inWatch = props.isWatched(symbol);

    const mainRef = useRef(null), subRef = useRef(null), fvgRef = useRef(null);
    const R = useRef({});

    useEffect(() => { localStorage.setItem('sv.period', period); }, [period]);
    useEffect(() => { localStorage.setItem('sv.tog', JSON.stringify(tog)); }, [tog]);

    const oscEnabled = tog.macd || tog.rsi || tog.stoch;
    const availTabs = OSC.filter(o => tog[o.key]);

    // keep active tab valid
    useEffect(() => {
      if (availTabs.length && !tog[tab]) setTab(availTabs[0].key);
    }, [tog]); // eslint-disable-line

    // ---- create charts once --------------------------------------------------
    useEffect(() => {
      const chart = LC.createChart(mainRef.current, baseLayout);
      const candle = chart.addCandlestickSeries({
        upColor: UP, downColor: DOWN, wickUpColor: UP, wickDownColor: DOWN,
        borderVisible: false, priceLineColor: 'rgba(255,255,255,0.25)', priceLineStyle: 2
      });
      const vol = chart.addHistogramSeries({ priceScaleId: 'vol', priceLineVisible: false, lastValueVisible: false });
      chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.86, bottom: 0 } });
      const emas = {};
      EMA_DEFS.forEach(e => {
        emas[e.key] = chart.addLineSeries({ color: e.color, lineWidth: 1.6, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, visible: false });
      });

      const subChart = LC.createChart(subRef.current, Object.assign({}, baseLayout, {
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)', scaleMargins: { top: 0.16, bottom: 0.12 } },
        timeScale: Object.assign({}, baseLayout.timeScale, { visible: false })
      }));

      R.current = { chart, candle, vol, emas, subChart, subSeries: [], priceLines: [], raf: 0, data: null, tog: null };

      // sync zoom both ways
      let syncing = false;
      const link = (a, b) => a.timeScale().subscribeVisibleLogicalRangeChange(rng => {
        if (syncing || !rng) return; syncing = true;
        try { b.timeScale().setVisibleLogicalRange(rng); } catch (e) {}
        syncing = false; scheduleFvg();
      });
      link(chart, subChart); link(subChart, chart);

      chart.subscribeCrosshairMove(param => {
        if (!param || !param.time || !param.point || param.point.x < 0) { setHover(null); return; }
        const d = param.seriesData.get(candle);
        if (d) setHover({ time: param.time, open: d.open, high: d.high, low: d.low, close: d.close });
      });

      const ro = new ResizeObserver(() => scheduleFvg());
      ro.observe(mainRef.current);
      R.current.ro = ro;

      return () => { ro.disconnect(); chart.remove(); subChart.remove(); R.current = {}; };
    }, []);

    // ---- fvg overlay draw ----------------------------------------------------
    const drawFvg = useCallback(() => {
      const r = R.current; if (!r.chart || !fvgRef.current || !mainRef.current) return;
      const cvs = fvgRef.current, cont = mainRef.current;
      const w = cont.clientWidth, h = cont.clientHeight, dpr = window.devicePixelRatio || 1;
      if (cvs.width !== w * dpr || cvs.height !== h * dpr) { cvs.width = w * dpr; cvs.height = h * dpr; cvs.style.width = w + 'px'; cvs.style.height = h + 'px'; }
      const ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      if (!r.tog || !r.tog.fvg || !r.data) return;
      const ts = r.chart.timeScale(); const rightEdge = ts.width();
      r.data.fvg.forEach(g => {
        let x1 = ts.timeToCoordinate(g.time); if (x1 == null) x1 = 0;
        let x2 = g.fillTime ? ts.timeToCoordinate(g.fillTime) : rightEdge;
        if (x2 == null) x2 = rightEdge;
        const yT = r.candle.priceToCoordinate(g.top), yB = r.candle.priceToCoordinate(g.bottom);
        if (yT == null || yB == null) return;
        const col = g.type === 'bullish' ? '46,189,133' : '246,70,93';
        ctx.fillStyle = 'rgba(' + col + ',0.13)';
        ctx.fillRect(x1, Math.min(yT, yB), Math.max(x2 - x1, 2), Math.abs(yB - yT));
        ctx.strokeStyle = 'rgba(' + col + ',0.45)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(x1, yT); ctx.lineTo(x2, yT); ctx.moveTo(x1, yB); ctx.lineTo(x2, yB); ctx.stroke();
        ctx.setLineDash([]);
      });
    }, []);
    const scheduleFvg = useCallback(() => {
      const r = R.current; if (r.raf) return;
      r.raf = requestAnimationFrame(() => { r.raf = 0; drawFvg(); });
    }, [drawFvg]);

    // ---- price lines (fib + s/r) --------------------------------------------
    const renderPriceLines = useCallback(() => {
      const r = R.current; if (!r.candle) return;
      r.priceLines.forEach(pl => { try { r.candle.removePriceLine(pl); } catch (e) {} });
      r.priceLines = [];
      const d = r.data; if (!d) return;
      if (r.tog.sr) d.sr.forEach(l => {
        r.priceLines.push(r.candle.createPriceLine({
          price: l.price, color: l.kind === 'resistance' ? 'rgba(246,70,93,0.55)' : 'rgba(46,189,133,0.55)',
          lineWidth: 1, lineStyle: 2, axisLabelVisible: true,
          title: (l.kind === 'resistance' ? 'R' : 'S')
        }));
      });
      if (r.tog.fibo) d.fib.levels.forEach(f => {
        r.priceLines.push(r.candle.createPriceLine({
          price: f.price, color: 'rgba(255,122,24,0.5)', lineWidth: 1, lineStyle: 1,
          axisLabelVisible: true, title: 'fib ' + f.ratio
        }));
      });
    }, []);

    // ---- oscillator subpanel -------------------------------------------------
    const buildOsc = useCallback((which) => {
      console.log('[buildOsc]', which, 'subChart?', !!R.current.subChart, 'data?', !!R.current.data);
      const r = R.current; if (!r.subChart) return;
      r.subSeries.forEach(s => { try { r.subChart.removeSeries(s); } catch (e) {} });
      r.subSeries = [];
      const d = r.data; if (!d) return;
      const bars = d.bars;
      const add = (type, opts) => { const s = type === 'hist' ? r.subChart.addHistogramSeries(opts) : r.subChart.addLineSeries(opts); r.subSeries.push(s); return s; };
      const anchor = (lo, hi) => { const a = add('line', { color: 'rgba(0,0,0,0)', lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false }); a.setData([{ time: bars[0].time, value: lo }, { time: bars[bars.length - 1].time, value: hi }]); };
      const pl = (s, price, color) => s.createPriceLine({ price: price, color: color, lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: String(price) });

      if (which === 'macd') {
        const hist = add('hist', { priceLineVisible: false, lastValueVisible: false });
        hist.setData(bars.map((b, i) => d.macd.hist[i] == null ? null : { time: b.time, value: d.macd.hist[i], color: d.macd.hist[i] >= 0 ? 'rgba(46,189,133,0.5)' : 'rgba(246,70,93,0.5)' }).filter(Boolean));
        const ml = add('line', { color: '#4da6ff', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false });
        ml.setData(lineData(bars, d.macd.macd));
        const sl = add('line', { color: ACCENT, lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false });
        sl.setData(lineData(bars, d.macd.signal));
      } else if (which === 'rsi') {
        anchor(0, 100);
        const l = add('line', { color: '#c678dd', lineWidth: 1.6, priceLineVisible: false, lastValueVisible: false });
        l.setData(lineData(bars, d.rsi));
        pl(l, 70, 'rgba(246,70,93,0.4)'); pl(l, 30, 'rgba(46,189,133,0.4)');
        l.createPriceLine({ price: 50, color: 'rgba(255,255,255,0.12)', lineWidth: 1, lineStyle: 1, axisLabelVisible: false });
      } else if (which === 'stoch') {
        anchor(0, 100);
        const k = add('line', { color: '#4da6ff', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false });
        k.setData(lineData(bars, d.stochRsi.k));
        const dd = add('line', { color: '#ff9e64', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false });
        dd.setData(lineData(bars, d.stochRsi.d));
        pl(k, 80, 'rgba(246,70,93,0.4)'); pl(k, 20, 'rgba(46,189,133,0.4)');
      }
    }, []);

    // ---- data effect ---------------------------------------------------------
    useEffect(() => {
      const r = R.current; if (!r.chart) return;
      r.data = data; r.tog = tog;
      r.candle.setData(data.bars);
      r.vol.setData(data.bars.map(b => ({ time: b.time, value: b.volume, color: b.close >= b.open ? 'rgba(46,189,133,0.22)' : 'rgba(246,70,93,0.22)' })));
      EMA_DEFS.forEach(e => { r.emas[e.key].setData(lineData(data.bars, data[e.key])); r.emas[e.key].applyOptions({ visible: !!tog[e.key] }); });
      renderPriceLines();
      buildOsc(tab);
      r.chart.timeScale().fitContent();
      requestAnimationFrame(scheduleFvg);
    }, [data]); // eslint-disable-line

    // ---- toggle effect -------------------------------------------------------
    useEffect(() => {
      const r = R.current; if (!r.chart) return;
      r.tog = tog;
      EMA_DEFS.forEach(e => r.emas[e.key].applyOptions({ visible: !!tog[e.key] }));
      renderPriceLines();
      scheduleFvg();
    }, [tog]); // eslint-disable-line

    // ---- tab effect ----------------------------------------------------------
    useEffect(() => { console.log('[tabEffect] tab=', tab, 'chart?', !!R.current.chart); if (R.current.chart) buildOsc(tab); }, [tab]); // eslint-disable-line

    const toggle = (k) => setTog(t => Object.assign({}, t, { [k]: !t[k] }));
    const resetZoom = () => { if (R.current.chart) { R.current.chart.timeScale().fitContent(); } };

    const row = useMemo(() => window.SV.overviewRow(symbol), [symbol]);
    const shown = hover || { open: data.bars[data.bars.length - 1].open, high: data.bars[data.bars.length - 1].high, low: data.bars[data.bars.length - 1].low, close: data.bars[data.bars.length - 1].close, time: data.bars[data.bars.length - 1].time };
    const chg = shown.close - shown.open;
    const chgPct = (chg / shown.open) * 100;

    const lastMacd = lastVal(data.macd.macd), lastSig = lastVal(data.macd.signal), lastHist = lastVal(data.macd.hist);
    const lastRsi = lastVal(data.rsi);
    const lastK = lastVal(data.stochRsi.k), lastD = lastVal(data.stochRsi.d);

    return React.createElement('div', { className: 'chartpage' },
      // header
      React.createElement('div', { className: 'chart-head' },
        React.createElement('div', { className: 'ch-id' },
          React.createElement('div', { className: 'ch-tick' },
            React.createElement('span', { className: 'ch-sym' }, row.symbol),
            React.createElement('button', {
              className: 'star-btn' + (inWatch ? ' on' : ''), title: inWatch ? 'In watchlist' : 'Add to watchlist',
              onClick: () => props.toggleWatch(symbol)
            }, React.createElement(Icon, { name: 'star', size: 16 }))),
          React.createElement('div', { className: 'ch-name' }, row.name, React.createElement('span', { className: 'ch-sector' }, row.sector))),
        React.createElement('div', { className: 'ch-price' },
          React.createElement('span', { className: 'ch-last' }, '$' + fmtPrice(row.price)),
          React.createElement(Delta, { value: row.diff, pct: row.pct, pill: true })),
        React.createElement('div', { className: 'ch-periods' },
          PERIODS.map(p => React.createElement('button', {
            key: p.key, className: 'seg' + (period === p.key ? ' active' : ''), onClick: () => setPeriod(p.key)
          }, p.label)),
          React.createElement('button', { className: 'icon-btn', title: 'Reset zoom', onClick: resetZoom }, React.createElement(Icon, { name: 'search', size: 15 })))
      ),
      // body: chart + rail
      React.createElement('div', { className: 'chart-body' },
        React.createElement('div', { className: 'chart-col' },
          React.createElement('div', { className: 'chart-main-wrap' },
            React.createElement('div', { ref: mainRef, className: 'chart-main' }),
            React.createElement('canvas', { ref: fvgRef, className: 'fvg-overlay' }),
            React.createElement('div', { className: 'ohlc-legend' },
              React.createElement('span', { className: 'oh-sym' }, row.symbol),
              React.createElement('span', { className: 'oh-per' }, '· ' + period.toUpperCase() + ' · 1D'),
              ohlcItem('O', shown.open), ohlcItem('H', shown.high), ohlcItem('L', shown.low), ohlcItem('C', shown.close),
              React.createElement('span', { className: 'oh-chg ' + (chg >= 0 ? 'up' : 'down') }, fmtSigned(chg) + ' (' + fmtPct(chgPct) + ')')),
            React.createElement('div', { className: 'ema-legend' },
              EMA_DEFS.filter(e => tog[e.key]).map(e => React.createElement('span', { key: e.key, className: 'ema-chip' },
                React.createElement('span', { className: 'dot', style: { background: e.color } }), e.label,
                React.createElement('b', null, fmtPrice(lastVal(data[e.key])))))) ),
          React.createElement('div', { className: 'osc-wrap', style: { height: oscEnabled ? 188 : 0, opacity: oscEnabled ? 1 : 0 } },
            React.createElement('div', { className: 'osc-bar' },
              React.createElement('div', { className: 'osc-tabs' },
                availTabs.map(o => React.createElement('button', { key: o.key, className: 'osc-tab' + (tab === o.key ? ' active' : ''), onClick: () => setTab(o.key) }, o.label))),
              React.createElement('div', { className: 'osc-vals' },
                tab === 'macd' && [oscVal('MACD', lastMacd, '#4da6ff'), oscVal('signal', lastSig, ACCENT), oscVal('hist', lastHist, lastHist >= 0 ? UP : DOWN)],
                tab === 'rsi' && [oscVal('RSI 14', lastRsi, '#c678dd')],
                tab === 'stoch' && [oscVal('%K', lastK, '#4da6ff'), oscVal('%D', lastD, '#ff9e64')])),
            React.createElement('div', { ref: subRef, className: 'osc-chart' }))),
        // indicator rail
        React.createElement(Rail, { tog: tog, toggle: toggle })
      )
    );
  }

  function Rail(props) {
    const tog = props.tog, toggle = props.toggle;
    return React.createElement('div', { className: 'ind-rail' },
      React.createElement('div', { className: 'rail-grp' },
        React.createElement('div', { className: 'rail-h' }, 'Overlays'),
        EMA_DEFS.map(e => Tog(e.key, e.label, tog, toggle, e.color)),
        Tog('fibo', 'Fibonacci', tog, toggle, ACCENT),
        Tog('sr', 'Support / Resistance', tog, toggle, '#9aa0ac'),
        Tog('fvg', 'Fair Value Gap', tog, toggle, '#2ebd85')),
      React.createElement('div', { className: 'rail-grp' },
        React.createElement('div', { className: 'rail-h' }, 'Oscillators'),
        Tog('macd', 'MACD', tog, toggle, '#4da6ff'),
        Tog('rsi', 'RSI', tog, toggle, '#c678dd'),
        Tog('stoch', 'Stoch RSI', tog, toggle, '#ff9e64')),
      React.createElement('div', { className: 'rail-note' }, 'Scroll to zoom · pan locked'));
  }

  function Tog(key, label, tog, toggle, color) {
    const on = !!tog[key];
    return React.createElement('button', { key: key, className: 'tog' + (on ? ' on' : ''), onClick: () => toggle(key) },
      React.createElement('span', { className: 'tog-dot', style: { background: on ? color : 'transparent', borderColor: color } }),
      React.createElement('span', { className: 'tog-lbl' }, label),
      React.createElement('span', { className: 'tog-sw', 'data-on': on }));
  }

  function ohlcItem(k, v) {
    return React.createElement('span', { key: k, className: 'oh-i' }, React.createElement('em', null, k), fmtPrice(v));
  }
  function oscVal(label, v, color) {
    return React.createElement('span', { key: label, className: 'osc-v' }, label, React.createElement('b', { style: { color: color } }, v == null ? '—' : v.toFixed(2)));
  }
  function lastVal(arr) { for (let i = arr.length - 1; i >= 0; i--) if (arr[i] != null) return arr[i]; return null; }

  window.ChartPage = ChartPage;
})();
