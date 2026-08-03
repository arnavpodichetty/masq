// Masq — plain React (no build step). Loaded after React/ReactDOM UMD
// and data.js.
(function () {
  const h = React.createElement;

  function css(str) {
    const o = {};
    if (!str) return o;
    for (const decl of str.split(';')) {
      const i = decl.indexOf(':');
      if (i < 0) continue;
      const prop = decl.slice(0, i).trim();
      if (!prop) continue;
      const val = decl.slice(i + 1).trim();
      o[prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = val;
    }
    return o;
  }


  const THEME_DARK = {
    '--m-page': '#05020a',
    '--m-page-glow': 'rgba(46,91,176,.12)',
    '--m-shell': '#1a070b',
    '--m-screen': '#0e0810',
    '--m-modal': '#16101a',
    '--m-text': '#f0e6c9',
    '--m-text-title': '#ecdfc0',
    '--m-text-bright': '#f3ead0',
    '--m-brand': '#e6cb7e',
    '--m-accent': '#caa64f',
    '--m-label': '#9b8a63',
    '--m-muted': '#8a9ab8',
    '--m-dim': '#5f6c86',
    '--m-dim2': '#5a6a84',
    '--m-body': '#ddd0b0',
    '--m-soft': '#c6b489',
    '--m-soft2': '#7a6a4a',
    '--m-help': '#b9c6df',
    '--m-lift': 'rgba(255,255,255,.05)',
    '--m-lift-soft': 'rgba(255,255,255,.04)',
    '--m-lift-med': 'rgba(255,255,255,.07)',
    '--m-lift-input': 'rgba(255,255,255,.08)',
    '--m-lift-strong': 'rgba(255,255,255,.1)',
    '--m-lift-toggle': 'rgba(255,255,255,.12)',
    '--m-border': 'rgba(200,162,76,.12)',
    '--m-border-med': 'rgba(200,162,76,.15)',
    '--m-border-btn': 'rgba(200,162,76,.2)',
    '--m-border-strong': 'rgba(200,162,76,.25)',
    '--m-border-hard': 'rgba(200,162,76,.3)',
    '--m-border-soft': 'rgba(200,162,76,.08)',
    '--m-border-white': 'rgba(255,255,255,.08)',
    '--m-backdrop': 'rgba(8,4,12,.7)',
    '--m-overlay': 'rgba(8,4,10,.88)',
    '--m-overlay-vote': 'rgba(8,4,10,.85)',
    '--m-avatar-bg': 'rgba(0,0,0,.3)',
    '--m-arrow': '#5a4a2a',
    '--m-results-bg': 'radial-gradient(80% 45% at 50% 26%, rgba(230,203,126,.28), transparent 60%), #14070c',
    '--m-results-sub': '#d8c79f',
    '--m-shell-shadow': '0 30px 90px rgba(0,0,0,.6)',
    '--m-ready-bg': 'rgba(144,200,144,.07)',
    '--m-ready-border': '1px solid rgba(144,200,144,.3)',
    '--m-ready-color': '#7fcf8a',
    '--m-idle-label': '#caa64f',
    '--m-timer': '#f0e6c9',
    '--m-cta': 'linear-gradient(180deg,#b3202f,#7a1620)',
    '--m-cta-text': '#f6ecd2',
    '--m-cta-glow': '0 8px 28px rgba(178,32,47,.4)',
    '--m-tile-sel': 'var(--m-tile-sel)',
    '--m-tile-sel-text': '#f0e6c9',
    '--m-tile-sel-sub': '#c6a96e',
    '--m-toggle-on': '#b3202f',
    '--m-curt1': '#6e141c',
    '--m-curt2': '#56101a',
    '--m-card-bg': 'radial-gradient(120% 80% at 50% 0%, #f6ecd2, #e6d6b0)',
    '--m-encore': 'linear-gradient(180deg,#ecdfc0,#d3bf93)',
    '--m-encore-text': '#3c0a10',
  };
  const THEME_LIGHT = {
    '--m-page': '#e4ddd0',
    '--m-page-glow': 'rgba(46,91,176,.08)',
    '--m-shell': '#f3eee4',
    '--m-screen': '#f7f2e8',
    '--m-modal': '#faf6ef',
    '--m-text': '#2a1f14',
    '--m-text-title': '#1f1610',
    '--m-text-bright': '#1a120c',
    '--m-brand': '#8a6a28',
    '--m-accent': '#9a7528',
    '--m-label': '#8a7340',
    '--m-muted': '#5a6578',
    '--m-dim': '#7a6e5c',
    '--m-dim2': '#6a6258',
    '--m-body': '#3d3228',
    '--m-soft': '#6b5a40',
    '--m-soft2': '#8a7348',
    '--m-help': '#4a5568',
    '--m-lift': 'rgba(60,40,20,.05)',
    '--m-lift-soft': 'rgba(60,40,20,.04)',
    '--m-lift-med': 'rgba(60,40,20,.07)',
    '--m-lift-input': 'rgba(60,40,20,.06)',
    '--m-lift-strong': 'rgba(60,40,20,.08)',
    '--m-lift-toggle': 'rgba(60,40,20,.15)',
    '--m-border': 'rgba(140,110,40,.18)',
    '--m-border-med': 'rgba(140,110,40,.22)',
    '--m-border-btn': 'rgba(140,110,40,.28)',
    '--m-border-strong': 'rgba(140,110,40,.32)',
    '--m-border-hard': 'rgba(140,110,40,.38)',
    '--m-border-soft': 'rgba(140,110,40,.12)',
    '--m-border-white': 'rgba(60,40,20,.1)',
    '--m-backdrop': 'rgba(40,30,20,.4)',
    '--m-overlay': 'rgba(40,30,20,.72)',
    '--m-overlay-vote': 'rgba(40,30,20,.7)',
    '--m-avatar-bg': 'rgba(60,40,20,.08)',
    '--m-arrow': '#9a8560',
    '--m-results-bg': 'radial-gradient(80% 45% at 50% 26%, rgba(200,162,76,.22), transparent 60%), #efe6d6',
    '--m-results-sub': '#6b5a40',
    '--m-shell-shadow': '0 30px 90px rgba(60,40,20,.22)',
    '--m-ready-bg': 'rgba(60,140,80,.1)',
    '--m-ready-border': '1px solid rgba(60,140,80,.35)',
    '--m-ready-color': '#2e7a40',
    '--m-idle-label': '#9a7528',
    '--m-timer': '#2a1f14',
    '--m-cta': 'linear-gradient(180deg,#b3202f,#7a1620)',
    '--m-cta-text': '#f6ecd2',
    '--m-cta-glow': '0 8px 28px rgba(178,32,47,.4)',
    '--m-tile-sel': 'var(--m-tile-sel)',
    '--m-tile-sel-text': '#f0e6c9',
    '--m-tile-sel-sub': '#c6a96e',
    '--m-toggle-on': '#b3202f',
    '--m-curt1': '#6e141c',
    '--m-curt2': '#56101a',
    '--m-card-bg': 'radial-gradient(120% 80% at 50% 0%, #f6ecd2, #e6d6b0)',
    '--m-encore': 'linear-gradient(180deg,#ecdfc0,#d3bf93)',
    '--m-encore-text': '#3c0a10',
  };
  // Jester Mode — a chaotic neon-carnival take on the whole stage.
  const THEME_JESTER = {
    ...THEME_DARK,
    '--m-page': '#07010f',
    '--m-page-glow': 'rgba(123,47,247,.25)',
    '--m-shell': '#150627',
    '--m-screen': '#100420',
    '--m-modal': '#1a0930',
    '--m-text': '#f3e8ff',
    '--m-text-title': '#f2e6ff',
    '--m-text-bright': '#fdf8ff',
    '--m-brand': '#ffd23f',
    '--m-accent': '#ff3d8b',
    '--m-label': '#b18cff',
    '--m-muted': '#a78bfa',
    '--m-dim': '#7d6aa8',
    '--m-dim2': '#8a76b5',
    '--m-body': '#e6d9ff',
    '--m-soft': '#c9a8ff',
    '--m-soft2': '#8d6fc0',
    '--m-help': '#d6c6f5',
    '--m-border': 'rgba(255,61,139,.18)',
    '--m-border-med': 'rgba(255,61,139,.24)',
    '--m-border-btn': 'rgba(255,210,63,.3)',
    '--m-border-strong': 'rgba(255,210,63,.35)',
    '--m-border-hard': 'rgba(255,61,139,.42)',
    '--m-border-soft': 'rgba(255,61,139,.12)',
    '--m-border-white': 'rgba(255,255,255,.1)',
    '--m-backdrop': 'rgba(10,2,20,.72)',
    '--m-overlay': 'rgba(10,2,20,.9)',
    '--m-overlay-vote': 'rgba(10,2,20,.86)',
    '--m-arrow': '#8b5cf6',
    '--m-results-bg': 'radial-gradient(80% 45% at 50% 26%, rgba(255,61,139,.32), transparent 60%), radial-gradient(70% 45% at 50% 85%, rgba(76,222,128,.14), transparent 60%), #12041f',
    '--m-results-sub': '#d9c6f0',
    '--m-shell-shadow': '0 0 0 1px rgba(255,210,63,.22), 0 0 44px rgba(255,61,139,.32), 0 0 100px rgba(123,47,247,.4), 0 30px 90px rgba(0,0,0,.7)',
    '--m-ready-bg': 'rgba(76,222,128,.1)',
    '--m-ready-border': '1px solid rgba(76,222,128,.45)',
    '--m-ready-color': '#4ade80',
    '--m-idle-label': '#ffd23f',
    '--m-timer': '#ffd23f',
    '--m-cta': 'linear-gradient(135deg,#ff3d8b 0%,#8b5cf6 55%,#7b2ff7 100%)',
    '--m-cta-text': '#fff',
    '--m-cta-glow': '0 8px 28px rgba(139,92,246,.55)',
    '--m-tile-sel': 'linear-gradient(135deg,#7b2ff7,#3b1470)',
    '--m-tile-sel-text': '#ffffff',
    '--m-tile-sel-sub': '#e8d5ff',
    '--m-toggle-on': '#ff3d8b',
    '--m-curt1': '#5b21b6',
    '--m-curt2': '#166534',
    '--m-card-bg': 'radial-gradient(120% 80% at 50% 0%, #fff7fd, #ecd9ff)',
    '--m-encore': 'linear-gradient(135deg,#ffd23f,#ff3d8b)',
    '--m-encore-text': '#2a0440',
  };
  function applyTheme(darkMode, jesterMode) {
    const theme = jesterMode ? THEME_JESTER : (darkMode ? THEME_DARK : THEME_LIGHT);
    const root = document.documentElement;
    Object.keys(theme).forEach((k) => root.style.setProperty(k, theme[k]));
    document.body.classList.toggle('jester', !!jesterMode);
    document.body.style.background = theme['--m-page'];
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme['--m-page']);
    const scheme = document.querySelector('meta[name="color-scheme"]');
    if (scheme) scheme.setAttribute('content', (darkMode || jesterMode) ? 'dark' : 'light');
  }
  applyTheme(true, false);

  // ---- static icon markup (no dynamic bindings, safe as raw SVG) ----
  const ICON_ROLE_20 = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><ellipse cx="9" cy="13" rx="6" ry="7" stroke="var(--m-brand)" stroke-width="1.7"></ellipse><path d="M7 11 Q9 9 11 11" stroke="var(--m-brand)" stroke-width="1.4" stroke-linecap="round"></path><path d="M7 15.5 Q9 18 11 15.5" stroke="var(--m-brand)" stroke-width="1.4" stroke-linecap="round"></path><ellipse cx="17" cy="11" rx="5" ry="6" stroke="var(--m-accent)" stroke-width="1.4" opacity=".6"></ellipse><path d="M15 9 Q17 7.5 19 9" stroke="var(--m-accent)" stroke-width="1.2" stroke-linecap="round" opacity=".6"></path></svg>';
  const ICON_ROLE_18 = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><ellipse cx="9" cy="13" rx="6" ry="7" stroke="var(--m-brand)" stroke-width="1.7"></ellipse><path d="M7 11 Q9 9 11 11" stroke="var(--m-brand)" stroke-width="1.4" stroke-linecap="round"></path><path d="M7 15.5 Q9 18 11 15.5" stroke="var(--m-brand)" stroke-width="1.4" stroke-linecap="round"></path><ellipse cx="17" cy="11" rx="5" ry="6" stroke="var(--m-accent)" stroke-width="1.4" opacity=".6"></ellipse><path d="M15 9 Q17 7.5 19 9" stroke="var(--m-accent)" stroke-width="1.2" stroke-linecap="round" opacity=".6"></path></svg>';
  const ICON_WORD = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><rect x="4" y="3" width="16" height="18" rx="3" stroke="var(--m-brand)" stroke-width="1.7"></rect><path d="M8 8 L16 8 M8 12 L16 12 M8 16 L12 16" stroke="var(--m-brand)" stroke-width="1.4" stroke-linecap="round"></path><path d="M14 15 L18 19 M16 15 L18 17" stroke="var(--m-accent)" stroke-width="1.3" stroke-linecap="round" opacity=".7"></path></svg>';
  const ICON_PLAYERS = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><circle cx="8" cy="8" r="4" stroke="var(--m-accent)" stroke-width="1.8"></circle><circle cx="16" cy="8" r="4" stroke="var(--m-accent)" stroke-width="1.8"></circle><path d="M2 20 C2 16 5 14 8 14 C10 14 12 14.8 13 16" stroke="var(--m-accent)" stroke-width="1.8" stroke-linecap="round"></path><path d="M22 20 C22 16 19 14 16 14 C14 14 12 14.8 11 16" stroke="var(--m-accent)" stroke-width="1.8" stroke-linecap="round"></path></svg>';
  const ICON_CATEGORIES_20 = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M4 5 L4 19 Q4 20 5 20 L19 20 Q20 20 20 19 L20 5 Q20 4 19 4 L5 4 Q4 4 4 5 Z" stroke="var(--m-accent)" stroke-width="1.8"></path><path d="M8 8 L16 8 M8 12 L16 12 M8 16 L13 16" stroke="var(--m-accent)" stroke-width="1.8" stroke-linecap="round"></path></svg>';
  const ICON_CATEGORIES_18 = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M4 5 L4 19 Q4 20 5 20 L19 20 Q20 20 20 19 L20 5 Q20 4 19 4 L5 4 Q4 4 4 5 Z" stroke="var(--m-accent)" stroke-width="1.8"></path><path d="M8 8 L16 8 M8 12 L16 12 M8 16 L13 16" stroke="var(--m-accent)" stroke-width="1.8" stroke-linecap="round"></path></svg>';
  const ICON_JESTERS_20 = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><ellipse cx="12" cy="13" rx="8" ry="9" stroke="#e6a0a8" stroke-width="1.8"></ellipse><path d="M9 10 Q10.5 8.5 12 10" stroke="#e6a0a8" stroke-width="1.5" stroke-linecap="round"></path><path d="M12 10 Q13.5 8.5 15 10" stroke="#e6a0a8" stroke-width="1.5" stroke-linecap="round"></path><path d="M9 16 Q12 20 15 16" stroke="#e6a0a8" stroke-width="1.5" stroke-linecap="round"></path><path d="M13 4 L11.5 9 L13.5 12 L11 16" stroke="#e6a0a8" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"></path></svg>';
  const ICON_JESTERS_18 = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><ellipse cx="12" cy="13" rx="8" ry="9" stroke="#e6a0a8" stroke-width="1.8"></ellipse><path d="M9 10 Q10.5 8.5 12 10" stroke="#e6a0a8" stroke-width="1.5" stroke-linecap="round"></path><path d="M12 10 Q13.5 8.5 15 10" stroke="#e6a0a8" stroke-width="1.5" stroke-linecap="round"></path><path d="M9 16 Q12 20 15 16" stroke="#e6a0a8" stroke-width="1.5" stroke-linecap="round"></path><path d="M13 4 L11.5 9 L13.5 12 L11 16" stroke="#e6a0a8" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"></path></svg>';
  const ICON_TIME = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M7 4 L17 4 L17 8 Q17 11 12 12 Q7 13 7 16 L7 20 L17 20 L17 16 Q17 13 12 12 Q7 11 7 8 Z" stroke="#9fb0cf" stroke-width="1.8" stroke-linejoin="round"></path><path d="M9 18 Q12 16 15 18" stroke="#9fb0cf" stroke-width="1.5" stroke-linecap="round"></path><path d="M9 6 Q12 7.5 15 6" stroke="#9fb0cf" stroke-width="1.5" stroke-linecap="round"></path></svg>';
  const ICON_OPTIONS = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="3" stroke="var(--m-accent)" stroke-width="1.8"></circle><path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12 M4.93 4.93 L7.05 7.05 M16.95 16.95 L19.07 19.07 M19.07 4.93 L16.95 7.05 M7.05 16.95 L4.93 19.07" stroke="var(--m-accent)" stroke-width="1.8" stroke-linecap="round"></path></svg>';
  const ICON_SHOW_WORD = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M3 12 C5.5 7.5 9 5 12 5 C15 5 18.5 7.5 21 12 C18.5 16.5 15 19 12 19 C9 19 5.5 16.5 3 12 Z" stroke="#9fb0cf" stroke-width="1.8"></path><circle cx="12" cy="12" r="2.5" stroke="#9fb0cf" stroke-width="1.4"></circle><path d="M5 19 L19 5" stroke="#9fb0cf" stroke-width="1.8" stroke-linecap="round"></path></svg>';
  const ICON_STEP1 = '<svg viewBox="0 0 32 32" width="28" height="28"><circle cx="16" cy="10" r="5" fill="none" stroke="#9fb0cf" stroke-width="2"></circle><path d="M11 14 L6 28 M21 14 L26 28 M8 28 L24 28" stroke="#9fb0cf" stroke-width="2" stroke-linecap="round"></path><path d="M13 18 L19 18" stroke="var(--m-brand)" stroke-width="1.5" stroke-linecap="round"></path><path d="M12 22 L20 22" stroke="var(--m-brand)" stroke-width="1.5" stroke-linecap="round"></path><circle cx="16" cy="10" r="2.5" fill="var(--m-brand)"></circle></svg>';
  const ICON_STEP2 = '<svg viewBox="0 0 32 32" width="28" height="28"><ellipse cx="16" cy="15" rx="11" ry="12" fill="none" stroke="#e6a0a8" stroke-width="2"></ellipse><path d="M10 13 Q13 10 16 13" fill="none" stroke="#e6a0a8" stroke-width="1.8" stroke-linecap="round"></path><path d="M16 13 Q19 10 22 13" fill="none" stroke="#e6a0a8" stroke-width="1.8" stroke-linecap="round"></path><path d="M11 21 Q16 27 21 21" fill="none" stroke="#e6a0a8" stroke-width="2" stroke-linecap="round"></path></svg>';
  const ICON_STEP3 = '<svg viewBox="0 0 32 32" width="28" height="28"><path d="M16 6 L16 20" stroke="var(--m-brand)" stroke-width="2.5" stroke-linecap="round"></path><path d="M10 14 L16 20 L22 14" fill="none" stroke="var(--m-brand)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path><rect x="8" y="24" width="16" height="3" rx="1.5" fill="var(--m-brand)" opacity="0.5"></rect></svg>';
  const ICON_STEP4 = '<svg viewBox="0 0 32 32" width="28" height="28"><ellipse cx="16" cy="15" rx="11" ry="12" fill="none" stroke="#f4a0a8" stroke-width="2"></ellipse><path d="M10 13 Q13 16 16 13" fill="none" stroke="#f4a0a8" stroke-width="1.8" stroke-linecap="round"></path><path d="M16 13 Q19 16 22 13" fill="none" stroke="#f4a0a8" stroke-width="1.8" stroke-linecap="round"></path><path d="M11 23 Q16 17 21 23" fill="none" stroke="#f4a0a8" stroke-width="2" stroke-linecap="round"></path><path d="M23 6 L26 3 M26 3 L29 6 M26 3 L26 8" stroke="#f4a0a8" stroke-width="1.5" stroke-linecap="round"></path></svg>';

  // ---- Mask (was Mask.dc.html, imported via dc-import) ----
  function Mask({ comedy, tragedy, cracked, faceColor, lineColor, size, hat }) {
    const FACE_D = 'M50 6 C26 6 13 26 13 52 C13 82 30 108 50 108 C70 108 87 82 87 52 C87 26 74 6 50 6 Z';
    return h('svg', { viewBox: '0 0 100 110', width: size, height: size, style: { display: 'block', overflow: 'visible' } },
      h('path', { key: 'face', d: FACE_D, fill: faceColor, stroke: lineColor, strokeWidth: 2.5 }),
      h('path', { key: 'shadow', d: FACE_D, fill: 'none', stroke: '#000', strokeOpacity: 0.07, strokeWidth: 6 }),
      h('circle', { key: 'dot', cx: 50, cy: 12, r: 3.5, fill: lineColor }),
      comedy && h('g', { key: 'comedy' },
        h('path', { d: 'M22 40 Q31 32 42 38', fill: 'none', stroke: lineColor, strokeWidth: 3, strokeLinecap: 'round' }),
        h('path', { d: 'M58 38 Q69 32 78 40', fill: 'none', stroke: lineColor, strokeWidth: 3, strokeLinecap: 'round' }),
        h('path', { d: 'M25 50 Q34 44 43 50 Q34 55 25 50 Z', fill: lineColor }),
        h('path', { d: 'M57 50 Q66 44 75 50 Q66 55 57 50 Z', fill: lineColor }),
        h('path', { d: 'M28 72 Q50 96 72 72', fill: 'none', stroke: lineColor, strokeWidth: 3, strokeLinecap: 'round' }),
        h('path', { d: 'M28 72 Q50 88 72 72 Q50 96 28 72 Z', fill: lineColor, opacity: 0.45 })
      ),
      tragedy && h('g', { key: 'tragedy' },
        h('path', { d: 'M22 38 Q31 44 42 40', fill: 'none', stroke: lineColor, strokeWidth: 3, strokeLinecap: 'round' }),
        h('path', { d: 'M58 40 Q69 44 78 38', fill: 'none', stroke: lineColor, strokeWidth: 3, strokeLinecap: 'round' }),
        h('path', { d: 'M25 52 Q34 47 43 53 Q34 57 25 52 Z', fill: lineColor }),
        h('path', { d: 'M57 53 Q66 47 75 52 Q66 57 57 53 Z', fill: lineColor }),
        h('path', { d: 'M38 58 Q36 66 38 72 Q41 66 38 58 Z', fill: lineColor, opacity: 0.5 }),
        h('path', { d: 'M30 88 Q50 68 70 88', fill: 'none', stroke: lineColor, strokeWidth: 3, strokeLinecap: 'round' }),
        h('path', { d: 'M30 88 Q50 76 70 88 Q50 68 30 88 Z', fill: lineColor, opacity: 0.4 })
      ),
      cracked && h(React.Fragment, { key: 'crack' },
        h('path', { d: 'M54 6 L46 28 L60 48 L44 68 L58 92 L48 108', fill: 'none', stroke: '#0c0608', strokeWidth: 3, strokeLinejoin: 'round', opacity: 0.85 }),
        h('path', { d: 'M54 6 L46 28 L60 48 L44 68 L58 92 L48 108', fill: 'none', stroke: 'rgba(255,80,60,.3)', strokeWidth: 1.2, strokeLinejoin: 'round' })
      ),
      hat && h('g', { key: 'hat' },
        h('path', { d: 'M24 28 C18 20 10 10 4 6 C10 16 12 24 16 34 Z', fill: '#7b2ff7' }),
        h('path', { d: 'M40 20 C40 10 46 2 50 -2 C54 2 60 10 60 20 Z', fill: '#ff3d8b' }),
        h('path', { d: 'M76 28 C82 20 90 10 96 6 C90 16 88 24 84 34 Z', fill: '#4ade80' }),
        h('path', { d: 'M16 32 Q50 4 84 32 Q50 20 16 32 Z', fill: '#8b5cf6' }),
        h('circle', { cx: 5, cy: 6, r: 4, fill: '#ffd23f', stroke: '#b98a12', strokeWidth: 0.8 }),
        h('circle', { cx: 50, cy: -1, r: 4, fill: '#ffd23f', stroke: '#b98a12', strokeWidth: 0.8 }),
        h('circle', { cx: 95, cy: 6, r: 4, fill: '#ffd23f', stroke: '#b98a12', strokeWidth: 0.8 })
      )
    );
  }

  // ---- App: game state + logic (ported ~verbatim from the DC script) ----
  class App extends React.Component {
    state = {
      screen: 'lobby', vote: null, viewed: {}, activePlayer: null, cardOpen: false, gameMode: 'roles',
      modal: null,
      playerList: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
      playerKeys: [0, 1, 2, 3],
      addingPlayer: false, newName: '', editingIdx: null, editingVal: '', removingIds: [],
      jesterCount: 1, jesterRandMin: 1, jesterRandMax: 3, randJesters: false, showCategory: true, showWord: false, jestersKnow: false, jesterGetsRole: false,
      timeLimit: 5,
      categories: ['Locations', 'Biomes', 'Historical Eras', 'Movie Genres'],
      wordCategories: ['Food', 'Animals', 'Objects', 'Movies'],
      selCategories: ['Locations', 'Biomes', 'Historical Eras', 'Movie Genres'],
      roundJesterIndices: null,
      roundStarterIdx: null,
      roundCategory: 'Locations',
      roundWord: '',
      roundRoleMap: {},
      roundJesterRoleMap: {},
      roundJesterWordMap: {},
      secondsLeft: null,
      timeUp: false,
      darkMode: true,
      soundEffects: true,
      jesterMode: false,
      wordListExpanded: [],
    };

    __nextPlayerId = 4;

    componentDidMount() {
      applyTheme(this.state.darkMode, this.state.jesterMode);
      this.__fitPhoneShell = this.__fitPhoneShell.bind(this);
      this.__fitPhoneShell();
      window.addEventListener('resize', this.__fitPhoneShell);
      // Jester mode: neon spark trail that follows the pointer (decorative,
      // rendered outside React so it never triggers re-renders).
      this.__spark = (e) => {
        if (!this.state.jesterMode) return;
        const now = performance.now();
        if (this.__lastSpark && now - this.__lastSpark < 50) return;
        this.__lastSpark = now;
        const s = document.createElement('span');
        s.className = 'j-spark';
        s.textContent = ['✦', '✧', '◆', '✺'][(Math.random() * 4) | 0];
        s.style.left = e.clientX + 'px';
        s.style.top = e.clientY + 'px';
        s.style.color = ['#ffd23f', '#ff3d8b', '#a78bfa', '#4ade80'][(Math.random() * 4) | 0];
        s.style.fontSize = (9 + Math.random() * 9) + 'px';
        s.style.setProperty('--dx', (Math.random() * 44 - 22) + 'px');
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 900);
      };
      window.addEventListener('pointermove', this.__spark);
    }

    componentDidUpdate(_, prev) {
      if (prev.darkMode !== this.state.darkMode || prev.jesterMode !== this.state.jesterMode) applyTheme(this.state.darkMode, this.state.jesterMode);
    }

    componentWillUnmount() {
      this.__clearTimer();
      window.removeEventListener('resize', this.__fitPhoneShell);
      window.removeEventListener('pointermove', this.__spark);
      if (this.__audioCtx) this.__audioCtx.close();
    }

    // Jester mode: holographic-foil card. Tilts in 3D toward the pointer and
    // slides the rainbow sheen (--hx/--hy feed the .j-holo gradient).
    __holoMove = (e) => {
      if (!this.state.jesterMode) return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      el.style.transform = `perspective(700px) rotateY(${((px - 0.5) * 14).toFixed(2)}deg) rotateX(${((0.5 - py) * 14).toFixed(2)}deg)`;
      el.style.setProperty('--hx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--hy', (py * 100).toFixed(1) + '%');
    };

    __holoLeave = (e) => {
      e.currentTarget.style.transform = '';
    };

    __fitPhoneShell() {
      const el = document.getElementById('phone-shell');
      if (!el) return;
      const BREAKPOINT = 640, BASE_W = 480, BASE_H = 900, MAX_SCALE = 1.7;
      const vw = window.innerWidth, vh = window.innerHeight;
      if (vw < BREAKPOINT) {
        el.style.transform = 'none';
        el.style.width = '100%';
        el.style.maxWidth = BASE_W + 'px';
        el.style.height = '100%';
        el.style.maxHeight = BASE_H + 'px';
        return;
      }
      el.style.width = BASE_W + 'px';
      el.style.height = BASE_H + 'px';
      el.style.maxWidth = 'none';
      el.style.maxHeight = 'none';
      const scale = Math.min(vw / BASE_W, vh / BASE_H, MAX_SCALE);
      el.style.transform = 'scale(' + scale + ')';
    }

    __clearTimer() {
      if (this.__timerId) {
        clearInterval(this.__timerId);
        this.__timerId = null;
      }
    }

    __ensureAudioCtx() {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!this.__audioCtx) this.__audioCtx = new Ctx();
      if (this.__audioCtx.state === 'suspended') this.__audioCtx.resume();
      return this.__audioCtx;
    }

    __playTimerSound() {
      if (!this.state.soundEffects) return;
      const ctx = this.__ensureAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const beep = (start, freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(0.3, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + 0.32);
      };
      beep(0, 880);
      beep(0.32, 880);
      beep(0.64, 1108);
    }

    __startTimer(minutes) {
      this.__clearTimer();
      if (!minutes) {
        this.setState({ secondsLeft: null, timeUp: false });
        return;
      }
      if (this.state.soundEffects) this.__ensureAudioCtx();
      this.setState({ secondsLeft: minutes * 60, timeUp: false });
      this.__timerId = setInterval(() => {
        const left = (this.state.secondsLeft || 0) - 1;
        if (left <= 0) {
          this.__clearTimer();
          this.setState({ secondsLeft: 0, timeUp: true });
          this.__playTimerSound();
        } else {
          this.setState({ secondsLeft: left });
        }
      }, 1000);
    }

    renderVals() {
      const st = this.state;
      const wine = '#6e141c', crimson = '#b3202f', navy = '#14254a';
      const goldFace = '#e6cb7e', ivoryFace = '#efe4c8';

      const faceColors = st.jesterMode
        ? ['#fdf4ff', '#f3e8ff', '#fef9c3', '#fce7f3', '#ecfccb', '#e0f2fe']
        : ['#efe4c8', '#e7d9b6', '#e0cfa6', '#ecdfc0', '#e8ddb5', '#f0e6c9'];
      const lineColors = st.jesterMode
        ? ['#7b2ff7', '#db2777', '#16a34a', '#d97706', '#7c3aed', '#be185d']
        : ['#7a1620', '#14254a', '#2e5bb0', '#6e141c', '#4a3010', '#7a1620'];
      const { biomeCatalog, locationCatalog, fakeLocationRoleCatalog, fakeBiomeRoleCatalog, historicalErasCatalog, fakeHistoricalErasRoleCatalog, movieCatalog, fakeMovieRoleCatalog, wordOnlyCatalog } = window.MASQ_LOCATIONS_DATA;
      const biomeNames = Object.keys(biomeCatalog);
      const locationNames = Object.keys(locationCatalog);
      const historicalEraNames = Object.keys(historicalErasCatalog);
      const movieGenreNames = Object.keys(movieCatalog);
      const shuffle = (items) => {
        const next = [...items];
        for (let i = next.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [next[i], next[j]] = [next[j], next[i]];
        }
        return next;
      };
      const allCategoryNames = [...st.categories, ...st.wordCategories];
      const mapCategoryItem = (cat) => ({
        cat,
        sel: st.selCategories.includes(cat),
        tileBg: st.selCategories.includes(cat) ? 'var(--m-tile-sel)' : 'var(--m-lift)',
        tileBorder: st.selCategories.includes(cat) ? '1.5px solid var(--m-accent)' : '1px solid var(--m-border-med)',
        color: st.selCategories.includes(cat) ? 'var(--m-tile-sel-text)' : 'var(--m-muted)',
        onToggle: () => {
          const s = st.selCategories;
          const next = s.includes(cat) ? (s.length > 1 ? s.filter(c => c !== cat) : s) : [...s, cat];
          this.setState({ selCategories: next });
        },
      });
      const maxJesters = Math.max(0, st.playerList.length - 1);
      const jesterCount = Math.min(st.jesterCount, maxJesters);
      const roundJesterIndices = Array.isArray(st.roundJesterIndices) ? st.roundJesterIndices : [];
      const jesterIndices = new Set(roundJesterIndices);
      const players = st.playerList.map((name, i) => ({
        name,
        comedy: i % 2 === 0,
        tragedy: i % 2 !== 0,
        face: faceColors[i % faceColors.length],
        line: lineColors[i % lineColors.length],
        jester: jesterIndices.has(i),
        you: i === 0,
      }));
      const jesterNames = players.filter(p => p.jester).map(p => p.name);

      const lobby = players.map((p, i) => ({ ...p, host: i === 0, notHost: i !== 0 }));

      const votable = players.filter(p => !p.you).map(p => {
        const selected = st.vote === p.name;
        const votes = selected ? 1 : 0;
        return {
          ...p, selected,
          voteLabel: votes === 1 ? '1 vote' : votes + ' votes',
          tileBg: selected ? 'rgba(230,203,126,.16)' : 'var(--m-lift-soft)',
          tileBorder: selected ? '2px solid var(--m-brand)' : '1px solid var(--m-border-btn)',
          onVote: () => this.setState({ vote: p.name }),
        };
      });

      const roundCategory = st.roundCategory || 'Locations';
      const roundRoleMap = st.roundRoleMap || {};
      const roundJesterRoleMap = st.roundJesterRoleMap || {};
      const roundJesterWordMap = st.roundJesterWordMap || {};
      const isBiomeRound = roundCategory === 'Biomes';
      const isLocationRound = roundCategory === 'Locations';
      const isHistoricalRound = roundCategory === 'Historical Eras';
      const isMovieRound = roundCategory === 'Movie Genres';
      const isFoodRound = roundCategory === 'Food';
      const isAnimalsRound = roundCategory === 'Animals';
      const isObjectsRound = roundCategory === 'Objects';
      const isMoviesWordRound = roundCategory === 'Movies';
      const actOnePlayers = players.map(p => {
        const seen = !!st.viewed[p.name];
        return {
          ...p, shortName: p.name.replace(' (You)', ''), seen,
          rowBg: seen ? 'var(--m-ready-bg)' : 'var(--m-lift)',
          rowBorder: seen ? 'var(--m-ready-border)' : '1px solid var(--m-border-med)',
          labelColor: seen ? 'var(--m-ready-color)' : 'var(--m-idle-label)',
          label: seen ? '✓ Ready' : 'Tap →',
          onTap: () => this.setState({ activePlayer: p, cardOpen: false }),
        };
      });
      const allSeen = players.every(p => st.viewed[p.name]);
      const ap = st.activePlayer;
      const apIsJester = ap && !!ap.jester;
      const apRoundRole = ap && !apIsJester ? (roundRoleMap[ap.name] || 'PERFORMER') : null;
      const apRoleDisguised = apIsJester && st.gameMode === 'roles' && st.jesterGetsRole;
      const apWordDisguised = apIsJester && st.gameMode === 'words' && st.jesterGetsRole;
      const apFakeRole = apRoleDisguised ? (roundJesterRoleMap[ap.name] || null) : null;
      const apFakeWord = apWordDisguised ? (roundJesterWordMap[ap.name] || null) : null;
      const apIsUndisguisedJester = apIsJester && !apRoleDisguised && !apWordDisguised;
      const closeOverlay = () => {
        if (ap) this.setState(s => ({ activePlayer: null, cardOpen: false, viewed: { ...s.viewed, [ap.name]: true } }));
      };
      const openCurtain = () => this.setState({ cardOpen: true });

      const voteName = st.vote || '';
      const jesterPlayer = players.find(p => p.jester);
      return {
        actOnePlayers, allSeen, notAllSeen: !allSeen,
        showOverlay: !!ap,
        hideOverlay: !ap,
        apName: ap ? ap.name.replace(' (You)', '') : '',
        apComedy: ap ? ap.comedy : true, apTragedy: ap ? ap.tragedy : false,
        apFace: ap ? ap.face : '#efe4c8', apLine: ap ? ap.line : '#7a1620',
        apRole: apIsUndisguisedJester ? 'THE JESTER' : (apIsJester ? (apFakeRole || 'PERFORMER') : apRoundRole),
        apRoleColor: apIsUndisguisedJester ? '#b3202f' : (isBiomeRound ? '#2e5bb0' : (isHistoricalRound ? '#b5893c' : (isMovieRound ? '#2f8f7a' : 'var(--m-accent)'))),
        apRoleSize: apIsUndisguisedJester ? '26px' : (isBiomeRound ? '22px' : '23px'),
        apWord: apIsJester ? (apWordDisguised ? apFakeWord : null) : st.roundWord,
        apWordLabel: isBiomeRound ? 'Biome' : (isHistoricalRound ? 'Era' : (isMovieRound ? 'Genre' : (isFoodRound ? 'Food' : (isAnimalsRound ? 'Animal' : (isObjectsRound ? 'Object' : (isMoviesWordRound ? 'Movie' : 'Location')))))),
        apWordSize: isBiomeRound ? '20px' : '22px',
        apWordBlockStyle: (st.gameMode === 'words' || st.showWord) ? '' : 'display:none;',
        apIsUndisguisedJester,
        apIsDisguisedJester: apRoleDisguised,
        apIsPerformer: !apIsJester || apWordDisguised,
        apHint: apIsUndisguisedJester
          ? 'You have no word. Blend in, bluff your clues, and avoid being unmasked before the curtain falls.'
          : isBiomeRound
            ? 'The biome is your secret. Give clues that fit your animal role without making the answer obvious.'
            : isLocationRound
              ? 'The location is your secret. Give clues that fit your role without making the answer obvious.'
            : isHistoricalRound
              ? 'The era is your secret. Give clues that fit your role without making the answer obvious.'
            : isMovieRound
              ? 'The genre is your secret. Give clues that fit your movie without making the answer obvious.'
            : 'Give clues that prove you know the word without giving it away to the Jester.',
        apJesterAllies: apIsUndisguisedJester && st.jestersKnow && jesterNames.length > 1
          ? jesterNames.filter(n => n !== (ap ? ap.name : '')).join(', ')
          : null,
        apShowAllies: apIsUndisguisedJester && st.jestersKnow && jesterNames.length > 1,
        starterName: st.playerList[st.roundStarterIdx] || st.playerList[0],
        gameCategory: roundCategory,
        roundWordBlockStyle: '',
        roundWordDisplay: st.roundWord,
        cardOpen: st.cardOpen, cardNotOpen: !st.cardOpen,
        openCurtain, closeOverlay,
        leftCurtain: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '50.5%', background: 'repeating-linear-gradient(90deg,var(--m-curt1) 0 12px,var(--m-curt2) 12px 22px)', boxShadow: 'inset -16px 0 30px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', transform: st.cardOpen ? 'translateX(-104%)' : 'translateX(0)', transition: 'transform 1.1s cubic-bezier(.7,0,.18,1)' },
        rightCurtain: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '50.5%', background: 'repeating-linear-gradient(90deg,var(--m-curt2) 0 12px,var(--m-curt1) 12px 22px)', boxShadow: 'inset 16px 0 30px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', transform: st.cardOpen ? 'translateX(104%)' : 'translateX(0)', transition: 'transform 1.1s cubic-bezier(.7,0,.18,1)' },
        curtainHint: st.cardOpen ? '' : 'TAP TO REVEAL',
        modal: st.modal,
        hasModal: !!st.modal,
        isModalCategories: st.modal === 'categories',
        isModalJesters: st.modal === 'jesters',
        isModalTime: st.modal === 'time',
        isModalHelp: st.modal === 'help',
        isModalSettings: st.modal === 'settings',
        isModalGameSettings: st.modal === 'gameSettings',
        isModalWordList: st.modal === 'wordList',
        isModalCredits: st.modal === 'credits',
        isModalPlayers: st.modal === 'players',
        closeModal: () => this.setState({ modal: null }),
        openPlayers: () => this.setState({ modal: 'players' }),
        openCategories: () => this.setState({ modal: 'categories' }),
        openJesters: () => this.setState({ modal: 'jesters' }),
        openTime: () => this.setState({ modal: 'time' }),
        openHelp: () => this.setState({ modal: 'help' }),
        openSettings: () => this.setState({ modal: 'settings' }),
        openGameSettings: () => this.setState({ modal: 'gameSettings' }),
        openWordList: () => this.setState({ modal: 'wordList', wordListExpanded: [] }),
        openCredits: () => this.setState({ modal: 'credits' }),
        wordListGroups: [
          { cat: 'Locations', words: locationNames },
          { cat: 'Biomes', words: biomeNames },
          { cat: 'Historical Eras', words: historicalEraNames },
          { cat: 'Movie Genres', words: movieGenreNames },
          { cat: 'Food', words: wordOnlyCatalog.Food },
          { cat: 'Animals', words: wordOnlyCatalog.Animals },
          { cat: 'Objects', words: wordOnlyCatalog.Objects },
          { cat: 'Movies', words: wordOnlyCatalog.Movies },
        ].map(g => {
          const open = (st.wordListExpanded || []).includes(g.cat);
          return {
            ...g, open,
            chevron: open ? 'rotate(90deg)' : 'rotate(0deg)',
            toggle: () => {
              const cur = this.state.wordListExpanded || [];
              this.setState({ wordListExpanded: cur.includes(g.cat) ? cur.filter(c => c !== g.cat) : [...cur, g.cat] });
            },
          };
        }),
        gameSettingsSummary: [st.showCategory ? 'Show Category' : null, st.showWord ? 'Show Word' : 'Word Hidden', st.jestersKnow ? 'Jesters Know Each Other' : null, st.jesterGetsRole ? (st.gameMode === 'words' ? 'Jester Gets Word' : 'Jester Gets Role') : null].filter(Boolean).join(' · ') || 'Default',
        playerItems: st.playerList.map((name, i) => {
          const editing = st.editingIdx === i;
          const p = players[i] || players[0];
          const pid = (st.playerKeys && st.playerKeys[i] != null) ? st.playerKeys[i] : i;
          const removing = (st.removingIds || []).includes(pid);
          return {
            name, i, pid, editing, notEditing: !editing, removing,
            comedy: p.comedy, tragedy: p.tragedy, face: p.face, line: p.line,
            editVal: editing ? st.editingVal : name,
            onEditTap: () => this.setState({ editingIdx: i, editingVal: name }),
            onEditChange: (e) => this.setState({ editingVal: e.target.value }),
            onEditKeyDown: (e) => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                const pl = [...st.playerList];
                if (e.key === 'Enter' && st.editingVal.trim()) pl[i] = st.editingVal.trim();
                this.setState({ playerList: pl, editingIdx: null, editingVal: '' });
              }
            },
            onEditBlur: () => {
              const pl = [...st.playerList];
              if (st.editingVal.trim()) pl[i] = st.editingVal.trim();
              this.setState({ playerList: pl, editingIdx: null, editingVal: '' });
            },
            onRemove: () => {
              if (removing) return;
              this.setState(prev => ({ removingIds: [...(prev.removingIds || []), pid], editingIdx: null }));
              setTimeout(() => {
                this.setState(prev => {
                  const idx = (prev.playerKeys || []).indexOf(pid);
                  const next = { removingIds: (prev.removingIds || []).filter(x => x !== pid) };
                  if (idx !== -1) {
                    next.playerList = prev.playerList.filter((_, j) => j !== idx);
                    next.playerKeys = prev.playerKeys.filter((_, j) => j !== idx);
                  }
                  return next;
                });
              }, 280);
            },
          };
        }),
        addingPlayer: st.addingPlayer, notAddingPlayer: !st.addingPlayer,
        newName: st.newName,
        onAddTap: () => this.setState({ addingPlayer: true }),
        onNameChange: (e) => this.setState({ newName: e.target.value }),
        onNameKeyDown: (e) => {
          if (e.key === 'Enter' && st.newName.trim()) {
            this.setState({ playerList: [...st.playerList, st.newName.trim()], playerKeys: [...st.playerKeys, this.__nextPlayerId++], newName: '', addingPlayer: false });
          }
        },
        confirmAdd: () => {
          if (st.newName.trim()) this.setState({ playerList: [...st.playerList, st.newName.trim()], playerKeys: [...st.playerKeys, this.__nextPlayerId++], newName: '', addingPlayer: false });
        },
        cancelAdd: () => this.setState({ addingPlayer: false, newName: '' }),
        categoryItems: st.categories.map(mapCategoryItem),
        wordCategoryItems: st.wordCategories.map(mapCategoryItem),
        catSummary: st.selCategories.length === allCategoryNames.length ? allCategoryNames.join(', ') : st.selCategories.join(', '),
        jesterCount: st.jesterCount,
        incJester: () => this.setState({ jesterCount: Math.min(st.jesterCount + 1, maxJesters) }),
        decJester: () => this.setState({ jesterCount: Math.max(st.jesterCount - 1, 0) }),
        jesterLabel: st.jesterCount === 0 ? 'No Jesters' : st.jesterCount === 1 ? '1 Jester' : st.jesterCount + ' Jesters',
        jesterRandMin: st.jesterRandMin,
        jesterRandMax: st.jesterRandMax,
        incRandMin: () => this.setState({ jesterRandMin: Math.min(st.jesterRandMin + 1, st.jesterRandMax) }),
        decRandMin: () => this.setState({ jesterRandMin: Math.max(st.jesterRandMin - 1, 0) }),
        incRandMax: () => this.setState({ jesterRandMax: Math.min(st.jesterRandMax + 1, maxJesters) }),
        decRandMax: () => this.setState({ jesterRandMax: Math.max(st.jesterRandMax - 1, st.jesterRandMin) }),
        randJesters: st.randJesters,
        randJestersBg: st.randJesters ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        randJestersThumb: st.randJesters ? 'translateX(22px)' : 'translateX(2px)',
        toggleRandJesters: () => this.setState({ randJesters: !st.randJesters }),
        showCategory: st.showCategory,
        showCatBg: st.showCategory ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        showCatThumb: st.showCategory ? 'translateX(22px)' : 'translateX(2px)',
        toggleShowCat: () => this.setState({ showCategory: !st.showCategory }),
        showWord: st.gameMode === 'words' ? true : st.showWord,
        showWordBg: (st.gameMode === 'words' || st.showWord) ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        showWordThumb: (st.gameMode === 'words' || st.showWord) ? 'translateX(22px)' : 'translateX(2px)',
        showWordToggleOpacity: st.gameMode === 'words' ? '.55' : '1',
        showWordTogglePointerEvents: st.gameMode === 'words' ? 'none' : 'auto',
        toggleShowWord: () => {
          if (st.gameMode === 'words') return;
          this.setState({ showWord: !st.showWord });
        },
        jestersKnow: st.jestersKnow,
        jestersKnowBg: st.jestersKnow ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        jestersKnowThumb: st.jestersKnow ? 'translateX(22px)' : 'translateX(2px)',
        toggleJestersKnow: () => this.setState({ jestersKnow: !st.jestersKnow }),
        jesterGetsRole: st.jesterGetsRole,
        jesterGetsRoleLabel: st.gameMode === 'words' ? 'Jester Gets Word' : 'Jester Gets Role',
        jesterGetsRoleDesc: st.gameMode === 'words' ? 'The Jester is handed a similar but fake word instead of being told they’re the Jester' : 'The Jester is handed a normal-looking fake role instead of being told they’re the Jester',
        jesterGetsRoleBg: st.jesterGetsRole ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        jesterGetsRoleThumb: st.jesterGetsRole ? 'translateX(22px)' : 'translateX(2px)',
        jesterGetsRoleToggleOpacity: '1',
        jesterGetsRoleTogglePointerEvents: 'auto',
        toggleJesterGetsRole: () => this.setState({ jesterGetsRole: !st.jesterGetsRole }),
        timeLimit: st.timeLimit,
        timeLimitDisplay: st.timeLimit === 0 ? '∞' : String(st.timeLimit),
        timeLimitUnit: st.timeLimit === 0 ? 'No limit' : st.timeLimit === 1 ? 'minute' : 'minutes',
        timeLimitRow: st.timeLimit === 0 ? 'No limit' : st.timeLimit + ' min',
        incTime: () => this.setState({ timeLimit: st.timeLimit === 0 ? 0 : st.timeLimit >= 10 ? 0 : st.timeLimit + 1 }),
        decTime: () => this.setState({ timeLimit: st.timeLimit === 0 ? 10 : Math.max(st.timeLimit - 1, 1) }),
        hasTimeLimit: st.timeLimit > 0,
        timerDisplay: (() => {
          const total = st.secondsLeft != null ? st.secondsLeft : st.timeLimit * 60;
          const m = Math.floor(total / 60);
          const s = total % 60;
          return m + ':' + String(s).padStart(2, '0');
        })(),
        timerColor: st.secondsLeft !== null && st.secondsLeft <= 30 ? '#e8a0a8' : 'var(--m-timer)',
        darkMode: st.darkMode,
        lightMode: !st.darkMode,
        lightModeBg: !st.darkMode ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        lightModeThumb: !st.darkMode ? 'translateX(22px)' : 'translateX(2px)',
        toggleLightMode: () => this.setState({ darkMode: !st.darkMode }),
        jesterMode: st.jesterMode,
        toggleJesterMode: () => this.setState({ jesterMode: !st.jesterMode }),
        soundEffects: st.soundEffects,
        soundEffectsBg: st.soundEffects ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        soundEffectsThumb: st.soundEffects ? 'translateX(22px)' : 'translateX(2px)',
        toggleSoundEffects: () => this.setState({ soundEffects: !st.soundEffects }),
        playerNames: st.playerList.join(', '),
        playerCount: st.playerList.length,
        isLobby: st.screen === 'lobby',
        isReveal: st.screen === 'reveal',
        isVoting: st.screen === 'voting',
        isResults: st.screen === 'results',
        gameMode: st.gameMode,
        isWordsMode: st.gameMode === 'words',
        showRoleHeading: st.gameMode !== 'words',
        setRoleMode: () => {
          const nextSel = st.selCategories.filter(c => !st.wordCategories.includes(c));
          this.setState({ gameMode: 'roles', selCategories: nextSel.length ? nextSel : st.categories });
        },
        setWordMode: () => this.setState({ gameMode: 'words', showWord: true }),
        roleTileBg: st.gameMode === 'roles' ? 'var(--m-tile-sel)' : 'var(--m-lift-soft)',
        roleTileBorder: st.gameMode === 'roles' ? '1.5px solid var(--m-accent)' : '1px solid var(--m-border-white)',
        roleTileColor: st.gameMode === 'roles' ? 'var(--m-tile-sel-text)' : 'var(--m-muted)',
        roleTileSubColor: st.gameMode === 'roles' ? 'var(--m-tile-sel-sub)' : 'var(--m-dim)',
        wordTileBg: st.gameMode === 'words' ? 'var(--m-tile-sel)' : 'var(--m-lift-soft)',
        wordTileBorder: st.gameMode === 'words' ? '1.5px solid var(--m-accent)' : '1px solid var(--m-border-white)',
        wordTileColor: st.gameMode === 'words' ? 'var(--m-tile-sel-text)' : 'var(--m-muted)',
        wordTileSubColor: st.gameMode === 'words' ? 'var(--m-tile-sel-sub)' : 'var(--m-dim)',
        wine, crimson, navy, goldFace, ivoryFace,
        lobby, votable,
        hasJester: !!jesterPlayer,
        revealedName: jesterPlayer ? jesterPlayer.name : 'No One',
        jesterRevealHeading: jesterPlayer ? 'The Jester was…' : 'There Was No Jester',
        goReveal: () => {
          let newJesterCount = st.jesterCount;
          if (st.randJesters) {
            const min = st.jesterRandMin;
            const max = Math.min(st.jesterRandMax, maxJesters);
            newJesterCount = Math.floor(Math.random() * (max - min + 1)) + min;
          }
          const shuffledIndices = st.playerList.map((_, index) => index).sort(() => Math.random() - 0.5);
          const selectedJesterIndices = shuffledIndices.slice(0, Math.min(newJesterCount, maxJesters));
          let pickableCategories = st.selCategories.length ? st.selCategories : ['Locations'];
          if (st.gameMode === 'roles') {
            pickableCategories = pickableCategories.filter(c => !st.wordCategories.includes(c));
            if (!pickableCategories.length) pickableCategories = st.categories;
          }
          const chosenCategory = pickableCategories[Math.floor(Math.random() * pickableCategories.length)];
          let nextRound = { roundCategory: 'Locations', roundWord: '', roundRoleMap: {}, roundJesterRoleMap: {} };
          const rolePlayers = players.filter(p => !p.jester);
          const jesterIndexSet = new Set(selectedJesterIndices);
          const jesterPlayerNames = st.playerList.filter((_, i) => jesterIndexSet.has(i));
          const useJesterRole = st.gameMode === 'roles' && st.jesterGetsRole;
          const useJesterWord = st.gameMode === 'words' && st.jesterGetsRole;
          const getWordPool = (category) => {
            if (category === 'Biomes') return biomeNames;
            if (category === 'Historical Eras') return historicalEraNames;
            if (category === 'Movie Genres') return movieGenreNames;
            if (category === 'Food') return wordOnlyCatalog.Food;
            if (category === 'Animals') return wordOnlyCatalog.Animals;
            if (category === 'Objects') return wordOnlyCatalog.Objects;
            if (category === 'Movies') return wordOnlyCatalog.Movies;
            return locationNames;
          };
          const buildRound = (roundCategory, wordName, roleCatalog, fakeRoleCatalog) => {
            const roles = shuffle(roleCatalog[wordName]);
            const roundRoleMap = rolePlayers.reduce((acc, player, index) => {
              acc[player.name] = roles[index % roles.length];
              return acc;
            }, {});
            let roundJesterRoleMap = {};
            if (useJesterRole) {
              const fakeRoles = shuffle(fakeRoleCatalog[wordName] || []);
              roundJesterRoleMap = jesterPlayerNames.reduce((acc, name, index) => {
                acc[name] = fakeRoles[index % fakeRoles.length];
                return acc;
              }, {});
            }
            return { roundCategory, roundWord: wordName, roundRoleMap, roundJesterRoleMap };
          };
          const buildWordOnlyRound = (category, words) => {
            const word = words[Math.floor(Math.random() * words.length)];
            return { roundCategory: category, roundWord: word, roundRoleMap: {}, roundJesterRoleMap: {} };
          };
          if (chosenCategory === 'Biomes') {
            const biomeName = biomeNames[Math.floor(Math.random() * biomeNames.length)];
            nextRound = buildRound('Biomes', biomeName, biomeCatalog, fakeBiomeRoleCatalog);
          } else if (chosenCategory === 'Historical Eras') {
            const eraName = historicalEraNames[Math.floor(Math.random() * historicalEraNames.length)];
            nextRound = buildRound('Historical Eras', eraName, historicalErasCatalog, fakeHistoricalErasRoleCatalog);
          } else if (chosenCategory === 'Movie Genres') {
            const genreName = movieGenreNames[Math.floor(Math.random() * movieGenreNames.length)];
            nextRound = buildRound('Movie Genres', genreName, movieCatalog, fakeMovieRoleCatalog);
          } else if (chosenCategory === 'Food') {
            nextRound = buildWordOnlyRound('Food', wordOnlyCatalog.Food);
          } else if (chosenCategory === 'Animals') {
            nextRound = buildWordOnlyRound('Animals', wordOnlyCatalog.Animals);
          } else if (chosenCategory === 'Objects') {
            nextRound = buildWordOnlyRound('Objects', wordOnlyCatalog.Objects);
          } else if (chosenCategory === 'Movies') {
            nextRound = buildWordOnlyRound('Movies', wordOnlyCatalog.Movies);
          } else {
            const locationName = locationNames[Math.floor(Math.random() * locationNames.length)];
            nextRound = buildRound('Locations', locationName, locationCatalog, fakeLocationRoleCatalog);
          }
          let roundJesterWordMap = {};
          if (useJesterWord) {
            const pool = getWordPool(nextRound.roundCategory).filter(w => w !== nextRound.roundWord);
            if (pool.length) {
              const fakeWords = shuffle(pool);
              roundJesterWordMap = jesterPlayerNames.reduce((acc, name, index) => {
                acc[name] = fakeWords[index % fakeWords.length];
                return acc;
              }, {});
            }
          }
          nextRound = { ...nextRound, roundJesterWordMap };
          const roundStarterIdx = Math.floor(Math.random() * st.playerList.length);
          this.setState({ screen: 'reveal', viewed: {}, activePlayer: null, cardOpen: false, jesterCount: newJesterCount, roundJesterIndices: selectedJesterIndices, roundStarterIdx, ...nextRound });
        },
        goVoting: () => { this.setState({ screen: 'voting' }); this.__startTimer(st.timeLimit); },
        goResults: () => { this.__clearTimer(); this.setState({ screen: 'results' }); },
        backToLobby: () => { this.__clearTimer(); this.setState({ screen: 'lobby', vote: null, viewed: {}, activePlayer: null, cardOpen: false, roundJesterIndices: null, secondsLeft: null, timeUp: false }); },
        backToReveal: () => { this.__clearTimer(); this.setState({ screen: 'reveal', vote: null, activePlayer: null, cardOpen: false, secondsLeft: null, timeUp: false }); },
        playAgain: () => { this.__clearTimer(); this.setState({ screen: 'lobby', vote: null, viewed: {}, activePlayer: null, cardOpen: false, roundJesterIndices: null, secondsLeft: null, timeUp: false }); },
        dismissTimeUp: () => this.setState({ timeUp: false }),
        showTimeUpPopup: st.timeUp,
        hasVote: st.vote !== null, notHasVote: st.vote === null,
        voteUpper: voteName.toUpperCase(),
        caughtJester: !!jesterPlayer && st.vote !== null && players.find(p => p.name === st.vote)?.jester,
        missedJester: !!jesterPlayer && st.vote !== null && !players.find(p => p.name === st.vote)?.jester,
      };
    }

    settingsRow({ onClick, iconBg, icon, label, value }) {
      return h('div', { onClick, className: 'imp-btn', style: css('display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:12px; background:var(--m-lift); border:1px solid var(--m-border); cursor:pointer;') },
        h('div', { style: css(`width:34px; height:34px; border-radius:9px; background:${iconBg}; display:flex; align-items:center; justify-content:center; flex:none;`), dangerouslySetInnerHTML: { __html: icon } }),
        h('div', { style: css('flex:1;') },
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.15em; text-transform:uppercase; color:var(--m-label);") }, label),
          h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:var(--m-body); margin-top:1px;") }, value)
        ),
        h('div', { style: css('color:var(--m-dim2); font-size:18px;') }, '›')
      );
    }

    categoriesModal(v) {
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); animation:imp-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'Categories'),
          h('div', { onClick: v.closeModal, style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label); margin-bottom:8px;") }, 'Role Categories'),
        h('div', { style: css('display:grid; grid-template-columns:1fr 1fr; gap:8px;') },
          v.categoryItems.map((c, i) => h('div', { key: i, onClick: c.onToggle, style: css(`padding:14px 12px; border-radius:12px; cursor:pointer; text-align:center; background:${c.tileBg}; border:${c.tileBorder};`) },
            h('div', { style: css(`font-family:'Cinzel',serif; font-weight:600; font-size:14px; color:${c.color};`) }, c.cat)
          ))
        ),
        v.isWordsMode && h(React.Fragment, null,
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label); margin:18px 0 8px;") }, 'Word Categories'),
          h('div', { style: css('display:grid; grid-template-columns:1fr 1fr; gap:8px;') },
            v.wordCategoryItems.map((c, i) => h('div', { key: i, onClick: c.onToggle, style: css(`padding:14px 12px; border-radius:12px; cursor:pointer; text-align:center; background:${c.tileBg}; border:${c.tileBorder};`) },
              h('div', { style: css(`font-family:'Cinzel',serif; font-weight:600; font-size:14px; color:${c.color};`) }, c.cat)
            ))
          )
        )
      );
    }

    jestersModal(v) {
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); animation:imp-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'Number of Jesters'),
          h('div', { onClick: v.closeModal, style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; align-items:center; justify-content:center; gap:32px;') },
          h('div', { onClick: v.decJester, style: css('width:52px; height:52px; border-radius:50%; background:var(--m-lift-input); border:1px solid var(--m-border-hard); display:flex; align-items:center; justify-content:center; font-size:26px; color:var(--m-accent); cursor:pointer; line-height:1;') }, '−'),
          h('div', { style: css('text-align:center;') },
            h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:52px; color:var(--m-text); line-height:1;") }, v.jesterCount),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:15px; color:var(--m-label); margin-top:4px;") }, v.jesterLabel)
          ),
          h('div', { onClick: v.incJester, style: css('width:52px; height:52px; border-radius:50%; background:rgba(178,32,47,.25); border:1px solid rgba(178,32,47,.5); display:flex; align-items:center; justify-content:center; font-size:26px; color:#f4a0a8; cursor:pointer; line-height:1;') }, '+')
        ),
        h('div', { style: css('display:flex; align-items:center; gap:12px; margin:20px 0 14px;') },
          h('div', { style: css('flex:1; height:1px; background:var(--m-border-med);') }),
          h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-soft2);") }, 'or randomize'),
          h('div', { style: css('flex:1; height:1px; background:var(--m-border-med);') })
        ),
        h('div', { onClick: v.toggleRandJesters, className: 'imp-btn', style: css('display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:12px; background:var(--m-lift-soft); border:1px solid var(--m-border); cursor:pointer; margin-bottom:14px;') },
          h('div', { style: css('flex:1;') },
            h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:var(--m-text);") }, 'Random Count'),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); margin-top:2px;") }, 'Pick a random number of jesters each round')
          ),
          h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.randJestersBg}; transition:background .25s; flex:none;`) },
            h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.randJestersThumb}; transition:transform .25s;`) })
          )
        ),
        v.randJesters && h('div', { style: css('display:flex; align-items:center; justify-content:center; gap:18px; animation:imp-rise .2s ease both;') },
          h('div', { style: css('display:flex; flex-direction:column; align-items:center; gap:7px;') },
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label);") }, 'Min'),
            h('div', { style: css('display:flex; align-items:center; gap:9px;') },
              h('div', { onClick: v.decRandMin, className: 'imp-btn', style: css('width:30px; height:30px; border-radius:50%; background:var(--m-lift-med); border:1px solid var(--m-border-strong); display:flex; align-items:center; justify-content:center; font-size:17px; color:var(--m-accent); cursor:pointer; line-height:1;') }, '−'),
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:26px; color:var(--m-text); min-width:28px; text-align:center; line-height:1;") }, v.jesterRandMin),
              h('div', { onClick: v.incRandMin, className: 'imp-btn', style: css('width:30px; height:30px; border-radius:50%; background:var(--m-lift-med); border:1px solid var(--m-border-strong); display:flex; align-items:center; justify-content:center; font-size:17px; color:var(--m-accent); cursor:pointer; line-height:1;') }, '+')
            )
          ),
          h('div', { style: css("font-family:'Cinzel',serif; font-size:16px; color:var(--m-arrow); padding-top:20px;") }, '→'),
          h('div', { style: css('display:flex; flex-direction:column; align-items:center; gap:7px;') },
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label);") }, 'Max'),
            h('div', { style: css('display:flex; align-items:center; gap:9px;') },
              h('div', { onClick: v.decRandMax, className: 'imp-btn', style: css('width:30px; height:30px; border-radius:50%; background:var(--m-lift-med); border:1px solid var(--m-border-strong); display:flex; align-items:center; justify-content:center; font-size:17px; color:var(--m-accent); cursor:pointer; line-height:1;') }, '−'),
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:26px; color:var(--m-text); min-width:28px; text-align:center; line-height:1;") }, v.jesterRandMax),
              h('div', { onClick: v.incRandMax, className: 'imp-btn', style: css('width:30px; height:30px; border-radius:50%; background:var(--m-lift-med); border:1px solid var(--m-border-strong); display:flex; align-items:center; justify-content:center; font-size:17px; color:var(--m-accent); cursor:pointer; line-height:1;') }, '+')
            )
          )
        )
      );
    }

    timeModal(v) {
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); animation:imp-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'Time Limit'),
          h('div', { onClick: v.closeModal, style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; align-items:center; justify-content:center; gap:32px; padding:10px 0 6px;') },
          h('div', { onClick: v.decTime, style: css('width:52px; height:52px; border-radius:50%; background:var(--m-lift-input); border:1px solid var(--m-border-hard); display:flex; align-items:center; justify-content:center; font-size:26px; color:var(--m-accent); cursor:pointer; line-height:1;') }, '−'),
          h('div', { style: css('text-align:center; min-width:100px;') },
            h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:52px; color:var(--m-text); line-height:1;") }, v.timeLimitDisplay),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:15px; color:var(--m-label); margin-top:4px;") }, v.timeLimitUnit)
          ),
          h('div', { onClick: v.incTime, style: css('width:52px; height:52px; border-radius:50%; background:rgba(178,32,47,.25); border:1px solid rgba(178,32,47,.5); display:flex; align-items:center; justify-content:center; font-size:26px; color:#f4a0a8; cursor:pointer; line-height:1;') }, '+')
        )
      );
    }

    helpModal(v) {
      const cards = [
        { border: 'var(--m-accent)', title: 'The Setup', body: 'Add your players, pick Role Mode or Word Mode, and choose categories. Each round picks one category at random from what you selected.' },
        { border: '#7a1620', title: 'Role Mode', body: 'The default. Everyone but the Jester gets a secret role. The word stays hidden (you can turn it on in Options). Use your role to ask and answer questions without giving yourself away. The Jester has no role and has to bluff.' },
        { border: '#14254a', title: 'Word Mode', body: 'Everyone but the Jester sees the same secret word, with no roles. Ask questions that prove you know it without saying it outright. The Jester sees nothing and has to fake it.' },
        { border: '#2e5bb0', title: 'The Round', body: 'Pass the phone so each player privately sees their card. Then take turns asking one question to someone else. When you’re ready (or the timer ends), discuss and vote. Catch the Jester and the Cast wins; miss them and the Jester wins.' },
      ];
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); max-height:80vh; overflow-y:auto; animation:imp-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'How to Play'),
          h('div', { onClick: v.closeModal, style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; flex-direction:column; gap:14px;') },
          cards.map((c, i) => h('div', { key: i, style: css(`padding:14px; background:var(--m-lift-soft); border-radius:12px; border-left:3px solid ${c.border};`) },
            h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:14px; color:var(--m-brand); margin-bottom:4px;") }, c.title),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:var(--m-help); line-height:1.5;") }, c.body)
          ))
        )
      );
    }

    gameSettingsModal(v) {
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); animation:imp-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'Game Options'),
          h('div', { onClick: v.closeModal, className: 'imp-btn', style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; flex-direction:column; gap:0; border-radius:14px; overflow:hidden; border:1px solid var(--m-border);') },
          h('div', { onClick: v.toggleShowCat, style: css('display:flex; align-items:center; gap:14px; padding:16px; background:var(--m-lift-soft); border-bottom:1px solid var(--m-border-soft); cursor:pointer;') },
            h('div', { style: css('flex:none; width:38px; height:38px; border-radius:10px; background:var(--m-border-med); display:flex; align-items:center; justify-content:center;'), dangerouslySetInnerHTML: { __html: ICON_CATEGORIES_18 } }),
            h('div', { style: css('flex:1;') },
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:var(--m-text);") }, 'Show Category'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); margin-top:2px;") }, 'Players can see the category of the secret word')
            ),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.showCatBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.showCatThumb}; transition:transform .25s;`) })
            )
          ),
          h('div', { onClick: v.toggleJestersKnow, style: css('display:flex; align-items:center; gap:14px; padding:16px; background:var(--m-lift-soft); border-bottom:1px solid var(--m-border-soft); cursor:pointer;') },
            h('div', { style: css('flex:none; width:38px; height:38px; border-radius:10px; background:rgba(178,32,47,.2); display:flex; align-items:center; justify-content:center;'), dangerouslySetInnerHTML: { __html: ICON_JESTERS_18 } }),
            h('div', { style: css('flex:1;') },
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:var(--m-text);") }, 'Jesters Know Each Other'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); margin-top:2px;") }, 'Jesters can see their fellow jesters')
            ),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.jestersKnowBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.jestersKnowThumb}; transition:transform .25s;`) })
            )
          ),
          h('div', { onClick: v.toggleShowWord, style: css(`display:flex; align-items:center; gap:14px; padding:16px; background:var(--m-lift-soft); border-bottom:1px solid var(--m-border-soft); cursor:pointer; opacity:${v.showWordToggleOpacity}; pointer-events:${v.showWordTogglePointerEvents};`) },
            h('div', { style: css('flex:none; width:38px; height:38px; border-radius:10px; background:rgba(46,91,176,.18); display:flex; align-items:center; justify-content:center;'), dangerouslySetInnerHTML: { __html: ICON_SHOW_WORD } }),
            h('div', { style: css('flex:1;') },
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:var(--m-text);") }, 'Show Word'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); margin-top:2px;") }, 'Players can see the word and their role')
            ),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.showWordBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.showWordThumb}; transition:transform .25s;`) })
            )
          ),
          h('div', { onClick: v.toggleJesterGetsRole, style: css(`display:flex; align-items:center; gap:14px; padding:16px; background:var(--m-lift-soft); cursor:pointer; opacity:${v.jesterGetsRoleToggleOpacity}; pointer-events:${v.jesterGetsRoleTogglePointerEvents};`) },
            h('div', { style: css('flex:none; width:38px; height:38px; border-radius:10px; background:var(--m-border-med); display:flex; align-items:center; justify-content:center;'), dangerouslySetInnerHTML: { __html: ICON_ROLE_18 } }),
            h('div', { style: css('flex:1;') },
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:var(--m-text);") }, v.jesterGetsRoleLabel),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); margin-top:2px;") }, v.jesterGetsRoleDesc)
            ),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.jesterGetsRoleBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.jesterGetsRoleThumb}; transition:transform .25s;`) })
            )
          )
        )
      );
    }

    wordListModal(v) {
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); max-height:80vh; overflow-y:auto; animation:imp-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'All Words'),
          h('div', { onClick: v.closeModal, style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; flex-direction:column; gap:10px;') },
          v.wordListGroups.map((g, i) => h('div', { key: i },
            h('div', { onClick: g.toggle, className: 'imp-btn', style: css('display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 14px; background:var(--m-lift); border-radius:12px; cursor:pointer;') },
              h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label);") }, `${g.cat} (${g.words.length})`),
              h('div', { style: css(`color:var(--m-dim2); font-size:18px; transform:${g.chevron}; transition:transform .2s;`) }, '›')
            ),
            g.open ? h('div', { style: css('display:flex; flex-wrap:wrap; gap:6px; padding:10px 4px 4px;') },
              g.words.map((w, j) => h('div', { key: j, style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-body); background:var(--m-lift); border:1px solid var(--m-border); border-radius:8px; padding:5px 10px;") }, w))
            ) : null
          ))
        )
      );
    }

    settingsModal(v) {
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); animation:imp-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'Settings'),
          h('div', { onClick: v.closeModal, style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; flex-direction:column; gap:10px;') },
          h('div', { onClick: v.openWordList, className: 'imp-btn', style: css('display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:var(--m-lift); border-radius:12px; cursor:pointer;') },
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:16px; color:var(--m-body);") }, 'View All Words'),
            h('div', { style: css('color:var(--m-dim2); font-size:18px;') }, '›')
          ),
          h('div', { onClick: v.toggleSoundEffects, className: 'imp-btn', style: css('display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:var(--m-lift); border-radius:12px; cursor:pointer;') },
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:16px; color:var(--m-body);") }, 'Timer Sound Effect'),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.soundEffectsBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.soundEffectsThumb}; transition:transform .25s;`) })
            )
          ),
          h('div', { onClick: v.toggleLightMode, className: 'imp-btn', style: css('display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:var(--m-lift); border-radius:12px; cursor:pointer;') },
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:16px; color:var(--m-body);") }, 'Light Mode'),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.lightModeBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.lightModeThumb}; transition:transform .25s;`) })
            )
          ),
          h('div', { onClick: v.openCredits, className: 'imp-btn', style: css('display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:var(--m-lift); border-radius:12px; cursor:pointer;') },
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:16px; color:var(--m-body);") }, 'Credits'),
            h('div', { style: css('color:var(--m-dim2); font-size:18px;') }, '›')
          ),
          h('div', { style: css('padding:14px 16px; background:var(--m-lift); border-radius:12px; text-align:center;') },
            h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:16px; color:var(--m-brand);"), className: 'j-title' }, 'MASQ'),
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:11px; color:var(--m-dim); margin-top:4px; letter-spacing:.06em;") }, 'VERSION 1.0')
          )
        )
      );
    }

    creditsModal(v) {
      const company = [
        { border: 'var(--m-accent)', name: 'Arnav Podichetty', role: 'Creator & Code' },
        { border: '#7a1620', name: 'Richard Chen', role: 'Creator & Concept' },
        { border: '#2e5bb0', name: 'Esha Bansiya', role: 'Contributions' },
      ];
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); max-height:80vh; overflow-y:auto; animation:imp-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'Credits'),
          h('div', { onClick: v.openSettings, className: 'imp-btn', style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; flex-direction:column; gap:14px;') },
          company.map((c, i) => h('div', { key: i, style: css(`padding:14px; background:var(--m-lift-soft); border-radius:12px; border-left:3px solid ${c.border};`) },
            h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:15px; color:var(--m-brand);") }, c.name),
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--m-label); margin-top:4px;") }, c.role)
          ))
        )
      );
    }

    renderLobby(v) {
      return h('div', { style: css('position:absolute; inset:0; display:flex; flex-direction:column; background:var(--m-screen); animation:imp-fade-in .25s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; padding:24px 20px 18px;') },
          h('div', { onClick: v.openHelp, className: 'imp-btn', style: css("width:36px; height:36px; border-radius:10px; background:var(--m-lift-med); border:1px solid var(--m-border-btn); display:flex; align-items:center; justify-content:center; cursor:pointer; font-family:'Cinzel',serif; font-weight:700; font-size:17px; color:var(--m-accent);") }, '?'),
          h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:22px; color:var(--m-text-title); letter-spacing:.04em; cursor:pointer;"), className: 'j-title', onClick: v.toggleJesterMode },
            v.jesterMode
              ? 'MASQ'.split('').map((ch, i) => h('span', { key: i, className: 'j-title j-dance', style: { animationDelay: (i * 0.13) + 's, ' + (i * 0.13) + 's' } }, ch))
              : 'MASQ'
          ),
          h('div', { onClick: v.openSettings, className: 'imp-btn', style: css('width:36px; height:36px; border-radius:10px; background:var(--m-lift-med); border:1px solid var(--m-border-btn); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:18px; color:var(--m-accent);') }, '⚙')
        ),
        h('div', { style: css('flex:1; overflow-y:auto; padding:0 20px 14px;') },
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.28em; text-transform:uppercase; color:var(--m-label); margin-bottom:10px;") }, 'Game Mode'),
          h('div', { style: css('display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:22px;') },
            h('div', { onClick: v.setRoleMode, className: 'imp-btn', style: css(`padding:13px 14px; border-radius:12px; background:${v.roleTileBg}; border:${v.roleTileBorder}; cursor:pointer;`) },
              h('div', { style: css('margin-bottom:6px;'), dangerouslySetInnerHTML: { __html: ICON_ROLE_20 } }),
              h('div', { style: css(`font-family:'Cinzel',serif; font-weight:700; font-size:13px; color:${v.roleTileColor};`) }, 'Role Mode'),
              h('div', { style: css(`font-family:'Archivo',sans-serif; font-size:10px; color:${v.roleTileSubColor}; margin-top:2px; line-height:1.35;`) }, 'Roles and words assigned, Jester flies blind')
            ),
            h('div', { onClick: v.setWordMode, className: 'imp-btn', style: css(`padding:13px 14px; border-radius:12px; background:${v.wordTileBg}; border:${v.wordTileBorder}; cursor:pointer;`) },
              h('div', { style: css('margin-bottom:6px;'), dangerouslySetInnerHTML: { __html: ICON_WORD } }),
              h('div', { style: css(`font-family:'Cinzel',serif; font-weight:700; font-size:13px; color:${v.wordTileColor};`) }, 'Word Mode'),
              h('div', { style: css(`font-family:'Archivo',sans-serif; font-size:10px; color:${v.wordTileSubColor}; margin-top:2px; line-height:1.35;`) }, 'Everyone gets the word but the Jester')
            )
          ),
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.28em; text-transform:uppercase; color:var(--m-label); margin-bottom:10px;") }, 'Game Settings'),
          h('div', { style: css('display:flex; flex-direction:column; gap:8px; margin-bottom:8px;') },
            this.settingsRow({ onClick: v.openPlayers, iconBg: 'var(--m-border-med)', icon: ICON_PLAYERS, label: 'Players', value: `${v.playerCount} Players` }),
            this.settingsRow({ onClick: v.openCategories, iconBg: 'var(--m-border-med)', icon: ICON_CATEGORIES_20, label: 'Categories', value: v.catSummary }),
            this.settingsRow({ onClick: v.openJesters, iconBg: 'rgba(178,32,47,.2)', icon: ICON_JESTERS_20, label: 'Jesters', value: v.jesterLabel }),
            this.settingsRow({ onClick: v.openTime, iconBg: 'rgba(46,91,176,.2)', icon: ICON_TIME, label: 'Time Limit', value: v.timeLimitRow }),
            this.settingsRow({ onClick: v.openGameSettings, iconBg: 'var(--m-border-med)', icon: ICON_OPTIONS, label: 'Options', value: v.gameSettingsSummary })
          )
        ),
        h('div', { style: css('padding:12px 20px 28px; background:linear-gradient(0deg,var(--m-screen) 70%,transparent);') },
          h('div', { onClick: v.goReveal, className: 'imp-btn j-glow', style: css("padding:17px; text-align:center; background:var(--m-cta); color:var(--m-cta-text); font-family:'Cinzel',serif; font-weight:700; font-size:17px; letter-spacing:.08em; border-radius:12px; box-shadow:var(--m-cta-glow); cursor:pointer;") }, 'RAISE THE CURTAIN')
        ),
        v.hasModal && h('div', { style: css('position:absolute; inset:0; background:var(--m-backdrop); display:flex; flex-direction:column; justify-content:flex-end; animation:imp-backdrop .2s ease both;') },
          h('div', { onClick: v.closeModal, style: css('flex:1;') }),
          v.isModalCategories && this.categoriesModal(v),
          v.isModalJesters && this.jestersModal(v),
          v.isModalTime && this.timeModal(v),
          v.isModalHelp && this.helpModal(v),
          v.isModalGameSettings && this.gameSettingsModal(v),
          v.isModalSettings && this.settingsModal(v),
          v.isModalWordList && this.wordListModal(v),
          v.isModalCredits && this.creditsModal(v),
          v.isModalPlayers && this.playersModal(v)
        )
      );
    }

    playersModal(v) {
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); max-height:80vh; display:flex; flex-direction:column; animation:imp-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'The Cast'),
          h('div', { onClick: v.closeModal, style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('flex:1; overflow-y:auto; margin:0 -4px; padding:0 4px;') },
          h('div', { style: css('display:flex; flex-direction:column;') },
            v.playerItems.map((p, i) => h('div', {
              key: p.pid,
              style: css(`display:grid; grid-template-rows:${p.removing ? '0fr' : '1fr'}; opacity:${p.removing ? 0 : 1}; margin-bottom:${p.removing ? '0px' : '8px'}; overflow:hidden; transition:grid-template-rows .28s ease, opacity .22s ease, margin-bottom .28s ease; pointer-events:${p.removing ? 'none' : 'auto'};`)
            },
              h('div', { style: css('overflow:hidden; min-height:0;') },
                h('div', { style: css('display:flex; align-items:center; gap:12px; padding:10px 14px; background:var(--m-lift); border-radius:14px; border:1px solid var(--m-border-med); animation:imp-rise .25s ease both;') },
                  h('div', { style: css('flex:none; width:40px; height:40px; border-radius:50%; background:var(--m-avatar-bg); border:1px solid var(--m-border-strong); display:flex; align-items:center; justify-content:center;') },
                    h(Mask, { comedy: p.comedy, tragedy: p.tragedy, cracked: false, faceColor: p.face, lineColor: p.line, size: 26, hat: v.jesterMode })
                  ),
                  p.editing
                    ? h('input', { onChange: p.onEditChange, onKeyDown: p.onEditKeyDown, onBlur: p.onEditBlur, value: p.editVal, style: css("flex:1; padding:6px 10px; background:var(--m-lift-strong); border:1px solid var(--m-accent); border-radius:8px; color:var(--m-text); font-family:'EB Garamond',serif; font-size:17px; outline:none;") })
                    : h('div', { onClick: p.onEditTap, style: css("flex:1; font-family:'EB Garamond',serif; font-size:17px; color:var(--m-text); cursor:text; padding:6px 2px;") }, p.name),
                  h('div', { onClick: p.onRemove, className: 'imp-btn', style: css('width:30px; height:30px; border-radius:50%; background:rgba(178,32,47,.2); border:1px solid rgba(178,32,47,.35); display:flex; align-items:center; justify-content:center; font-size:16px; color:#e6a0a8; cursor:pointer; line-height:1; flex:none;') }, '×')
                )
              )
            ))
          )
        ),
        h('div', { style: css('padding-top:14px;') },
          v.addingPlayer
            ? h('div', { style: css('display:flex; gap:8px; align-items:center; animation:imp-rise .2s ease both;') },
                h('input', { onKeyDown: v.onNameKeyDown, onChange: v.onNameChange, value: v.newName, placeholder: 'Enter player name…', style: css("flex:1; padding:14px 16px; background:var(--m-lift-input); border:1px solid var(--m-accent); border-radius:12px; color:var(--m-text); font-family:'EB Garamond',serif; font-size:16px; outline:none;") }),
                h('div', { onClick: v.confirmAdd, className: 'imp-btn', style: css("padding:14px 16px; background:var(--m-cta); border-radius:12px; color:var(--m-cta-text); font-family:'Cinzel',serif; font-weight:700; font-size:14px; cursor:pointer;") }, 'Add'),
                h('div', { onClick: v.cancelAdd, className: 'imp-btn', style: css('padding:14px 12px; color:#7c6a46; font-size:20px; cursor:pointer;') }, '×')
              )
            : h('div', { onClick: v.onAddTap, className: 'imp-btn', style: css('padding:16px; text-align:center; border:1.5px dashed rgba(200,162,76,.4); border-radius:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px;') },
                h('div', { style: css("font-size:22px; color:var(--m-accent); line-height:1; font-family:'EB Garamond',serif;") }, '+'),
                h('div', { style: css("font-family:'EB Garamond',serif; font-size:16px; color:var(--m-soft);") }, 'Add a player…')
              )
        )
      );
    }

    renderReveal(v) {
      return h('div', { style: css('position:absolute; inset:0; display:flex; flex-direction:column; background:var(--m-screen); animation:imp-slide-in .3s ease both;') },
        h('div', { style: css('height:24px;') }),
        h('div', { style: css('position:relative; text-align:center; padding:0 20px 18px;') },
          h('div', { onClick: v.backToLobby, className: 'imp-btn', style: css("position:absolute; left:0; top:0; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-family:'Cinzel',serif; font-size:22px; color:var(--m-accent); cursor:pointer; opacity:.8;") }, '‹'),
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:22px; color:var(--m-text);") }, 'Tap your name in secret'),
          h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:var(--m-muted); margin-top:4px;") }, 'Each player privately sees their role, then passes the phone.'),
          v.showCategory && h('div', { style: css('display:inline-flex; align-items:center; gap:8px; margin-top:12px; padding:7px 16px; border-radius:20px; border:1px solid var(--m-border-hard);') },
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label);") }, 'Category'),
            h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:14px; color:var(--m-brand);") }, v.gameCategory)
          )
        ),
        h('div', { style: css('flex:1; overflow-y:auto; padding:0 20px;') },
          h('div', { style: css('display:flex; flex-direction:column; gap:8px;') },
            v.actOnePlayers.map((p, i) => h('div', { key: i, onClick: p.onTap, className: 'imp-btn', style: css(`display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:14px; cursor:pointer; background:${p.rowBg}; border:${p.rowBorder};`) },
              h('div', { style: css('flex:none; width:44px; height:44px; border-radius:50%; background:var(--m-avatar-bg); display:flex; align-items:center; justify-content:center; border:1px solid var(--m-border-strong);') },
                h(Mask, { comedy: p.comedy, tragedy: p.tragedy, cracked: false, faceColor: p.face, lineColor: p.line, size: 30, hat: v.jesterMode })
              ),
              h('div', { style: css("flex:1; font-family:'Cinzel',serif; font-weight:600; font-size:17px; color:var(--m-text);") }, p.shortName),
              h('div', { style: css(`font-family:'Archivo',sans-serif; font-size:12px; color:${p.labelColor};`) }, p.label)
            ))
          ),
          h('div', { style: css('height:16px;') })
        ),
        h('div', { style: css('padding:12px 20px 28px;') },
          v.allSeen
            ? h('div', { onClick: v.goVoting, className: 'imp-btn j-glow', style: css("padding:17px; text-align:center; background:var(--m-cta); color:var(--m-cta-text); font-family:'Cinzel',serif; font-weight:700; font-size:17px; letter-spacing:.08em; border-radius:12px; box-shadow:var(--m-cta-glow); cursor:pointer; animation:imp-rise .4s ease both;") }, 'BEGIN THE TRIAL →')
            : h('div', { style: css("padding:17px; text-align:center; border:1px dashed var(--m-border-hard); color:var(--m-soft2); font-family:'Cinzel',serif; font-weight:700; font-size:15px; border-radius:12px;") }, 'ALL PLAYERS MUST TAP FIRST')
        ),
        v.showOverlay && h('div', { style: css('position:absolute; inset:0; background:var(--m-overlay); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:28px; animation:imp-fade-in .2s ease both;') },
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.35em; text-transform:uppercase; color:var(--m-accent); margin-bottom:6px;") }, 'Your Role'),
          h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:28px; color:var(--m-text-bright); margin-bottom:22px;") }, v.apName),
          h('div', { onClick: v.openCurtain, className: 'j-card', onPointerMove: this.__holoMove, onPointerLeave: this.__holoLeave, style: css('position:relative; width:240px; height:340px; border-radius:16px; cursor:pointer; overflow:hidden; box-shadow:0 20px 56px rgba(0,0,0,.7); border:1px solid rgba(180,140,50,.45);') },
            h('div', { style: css('position:absolute; inset:0; background:var(--m-card-bg); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:28px; text-align:center;') },
              h('div', { style: css('display:flex; justify-content:center; margin-bottom:14px;') },
                h(Mask, { comedy: v.apComedy, tragedy: v.apTragedy, cracked: v.apIsUndisguisedJester, faceColor: v.apFace, lineColor: v.apLine, size: 60, hat: v.jesterMode })
              ),
              v.apIsUndisguisedJester && h(React.Fragment, null,
                h('div', { style: css(`font-family:'Archivo',sans-serif; font-size:11px; letter-spacing:.15em; text-transform:uppercase; text-decoration:underline; color:${v.apRoleColor};`) }, 'Role'),
                h('div', { style: css(`font-family:'Cinzel',serif; font-weight:800; font-size:${v.apRoleSize}; color:${v.apRoleColor}; letter-spacing:.04em; text-wrap:balance; margin-top:4px;`) }, v.apRole),
                v.apShowAllies && h('div', { style: css('margin-top:12px; padding:8px 12px; background:rgba(178,32,47,.15); border:1px solid rgba(178,32,47,.4); border-radius:8px; text-align:center;') },
                  h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:#b3202f; margin-bottom:3px;") }, 'Your Fellow Jesters'),
                  h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:13px; color:#7a1620;") }, v.apJesterAllies)
                )
              ),
              v.apIsDisguisedJester && h(React.Fragment, null,
                h('div', { style: css(`font-family:'Archivo',sans-serif; font-size:11px; letter-spacing:.15em; text-transform:uppercase; text-decoration:underline; color:${v.apRoleColor};`) }, 'Role'),
                h('div', { style: css(`font-family:'Cinzel',serif; font-weight:800; font-size:${v.apRoleSize}; color:${v.apRoleColor}; letter-spacing:.04em; text-wrap:balance; margin-top:4px;`) }, v.apRole)
              ),
              v.apIsPerformer && h(React.Fragment, null,
                h('div', { style: css(v.apWordBlockStyle) },
                  h('div', { style: css("font-family:'Archivo',sans-serif; font-size:11px; letter-spacing:.15em; text-transform:uppercase; text-decoration:underline; color:#14254a;") }, v.apWordLabel),
                  h('div', { style: css(`font-family:'Cinzel',serif; font-weight:700; font-size:${v.apWordSize}; color:#14254a; text-wrap:balance; margin-top:4px;`) }, v.apWord)
                ),
                v.showRoleHeading && h(React.Fragment, null,
                  h('div', { style: css(`font-family:'Archivo',sans-serif; font-size:11px; letter-spacing:.15em; text-transform:uppercase; text-decoration:underline; color:${v.apRoleColor}; margin-top:12px;`) }, 'Role'),
                  h('div', { style: css(`font-family:'Cinzel',serif; font-weight:800; font-size:${v.apRoleSize}; color:${v.apRoleColor}; letter-spacing:.04em; text-wrap:balance; margin-top:4px;`) }, v.apRole)
                )
              )
            ),
            v.jesterMode && h('div', { className: 'j-holo' }),
            h('div', { style: v.leftCurtain },
              h('div', { style: css('width:3px; height:84%; background:linear-gradient(180deg,transparent,#e6cb7e,transparent); opacity:.55;') })
            ),
            h('div', { style: v.rightCurtain },
              h('div', { style: css('width:3px; height:84%; background:linear-gradient(180deg,transparent,#e6cb7e,transparent); opacity:.55;') })
            ),
            h('div', { style: css("position:absolute; top:12px; left:0; right:0; text-align:center; font-family:'Cinzel',serif; font-size:12px; letter-spacing:.2em; color:#e6cb7e; pointer-events:none;") }, v.curtainHint)
          ),
          v.cardOpen
            ? h('div', { onClick: v.closeOverlay, style: css("margin-top:22px; padding:14px 32px; background:var(--m-lift-med); border:1px solid rgba(200,162,76,.4); color:var(--m-text-title); font-family:'Cinzel',serif; font-weight:700; font-size:14px; letter-spacing:.06em; border-radius:10px; cursor:pointer; animation:imp-rise .35s ease both;") }, 'GOT IT')
            : h('div', { style: css("margin-top:18px; font-family:'EB Garamond',serif; font-size:14px; color:var(--m-accent);") }, 'Tap the curtain to reveal')
        )
      );
    }

    renderVoting(v) {
      const steps = [
        { badge: '#2e5bb0', bg: 'linear-gradient(135deg,#14254a,#0d1a38)', border: 'rgba(46,91,176,.35)', num: '1', numColor: '#fff', icon: ICON_STEP1, title: 'Opening Statements', body: v.starterName + ' opens the round and asks a question to someone else.' },
        { badge: '#7a1620', bg: 'linear-gradient(135deg,#4d0e14,#380a0f)', border: 'rgba(122,22,32,.5)', num: '2', numColor: 'var(--m-text-title)', icon: ICON_STEP2, title: 'Drop Clues', body: 'Each player asks a question to another player who then gets to ask the next question.' },
        { badge: 'var(--m-accent)', bg: 'linear-gradient(135deg,#3a2a0a,#2a1e06)', border: 'var(--m-border-strong)', num: '3', numColor: '#1a0e02', icon: ICON_STEP3, title: 'Cast Your Vote', body: 'After everyone agrees or the timer runs out, begin discussion or point to the jester.' },
        { badge: '#b3202f', bg: 'linear-gradient(135deg,#5c1117,#3c0a10)', border: 'rgba(178,32,47,.4)', num: '4', numColor: '#fff', icon: ICON_STEP4, title: 'Unmask the Jester', body: 'When ready, tap below to reveal who the jester really was.', panelBg: 'rgba(178,32,47,.08)' },
      ];
      return h('div', { style: css('position:absolute; inset:0; display:flex; flex-direction:column; background:var(--m-screen); animation:imp-slide-in .3s ease both;') },
        h('div', { style: css('height:24px;') }),
        h('div', { style: css('position:relative; text-align:center; padding:0 20px 18px;') },
          h('div', { onClick: v.backToReveal, className: 'imp-btn', style: css("position:absolute; left:0; top:0; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-family:'Cinzel',serif; font-size:22px; color:var(--m-accent); cursor:pointer; opacity:.8;") }, '‹'),
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:22px; color:var(--m-text);") }, 'The Trial'),
          h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:var(--m-muted); margin-top:4px;") }, 'Debate, accuse, unmask the jester.')
        ),
        h('div', { style: css('flex:1; overflow-y:auto; padding:0 20px; display:flex; flex-direction:column;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:16px; color:var(--m-text-title); margin-bottom:14px;") }, 'How It Works'),
          h('div', { style: css('display:flex; flex-direction:column; gap:10px; margin-bottom:22px;') },
            steps.map((s, i) => h('div', { key: i, style: css(`display:flex; align-items:center; gap:14px; padding:16px; border-radius:14px; background:${s.panelBg || 'var(--m-lift)'}; border:1px solid ${s.border};`) },
              h('div', { style: css(`position:relative; flex:none; width:52px; height:52px; border-radius:12px; background:${s.bg}; display:flex; align-items:center; justify-content:center;`) },
                h('div', { style: css('display:flex; align-items:center; justify-content:center;'), dangerouslySetInnerHTML: { __html: s.icon } }),
                h('div', { style: css(`position:absolute; top:-6px; right:-6px; width:20px; height:20px; border-radius:50%; background:${s.badge}; font-family:'Cinzel',serif; font-weight:700; font-size:11px; color:${s.numColor}; display:flex; align-items:center; justify-content:center;`) }, s.num)
              ),
              h('div', {},
                h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:16px; color:var(--m-text);") }, s.title),
                h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:var(--m-muted); margin-top:2px;") }, s.body)
              )
            ))
          ),
          v.hasTimeLimit && h('div', { style: css('flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;') },
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.3em; text-transform:uppercase; color:var(--m-label);") }, 'Time Remaining'),
            h('div', { style: css(`font-family:'Cinzel Decorative',serif; font-weight:700; font-size:52px; color:${v.timerColor}; line-height:1.2;`) }, v.timerDisplay)
          )
        ),
        h('div', { style: css('padding:12px 20px 28px;') },
          h('div', { onClick: v.goResults, className: 'imp-btn j-glow', style: css("padding:17px; text-align:center; background:var(--m-cta); color:var(--m-cta-text); font-family:'Cinzel',serif; font-weight:700; font-size:17px; letter-spacing:.08em; border-radius:14px; box-shadow:var(--m-cta-glow); cursor:pointer;") }, 'REVEAL THE JESTER')
        ),
        v.showTimeUpPopup && h('div', { style: css('position:absolute; inset:0; background:var(--m-overlay-vote); display:flex; align-items:center; justify-content:center; padding:28px; animation:imp-fade-in .2s ease both;') },
          h('div', { style: css('background:var(--m-modal); border-radius:18px; padding:30px 26px; text-align:center; border:1px solid var(--m-border-hard); max-width:300px; animation:imp-rise .3s ease both;') },
            h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:24px; color:var(--m-brand);") }, 'Time to Vote!'),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:var(--m-help); margin-top:8px; line-height:1.4;") }, 'The clock has run out. Cast your votes and unmask the jester.'),
            h('div', { onClick: v.dismissTimeUp, className: 'imp-btn', style: css("margin-top:22px; padding:14px; background:var(--m-cta); color:var(--m-cta-text); font-family:'Cinzel',serif; font-weight:700; font-size:15px; letter-spacing:.05em; border-radius:10px; cursor:pointer;") }, 'GOT IT')
          )
        )
      );
    }

    renderResults(v) {
      return h('div', { style: css('position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; background:var(--m-results-bg); animation:imp-scale-in .35s ease both;') },
        v.jesterMode && h('div', { className: 'j-burst' },
          Array.from({ length: 14 }, (_, i) => h('span', {
            key: i,
            className: 'jb b' + (i % 4),
            style: { '--ang': (i * 25.7) + 'deg', '--dist': (90 + (i % 4) * 45) + 'px', animationDelay: (i * 0.035) + 's' },
          }, ['◆', '✦', '♦', '✧'][i % 4]))
        ),
        h('div', { style: css('height:24px;') }),
        h('div', { style: css('position:relative; width:100%; display:flex; justify-content:center; align-items:center; margin-bottom:2px;') },
          h('div', { onClick: v.backToLobby, style: css("position:absolute; left:20px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-family:'Cinzel',serif; font-size:22px; color:var(--m-accent); cursor:pointer; opacity:.8;") }, '‹'),
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.35em; text-transform:uppercase; color:var(--m-accent);") }, 'The Final Curtain')
        ),
        h('div', { style: css('flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:800; font-size:26px; color:var(--m-text-bright);") }, v.jesterRevealHeading),
          h('div', { style: css('margin-top:18px; animation:imp-float 5s ease-in-out infinite; position:relative;') },
            v.jesterMode && h('div', { className: 'j-rays' }),
            h(Mask, { comedy: !v.hasJester, tragedy: v.hasJester, cracked: v.hasJester, faceColor: v.ivoryFace, lineColor: v.hasJester ? v.crimson : v.wine, size: 120, hat: v.jesterMode })
          ),
          h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:34px; color:var(--m-brand); margin-top:14px;"), className: 'j-title' }, v.revealedName),
          h('div', { style: css('display:flex; gap:14px; margin-top:24px; padding:0 26px; width:100%; justify-content:center;') },
            h('div', { style: css('flex:1; max-width:140px; text-align:center; padding:14px 10px; border-radius:12px; background:rgba(46,91,176,.18); border:1px solid rgba(46,91,176,.4);') },
              h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; color:#9fb0cf;") }, 'ROUND CATEGORY'),
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:16px; color:#cfe0ff; margin-top:5px;") }, v.gameCategory)
            ),
            h('div', { style: css(v.roundWordBlockStyle) },
              h('div', { style: css('flex:1; max-width:140px; text-align:center; padding:14px 10px; border-radius:12px; background:rgba(178,32,47,.18); border:1px solid rgba(178,32,47,.45);') },
                h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; color:#e3a6ac;") }, 'ROUND WORD'),
                h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:16px; color:#f4c9cd; margin-top:5px;") }, v.roundWordDisplay)
              )
            )
          ),
          h('div', { style: css('margin-top:26px; padding:0 30px; text-align:center;') },
            v.caughtJester && h(React.Fragment, null,
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:20px; color:#9ad2a3;") }, 'The Cast wins! 🎉'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:15px; color:var(--m-results-sub); margin-top:6px;") }, 'You unmasked the jester before the curtain fell.')
            ),
            v.missedJester && h(React.Fragment, null,
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:20px; color:#e8a0a8;") }, 'The Jester escapes!'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:15px; color:var(--m-results-sub); margin-top:6px;") }, 'You accused the wrong performer. The jester takes a bow.')
            ),
            !v.hasJester && h(React.Fragment, null,
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:20px; color:#9ad2a3;") }, 'Every performer was genuine.'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:15px; color:var(--m-results-sub); margin-top:6px;") }, 'No one was pretending. This round had no jester.')
            )
          )
        ),
        h('div', { style: css('width:100%; padding:12px 20px 28px;') },
          h('div', { onClick: v.playAgain, className: 'imp-btn', style: css("padding:17px; text-align:center; background:var(--m-encore); color:var(--m-encore-text); font-family:'Cinzel',serif; font-weight:700; font-size:16px; letter-spacing:.05em; border-radius:10px; cursor:pointer;") }, 'ENCORE · PLAY AGAIN')
        )
      );
    }

    render() {
      const v = this.renderVals();
      const jester = this.state.jesterMode;
      const glyphs = ['◆', '✦', '♦', '✧'];
      return h('div', { style: css('width:100%; height:100dvh; background:radial-gradient(120% 70% at 50% -10%, var(--m-page-glow), transparent 60%), var(--m-page); display:flex; align-items:center; justify-content:center;') },
        jester && h('div', { className: 'jester-page-fx' }),
        h('div', { id: 'phone-shell', style: css('width:100%; max-width:480px; height:100%; max-height:900px; position:relative; overflow:hidden; background:var(--m-shell); box-shadow:var(--m-shell-shadow); transform-origin:center center;') },
          v.isLobby && this.renderLobby(v),
          v.isReveal && this.renderReveal(v),
          v.isVoting && this.renderVoting(v),
          v.isResults && this.renderResults(v),
          jester && h('div', { className: 'jester-fx' },
            Array.from({ length: 16 }, (_, i) => h('span', {
              key: i,
              className: 'jfx c' + (i % 4),
              style: {
                left: ((i * 61) % 97) + '%',
                animationDelay: (-i * 1.7) + 's',
                animationDuration: (9 + (i % 5) * 2.5) + 's',
                fontSize: (11 + ((i * 7) % 12)) + 'px',
              },
            }, glyphs[i % 4]))
          )
        )
      );
    }
  }

  const rootEl = document.getElementById('root');
  if (ReactDOM.createRoot) ReactDOM.createRoot(rootEl).render(h(App));
  else ReactDOM.render(h(App), rootEl);
})();
