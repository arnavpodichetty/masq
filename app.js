// Masquerade — plain React (no build step). Loaded after React/ReactDOM UMD
// and impfall-locations-data.js.
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

  // ---- static icon markup (no dynamic bindings, safe as raw SVG) ----
  const ICON_ROLE_20 = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><ellipse cx="9" cy="13" rx="6" ry="7" stroke="#e6cb7e" stroke-width="1.7"></ellipse><path d="M7 11 Q9 9 11 11" stroke="#e6cb7e" stroke-width="1.4" stroke-linecap="round"></path><path d="M7 15.5 Q9 18 11 15.5" stroke="#e6cb7e" stroke-width="1.4" stroke-linecap="round"></path><ellipse cx="17" cy="11" rx="5" ry="6" stroke="#caa64f" stroke-width="1.4" opacity=".6"></ellipse><path d="M15 9 Q17 7.5 19 9" stroke="#caa64f" stroke-width="1.2" stroke-linecap="round" opacity=".6"></path></svg>';
  const ICON_ROLE_18 = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><ellipse cx="9" cy="13" rx="6" ry="7" stroke="#e6cb7e" stroke-width="1.7"></ellipse><path d="M7 11 Q9 9 11 11" stroke="#e6cb7e" stroke-width="1.4" stroke-linecap="round"></path><path d="M7 15.5 Q9 18 11 15.5" stroke="#e6cb7e" stroke-width="1.4" stroke-linecap="round"></path><ellipse cx="17" cy="11" rx="5" ry="6" stroke="#caa64f" stroke-width="1.4" opacity=".6"></ellipse><path d="M15 9 Q17 7.5 19 9" stroke="#caa64f" stroke-width="1.2" stroke-linecap="round" opacity=".6"></path></svg>';
  const ICON_WORD = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><rect x="4" y="3" width="16" height="18" rx="3" stroke="#e6cb7e" stroke-width="1.7"></rect><path d="M8 8 L16 8 M8 12 L16 12 M8 16 L12 16" stroke="#e6cb7e" stroke-width="1.4" stroke-linecap="round"></path><path d="M14 15 L18 19 M16 15 L18 17" stroke="#caa64f" stroke-width="1.3" stroke-linecap="round" opacity=".7"></path></svg>';
  const ICON_PLAYERS = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><circle cx="8" cy="8" r="4" stroke="#caa64f" stroke-width="1.8"></circle><circle cx="16" cy="8" r="4" stroke="#caa64f" stroke-width="1.8"></circle><path d="M2 20 C2 16 5 14 8 14 C10 14 12 14.8 13 16" stroke="#caa64f" stroke-width="1.8" stroke-linecap="round"></path><path d="M22 20 C22 16 19 14 16 14 C14 14 12 14.8 11 16" stroke="#caa64f" stroke-width="1.8" stroke-linecap="round"></path></svg>';
  const ICON_CATEGORIES_20 = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M4 5 L4 19 Q4 20 5 20 L19 20 Q20 20 20 19 L20 5 Q20 4 19 4 L5 4 Q4 4 4 5 Z" stroke="#caa64f" stroke-width="1.8"></path><path d="M8 8 L16 8 M8 12 L16 12 M8 16 L13 16" stroke="#caa64f" stroke-width="1.8" stroke-linecap="round"></path></svg>';
  const ICON_CATEGORIES_18 = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M4 5 L4 19 Q4 20 5 20 L19 20 Q20 20 20 19 L20 5 Q20 4 19 4 L5 4 Q4 4 4 5 Z" stroke="#caa64f" stroke-width="1.8"></path><path d="M8 8 L16 8 M8 12 L16 12 M8 16 L13 16" stroke="#caa64f" stroke-width="1.8" stroke-linecap="round"></path></svg>';
  const ICON_JESTERS_20 = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><ellipse cx="12" cy="13" rx="8" ry="9" stroke="#e6a0a8" stroke-width="1.8"></ellipse><path d="M9 10 Q10.5 8.5 12 10" stroke="#e6a0a8" stroke-width="1.5" stroke-linecap="round"></path><path d="M12 10 Q13.5 8.5 15 10" stroke="#e6a0a8" stroke-width="1.5" stroke-linecap="round"></path><path d="M9 16 Q12 20 15 16" stroke="#e6a0a8" stroke-width="1.5" stroke-linecap="round"></path><path d="M13 4 L11.5 9 L13.5 12 L11 16" stroke="#e6a0a8" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"></path></svg>';
  const ICON_JESTERS_18 = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><ellipse cx="12" cy="13" rx="8" ry="9" stroke="#e6a0a8" stroke-width="1.8"></ellipse><path d="M9 10 Q10.5 8.5 12 10" stroke="#e6a0a8" stroke-width="1.5" stroke-linecap="round"></path><path d="M12 10 Q13.5 8.5 15 10" stroke="#e6a0a8" stroke-width="1.5" stroke-linecap="round"></path><path d="M9 16 Q12 20 15 16" stroke="#e6a0a8" stroke-width="1.5" stroke-linecap="round"></path><path d="M13 4 L11.5 9 L13.5 12 L11 16" stroke="#e6a0a8" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"></path></svg>';
  const ICON_TIME = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M7 4 L17 4 L17 8 Q17 11 12 12 Q7 13 7 16 L7 20 L17 20 L17 16 Q17 13 12 12 Q7 11 7 8 Z" stroke="#9fb0cf" stroke-width="1.8" stroke-linejoin="round"></path><path d="M9 18 Q12 16 15 18" stroke="#9fb0cf" stroke-width="1.5" stroke-linecap="round"></path><path d="M9 6 Q12 7.5 15 6" stroke="#9fb0cf" stroke-width="1.5" stroke-linecap="round"></path></svg>';
  const ICON_OPTIONS = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="3" stroke="#caa64f" stroke-width="1.8"></circle><path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12 M4.93 4.93 L7.05 7.05 M16.95 16.95 L19.07 19.07 M19.07 4.93 L16.95 7.05 M7.05 16.95 L4.93 19.07" stroke="#caa64f" stroke-width="1.8" stroke-linecap="round"></path></svg>';
  const ICON_SHOW_WORD = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M3 12 C5.5 7.5 9 5 12 5 C15 5 18.5 7.5 21 12 C18.5 16.5 15 19 12 19 C9 19 5.5 16.5 3 12 Z" stroke="#9fb0cf" stroke-width="1.8"></path><circle cx="12" cy="12" r="2.5" stroke="#9fb0cf" stroke-width="1.4"></circle><path d="M5 19 L19 5" stroke="#9fb0cf" stroke-width="1.8" stroke-linecap="round"></path></svg>';
  const ICON_STEP1 = '<svg viewBox="0 0 32 32" width="28" height="28"><circle cx="16" cy="10" r="5" fill="none" stroke="#9fb0cf" stroke-width="2"></circle><path d="M11 14 L6 28 M21 14 L26 28 M8 28 L24 28" stroke="#9fb0cf" stroke-width="2" stroke-linecap="round"></path><path d="M13 18 L19 18" stroke="#e6cb7e" stroke-width="1.5" stroke-linecap="round"></path><path d="M12 22 L20 22" stroke="#e6cb7e" stroke-width="1.5" stroke-linecap="round"></path><circle cx="16" cy="10" r="2.5" fill="#e6cb7e"></circle></svg>';
  const ICON_STEP2 = '<svg viewBox="0 0 32 32" width="28" height="28"><ellipse cx="16" cy="15" rx="11" ry="12" fill="none" stroke="#e6a0a8" stroke-width="2"></ellipse><path d="M10 13 Q13 10 16 13" fill="none" stroke="#e6a0a8" stroke-width="1.8" stroke-linecap="round"></path><path d="M16 13 Q19 10 22 13" fill="none" stroke="#e6a0a8" stroke-width="1.8" stroke-linecap="round"></path><path d="M11 21 Q16 27 21 21" fill="none" stroke="#e6a0a8" stroke-width="2" stroke-linecap="round"></path></svg>';
  const ICON_STEP3 = '<svg viewBox="0 0 32 32" width="28" height="28"><path d="M16 6 L16 20" stroke="#e6cb7e" stroke-width="2.5" stroke-linecap="round"></path><path d="M10 14 L16 20 L22 14" fill="none" stroke="#e6cb7e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path><rect x="8" y="24" width="16" height="3" rx="1.5" fill="#e6cb7e" opacity="0.5"></rect></svg>';
  const ICON_STEP4 = '<svg viewBox="0 0 32 32" width="28" height="28"><ellipse cx="16" cy="15" rx="11" ry="12" fill="none" stroke="#f4a0a8" stroke-width="2"></ellipse><path d="M10 13 Q13 16 16 13" fill="none" stroke="#f4a0a8" stroke-width="1.8" stroke-linecap="round"></path><path d="M16 13 Q19 16 22 13" fill="none" stroke="#f4a0a8" stroke-width="1.8" stroke-linecap="round"></path><path d="M11 23 Q16 17 21 23" fill="none" stroke="#f4a0a8" stroke-width="2" stroke-linecap="round"></path><path d="M23 6 L26 3 M26 3 L29 6 M26 3 L26 8" stroke="#f4a0a8" stroke-width="1.5" stroke-linecap="round"></path></svg>';

  // ---- Mask (was Mask.dc.html, imported via dc-import) ----
  function Mask({ comedy, tragedy, cracked, faceColor, lineColor, size }) {
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
      )
    );
  }

  // ---- App: game state + logic (ported ~verbatim from the DC script) ----
  class App extends React.Component {
    state = {
      screen: 'lobby', vote: null, viewed: {}, activePlayer: null, cardOpen: false, gameMode: 'roles',
      modal: null,
      playerList: ['Arnav', 'Esha', 'Richard'],
      addingPlayer: false, newName: '', editingIdx: null, editingVal: '',
      jesterCount: 1, jesterRandMin: 1, jesterRandMax: 3, randJesters: false, showCategory: true, showWord: true, jestersKnow: false, jesterGetsRole: false,
      timeLimit: 5,
      categories: ['Locations', 'Biomes', 'Historical Eras', 'Movie Genres'],
      wordCategories: ['Food', 'Animals', 'Objects', 'Movies'],
      selCategories: ['Locations', 'Biomes', 'Historical Eras', 'Movie Genres', 'Food', 'Animals', 'Objects', 'Movies'],
      roundJesterIndices: null,
      roundStarterIdx: null,
      roundCategory: 'Locations',
      roundWord: '',
      roundRoleMap: {},
      roundJesterRoleMap: {},
      roundJesterWordMap: {},
      secondsLeft: null,
      timeUp: false,
    };

    componentDidMount() {
      this.__fitPhoneShell = this.__fitPhoneShell.bind(this);
      this.__fitPhoneShell();
      window.addEventListener('resize', this.__fitPhoneShell);
    }

    componentWillUnmount() {
      this.__clearTimer();
      window.removeEventListener('resize', this.__fitPhoneShell);
    }

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

    __startTimer(minutes) {
      this.__clearTimer();
      if (!minutes) {
        this.setState({ secondsLeft: null, timeUp: false });
        return;
      }
      this.setState({ secondsLeft: minutes * 60, timeUp: false });
      this.__timerId = setInterval(() => {
        const left = (this.state.secondsLeft || 0) - 1;
        if (left <= 0) {
          this.__clearTimer();
          this.setState({ secondsLeft: 0, timeUp: true });
        } else {
          this.setState({ secondsLeft: left });
        }
      }, 1000);
    }

    renderVals() {
      const st = this.state;
      const wine = '#6e141c', crimson = '#b3202f', navy = '#14254a';
      const goldFace = '#e6cb7e', ivoryFace = '#efe4c8';

      const faceColors = ['#efe4c8', '#e7d9b6', '#e0cfa6', '#ecdfc0', '#e8ddb5', '#f0e6c9'];
      const lineColors = ['#7a1620', '#14254a', '#2e5bb0', '#6e141c', '#4a3010', '#7a1620'];
      const { biomeCatalog, locationCatalog, fakeLocationRoleCatalog, fakeBiomeRoleCatalog, historicalErasCatalog, fakeHistoricalErasRoleCatalog, movieCatalog, fakeMovieRoleCatalog, wordOnlyCatalog } = window.IMPFALL_LOCATIONS_DATA;
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
        tileBg: st.selCategories.includes(cat) ? 'linear-gradient(135deg,#7a1620,#4d0e14)' : 'rgba(255,255,255,.05)',
        tileBorder: st.selCategories.includes(cat) ? '1.5px solid #caa64f' : '1px solid rgba(200,162,76,.15)',
        color: st.selCategories.includes(cat) ? '#f0e6c9' : '#8a9ab8',
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
          tileBg: selected ? 'rgba(230,203,126,.16)' : 'rgba(255,255,255,.04)',
          tileBorder: selected ? '2px solid #e6cb7e' : '1px solid rgba(200,162,76,.2)',
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
          rowBg: seen ? 'rgba(144,200,144,.07)' : 'rgba(255,255,255,.05)',
          rowBorder: seen ? '1px solid rgba(144,200,144,.3)' : '1px solid rgba(200,162,76,.15)',
          labelColor: seen ? '#7fcf8a' : '#caa64f',
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
        apRoleColor: apIsUndisguisedJester ? '#b3202f' : (isBiomeRound ? '#2e5bb0' : (isHistoricalRound ? '#b5893c' : (isMovieRound ? '#2f8f7a' : '#caa64f'))),
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
            : 'Give clues that prove you know the word — without giving it away to the Jester.',
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
        leftCurtain: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '50.5%', background: 'repeating-linear-gradient(90deg,#6e141c 0 12px,#56101a 12px 22px)', boxShadow: 'inset -16px 0 30px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', transform: st.cardOpen ? 'translateX(-104%)' : 'translateX(0)', transition: 'transform 1.1s cubic-bezier(.7,0,.18,1)' },
        rightCurtain: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '50.5%', background: 'repeating-linear-gradient(90deg,#56101a 0 12px,#6e141c 12px 22px)', boxShadow: 'inset 16px 0 30px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', transform: st.cardOpen ? 'translateX(104%)' : 'translateX(0)', transition: 'transform 1.1s cubic-bezier(.7,0,.18,1)' },
        curtainHint: st.cardOpen ? '' : 'TAP TO REVEAL',
        modal: st.modal,
        hasModal: !!st.modal,
        isModalCategories: st.modal === 'categories',
        isModalJesters: st.modal === 'jesters',
        isModalTime: st.modal === 'time',
        isModalHelp: st.modal === 'help',
        isModalSettings: st.modal === 'settings',
        isModalGameSettings: st.modal === 'gameSettings',
        closeModal: () => this.setState({ modal: null }),
        openPlayers: () => this.setState({ screen: 'players' }),
        openCategories: () => this.setState({ modal: 'categories' }),
        openJesters: () => this.setState({ modal: 'jesters' }),
        openTime: () => this.setState({ modal: 'time' }),
        openHelp: () => this.setState({ modal: 'help' }),
        openSettings: () => this.setState({ modal: 'settings' }),
        openGameSettings: () => this.setState({ modal: 'gameSettings' }),
        gameSettingsSummary: [st.showCategory ? 'Show Category' : null, st.showWord ? 'Show Word' : 'Word Hidden', st.jestersKnow ? 'Jesters Know Each Other' : null, st.jesterGetsRole ? (st.gameMode === 'words' ? 'Jester Gets Word' : 'Jester Gets Role') : null].filter(Boolean).join(' · ') || 'Default',
        playerItems: st.playerList.map((name, i) => {
          const editing = st.editingIdx === i;
          const p = players[i] || players[0];
          return {
            name, i, editing, notEditing: !editing,
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
              const pl = st.playerList.filter((_, j) => j !== i);
              this.setState({ playerList: pl, editingIdx: null });
            },
          };
        }),
        addingPlayer: st.addingPlayer, notAddingPlayer: !st.addingPlayer,
        newName: st.newName,
        onAddTap: () => this.setState({ addingPlayer: true }),
        onNameChange: (e) => this.setState({ newName: e.target.value }),
        onNameKeyDown: (e) => {
          if (e.key === 'Enter' && st.newName.trim()) {
            this.setState({ playerList: [...st.playerList, st.newName.trim()], newName: '', addingPlayer: false });
          }
        },
        confirmAdd: () => {
          if (st.newName.trim()) this.setState({ playerList: [...st.playerList, st.newName.trim()], newName: '', addingPlayer: false });
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
        randJestersBg: st.randJesters ? '#b3202f' : 'rgba(255,255,255,.12)',
        randJestersThumb: st.randJesters ? 'translateX(22px)' : 'translateX(2px)',
        toggleRandJesters: () => this.setState({ randJesters: !st.randJesters }),
        showCategory: st.showCategory,
        showCatBg: st.showCategory ? '#b3202f' : 'rgba(255,255,255,.12)',
        showCatThumb: st.showCategory ? 'translateX(22px)' : 'translateX(2px)',
        toggleShowCat: () => this.setState({ showCategory: !st.showCategory }),
        showWord: st.gameMode === 'words' ? true : st.showWord,
        showWordBg: (st.gameMode === 'words' || st.showWord) ? '#b3202f' : 'rgba(255,255,255,.12)',
        showWordThumb: (st.gameMode === 'words' || st.showWord) ? 'translateX(22px)' : 'translateX(2px)',
        showWordToggleOpacity: st.gameMode === 'words' ? '.55' : '1',
        showWordTogglePointerEvents: st.gameMode === 'words' ? 'none' : 'auto',
        toggleShowWord: () => {
          if (st.gameMode === 'words') return;
          this.setState({ showWord: !st.showWord });
        },
        jestersKnow: st.jestersKnow,
        jestersKnowBg: st.jestersKnow ? '#b3202f' : 'rgba(255,255,255,.12)',
        jestersKnowThumb: st.jestersKnow ? 'translateX(22px)' : 'translateX(2px)',
        toggleJestersKnow: () => this.setState({ jestersKnow: !st.jestersKnow }),
        jesterGetsRole: st.jesterGetsRole,
        jesterGetsRoleLabel: st.gameMode === 'words' ? 'Jester Gets Word' : 'Jester Gets Role',
        jesterGetsRoleDesc: st.gameMode === 'words' ? 'The Jester is handed a similar but fake word instead of being told they’re the Jester' : 'The Jester is handed a normal-looking fake role instead of being told they’re the Jester',
        jesterGetsRoleBg: st.jesterGetsRole ? '#b3202f' : 'rgba(255,255,255,.12)',
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
        timerColor: st.secondsLeft !== null && st.secondsLeft <= 30 ? '#e8a0a8' : '#f0e6c9',
        playerNames: st.playerList.join(', '),
        playerCount: st.playerList.length,
        isLobby: st.screen === 'lobby',
        isPlayers: st.screen === 'players',
        isReveal: st.screen === 'reveal',
        isVoting: st.screen === 'voting',
        isResults: st.screen === 'results',
        backToLobbyFromPlayers: () => this.setState({ screen: 'lobby' }),
        gameMode: st.gameMode,
        isWordsMode: st.gameMode === 'words',
        showRoleHeading: st.gameMode !== 'words',
        setRoleMode: () => {
          const nextSel = st.selCategories.filter(c => !st.wordCategories.includes(c));
          this.setState({ gameMode: 'roles', selCategories: nextSel.length ? nextSel : st.categories });
        },
        setWordMode: () => this.setState({ gameMode: 'words', showWord: true }),
        roleTileBg: st.gameMode === 'roles' ? 'linear-gradient(135deg,#7a1620,#4d0e14)' : 'rgba(255,255,255,.04)',
        roleTileBorder: st.gameMode === 'roles' ? '1.5px solid #caa64f' : '1px solid rgba(255,255,255,.08)',
        roleTileColor: st.gameMode === 'roles' ? '#f0e6c9' : '#8a9ab8',
        roleTileSubColor: st.gameMode === 'roles' ? '#c6a96e' : '#5f6c86',
        wordTileBg: st.gameMode === 'words' ? 'linear-gradient(135deg,#7a1620,#4d0e14)' : 'rgba(255,255,255,.04)',
        wordTileBorder: st.gameMode === 'words' ? '1.5px solid #caa64f' : '1px solid rgba(255,255,255,.08)',
        wordTileColor: st.gameMode === 'words' ? '#f0e6c9' : '#8a9ab8',
        wordTileSubColor: st.gameMode === 'words' ? '#c6a96e' : '#5f6c86',
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
      return h('div', { onClick, className: 'imp-btn', style: css('display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:12px; background:rgba(255,255,255,.05); border:1px solid rgba(200,162,76,.12); cursor:pointer;') },
        h('div', { style: css(`width:34px; height:34px; border-radius:9px; background:${iconBg}; display:flex; align-items:center; justify-content:center; flex:none;`), dangerouslySetInnerHTML: { __html: icon } }),
        h('div', { style: css('flex:1;') },
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.15em; text-transform:uppercase; color:#9b8a63;") }, label),
          h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:#ddd0b0; margin-top:1px;") }, value)
        ),
        h('div', { style: css('color:#5a6a84; font-size:18px;') }, '›')
      );
    }

    categoriesModal(v) {
      return h('div', { style: css('background:#16101a; border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid rgba(200,162,76,.25); animation:imp-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:#f0e6c9;") }, 'Categories'),
          h('div', { onClick: v.closeModal, style: css("font-family:'Archivo',sans-serif; font-size:22px; color:#9b8a63; cursor:pointer;") }, '×')
        ),
        h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:#9b8a63; margin-bottom:8px;") }, 'Role Categories'),
        h('div', { style: css('display:grid; grid-template-columns:1fr 1fr; gap:8px;') },
          v.categoryItems.map((c, i) => h('div', { key: i, onClick: c.onToggle, style: css(`padding:14px 12px; border-radius:12px; cursor:pointer; text-align:center; background:${c.tileBg}; border:${c.tileBorder};`) },
            h('div', { style: css(`font-family:'Cinzel',serif; font-weight:600; font-size:14px; color:${c.color};`) }, c.cat)
          ))
        ),
        v.isWordsMode && h(React.Fragment, null,
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:#9b8a63; margin:18px 0 8px;") }, 'Word Categories'),
          h('div', { style: css('display:grid; grid-template-columns:1fr 1fr; gap:8px;') },
            v.wordCategoryItems.map((c, i) => h('div', { key: i, onClick: c.onToggle, style: css(`padding:14px 12px; border-radius:12px; cursor:pointer; text-align:center; background:${c.tileBg}; border:${c.tileBorder};`) },
              h('div', { style: css(`font-family:'Cinzel',serif; font-weight:600; font-size:14px; color:${c.color};`) }, c.cat)
            ))
          )
        )
      );
    }

    jestersModal(v) {
      return h('div', { style: css('background:#16101a; border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid rgba(200,162,76,.25); animation:imp-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:24px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:#f0e6c9;") }, 'Number of Jesters'),
          h('div', { onClick: v.closeModal, style: css("font-family:'Archivo',sans-serif; font-size:22px; color:#9b8a63; cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; align-items:center; justify-content:center; gap:32px;') },
          h('div', { onClick: v.decJester, style: css('width:52px; height:52px; border-radius:50%; background:rgba(255,255,255,.08); border:1px solid rgba(200,162,76,.3); display:flex; align-items:center; justify-content:center; font-size:26px; color:#caa64f; cursor:pointer; line-height:1;') }, '−'),
          h('div', { style: css('text-align:center;') },
            h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:52px; color:#f0e6c9; line-height:1;") }, v.jesterCount),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:15px; color:#9b8a63; margin-top:4px;") }, v.jesterLabel)
          ),
          h('div', { onClick: v.incJester, style: css('width:52px; height:52px; border-radius:50%; background:rgba(178,32,47,.25); border:1px solid rgba(178,32,47,.5); display:flex; align-items:center; justify-content:center; font-size:26px; color:#f4a0a8; cursor:pointer; line-height:1;') }, '+')
        ),
        h('div', { style: css('display:flex; align-items:center; gap:12px; margin:20px 0 14px;') },
          h('div', { style: css('flex:1; height:1px; background:rgba(200,162,76,.15);') }),
          h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:#7a6a4a;") }, 'or randomize'),
          h('div', { style: css('flex:1; height:1px; background:rgba(200,162,76,.15);') })
        ),
        h('div', { onClick: v.toggleRandJesters, className: 'imp-btn', style: css('display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:12px; background:rgba(255,255,255,.04); border:1px solid rgba(200,162,76,.12); cursor:pointer; margin-bottom:14px;') },
          h('div', { style: css('flex:1;') },
            h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:#f0e6c9;") }, 'Random Count'),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:#8a9ab8; margin-top:2px;") }, 'Pick a random number of jesters each round')
          ),
          h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.randJestersBg}; transition:background .25s; flex:none;`) },
            h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.randJestersThumb}; transition:transform .25s;`) })
          )
        ),
        v.randJesters && h('div', { style: css('display:flex; align-items:center; justify-content:center; gap:18px; animation:imp-rise .2s ease both;') },
          h('div', { style: css('display:flex; flex-direction:column; align-items:center; gap:7px;') },
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:#9b8a63;") }, 'Min'),
            h('div', { style: css('display:flex; align-items:center; gap:9px;') },
              h('div', { onClick: v.decRandMin, className: 'imp-btn', style: css('width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,.07); border:1px solid rgba(200,162,76,.25); display:flex; align-items:center; justify-content:center; font-size:17px; color:#caa64f; cursor:pointer; line-height:1;') }, '−'),
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:26px; color:#f0e6c9; min-width:28px; text-align:center; line-height:1;") }, v.jesterRandMin),
              h('div', { onClick: v.incRandMin, className: 'imp-btn', style: css('width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,.07); border:1px solid rgba(200,162,76,.25); display:flex; align-items:center; justify-content:center; font-size:17px; color:#caa64f; cursor:pointer; line-height:1;') }, '+')
            )
          ),
          h('div', { style: css("font-family:'Cinzel',serif; font-size:16px; color:#5a4a2a; padding-top:20px;") }, '→'),
          h('div', { style: css('display:flex; flex-direction:column; align-items:center; gap:7px;') },
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:#9b8a63;") }, 'Max'),
            h('div', { style: css('display:flex; align-items:center; gap:9px;') },
              h('div', { onClick: v.decRandMax, className: 'imp-btn', style: css('width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,.07); border:1px solid rgba(200,162,76,.25); display:flex; align-items:center; justify-content:center; font-size:17px; color:#caa64f; cursor:pointer; line-height:1;') }, '−'),
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:26px; color:#f0e6c9; min-width:28px; text-align:center; line-height:1;") }, v.jesterRandMax),
              h('div', { onClick: v.incRandMax, className: 'imp-btn', style: css('width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,.07); border:1px solid rgba(200,162,76,.25); display:flex; align-items:center; justify-content:center; font-size:17px; color:#caa64f; cursor:pointer; line-height:1;') }, '+')
            )
          )
        )
      );
    }

    timeModal(v) {
      return h('div', { style: css('background:#16101a; border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid rgba(200,162,76,.25); animation:imp-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:#f0e6c9;") }, 'Time Limit'),
          h('div', { onClick: v.closeModal, style: css("font-family:'Archivo',sans-serif; font-size:22px; color:#9b8a63; cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; align-items:center; justify-content:center; gap:32px; padding:10px 0 6px;') },
          h('div', { onClick: v.decTime, style: css('width:52px; height:52px; border-radius:50%; background:rgba(255,255,255,.08); border:1px solid rgba(200,162,76,.3); display:flex; align-items:center; justify-content:center; font-size:26px; color:#caa64f; cursor:pointer; line-height:1;') }, '−'),
          h('div', { style: css('text-align:center; min-width:100px;') },
            h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:52px; color:#f0e6c9; line-height:1;") }, v.timeLimitDisplay),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:15px; color:#9b8a63; margin-top:4px;") }, v.timeLimitUnit)
          ),
          h('div', { onClick: v.incTime, style: css('width:52px; height:52px; border-radius:50%; background:rgba(178,32,47,.25); border:1px solid rgba(178,32,47,.5); display:flex; align-items:center; justify-content:center; font-size:26px; color:#f4a0a8; cursor:pointer; line-height:1;') }, '+')
        )
      );
    }

    helpModal(v) {
      const cards = [
        { border: '#caa64f', title: 'The Setup', body: 'Add your players, then choose from Role Categories (Locations, Biomes, Historical Eras, Movie Genres) or Word Categories (Food, Animals, Objects, Movies). Each round picks one category — role categories give the Jester a different role, word categories just hide the shared word.' },
        { border: '#7a1620', title: 'The Modes', body: 'Role Mode shows each player a role for the chosen word. Word Mode hides the role label and shows only the shared word for everyone except the Jester.' },
        { border: '#14254a', title: 'The Clues', body: 'Take turns saying one clue related to the secret word, location, or biome. Be clear enough to seem informed, but not so clear that you give it away.' },
        { border: '#2e5bb0', title: 'The Trial', body: 'Discuss and vote. If the group picks the Jester correctly, the Cast wins. If not, the Jester escapes and wins. If the Jester is caught, they may still guess the word to steal the round.' },
      ];
      return h('div', { style: css('background:#16101a; border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid rgba(200,162,76,.25); max-height:80vh; overflow-y:auto; animation:imp-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:#f0e6c9;") }, 'How to Play'),
          h('div', { onClick: v.closeModal, style: css("font-family:'Archivo',sans-serif; font-size:22px; color:#9b8a63; cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; flex-direction:column; gap:14px;') },
          cards.map((c, i) => h('div', { key: i, style: css(`padding:14px; background:rgba(255,255,255,.04); border-radius:12px; border-left:3px solid ${c.border};`) },
            h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:14px; color:#e6cb7e; margin-bottom:4px;") }, c.title),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:#b9c6df; line-height:1.5;") }, c.body)
          ))
        )
      );
    }

    gameSettingsModal(v) {
      return h('div', { style: css('background:#16101a; border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid rgba(200,162,76,.25); animation:imp-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:#f0e6c9;") }, 'Game Options'),
          h('div', { onClick: v.closeModal, className: 'imp-btn', style: css("font-family:'Archivo',sans-serif; font-size:22px; color:#9b8a63; cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; flex-direction:column; gap:0; border-radius:14px; overflow:hidden; border:1px solid rgba(200,162,76,.12);') },
          h('div', { onClick: v.toggleShowCat, style: css('display:flex; align-items:center; gap:14px; padding:16px; background:rgba(255,255,255,.04); border-bottom:1px solid rgba(200,162,76,.08); cursor:pointer;') },
            h('div', { style: css('flex:none; width:38px; height:38px; border-radius:10px; background:rgba(200,162,76,.15); display:flex; align-items:center; justify-content:center;'), dangerouslySetInnerHTML: { __html: ICON_CATEGORIES_18 } }),
            h('div', { style: css('flex:1;') },
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:#f0e6c9;") }, 'Show Category'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:#8a9ab8; margin-top:2px;") }, 'Players can see the category of the secret word')
            ),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.showCatBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.showCatThumb}; transition:transform .25s;`) })
            )
          ),
          h('div', { onClick: v.toggleJestersKnow, style: css('display:flex; align-items:center; gap:14px; padding:16px; background:rgba(255,255,255,.04); border-bottom:1px solid rgba(200,162,76,.08); cursor:pointer;') },
            h('div', { style: css('flex:none; width:38px; height:38px; border-radius:10px; background:rgba(178,32,47,.2); display:flex; align-items:center; justify-content:center;'), dangerouslySetInnerHTML: { __html: ICON_JESTERS_18 } }),
            h('div', { style: css('flex:1;') },
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:#f0e6c9;") }, 'Jesters Know Each Other'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:#8a9ab8; margin-top:2px;") }, 'Jesters can see their fellow jesters')
            ),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.jestersKnowBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.jestersKnowThumb}; transition:transform .25s;`) })
            )
          ),
          h('div', { onClick: v.toggleShowWord, style: css(`display:flex; align-items:center; gap:14px; padding:16px; background:rgba(255,255,255,.04); border-bottom:1px solid rgba(200,162,76,.08); cursor:pointer; opacity:${v.showWordToggleOpacity}; pointer-events:${v.showWordTogglePointerEvents};`) },
            h('div', { style: css('flex:none; width:38px; height:38px; border-radius:10px; background:rgba(46,91,176,.18); display:flex; align-items:center; justify-content:center;'), dangerouslySetInnerHTML: { __html: ICON_SHOW_WORD } }),
            h('div', { style: css('flex:1;') },
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:#f0e6c9;") }, 'Show Word'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:#8a9ab8; margin-top:2px;") }, 'Players can see the word and their role')
            ),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.showWordBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.showWordThumb}; transition:transform .25s;`) })
            )
          ),
          h('div', { onClick: v.toggleJesterGetsRole, style: css(`display:flex; align-items:center; gap:14px; padding:16px; background:rgba(255,255,255,.04); cursor:pointer; opacity:${v.jesterGetsRoleToggleOpacity}; pointer-events:${v.jesterGetsRoleTogglePointerEvents};`) },
            h('div', { style: css('flex:none; width:38px; height:38px; border-radius:10px; background:rgba(200,162,76,.15); display:flex; align-items:center; justify-content:center;'), dangerouslySetInnerHTML: { __html: ICON_ROLE_18 } }),
            h('div', { style: css('flex:1;') },
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:#f0e6c9;") }, v.jesterGetsRoleLabel),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:#8a9ab8; margin-top:2px;") }, v.jesterGetsRoleDesc)
            ),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.jesterGetsRoleBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.jesterGetsRoleThumb}; transition:transform .25s;`) })
            )
          )
        )
      );
    }

    settingsModal(v) {
      return h('div', { style: css('background:#16101a; border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid rgba(200,162,76,.25); animation:imp-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:#f0e6c9;") }, 'Settings'),
          h('div', { onClick: v.closeModal, style: css("font-family:'Archivo',sans-serif; font-size:22px; color:#9b8a63; cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; flex-direction:column; gap:10px;') },
          h('div', { style: css('display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:rgba(255,255,255,.05); border-radius:12px;') },
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:16px; color:#ddd0b0;") }, 'Sound Effects'),
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:13px; color:#5a6a84;") }, 'Coming Soon')
          ),
          h('div', { style: css('display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:rgba(255,255,255,.05); border-radius:12px;') },
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:16px; color:#ddd0b0;") }, 'Dark Theme'),
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:13px; color:#5a6a84;") }, 'Coming Soon')
          ),
          h('div', { style: css('padding:14px 16px; background:rgba(255,255,255,.05); border-radius:12px; text-align:center;') },
            h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:16px; color:#e6cb7e;") }, 'MASQUERADE'),
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:11px; color:#5f6c86; margin-top:4px; letter-spacing:.06em;") }, 'VERSION 1.0')
          )
        )
      );
    }

    renderLobby(v) {
      return h('div', { style: css('position:absolute; inset:0; display:flex; flex-direction:column; background:#0e0810; animation:imp-fade-in .25s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; padding:28px 20px 14px;') },
          h('div', { onClick: v.openHelp, className: 'imp-btn', style: css("width:36px; height:36px; border-radius:10px; background:rgba(255,255,255,.07); border:1px solid rgba(200,162,76,.2); display:flex; align-items:center; justify-content:center; cursor:pointer; font-family:'Cinzel',serif; font-weight:700; font-size:17px; color:#caa64f;") }, '?'),
          h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:22px; color:#ecdfc0; letter-spacing:.04em;") }, 'MASQUERADE'),
          h('div', { onClick: v.openSettings, className: 'imp-btn', style: css('width:36px; height:36px; border-radius:10px; background:rgba(255,255,255,.07); border:1px solid rgba(200,162,76,.2); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:18px; color:#caa64f;') }, '⚙')
        ),
        h('div', { style: css('flex:1; overflow-y:auto; padding:0 18px 14px;') },
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.28em; text-transform:uppercase; color:#9b8a63; margin-bottom:10px;") }, 'Game Mode'),
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
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.28em; text-transform:uppercase; color:#9b8a63; margin-bottom:10px;") }, 'Game Settings'),
          h('div', { style: css('display:flex; flex-direction:column; gap:8px; margin-bottom:8px;') },
            this.settingsRow({ onClick: v.openPlayers, iconBg: 'rgba(200,162,76,.15)', icon: ICON_PLAYERS, label: 'Players', value: `${v.playerCount} Players` }),
            this.settingsRow({ onClick: v.openCategories, iconBg: 'rgba(200,162,76,.15)', icon: ICON_CATEGORIES_20, label: 'Categories', value: v.catSummary }),
            this.settingsRow({ onClick: v.openJesters, iconBg: 'rgba(178,32,47,.2)', icon: ICON_JESTERS_20, label: 'Jesters', value: v.jesterLabel }),
            this.settingsRow({ onClick: v.openTime, iconBg: 'rgba(46,91,176,.2)', icon: ICON_TIME, label: 'Time Limit', value: v.timeLimitRow }),
            this.settingsRow({ onClick: v.openGameSettings, iconBg: 'rgba(200,162,76,.15)', icon: ICON_OPTIONS, label: 'Options', value: v.gameSettingsSummary })
          )
        ),
        h('div', { style: css('padding:10px 18px 28px; background:linear-gradient(0deg,#0e0810 70%,transparent);') },
          h('div', { onClick: v.goReveal, className: 'imp-btn', style: css("padding:17px; text-align:center; background:linear-gradient(180deg,#b3202f,#7a1620); color:#f6ecd2; font-family:'Cinzel',serif; font-weight:700; font-size:17px; letter-spacing:.08em; border-radius:12px; box-shadow:0 8px 28px rgba(178,32,47,.4); cursor:pointer;") }, 'RAISE THE CURTAIN')
        ),
        v.hasModal && h('div', { style: css('position:absolute; inset:0; background:rgba(8,4,12,.7); display:flex; flex-direction:column; justify-content:flex-end; animation:imp-backdrop .2s ease both;') },
          h('div', { onClick: v.closeModal, style: css('flex:1;') }),
          v.isModalCategories && this.categoriesModal(v),
          v.isModalJesters && this.jestersModal(v),
          v.isModalTime && this.timeModal(v),
          v.isModalHelp && this.helpModal(v),
          v.isModalGameSettings && this.gameSettingsModal(v),
          v.isModalSettings && this.settingsModal(v)
        )
      );
    }

    renderPlayers(v) {
      return h('div', { style: css('position:absolute; inset:0; display:flex; flex-direction:column; background:#0e0810; animation:imp-slide-in .3s ease both;') },
        h('div', { style: css('height:24px;') }),
        h('div', { style: css('display:flex; align-items:center; gap:12px; padding:0 20px 18px;') },
          h('div', { onClick: v.backToLobbyFromPlayers, className: 'imp-btn', style: css("font-family:'Cinzel',serif; font-size:22px; color:#caa64f; cursor:pointer; flex:none;") }, '‹'),
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:22px; color:#f0e6c9;") }, 'The Cast')
        ),
        h('div', { style: css('flex:1; overflow-y:auto; padding:0 20px;') },
          h('div', { style: css('display:flex; flex-direction:column; gap:8px;') },
            v.playerItems.map((p, i) => h('div', { key: i, style: css('display:flex; align-items:center; gap:12px; padding:10px 14px; background:rgba(255,255,255,.05); border-radius:14px; border:1px solid rgba(200,162,76,.15); animation:imp-rise .25s ease both;') },
              h('div', { style: css('flex:none; width:40px; height:40px; border-radius:50%; background:rgba(0,0,0,.3); border:1px solid rgba(200,162,76,.25); display:flex; align-items:center; justify-content:center;') },
                h(Mask, { comedy: p.comedy, tragedy: p.tragedy, cracked: false, faceColor: p.face, lineColor: p.line, size: 26 })
              ),
              p.editing
                ? h('input', { onChange: p.onEditChange, onKeyDown: p.onEditKeyDown, onBlur: p.onEditBlur, value: p.editVal, style: css("flex:1; padding:6px 10px; background:rgba(255,255,255,.1); border:1px solid #caa64f; border-radius:8px; color:#f0e6c9; font-family:'EB Garamond',serif; font-size:17px; outline:none;") })
                : h('div', { onClick: p.onEditTap, style: css("flex:1; font-family:'EB Garamond',serif; font-size:17px; color:#f0e6c9; cursor:text; padding:6px 2px;") }, p.name),
              h('div', { onClick: p.onRemove, className: 'imp-btn', style: css('width:30px; height:30px; border-radius:50%; background:rgba(178,32,47,.2); border:1px solid rgba(178,32,47,.35); display:flex; align-items:center; justify-content:center; font-size:16px; color:#e6a0a8; cursor:pointer; line-height:1; flex:none;') }, '×')
            ))
          ),
          h('div', { style: css('height:16px;') })
        ),
        h('div', { style: css('padding:12px 20px 28px; background:linear-gradient(0deg,#0e0810 70%,transparent);') },
          v.addingPlayer
            ? h('div', { style: css('display:flex; gap:8px; align-items:center; animation:imp-rise .2s ease both;') },
                h('input', { onKeyDown: v.onNameKeyDown, onChange: v.onNameChange, value: v.newName, placeholder: 'Enter player name…', style: css("flex:1; padding:14px 16px; background:rgba(255,255,255,.08); border:1px solid #caa64f; border-radius:12px; color:#f0e6c9; font-family:'EB Garamond',serif; font-size:16px; outline:none;") }),
                h('div', { onClick: v.confirmAdd, className: 'imp-btn', style: css("padding:14px 16px; background:linear-gradient(180deg,#b3202f,#7a1620); border-radius:12px; color:#f6ecd2; font-family:'Cinzel',serif; font-weight:700; font-size:14px; cursor:pointer;") }, 'Add'),
                h('div', { onClick: v.cancelAdd, className: 'imp-btn', style: css('padding:14px 12px; color:#7c6a46; font-size:20px; cursor:pointer;') }, '×')
              )
            : h('div', { onClick: v.onAddTap, className: 'imp-btn', style: css('padding:16px; text-align:center; border:1.5px dashed rgba(200,162,76,.4); border-radius:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px;') },
                h('div', { style: css("font-size:22px; color:#caa64f; line-height:1; font-family:'EB Garamond',serif;") }, '+'),
                h('div', { style: css("font-family:'EB Garamond',serif; font-size:16px; color:#c6b489;") }, 'Add a player…')
              )
        )
      );
    }

    renderReveal(v) {
      return h('div', { style: css('position:absolute; inset:0; display:flex; flex-direction:column; background:#0e0810; animation:imp-slide-in .3s ease both;') },
        h('div', { style: css('height:24px;') }),
        h('div', { style: css('position:relative; text-align:center; padding:0 26px 18px;') },
          h('div', { onClick: v.backToLobby, className: 'imp-btn', style: css("position:absolute; left:0; top:0; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-family:'Cinzel',serif; font-size:22px; color:#caa64f; cursor:pointer; opacity:.8;") }, '‹'),
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:22px; color:#f0e6c9;") }, 'Tap your name in secret'),
          h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:#8a9ab8; margin-top:4px;") }, 'Each player privately sees their role, then passes the phone.'),
          v.showCategory && h('div', { style: css('display:inline-flex; align-items:center; gap:8px; margin-top:12px; padding:7px 16px; border-radius:20px; border:1px solid rgba(200,162,76,.3);') },
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:#9b8a63;") }, 'Category'),
            h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:14px; color:#e6cb7e;") }, v.gameCategory)
          )
        ),
        h('div', { style: css('flex:1; overflow-y:auto; padding:0 20px;') },
          h('div', { style: css('display:flex; flex-direction:column; gap:8px;') },
            v.actOnePlayers.map((p, i) => h('div', { key: i, onClick: p.onTap, className: 'imp-btn', style: css(`display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:14px; cursor:pointer; background:${p.rowBg}; border:${p.rowBorder};`) },
              h('div', { style: css('flex:none; width:44px; height:44px; border-radius:50%; background:rgba(0,0,0,.3); display:flex; align-items:center; justify-content:center; border:1px solid rgba(200,162,76,.25);') },
                h(Mask, { comedy: p.comedy, tragedy: p.tragedy, cracked: false, faceColor: p.face, lineColor: p.line, size: 30 })
              ),
              h('div', { style: css("flex:1; font-family:'Cinzel',serif; font-weight:600; font-size:17px; color:#f0e6c9;") }, p.shortName),
              h('div', { style: css(`font-family:'Archivo',sans-serif; font-size:12px; color:${p.labelColor};`) }, p.label)
            ))
          ),
          h('div', { style: css('height:16px;') })
        ),
        h('div', { style: css('padding:12px 20px 28px;') },
          v.allSeen
            ? h('div', { onClick: v.goVoting, className: 'imp-btn', style: css("padding:17px; text-align:center; background:linear-gradient(180deg,#b3202f,#7a1620); color:#f6ecd2; font-family:'Cinzel',serif; font-weight:700; font-size:17px; letter-spacing:.08em; border-radius:12px; box-shadow:0 8px 28px rgba(178,32,47,.4); cursor:pointer; animation:imp-rise .4s ease both;") }, 'BEGIN THE TRIAL →')
            : h('div', { style: css("padding:17px; text-align:center; border:1px dashed rgba(200,162,76,.3); color:#7a6a4a; font-family:'Cinzel',serif; font-weight:700; font-size:15px; border-radius:12px;") }, 'ALL PLAYERS MUST TAP FIRST')
        ),
        v.showOverlay && h('div', { style: css('position:absolute; inset:0; background:rgba(8,4,10,.88); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:28px; animation:imp-fade-in .2s ease both;') },
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.35em; text-transform:uppercase; color:#caa64f; margin-bottom:6px;") }, 'Your Role'),
          h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:28px; color:#f3ead0; margin-bottom:22px;") }, v.apName),
          h('div', { onClick: v.openCurtain, style: css('position:relative; width:240px; height:340px; border-radius:16px; cursor:pointer; overflow:hidden; box-shadow:0 20px 56px rgba(0,0,0,.7); border:1px solid rgba(230,203,126,.4);') },
            h('div', { style: css('position:absolute; inset:0; background:radial-gradient(120% 80% at 50% 0%, #f6ecd2, #e6d6b0); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:28px; text-align:center;') },
              h('div', { style: css('display:flex; justify-content:center; margin-bottom:14px;') },
                h(Mask, { comedy: v.apComedy, tragedy: v.apTragedy, cracked: v.apIsUndisguisedJester, faceColor: v.apFace, lineColor: v.apLine, size: 60 })
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
            h('div', { style: v.leftCurtain },
              h('div', { style: css('width:3px; height:84%; background:linear-gradient(180deg,transparent,#e6cb7e,transparent); opacity:.55;') })
            ),
            h('div', { style: v.rightCurtain },
              h('div', { style: css('width:3px; height:84%; background:linear-gradient(180deg,transparent,#e6cb7e,transparent); opacity:.55;') })
            ),
            h('div', { style: css("position:absolute; top:12px; left:0; right:0; text-align:center; font-family:'Cinzel',serif; font-size:12px; letter-spacing:.2em; color:#e6cb7e; pointer-events:none;") }, v.curtainHint)
          ),
          v.cardOpen
            ? h('div', { onClick: v.closeOverlay, style: css("margin-top:22px; padding:14px 32px; background:rgba(255,255,255,.07); border:1px solid rgba(200,162,76,.4); color:#ecdfc0; font-family:'Cinzel',serif; font-weight:700; font-size:14px; letter-spacing:.06em; border-radius:10px; cursor:pointer; animation:imp-rise .35s ease both;") }, 'GOT IT')
            : h('div', { style: css("margin-top:18px; font-family:'EB Garamond',serif; font-size:14px; color:#caa64f;") }, 'Tap the curtain to reveal')
        )
      );
    }

    renderVoting(v) {
      const steps = [
        { badge: '#2e5bb0', bg: 'linear-gradient(135deg,#14254a,#0d1a38)', border: 'rgba(46,91,176,.35)', num: '1', numColor: '#fff', icon: ICON_STEP1, title: 'Opening Statements', body: v.starterName + ' opens the round — go around the table.' },
        { badge: '#7a1620', bg: 'linear-gradient(135deg,#4d0e14,#380a0f)', border: 'rgba(122,22,32,.5)', num: '2', numColor: '#ecdfc0', icon: ICON_STEP2, title: 'Drop Clues', body: 'Each player says one clue word. Go around 2–3 times — watch for hesitation.' },
        { badge: '#caa64f', bg: 'linear-gradient(135deg,#3a2a0a,#2a1e06)', border: 'rgba(200,162,76,.25)', num: '3', numColor: '#1a0e02', icon: ICON_STEP3, title: 'Cast Your Vote', body: 'Discuss, point fingers, and vote on who you think is the jester. Majority rules.' },
        { badge: '#b3202f', bg: 'linear-gradient(135deg,#5c1117,#3c0a10)', border: 'rgba(178,32,47,.4)', num: '4', numColor: '#fff', icon: ICON_STEP4, title: 'Unmask the Jester', body: 'When ready, tap below to reveal who the jester really was.', panelBg: 'rgba(178,32,47,.08)' },
      ];
      return h('div', { style: css('position:absolute; inset:0; display:flex; flex-direction:column; background:#0e0810; animation:imp-slide-in .3s ease both;') },
        h('div', { style: css('height:24px;') }),
        h('div', { style: css('position:relative; text-align:center; padding:0 26px 18px;') },
          h('div', { onClick: v.backToReveal, className: 'imp-btn', style: css("position:absolute; left:0; top:0; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-family:'Cinzel',serif; font-size:22px; color:#caa64f; cursor:pointer; opacity:.8;") }, '‹'),
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:22px; color:#f0e6c9;") }, 'The Trial'),
          h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:#8a9ab8; margin-top:4px;") }, 'Debate, accuse, unmask the jester.')
        ),
        h('div', { style: css('flex:1; overflow-y:auto; padding:16px 20px 0; display:flex; flex-direction:column;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:16px; color:#ecdfc0; margin-bottom:14px;") }, 'How It Works'),
          h('div', { style: css('display:flex; flex-direction:column; gap:10px; margin-bottom:22px;') },
            steps.map((s, i) => h('div', { key: i, style: css(`display:flex; align-items:center; gap:14px; padding:16px; border-radius:14px; background:${s.panelBg || 'rgba(255,255,255,.05)'}; border:1px solid ${s.border};`) },
              h('div', { style: css(`position:relative; flex:none; width:52px; height:52px; border-radius:12px; background:${s.bg}; display:flex; align-items:center; justify-content:center;`) },
                h('div', { style: css('display:flex; align-items:center; justify-content:center;'), dangerouslySetInnerHTML: { __html: s.icon } }),
                h('div', { style: css(`position:absolute; top:-6px; right:-6px; width:20px; height:20px; border-radius:50%; background:${s.badge}; font-family:'Cinzel',serif; font-weight:700; font-size:11px; color:${s.numColor}; display:flex; align-items:center; justify-content:center;`) }, s.num)
              ),
              h('div', {},
                h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:16px; color:#f0e6c9;") }, s.title),
                h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:#8a9ab8; margin-top:2px;") }, s.body)
              )
            ))
          ),
          v.hasTimeLimit && h('div', { style: css('flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;') },
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.3em; text-transform:uppercase; color:#9b8a63;") }, 'Time Remaining'),
            h('div', { style: css(`font-family:'Cinzel Decorative',serif; font-weight:700; font-size:52px; color:${v.timerColor}; line-height:1.2;`) }, v.timerDisplay)
          )
        ),
        h('div', { style: css('padding:12px 20px 28px;') },
          h('div', { onClick: v.goResults, className: 'imp-btn', style: css("padding:18px; text-align:center; background:linear-gradient(180deg,#b3202f,#7a1620); color:#f6ecd2; font-family:'Cinzel',serif; font-weight:700; font-size:17px; letter-spacing:.08em; border-radius:14px; box-shadow:0 8px 28px rgba(178,32,47,.4); cursor:pointer;") }, 'REVEAL THE JESTER')
        ),
        v.showTimeUpPopup && h('div', { style: css('position:absolute; inset:0; background:rgba(8,4,10,.85); display:flex; align-items:center; justify-content:center; padding:28px; animation:imp-fade-in .2s ease both;') },
          h('div', { style: css('background:#16101a; border-radius:18px; padding:30px 26px; text-align:center; border:1px solid rgba(200,162,76,.3); max-width:300px; animation:imp-rise .3s ease both;') },
            h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:24px; color:#e6cb7e;") }, 'Time to Vote!'),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:#b9c6df; margin-top:8px; line-height:1.4;") }, 'The clock has run out — cast your votes and unmask the jester.'),
            h('div', { onClick: v.dismissTimeUp, className: 'imp-btn', style: css("margin-top:22px; padding:14px; background:linear-gradient(180deg,#b3202f,#7a1620); color:#f6ecd2; font-family:'Cinzel',serif; font-weight:700; font-size:15px; letter-spacing:.05em; border-radius:10px; cursor:pointer;") }, 'GOT IT')
          )
        )
      );
    }

    renderResults(v) {
      return h('div', { style: css('position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; background:radial-gradient(80% 45% at 50% 26%, rgba(230,203,126,.28), transparent 60%), #14070c; animation:imp-scale-in .35s ease both;') },
        h('div', { style: css('height:28px;') }),
        h('div', { style: css('position:relative; width:100%; display:flex; justify-content:center; align-items:center; margin-bottom:2px;') },
          h('div', { onClick: v.backToLobby, style: css("position:absolute; left:20px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-family:'Cinzel',serif; font-size:22px; color:#caa64f; cursor:pointer; opacity:.8;") }, '‹'),
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.35em; text-transform:uppercase; color:#caa64f;") }, 'The Final Curtain')
        ),
        h('div', { style: css('flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:800; font-size:26px; color:#f3ead0;") }, v.jesterRevealHeading),
          h('div', { style: css('margin-top:18px; animation:imp-float 5s ease-in-out infinite;') },
            h(Mask, { comedy: !v.hasJester, tragedy: v.hasJester, cracked: v.hasJester, faceColor: v.ivoryFace, lineColor: v.hasJester ? v.crimson : v.wine, size: 120 })
          ),
          h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:34px; color:#e6cb7e; margin-top:14px;") }, v.revealedName),
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
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:15px; color:#d8c79f; margin-top:6px;") }, 'You unmasked the jester before the curtain fell.')
            ),
            v.missedJester && h(React.Fragment, null,
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:20px; color:#e8a0a8;") }, 'The Jester escapes!'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:15px; color:#d8c79f; margin-top:6px;") }, 'You accused the wrong performer. The jester takes a bow.')
            ),
            !v.hasJester && h(React.Fragment, null,
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:20px; color:#9ad2a3;") }, 'Every performer was genuine.'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:15px; color:#d8c79f; margin-top:6px;") }, 'No one was pretending — this round had no jester.')
            )
          )
        ),
        h('div', { style: css('width:100%; padding:14px 26px 28px;') },
          h('div', { onClick: v.playAgain, className: 'imp-btn', style: css("padding:16px; text-align:center; background:linear-gradient(180deg,#ecdfc0,#d3bf93); color:#3c0a10; font-family:'Cinzel',serif; font-weight:700; font-size:16px; letter-spacing:.05em; border-radius:10px; cursor:pointer;") }, 'ENCORE · PLAY AGAIN')
        )
      );
    }

    render() {
      const v = this.renderVals();
      return h('div', { style: css('width:100%; height:100dvh; background:radial-gradient(120% 70% at 50% -10%, rgba(46,91,176,.12), transparent 60%), #05020a; display:flex; align-items:center; justify-content:center;') },
        h('div', { id: 'phone-shell', style: css('width:100%; max-width:480px; height:100%; max-height:900px; position:relative; overflow:hidden; background:#1a070b; box-shadow:0 30px 90px rgba(0,0,0,.6); transform-origin:center center;') },
          v.isLobby && this.renderLobby(v),
          v.isPlayers && this.renderPlayers(v),
          v.isReveal && this.renderReveal(v),
          v.isVoting && this.renderVoting(v),
          v.isResults && this.renderResults(v)
        )
      );
    }
  }

  const rootEl = document.getElementById('root');
  if (ReactDOM.createRoot) ReactDOM.createRoot(rootEl).render(h(App));
  else ReactDOM.render(h(App), rootEl);
})();
