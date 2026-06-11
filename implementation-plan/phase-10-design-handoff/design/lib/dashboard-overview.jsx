/* Dashboard landing + Overview table. Exposes window.Dashboard, window.OverviewPage */
(function () {
  'use strict';
  const { Icon, Delta, Sparkline, fmtPrice, fmtPct, fmtSigned, fmtCompact } = window.SVUI;
  const { useState, useMemo } = React;

  function rowsFor(symbols) { return symbols.map(s => window.SV.overviewRow(s)); }

  // ============================ DASHBOARD ====================================
  function Dashboard(props) {
    const nav = props.navigate;
    const watch = props.watchlist;
    const indices = useMemo(() => rowsFor(['SPY', 'QQQ', 'NVDA', 'AAPL']), []);
    const universe = useMemo(() => rowsFor(window.SV.SYMBOLS), []);
    const gainers = useMemo(() => universe.slice().sort((a, b) => b.pct - a.pct).slice(0, 5), [universe]);
    const losers = useMemo(() => universe.slice().sort((a, b) => a.pct - b.pct).slice(0, 5), [universe]);
    const wlRows = useMemo(() => rowsFor(watch), [watch]);
    const hour = 13;
    const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return React.createElement('div', { className: 'page dash' },
      React.createElement('div', { className: 'dash-hero' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'h1' }, greet),
          React.createElement('p', { className: 'sub' }, 'Markets snapshot · ', React.createElement('span', { className: 'mono' }, 'Tue, Jun 3 2026'), ' · simulated data')),
        React.createElement('div', { className: 'mkt-status' }, React.createElement('span', { className: 'live-dot' }), 'Markets open')),

      React.createElement('div', { className: 'idx-row' },
        indices.map(r => React.createElement('button', { key: r.symbol, className: 'idx-card', onClick: () => nav('#/stock/' + r.symbol) },
          React.createElement('div', { className: 'idx-top' },
            React.createElement('span', { className: 'idx-sym' }, r.symbol),
            React.createElement(Delta, { pct: r.pct })),
          React.createElement('div', { className: 'idx-px' }, '$' + fmtPrice(r.price)),
          React.createElement('div', { className: 'idx-spark' }, React.createElement(Sparkline, { values: r.spark, width: 150, height: 40 }))))),

      React.createElement('div', { className: 'dash-grid' },
        React.createElement('section', { className: 'panel' },
          React.createElement('div', { className: 'panel-h' },
            React.createElement('h2', null, 'Your watchlist'),
            React.createElement('button', { className: 'link-btn', onClick: () => nav('#/overview') }, 'Open overview ', React.createElement(Icon, { name: 'chevron', size: 14 }))),
          wlRows.length === 0
            ? React.createElement('div', { className: 'empty' }, 'No symbols yet. Add some from the Overview page.')
            : React.createElement('div', { className: 'wl-grid' },
              wlRows.map(r => React.createElement('button', { key: r.symbol, className: 'wl-card', onClick: () => nav('#/stock/' + r.symbol) },
                React.createElement('div', { className: 'wl-l' },
                  React.createElement('div', { className: 'wl-sym' }, r.symbol),
                  React.createElement('div', { className: 'wl-name' }, r.name)),
                React.createElement('div', { className: 'wl-spark' }, React.createElement(Sparkline, { values: r.spark, width: 84, height: 30 })),
                React.createElement('div', { className: 'wl-r' },
                  React.createElement('div', { className: 'wl-px' }, '$' + fmtPrice(r.price)),
                  React.createElement(Delta, { pct: r.pct })))))),

        React.createElement('section', { className: 'panel' },
          React.createElement('div', { className: 'panel-h' }, React.createElement('h2', null, 'Movers today')),
          React.createElement('div', { className: 'movers' },
            React.createElement('div', { className: 'mv-col' },
              React.createElement('div', { className: 'mv-h up' }, 'Gainers'),
              gainers.map(r => moverRow(r, nav))),
            React.createElement('div', { className: 'mv-col' },
              React.createElement('div', { className: 'mv-h down' }, 'Losers'),
              losers.map(r => moverRow(r, nav)))))));
  }

  function moverRow(r, nav) {
    return React.createElement('button', { key: r.symbol, className: 'mv-row', onClick: () => nav('#/stock/' + r.symbol) },
      React.createElement('span', { className: 'mv-sym' }, r.symbol),
      React.createElement('span', { className: 'mv-spark' }, React.createElement(Sparkline, { values: r.spark, width: 46, height: 18, fill: false })),
      React.createElement('span', { className: 'mv-px' }, fmtPrice(r.price)),
      React.createElement(Delta, { pct: r.pct, showArrow: false }));
  }

  // ============================ OVERVIEW =====================================
  function OverviewPage(props) {
    const nav = props.navigate;
    const watch = props.watchlist;
    const [input, setInput] = useState('');
    const [err, setErr] = useState('');
    const [sort, setSort] = useState({ key: 'symbol', dir: 1 });

    const rows = useMemo(() => {
      const r = rowsFor(watch);
      const k = sort.key, dir = sort.dir;
      r.sort((a, b) => {
        let av = a[k], bv = b[k];
        if (typeof av === 'string') return av.localeCompare(bv) * dir;
        return (av - bv) * dir;
      });
      return r;
    }, [watch, sort]);

    const submit = (e) => {
      e.preventDefault();
      const s = input.trim().toUpperCase();
      if (!s) return;
      if (!/^[A-Z.]{1,6}$/.test(s)) { setErr('Enter a valid ticker'); return; }
      if (watch.includes(s)) { setErr(s + ' is already in your watchlist'); return; }
      props.addSymbol(s); setInput(''); setErr('');
    };
    const head = (key, label, align) => React.createElement('th', {
      className: 'th ' + (align || '') + (sort.key === key ? ' sorted' : ''),
      onClick: () => setSort(p => ({ key: key, dir: p.key === key ? -p.dir : 1 }))
    }, label, React.createElement('span', { className: 'caret', 'data-dir': sort.key === key ? sort.dir : 0 }));

    return React.createElement('div', { className: 'page overview' },
      React.createElement('div', { className: 'ov-head' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'h1' }, 'Overview'),
          React.createElement('p', { className: 'sub' }, watch.length + ' symbols · saved to this browser')),
        React.createElement('form', { className: 'add-form', onSubmit: submit },
          React.createElement('div', { className: 'add-wrap' },
            React.createElement(Icon, { name: 'plus', size: 16 }),
            React.createElement('input', {
              className: 'add-input', placeholder: 'Add symbol (e.g. GOOGL)', value: input,
              onChange: e => { setInput(e.target.value.toUpperCase()); setErr(''); }, maxLength: 6
            })),
          React.createElement('button', { className: 'btn-accent', type: 'submit' }, 'Add'))),
      err ? React.createElement('div', { className: 'form-err' }, err) : null,

      React.createElement('div', { className: 'sugg' },
        React.createElement('span', { className: 'sugg-l' }, 'Quick add'),
        window.SV.SYMBOLS.filter(s => !watch.includes(s)).slice(0, 7).map(s =>
          React.createElement('button', { key: s, className: 'chip', onClick: () => props.addSymbol(s) }, '+ ' + s)),
        window.SV.SYMBOLS.filter(s => !watch.includes(s)).length === 0 ? React.createElement('span', { className: 'sugg-l' }, 'all added') : null),

      React.createElement('div', { className: 'tbl-wrap' },
        React.createElement('table', { className: 'tbl' },
          React.createElement('thead', null, React.createElement('tr', null,
            head('symbol', 'Symbol', 'l'),
            React.createElement('th', { className: 'th l hide-sm' }, 'Name'),
            head('price', 'Last', 'r'),
            head('diff', 'Chg', 'r'),
            head('pct', 'Chg %', 'r'),
            React.createElement('th', { className: 'th r hide-sm' }, '30D'),
            head('volume', 'Volume', 'r hide-sm'),
            React.createElement('th', { className: 'th' }, ''))),
          React.createElement('tbody', null,
            rows.length === 0
              ? React.createElement('tr', null, React.createElement('td', { colSpan: 8, className: 'empty' }, 'Watchlist empty — add a symbol above.'))
              : rows.map(r => React.createElement('tr', { key: r.symbol, className: 'trow', onClick: () => nav('#/stock/' + r.symbol) },
                React.createElement('td', { className: 'l' }, React.createElement('span', { className: 'td-sym' }, r.symbol)),
                React.createElement('td', { className: 'l hide-sm td-name' }, r.name),
                React.createElement('td', { className: 'r mono' }, fmtPrice(r.price)),
                React.createElement('td', { className: 'r mono ' + (r.diff >= 0 ? 'up' : 'down') }, fmtSigned(r.diff)),
                React.createElement('td', { className: 'r' }, React.createElement(Delta, { pct: r.pct, pill: true })),
                React.createElement('td', { className: 'r hide-sm' }, React.createElement(Sparkline, { values: r.spark, width: 80, height: 24, fill: false })),
                React.createElement('td', { className: 'r mono dim hide-sm' }, fmtCompact(r.volume)),
                React.createElement('td', { className: 'r' }, React.createElement('button', {
                  className: 'rm-btn', title: 'Remove', onClick: (e) => { e.stopPropagation(); props.removeSymbol(r.symbol); }
                }, React.createElement(Icon, { name: 'x', size: 15 }))))))))
    );
  }

  window.Dashboard = Dashboard;
  window.OverviewPage = OverviewPage;
})();
