/* Shared UI helpers + atoms. Exposes window.SVUI */
(function () {
  'use strict';

  function fmtPrice(x, dp) {
    if (x == null || isNaN(x)) return '—';
    return x.toLocaleString('en-US', { minimumFractionDigits: dp == null ? 2 : dp, maximumFractionDigits: dp == null ? 2 : dp });
  }
  function fmtSigned(x) {
    if (x == null || isNaN(x)) return '—';
    return (x >= 0 ? '+' : '') + fmtPrice(x);
  }
  function fmtPct(x) {
    if (x == null || isNaN(x)) return '—';
    return (x >= 0 ? '+' : '') + x.toFixed(2) + '%';
  }
  function fmtCompact(x) {
    if (x == null || isNaN(x)) return '—';
    const a = Math.abs(x);
    if (a >= 1e12) return (x / 1e12).toFixed(2) + 'T';
    if (a >= 1e9) return (x / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return (x / 1e6).toFixed(2) + 'M';
    if (a >= 1e3) return (x / 1e3).toFixed(1) + 'K';
    return String(x);
  }

  // ---- inline line icons -----------------------------------------------------
  const PATHS = {
    dashboard: 'M3 3h7v7H3zM14 3h7v4h-7zM14 11h7v10h-7zM3 14h7v7H3z',
    chart: 'M3 3v18h18 M7 14l3-4 3 3 4-6',
    table: 'M3 5h18M3 12h18M3 19h18',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5',
    plus: 'M12 5v14M5 12h14',
    x: 'M6 6l12 12M18 6L6 18',
    trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
    chevron: 'M9 6l6 6-6 6',
    star: 'M12 3l2.7 5.8 6.3.8-4.6 4.4 1.2 6.2L12 17.8 6.4 20.2l1.2-6.2L3 9.6l6.3-.8z',
    arrowUp: 'M12 19V5M6 11l6-6 6 6',
    bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
    layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5'
  };
  function Icon(props) {
    const d = PATHS[props.name] || '';
    const s = props.size || 18;
    const filled = props.name === 'star';
    return React.createElement('svg', {
      width: s, height: s, viewBox: '0 0 24 24',
      fill: filled ? 'currentColor' : 'none',
      stroke: 'currentColor', strokeWidth: props.weight || 1.7,
      strokeLinecap: 'round', strokeLinejoin: 'round',
      style: { display: 'block', flex: 'none' }
    }, React.createElement('path', { d: d }));
  }

  // ---- sparkline -------------------------------------------------------------
  function Sparkline(props) {
    const vals = props.values || [];
    const w = props.width || 96, h = props.height || 28, pad = 2;
    if (vals.length < 2) return React.createElement('svg', { width: w, height: h });
    let lo = Infinity, hi = -Infinity;
    for (const v of vals) { if (v < lo) lo = v; if (v > hi) hi = v; }
    const rng = hi - lo || 1;
    const stepX = (w - pad * 2) / (vals.length - 1);
    const pts = vals.map((v, i) => {
      const x = pad + i * stepX;
      const y = pad + (h - pad * 2) * (1 - (v - lo) / rng);
      return [x, y];
    });
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const up = vals[vals.length - 1] >= vals[0];
    const color = props.color || (up ? 'var(--up)' : 'var(--down)');
    const id = 'sg' + Math.round(pts[0][1]) + vals.length + Math.round(hi);
    const area = line + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + (h - pad) + ' L' + pts[0][0].toFixed(1) + ' ' + (h - pad) + ' Z';
    return React.createElement('svg', { width: w, height: h, style: { display: 'block', overflow: 'visible' } },
      React.createElement('defs', null,
        React.createElement('linearGradient', { id: id, x1: '0', y1: '0', x2: '0', y2: '1' },
          React.createElement('stop', { offset: '0', stopColor: color, stopOpacity: 0.22 }),
          React.createElement('stop', { offset: '1', stopColor: color, stopOpacity: 0 }))),
      props.fill !== false ? React.createElement('path', { d: area, fill: 'url(#' + id + ')', stroke: 'none' }) : null,
      React.createElement('path', { d: line, fill: 'none', stroke: color, strokeWidth: props.weight || 1.6, strokeLinejoin: 'round', strokeLinecap: 'round' })
    );
  }

  // ---- delta pill ------------------------------------------------------------
  function Delta(props) {
    const v = props.pct;
    const up = v >= 0;
    return React.createElement('span', {
      className: 'delta ' + (up ? 'up' : 'down') + (props.pill ? ' pill' : ''),
    }, props.showArrow !== false ? React.createElement('span', { className: 'delta-tri', 'data-up': up }) : null,
      (props.value != null ? fmtSigned(props.value) + '  ' : '') + fmtPct(v));
  }

  window.SVUI = {
    fmtPrice: fmtPrice, fmtSigned: fmtSigned, fmtPct: fmtPct, fmtCompact: fmtCompact,
    Icon: Icon, Sparkline: Sparkline, Delta: Delta
  };
})();
