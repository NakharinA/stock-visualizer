/* App shell: routing, sidebar, topbar search, watchlist state. Mounts the app. */
(function () {
  'use strict';
  const { Icon, Sparkline, Delta, fmtPrice, fmtPct } = window.SVUI;
  const { useState, useEffect, useMemo, useRef } = React;

  const WL_KEY = 'sv.watchlist';
  function loadWatch() {
    try { const s = JSON.parse(localStorage.getItem(WL_KEY)); if (Array.isArray(s)) return s; } catch (e) {}
    return window.SV.DEFAULT_WATCHLIST.slice();
  }

  function parseRoute() {
    const h = (location.hash || '#/').replace(/^#/, '');
    const parts = h.split('/').filter(Boolean);
    if (parts[0] === 'stock') return { name: 'stock', symbol: (parts[1] || '').toUpperCase() };
    if (parts[0] === 'overview') return { name: 'overview' };
    return { name: 'dashboard' };
  }

  // ---------------------------- Search --------------------------------------
  function Search(props) {
    const [q, setQ] = useState('');
    const [open, setOpen] = useState(false);
    const [hi, setHi] = useState(0);
    const ref = useRef(null);

    const matches = useMemo(() => {
      const t = q.trim().toUpperCase();
      const list = window.SV.SYMBOLS.map(s => window.SV.meta(s));
      if (!t) return list.slice(0, 6);
      return list.filter(m => m.symbol.indexOf(t) === 0 || m.symbol.indexOf(t) >= 0 || m.name.toUpperCase().indexOf(t) >= 0).slice(0, 7);
    }, [q]);

    useEffect(() => {
      const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    const go = (sym) => { setOpen(false); setQ(''); props.navigate('#/stock/' + sym); };
    const onKey = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, matches.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(h - 1, 0)); }
      else if (e.key === 'Enter') {
        const t = q.trim().toUpperCase();
        if (matches[hi]) go(matches[hi].symbol);
        else if (/^[A-Z.]{1,6}$/.test(t)) go(t);
      } else if (e.key === 'Escape') setOpen(false);
    };

    return React.createElement('div', { className: 'search', ref: ref },
      React.createElement('div', { className: 'search-box' + (open ? ' open' : '') },
        React.createElement(Icon, { name: 'search', size: 16 }),
        React.createElement('input', {
          className: 'search-input', placeholder: 'Search symbol or company…', value: q,
          onChange: e => { setQ(e.target.value); setOpen(true); setHi(0); }, onFocus: () => setOpen(true), onKeyDown: onKey
        }),
        React.createElement('kbd', { className: 'kbd' }, '↵')),
      open && matches.length ? React.createElement('div', { className: 'search-drop' },
        matches.map((m, i) => React.createElement('button', {
          key: m.symbol, className: 'sr-item' + (i === hi ? ' hi' : ''),
          onMouseEnter: () => setHi(i), onClick: () => go(m.symbol)
        },
          React.createElement('span', { className: 'sr-sym' }, m.symbol),
          React.createElement('span', { className: 'sr-name' }, m.name),
          React.createElement('span', { className: 'sr-sec' }, m.sector)))) : null);
  }

  // ---------------------------- App -----------------------------------------
  function App() {
    const [route, setRoute] = useState(parseRoute());
    const [watch, setWatch] = useState(loadWatch());

    useEffect(() => {
      const onHash = () => setRoute(parseRoute());
      window.addEventListener('hashchange', onHash);
      return () => window.removeEventListener('hashchange', onHash);
    }, []);
    useEffect(() => { localStorage.setItem(WL_KEY, JSON.stringify(watch)); }, [watch]);

    const navigate = (hash) => { if (location.hash === hash) setRoute(parseRoute()); else location.hash = hash; };

    // normalize /stock with no symbol → last viewed / default
    useEffect(() => {
      if (route.name === 'stock') {
        if (!route.symbol) { navigate('#/stock/' + (localStorage.getItem('sv.last') || 'AAPL')); }
        else localStorage.setItem('sv.last', route.symbol);
      }
    }, [route]); // eslint-disable-line

    const addSymbol = (s) => setWatch(w => w.includes(s) ? w : w.concat(s));
    const removeSymbol = (s) => setWatch(w => w.filter(x => x !== s));
    const isWatched = (s) => watch.includes(s.toUpperCase());
    const toggleWatch = (s) => setWatch(w => w.includes(s.toUpperCase()) ? w.filter(x => x !== s.toUpperCase()) : w.concat(s.toUpperCase()));

    const navItems = [
      { key: 'dashboard', icon: 'dashboard', label: 'Dashboard', hash: '#/' },
      { key: 'stock', icon: 'chart', label: 'Chart', hash: '#/stock/' + (localStorage.getItem('sv.last') || 'AAPL') },
      { key: 'overview', icon: 'table', label: 'Watchlist', hash: '#/overview' }
    ];

    let page;
    if (route.name === 'dashboard') page = React.createElement(window.Dashboard, { navigate, watchlist: watch });
    else if (route.name === 'overview') page = React.createElement(window.OverviewPage, { navigate, watchlist: watch, addSymbol, removeSymbol });
    else if (route.name === 'stock' && route.symbol) page = React.createElement(window.ChartPage, { symbol: route.symbol, navigate, isWatched, toggleWatch });
    else page = React.createElement('div', { className: 'page' });

    const idx = useMemo(() => ['SPY', 'QQQ'].map(s => window.SV.overviewRow(s)), []);

    return React.createElement('div', { className: 'app' },
      React.createElement('aside', { className: 'sidebar' },
        React.createElement('div', { className: 'brand', onClick: () => navigate('#/') },
          React.createElement('div', { className: 'brand-mark' }, React.createElement(Icon, { name: 'bolt', size: 18, weight: 2 })),
          React.createElement('span', { className: 'brand-tx' }, 'Ticker')),
        React.createElement('nav', { className: 'nav' },
          navItems.map(n => React.createElement('button', {
            key: n.key, className: 'nav-i' + (route.name === n.key ? ' active' : ''), onClick: () => navigate(n.hash)
          }, React.createElement(Icon, { name: n.icon, size: 20 }), React.createElement('span', null, n.label)))),
        React.createElement('div', { className: 'side-foot' }, React.createElement('span', { className: 'dot-sim' }), 'sim')),

      React.createElement('div', { className: 'main' },
        React.createElement('header', { className: 'topbar' },
          React.createElement(Search, { navigate }),
          React.createElement('div', { className: 'idx-chips' },
            idx.map(r => React.createElement('button', { key: r.symbol, className: 'idx-chip', onClick: () => navigate('#/stock/' + r.symbol) },
              React.createElement('span', { className: 'ic-sym' }, r.symbol),
              React.createElement('span', { className: 'ic-px mono' }, fmtPrice(r.price)),
              React.createElement('span', { className: 'ic-pct ' + (r.pct >= 0 ? 'up' : 'down') }, fmtPct(r.pct)))))),
        React.createElement('main', { className: 'content' }, page)));
  }

  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
})();
