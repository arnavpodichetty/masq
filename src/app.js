// Masq — plain React (no build step). Loaded after React/ReactDOM UMD and the
// two data files.
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

  // Poster paths are pre-resolved into src/artwork/posters.js by
  // tools/fetch-posters.js — no TMDB calls at play time. A missing map just
  // means no posters, never a crash.
  const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';
  function posterFor(title) {
    const path = title && window.MASQ_POSTERS ? window.MASQ_POSTERS[title] : null;
    return path ? POSTER_BASE + path : null;
  }

  // Same, from src/artwork/albums.js — but Deezer hands out a per-album URL
  // prefix, so the size is what gets appended. 300px covers the card's 132px
  // square at 2x.
  const ALBUM_SIZE = '300x300-000000-80-0-0.jpg';
  function albumFor(entry) {
    const prefix = entry && window.MASQ_ALBUMS ? window.MASQ_ALBUMS[entry] : null;
    return prefix ? prefix + ALBUM_SIZE : null;
  }

  const MUSE_ALBUM_OF = (() => {
    const catalog = (window.MASQ_LOCATIONS_DATA || {}).museCatalog || {};
    const index = {};
    Object.keys(catalog).forEach((album) => {
      (catalog[album] || []).forEach((song) => { index[song] = album; });
    });
    return index;
  })();

  function museCoverFor(song) {
    if (!song) return null;
    const own = window.MASQ_MUSE_TRACKS ? window.MASQ_MUSE_TRACKS[song] : null;
    const album = MUSE_ALBUM_OF[song];
    const prefix = own || (album && window.MASQ_MUSE_ALBUMS ? window.MASQ_MUSE_ALBUMS[album] : null);
    return prefix ? prefix + ALBUM_SIZE : null;
  }

  // Animal photos from src/artwork/animals.js (tools/fetch-animals.js, out of
  // Wikipedia's lead images). Wikimedia returns a finished URL, so unlike the
  // other two there's nothing to build.
  function animalFor(entry) {
    return (entry && window.MASQ_ANIMALS ? window.MASQ_ANIMALS[entry] : null) || null;
  }

  // Food photos from src/artwork/food.js (tools/fetch-cuisines.js), same
  // Wikipedia lead images, arriving finished the same way.
  function foodFor(entry) {
    return (entry && window.MASQ_FOOD ? window.MASQ_FOOD[entry] : null) || null;
  }

  // Object photos from src/artwork/objects.js (tools/fetch-objects.js). Word
  // Mode only — no role catalog names an everyday object.
  function objectFor(entry) {
    return (entry && window.MASQ_OBJECTS ? window.MASQ_OBJECTS[entry] : null) || null;
  }

  // The photographers, for the Credits screen — most of these photos are
  // Creative Commons, which asks that whoever took them is named. Built once,
  // and empty rather than broken if the artwork file failed to load. No author
  // on record means public domain, credited to its licence alone.
  const toCredits = (rows) => (rows || []).map(([name, by, license]) => ({
    name,
    credit: by ? `${by} · ${license}` : license,
  }));
  const PHOTO_CREDITS = toCredits(window.MASQ_ANIMAL_CREDITS);
  const FOOD_CREDITS = toCredits(window.MASQ_FOOD_CREDITS);
  const OBJECT_CREDITS = toCredits(window.MASQ_OBJECT_CREDITS);

  // Each medium keeps its own shape: a poster stands 2:3, a sleeve is square, a
  // wildlife photo is 4:3 landscape. Cropped to fill, so the wrong frame cuts
  // the subject out of its own picture.
  //
  // 'compact' is a size down, for rounds that print a word above the role — see
  // apArtCompact. 'focus' only matters for the portrait photos: an animal shot
  // upright carries its head near the top, so those crop high. 'plate' is the
  // same landscape frame cropped centrally, since food sits centred.
  const ART_SHAPES = {
    poster: { full: ['112px', '168px'], compact: ['96px', '144px'], focus: '50% 50%' },
    cover: { full: ['132px', '132px'], compact: ['108px', '108px'], focus: '50% 50%' },
    photo: { full: ['148px', '111px'], compact: ['128px', '96px'], focus: '50% 25%' },
    plate: { full: ['148px', '111px'], compact: ['128px', '96px'], focus: '50% 50%' },
  };

  // Gives a styled <div> real button semantics: Tab to reach, Enter/Space to
  // activate, a name to announce. Pass `label` only for a bare glyph like '×';
  // `extra` overrides the role.
  function press(onClick, label, extra) {
    if (!onClick) return {};
    return {
      onClick,
      onKeyDown: (e) => {
        if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
        e.preventDefault();
        onClick(e);
      },
      role: 'button',
      tabIndex: 0,
      ...(label ? { 'aria-label': label } : null),
      ...extra,
    };
  }

  // ---- progressive jester ----
  // Everyone holds "shares", starting at 1; your odds are your share of the
  // table's total. Being picked costs this much of the table's chance, split
  // among everyone who wasn't — so the total never drifts and the cost is the
  // same percentage at any head count. A nudge, not a lockout.
  const PROGRESSIVE_STEP_PCT = 0.05;

  function freshWeights(ids) {
    const weights = {};
    ids.forEach((id) => { weights[id] = 1; });
    return weights;
  }

  // Stored weights only fit the roster that earned them; any change resets.
  function normalizeWeights(stored, ids) {
    if (!stored || typeof stored !== 'object') return freshWeights(ids);
    const sameRoster = Object.keys(stored).length === ids.length
      && ids.every(id => typeof stored[id] === 'number' && isFinite(stored[id]) && stored[id] >= 0);
    return sameRoster ? { ...stored } : freshWeights(ids);
  }

  // Draws `count` distinct items, each item's odds being its share of the pool.
  function weightedDraw(items, weightOf, count) {
    const pool = items.slice();
    const picked = [];
    while (picked.length < count && pool.length) {
      const weights = pool.map(item => Math.max(0, weightOf(item) || 0));
      const total = weights.reduce((sum, w) => sum + w, 0);
      let idx = -1;
      if (total > 0) {
        let target = Math.random() * total;
        for (let i = 0; i < pool.length; i += 1) {
          if (target < weights[i]) { idx = i; break; }
          target -= weights[i];
        }
        // Rounding ate the remainder — take the last non-zero candidate.
        if (idx < 0) idx = weights.reduce((best, w, i) => (w > 0 ? i : best), 0);
      } else {
        // Everyone left is spent — fall back to an even draw.
        idx = Math.floor(Math.random() * pool.length);
      }
      picked.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return picked;
  }

  function applyProgressive(weights, ids, pickedIds) {
    const next = { ...weights };
    const wasPicked = new Set(pickedIds.map(String));
    const others = ids.filter(id => !wasPicked.has(String(id)));
    // One share per player, so a percentage of the table is that times the
    // head count, in shares.
    const step = PROGRESSIVE_STEP_PCT * ids.length;
    let released = 0;
    pickedIds.forEach((id) => {
      const held = Math.max(0, next[id] || 0);
      const spend = Math.min(step, held);
      next[id] = held - spend;
      released += spend;
    });
    if (others.length && released > 0) {
      const share = released / others.length;
      others.forEach((id) => { next[id] = Math.max(0, (next[id] || 0) + share); });
    }
    return next;
  }

  // ---- custom categories (saved, like the roster below) ----
  // [{ id, name, kind, entries: [{ word, roles: [] }] }]
  // 'roles' — every word carries its own role list, like Locations.
  // 'words' — just words, like Food. Hidden from Role Mode: no roles to deal.
  const CUSTOM_KEY = 'masq.customCategories';

  // Typed as one blob; commas and newlines both split, so pasted lists work.
  function parseWordList(text) {
    const out = [];
    const seen = new Set();
    String(text || '').split(/[\n,]/).forEach((raw) => {
      const word = raw.trim();
      if (!word || seen.has(word.toLowerCase())) return;
      seen.add(word.toLowerCase());
      out.push(word);
    });
    return out;
  }

  function loadCustomCategories() {
    try {
      const raw = window.localStorage.getItem(CUSTOM_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(c => c && typeof c.name === 'string' && Array.isArray(c.entries))
        .map((c, i) => {
          const entries = c.entries
            .filter(e => e && typeof e.word === 'string' && e.word.trim())
            .map(e => ({ word: e.word, roles: Array.isArray(e.roles) ? e.roles.filter(r => typeof r === 'string' && r.trim()) : [] }));
          return {
            id: typeof c.id === 'string' ? c.id : 'c' + i,
            name: c.name,
            // Saved before `kind` existed — infer it from the roles.
            kind: c.kind === 'words' || c.kind === 'roles' ? c.kind : (entries.some(e => e.roles.length) ? 'roles' : 'words'),
            entries,
          };
        })
        .filter(c => c.name.trim() && c.entries.length);
    } catch (err) {
      return [];
    }
  }

  function saveCustomCategories(list) {
    try {
      window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
    } catch (err) {
      // Private mode / quota — the categories still work for this session.
    }
  }

  function newCustomId() {
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  const MUSE_CATEGORY = 'Muse';
  const ROLE_CATEGORIES = ['Biomes', 'Cuisines', 'Locations', 'Movie/TV Show Genres', 'Muse', 'Music Genres'];
  const OPEN_ROLE_CATEGORIES = ROLE_CATEGORIES.filter(c => c !== MUSE_CATEGORY);
  // The word-only categories, in the order their tiles render. A constant
  // rather than state, unlike the role list: nothing ever unlocks into it.
  const WORD_CATEGORIES = ['Animals', 'Food/Drinks', 'Movies/TV', 'Objects'];

  // Categories that have been renamed, old name to new. A saved lobby and a
  // crossed-out word list both key off the name, so without this a rename drops
  // them: the picker would find nothing it recognises and fall back to the
  // opening categories, and every crossing under the old name would be swept
  // away as a stray. Entries stay forever — a device that hasn't been opened in
  // a year still has the old name in it.
  const RENAMED_CATEGORIES = { Food: 'Food/Drinks' };
  const currentCategoryName = (name) => RENAMED_CATEGORIES[name] || name;

  // Muse is found once, in the Credits, and a refresh shouldn't hide it again —
  // so the unlock outlasts the tab. One flag, written when found and never
  // unwritten: this isn't a setting, it's something that happened.
  const MUSE_KEY = 'masq.museUnlocked';

  function loadMuseUnlocked() {
    try {
      return window.localStorage.getItem(MUSE_KEY) === '1';
    } catch (err) {
      return false;
    }
  }

  function saveMuseUnlocked() {
    try {
      window.localStorage.setItem(MUSE_KEY, '1');
    } catch (err) {
      // Private mode / quota — unlocked for this session, found again next time.
    }
  }

  // Read once: two state fields are set from this and have to agree about
  // whether Muse is in the picker.
  const INITIAL_MUSE_UNLOCKED = loadMuseUnlocked();

  // ---- crossed-out words ----
  // A crossing is a decision about the table, not the session, so these outlast
  // the tab.
  const DISABLED_KEY = 'masq.disabledWords';

  function loadDisabledWords() {
    try {
      const raw = window.localStorage.getItem(DISABLED_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      const out = {};
      Object.keys(parsed).forEach((cat) => {
        if (!Array.isArray(parsed[cat])) return;
        const words = parsed[cat].filter(w => typeof w === 'string' && w);
        // Under its current name, so a category renamed since these were saved
        // keeps its crossings instead of losing them to the sweep below.
        if (words.length) out[currentCategoryName(cat)] = words;
      });
      return out;
    } catch (err) {
      return {};
    }
  }

  function saveDisabledWords(map) {
    try {
      window.localStorage.setItem(DISABLED_KEY, JSON.stringify(map || {}));
    } catch (err) {
      // Private mode / quota — the crossings still hold for this session.
    }
  }

  // Every word a crossing could legitimately point at, as a set per category.
  // Null when the data files didn't load, which is the difference between "this
  // word is gone" and "we can't see the catalogs from here".
  function knownWordsByCategory(customs) {
    const roles = window.MASQ_LOCATIONS_DATA;
    const words = window.MASQ_WORDS;
    if (!roles || !words || !words.wordOnlyCatalog) return null;
    const index = {
      Biomes: Object.keys(roles.biomeCatalog || {}),
      Cuisines: Object.keys(roles.cuisineCatalog || {}),
      Locations: Object.keys(roles.locationCatalog || {}),
      'Movie/TV Show Genres': Object.keys(roles.movieTvCatalog || {}),
      'Music Genres': Object.keys(roles.musicGenreCatalog || {}),
      [MUSE_CATEGORY]: Object.keys(roles.museCatalog || {}),
    };
    Object.keys(words.wordOnlyCatalog).forEach((cat) => { index[cat] = words.wordOnlyCatalog[cat] || []; });
    (customs || []).forEach((c) => { index[c.name] = (c.entries || []).map(e => e.word); });
    const out = {};
    Object.keys(index).forEach((cat) => { out[cat] = new Set(index[cat]); });
    return out;
  }

  // A word list changes between releases — words get dropped, categories get
  // renamed — and a crossing pointing at a word that no longer exists is inert
  // but permanent, sitting in localStorage on that device for good. So the map
  // is swept on the way in and the strays are dropped.
  //
  // A sweep, never a reset: with no catalogs to check against there is nothing
  // to call stray, so the map is handed back untouched rather than thrown away
  // on the strength of a script that failed to load.
  function pruneDisabledWords(map, known) {
    if (!known) return map;
    const out = {};
    Object.keys(map).forEach((cat) => {
      const valid = known[cat];
      if (!valid) return;
      const kept = map[cat].filter(w => valid.has(w));
      if (kept.length) out[cat] = kept;
    });
    return out;
  }

  // ---- lobby settings ----
  // How this table likes to play — mode, categories, jesters, clock, options,
  // theme. None of it is a decision about one round, so all of it outlasts the
  // tab. One blob rather than a key each: they're read and written together,
  // and half a restored lobby is worse than a default one. Deliberately left
  // out are the round itself and the progressive jester's weights.
  const SETTINGS_KEY = 'masq.settings';

  // Every field the lobby remembers, and its opening value. Also the read-back
  // list: anything else in storage is ignored, anything missing or unusable
  // falls back to its value here.
  const DEFAULT_SETTINGS = {
    gameMode: 'roles',
    selCategories: OPEN_ROLE_CATEGORIES,
    jesterCount: 1,
    randJesters: false,
    jesterRandMin: 1,
    jesterRandMax: 3,
    // Progressive to start with: it passes the jester around the table, which
    // is what most groups expect a random draw to feel like.
    jesterSelection: 'progressive',
    showJesterOdds: false,
    timeLimit: 5,
    soundEffects: true,
    showCategory: true,
    showWord: false,
    jestersKnow: false,
    jesterGetsRole: false,
    // On to start with: a Word Mode jester is otherwise guessing at a hundred
    // words, which is the complaint this setting exists to answer.
    jesterHints: true,
    darkMode: true,
    jesterMode: false,
  };
  const SETTINGS_FIELDS = Object.keys(DEFAULT_SETTINGS);

  // The top of the time dial, in minutes. The dial runs 0 (no limit) through
  // this and then back to 0, so it's the wrap point as well as the ceiling —
  // both the stepper and the bounds check below read it from here.
  const TIME_LIMIT_MAX = 15;

  const asBool = (v, fallback) => (typeof v === 'boolean' ? v : fallback);
  const asOneOf = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback);
  const asCount = (v, min, max, fallback) => (typeof v === 'number' && isFinite(v)
    ? Math.min(max, Math.max(min, Math.round(v)))
    : fallback);

  // Saved picks are checked against what exists now, not what existed when they
  // were saved — a custom category can be renamed or deleted between visits. A
  // stale name would still be drawn, and would quietly deal Locations, so it's
  // dropped on the way in.
  function usableCategories(names, customs, museUnlocked, gameMode) {
    const custom = Array.isArray(customs) ? customs : [];
    const isWordOnly = (c) => c.kind === 'words' || !c.entries.some(e => e.roles && e.roles.length);
    const known = new Set([
      ...(museUnlocked ? ROLE_CATEGORIES : OPEN_ROLE_CATEGORIES),
      ...WORD_CATEGORIES,
      ...custom.map(c => c.name),
    ]);
    // Role Mode can't deal a roleless category — the same cut setRoleMode makes.
    const roleless = new Set(gameMode === 'words'
      ? []
      : [...WORD_CATEGORIES, ...custom.filter(isWordOnly).map(c => c.name)]);
    const seen = new Set();
    return names.filter((name) => {
      if (typeof name !== 'string' || !known.has(name) || roleless.has(name) || seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }

  function loadSettings(customs, museUnlocked) {
    let saved = {};
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) saved = parsed;
    } catch (err) {
      // Private mode, or something unreadable under the key — take the defaults.
    }
    const gameMode = asOneOf(saved.gameMode, ['roles', 'words'], DEFAULT_SETTINGS.gameMode);
    const picked = usableCategories(
      (Array.isArray(saved.selCategories) ? saved.selCategories : []).map(currentCategoryName),
      customs, museUnlocked, gameMode,
    );
    return {
      gameMode,
      // Never empty: a picker with nothing in it has nothing to deal, so a list
      // that lost everything falls back to the opening categories.
      selCategories: picked.length ? picked : DEFAULT_SETTINGS.selCategories,
      jesterCount: asCount(saved.jesterCount, 0, 99, DEFAULT_SETTINGS.jesterCount),
      randJesters: asBool(saved.randJesters, DEFAULT_SETTINGS.randJesters),
      // Re-clamped against the cast on every render (see randMin/randMax), so
      // this only has to be a number.
      jesterRandMin: asCount(saved.jesterRandMin, 0, 99, DEFAULT_SETTINGS.jesterRandMin),
      jesterRandMax: asCount(saved.jesterRandMax, 0, 99, DEFAULT_SETTINGS.jesterRandMax),
      jesterSelection: asOneOf(saved.jesterSelection, ['random', 'progressive'], DEFAULT_SETTINGS.jesterSelection),
      showJesterOdds: asBool(saved.showJesterOdds, DEFAULT_SETTINGS.showJesterOdds),
      // 0 is 'no limit', and the dial stops at TIME_LIMIT_MAX minutes.
      timeLimit: asCount(saved.timeLimit, 0, TIME_LIMIT_MAX, DEFAULT_SETTINGS.timeLimit),
      soundEffects: asBool(saved.soundEffects, DEFAULT_SETTINGS.soundEffects),
      showCategory: asBool(saved.showCategory, DEFAULT_SETTINGS.showCategory),
      showWord: asBool(saved.showWord, DEFAULT_SETTINGS.showWord),
      jestersKnow: asBool(saved.jestersKnow, DEFAULT_SETTINGS.jestersKnow),
      jesterGetsRole: asBool(saved.jesterGetsRole, DEFAULT_SETTINGS.jesterGetsRole),
      jesterHints: asBool(saved.jesterHints, DEFAULT_SETTINGS.jesterHints),
      darkMode: asBool(saved.darkMode, DEFAULT_SETTINGS.darkMode),
      jesterMode: asBool(saved.jesterMode, DEFAULT_SETTINGS.jesterMode),
    };
  }

  function saveSettings(state) {
    try {
      const out = {};
      SETTINGS_FIELDS.forEach((field) => { out[field] = state[field]; });
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(out));
    } catch (err) {
      // Private mode / quota — the lobby still holds for this session.
    }
  }

  // Order matters: the customs have to be known before the saved category picks
  // can be checked against them.
  const INITIAL_CUSTOM = loadCustomCategories();
  const INITIAL_SETTINGS = loadSettings(INITIAL_CUSTOM, INITIAL_MUSE_UNLOCKED);

  // Swept here rather than on first edit: a crossing for a word this release
  // dropped would otherwise wait for someone to open that category's word list,
  // which they may never do. Written back only when the sweep found something,
  // so an untouched device isn't given a pointless write on every load.
  const INITIAL_DISABLED = (() => {
    const saved = loadDisabledWords();
    const swept = pruneDisabledWords(saved, knownWordsByCategory(INITIAL_CUSTOM));
    if (JSON.stringify(swept) !== JSON.stringify(saved)) saveDisabledWords(swept);
    return swept;
  })();

  // ---- roster ----
  // The table usually plays with the same people, so the names outlast the tab.
  // Stored as [{ id, name }] rather than two arrays, so a name can never come
  // back paired with the wrong id. Round state keys off `id` — see `playerId`.
  const PLAYERS_KEY = 'masq.players';
  const DEFAULT_PLAYERS = [
    { id: 0, name: 'Player 1' }, { id: 1, name: 'Player 2' },
    { id: 2, name: 'Player 3' }, { id: 3, name: 'Player 4' },
  ];

  function loadPlayers() {
    try {
      const raw = window.localStorage.getItem(PLAYERS_KEY);
      if (!raw) return DEFAULT_PLAYERS;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return DEFAULT_PLAYERS;
      const seen = new Set();
      const players = [];
      parsed.forEach((p) => {
        if (!p || typeof p.name !== 'string' || !p.name.trim()) return;
        // A duplicate or unusable id would collide in the round maps — keep the
        // name, reissue the id below.
        const id = (typeof p.id === 'number' && isFinite(p.id) && !seen.has(p.id)) ? p.id : null;
        if (id !== null) seen.add(id);
        players.push({ id, name: p.name.trim() });
      });
      if (!players.length) return DEFAULT_PLAYERS;
      let nextId = players.reduce((max, p) => (p.id === null ? max : Math.max(max, p.id)), -1) + 1;
      return players.map(p => (p.id === null ? { id: nextId++, name: p.name } : p));
    } catch (err) {
      return DEFAULT_PLAYERS;
    }
  }

  function savePlayers(names, keys) {
    try {
      const players = names.map((name, i) => ({ id: keys[i], name }));
      window.localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
    } catch (err) {
      // Private mode / quota — the roster still works for this session.
    }
  }

  // Read once: the two state fields and the id counter must agree, and another
  // tab could write in between two reads.
  const INITIAL_PLAYERS = loadPlayers();

  const THEME_DARK = {
    '--m-page': '#0e0810',
    '--m-page-glow': 'transparent',
    '--m-page-vignette': '#190e24',
    '--m-chrome': '#190e24',
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
    '--m-icon-gold': 'rgba(200,162,76,.13)',
    '--m-icon-crimson': 'rgba(178,32,47,.26)',
    '--m-icon-blue': 'rgba(46,91,176,.24)',
    '--m-icon-purple': 'rgba(107,78,168,.235)',
    '--m-backdrop': 'rgba(8,4,12,.7)',
    '--m-overlay': 'rgba(8,4,10,.88)',
    '--m-overlay-vote': 'rgba(8,4,10,.85)',
    '--m-avatar-bg': 'rgba(0,0,0,.3)',
    '--m-arrow': '#5a4a2a',
    '--m-results-bg': 'radial-gradient(80% 45% at 50% 26%, rgba(230,203,126,.28), transparent 60%), #14070c',
    '--m-results-sub': '#d8c79f',
    '--m-shell-shadow': 'none',
    '--m-ready-bg': 'rgba(144,200,144,.07)',
    '--m-ready-border': '1px solid rgba(144,200,144,.3)',
    '--m-ready-color': '#7fcf8a',
    '--m-idle-label': '#caa64f',
    '--m-timer': '#f0e6c9',
    '--m-cta': 'linear-gradient(180deg,#b3202f,#7a1620)',
    '--m-cta-text': '#f6ecd2',
    '--m-cta-glow': '0 8px 28px rgba(178,32,47,.4)',
    '--m-tile-sel': 'linear-gradient(135deg,#7a1620,#4d0e14)',
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
    '--m-page-vignette': 'transparent',
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
    // Inverted from dark: over a near-white screen these wash *down*, and the
    // saturated hues darken far harder than gold does.
    '--m-icon-gold': 'rgba(154,117,40,.2)',
    '--m-icon-crimson': 'rgba(178,32,47,.14)',
    '--m-icon-blue': 'rgba(46,91,176,.16)',
    '--m-icon-purple': 'rgba(90,63,140,.145)',
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
    '--m-tile-sel': 'linear-gradient(135deg,#7a1620,#4d0e14)',
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
    '--m-page-vignette': 'transparent',
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
    // The accent here is hot pink, not gold, so the neutral wash follows it.
    // Crimson and blue carry over from dark unchanged.
    '--m-icon-gold': 'rgba(255,61,139,.16)',
    '--m-icon-purple': 'rgba(167,139,250,.135)',
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
    if (meta) meta.setAttribute('content', theme['--m-chrome'] || theme['--m-page']);
    const scheme = document.querySelector('meta[name="color-scheme"]');
    if (scheme) scheme.setAttribute('content', (darkMode || jesterMode) ? 'dark' : 'light');
  }
  // Painted before React mounts, in the theme this table chose — otherwise a
  // light-mode table watches the stage go dark and back again on every load.
  applyTheme(INITIAL_SETTINGS.darkMode, INITIAL_SETTINGS.jesterMode);

  // ---- static icon markup (no dynamic bindings, safe as raw SVG) ----
  // All drawn on a 24x24 grid at stroke-width ~1.7 so the set reads as one hand.
  // The 18px variants are resized here rather than kept as second copies, which
  // drifted from their 20px twins.
  const resize = (svg, size) => svg.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`);
  // Role Mode: a Venetian domino mask — you're handed a face to wear.
  const ICON_ROLE_20 = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M2.6 10.2 C2.6 7.4 5 6 7.6 6.4 C9.4 6.7 11 7.6 12 8.4 C13 7.6 14.6 6.7 16.4 6.4 C19 6 21.4 7.4 21.4 10.2 C21.4 13.6 18.6 17.4 15.8 17.4 C13.9 17.4 12.7 16 12 14.6 C11.3 16 10.1 17.4 8.2 17.4 C5.4 17.4 2.6 13.6 2.6 10.2 Z" stroke="var(--m-brand)" stroke-width="1.7" stroke-linejoin="round"></path><ellipse cx="7.7" cy="11" rx="2.3" ry="1.6" transform="rotate(-12 7.7 11)" stroke="var(--m-brand)" stroke-width="1.3"></ellipse><ellipse cx="16.3" cy="11" rx="2.3" ry="1.6" transform="rotate(12 16.3 11)" stroke="var(--m-brand)" stroke-width="1.3"></ellipse><path d="M5.6 2.9 L6.9 4.2 L5.6 5.5 L4.3 4.2 Z" stroke="var(--m-accent)" stroke-width="1.2" stroke-linejoin="round" opacity=".75"></path></svg>';
  const ICON_ROLE_18 = resize(ICON_ROLE_20, 18);
  // Word Mode: the open script everyone but the jester is reading from.
  const ICON_WORD = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M12 8 C10 6.4 7.4 5.8 4.6 6.2 L4.6 17.6 C7.4 17.2 10 17.8 12 19.4 C14 17.8 16.6 17.2 19.4 17.6 L19.4 6.2 C16.6 5.8 14 6.4 12 8 Z" stroke="var(--m-brand)" stroke-width="1.7" stroke-linejoin="round"></path><path d="M12 8 L12 19.4" stroke="var(--m-brand)" stroke-width="1.4"></path><path d="M7 10.4 C8.2 10.5 9.2 10.8 10.1 11.3 M17 10.4 C15.8 10.5 14.8 10.8 13.9 11.3" stroke="var(--m-accent)" stroke-width="1.2" stroke-linecap="round" opacity=".65"></path></svg>';
  // Players: the company — one player forward, the rest of the table behind.
  const ICON_PLAYERS = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><circle cx="5.6" cy="10" r="2.3" stroke="var(--m-accent)" stroke-width="1.5" opacity=".55"></circle><path d="M2 18.6 C2 16 3.6 14.6 5.6 14.6 C6.2 14.6 6.8 14.7 7.3 14.9" stroke="var(--m-accent)" stroke-width="1.5" stroke-linecap="round" opacity=".55"></path><circle cx="18.4" cy="10" r="2.3" stroke="var(--m-accent)" stroke-width="1.5" opacity=".55"></circle><path d="M22 18.6 C22 16 20.4 14.6 18.4 14.6 C17.8 14.6 17.2 14.7 16.7 14.9" stroke="var(--m-accent)" stroke-width="1.5" stroke-linecap="round" opacity=".55"></path><circle cx="12" cy="8.6" r="3.3" stroke="var(--m-accent)" stroke-width="1.8"></circle><path d="M6.7 19.4 C6.7 15.8 9.1 13.9 12 13.9 C14.9 13.9 17.3 15.8 17.3 19.4" stroke="var(--m-accent)" stroke-width="1.8" stroke-linecap="round"></path></svg>';
  // Categories: a deck of cards to draw the round from, marked with a harlequin
  // lozenge so it can't be mistaken for the script.
  const ICON_CATEGORIES_20 = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M5 16.8 L5 6.2 C5 5.2 5.8 4.4 6.8 4.4 L15.4 4.4" stroke="#b9a8dd" stroke-width="1.4" stroke-linecap="round" opacity=".55"></path><rect x="8" y="6.6" width="11.4" height="13.4" rx="2.2" stroke="#b9a8dd" stroke-width="1.7"></rect><path d="M13.7 9.9 L16.3 13.3 L13.7 16.7 L11.1 13.3 Z" stroke="#b9a8dd" stroke-width="1.4" stroke-linejoin="round"></path></svg>';
  const ICON_CATEGORIES_18 = resize(ICON_CATEGORIES_20, 18);
  // Jesters: the cap and bells, rather than a third mask icon in the same row.
  // One flat silhouette, not an outlined cone per horn — outlines at 20px put
  // four thin lines through the same few pixels and stopped reading. The crown
  // is drawn last, so the horn bases tuck behind its rim with no seams.
  const ICON_JESTERS_20 = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M10.2 17.2 C8.4 14.2 6 11.6 3.4 10.3 C2.8 10.1 2.5 10.5 2.9 11.2 C4 13.2 5.4 16.4 6.6 19.6 Z" fill="#e6a0a8"></path><path d="M13.8 17.2 C15.6 14.2 18 11.6 20.6 10.3 C21.2 10.1 21.5 10.5 21.1 11.2 C20 13.2 18.6 16.4 17.4 19.6 Z" fill="#e6a0a8"></path><path d="M10 18.8 C9.8 13.2 10 8.4 11 4.9 C11.2 4.4 11.6 4.4 11.8 4.9 C13.2 8.8 14 13.4 14.2 18.8 Z" fill="#e6a0a8"></path><circle cx="2" cy="9.6" r="1.6" fill="#e6a0a8"></circle><circle cx="10.4" cy="3.4" r="1.6" fill="#e6a0a8"></circle><circle cx="22" cy="9.6" r="1.6" fill="#e6a0a8"></circle><path d="M4.6 15.2 L7 18.4 L9.4 15.2 L11.8 18.4 L14.2 15.2 L16.6 18.4 L19 15.2 L17.6 20.4 C17.5 20.8 17.2 21 16.8 21 L7.2 21 C6.8 21 6.5 20.8 6.4 20.4 Z" fill="#e6a0a8"></path></svg>';
  const ICON_JESTERS_18 = resize(ICON_JESTERS_20, 18);
  // Time Limit: an hourglass with the sand actually running.
  const ICON_TIME = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M6.4 3.6 L17.6 3.6 M6.4 20.4 L17.6 20.4" stroke="#9fb0cf" stroke-width="1.8" stroke-linecap="round"></path><path d="M8.2 3.6 L8.2 6.6 C8.2 9.3 12 10.9 12 12 C12 13.1 8.2 14.7 8.2 17.4 L8.2 20.4 M15.8 3.6 L15.8 6.6 C15.8 9.3 12 10.9 12 12 C12 13.1 15.8 14.7 15.8 17.4 L15.8 20.4" stroke="#9fb0cf" stroke-width="1.7" stroke-linejoin="round"></path><path d="M9.6 5.6 L14.4 5.6 C14 7.6 12.6 8.7 12 9.4 C11.4 8.7 10 7.6 9.6 5.6 Z" fill="#9fb0cf" opacity=".3"></path><path d="M9.9 18.6 C10.6 16.5 13.4 16.5 14.1 18.6 Z" fill="#9fb0cf" opacity=".55"></path><path d="M12 10.9 L12 13.4" stroke="#9fb0cf" stroke-width="1.1" stroke-linecap="round" opacity=".6"></path></svg>';
  // Options: a lighting board's faders. A gear would echo the header's ⚙, which
  // opens a different screen.
  const ICON_OPTIONS = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M4 7 L6.8 7 M11.2 7 L20 7 M4 12 L12.8 12 M17.2 12 L20 12 M4 17 L8.8 17 M13.2 17 L20 17" stroke="var(--m-accent)" stroke-width="1.7" stroke-linecap="round"></path><circle cx="9" cy="7" r="2.2" stroke="var(--m-accent)" stroke-width="1.7"></circle><circle cx="15" cy="12" r="2.2" stroke="var(--m-accent)" stroke-width="1.7"></circle><circle cx="11" cy="17" r="2.2" stroke="var(--m-accent)" stroke-width="1.7"></circle></svg>';
  const ICON_SHOW_WORD = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M3 12 C5.5 7.5 9 5 12 5 C15 5 18.5 7.5 21 12 C18.5 16.5 15 19 12 19 C9 19 5.5 16.5 3 12 Z" stroke="#9fb0cf" stroke-width="1.8"></path><circle cx="12" cy="12" r="2.5" stroke="#9fb0cf" stroke-width="1.4"></circle><path d="M5 19 L19 5" stroke="#9fb0cf" stroke-width="1.8" stroke-linecap="round"></path></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none"><rect x="7" y="5" width="3.6" height="14" rx="1.4" fill="var(--m-accent)"></rect><rect x="13.4" y="5" width="3.6" height="14" rx="1.4" fill="var(--m-accent)"></rect></svg>';
  const ICON_PLAY = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none"><path d="M8.5 5.4 L18 12 L8.5 18.6 Z" fill="var(--m-accent)" stroke="var(--m-accent)" stroke-width="1.8" stroke-linejoin="round"></path></svg>';
  const ICON_STEP1 = '<svg viewBox="0 0 32 32" width="28" height="28"><circle cx="16" cy="10" r="5" fill="none" stroke="#9fb0cf" stroke-width="2"></circle><path d="M11 14 L6 28 M21 14 L26 28 M8 28 L24 28" stroke="#9fb0cf" stroke-width="2" stroke-linecap="round"></path><path d="M13 18 L19 18" stroke="var(--m-brand)" stroke-width="1.5" stroke-linecap="round"></path><path d="M12 22 L20 22" stroke="var(--m-brand)" stroke-width="1.5" stroke-linecap="round"></path><circle cx="16" cy="10" r="2.5" fill="var(--m-brand)"></circle></svg>';
  const ICON_STEP2 = '<svg viewBox="0 0 32 32" width="28" height="28"><ellipse cx="16" cy="15" rx="11" ry="12" fill="none" stroke="#e6a0a8" stroke-width="2"></ellipse><path d="M10 13 Q13 10 16 13" fill="none" stroke="#e6a0a8" stroke-width="1.8" stroke-linecap="round"></path><path d="M16 13 Q19 10 22 13" fill="none" stroke="#e6a0a8" stroke-width="1.8" stroke-linecap="round"></path><path d="M11 21 Q16 27 21 21" fill="none" stroke="#e6a0a8" stroke-width="2" stroke-linecap="round"></path></svg>';
  const ICON_STEP3 = '<svg viewBox="0 0 32 32" width="28" height="28"><path d="M16 6 L16 20" stroke="var(--m-brand)" stroke-width="2.5" stroke-linecap="round"></path><path d="M10 14 L16 20 L22 14" fill="none" stroke="var(--m-brand)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path><rect x="8" y="24" width="16" height="3" rx="1.5" fill="var(--m-brand)" opacity="0.5"></rect></svg>';
  const ICON_STEP4 = '<svg viewBox="0 0 32 32" width="28" height="28"><ellipse cx="16" cy="15" rx="11" ry="12" fill="none" stroke="#f4a0a8" stroke-width="2"></ellipse><path d="M10 13 Q13 16 16 13" fill="none" stroke="#f4a0a8" stroke-width="1.8" stroke-linecap="round"></path><path d="M16 13 Q19 16 22 13" fill="none" stroke="#f4a0a8" stroke-width="1.8" stroke-linecap="round"></path><path d="M11 23 Q16 17 21 23" fill="none" stroke="#f4a0a8" stroke-width="2" stroke-linecap="round"></path><path d="M23 6 L26 3 M26 3 L29 6 M26 3 L26 8" stroke="#f4a0a8" stroke-width="1.5" stroke-linecap="round"></path></svg>';

  // ---- Mask ----
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

  // ---- App: game state + logic ----
  class App extends React.Component {
    state = {
      screen: 'lobby', viewed: {}, activePlayer: null, cardOpen: false,
      modal: null,
      playerList: INITIAL_PLAYERS.map(p => p.name),
      playerKeys: INITIAL_PLAYERS.map(p => p.id),
      addingPlayer: false, newName: '', editingIdx: null, editingVal: '', removingIds: [],
      // Mode, categories, jesters, clock, options and theme, restored as the
      // table left them. Fields and opening values are in DEFAULT_SETTINGS.
      ...INITIAL_SETTINGS,
      // The progressive cycle itself, unlike the setting that turns it on, is
      // in-memory only: a reload or a roster change starts it over.
      jesterWeights: {},
      // Alphabetical: also the order the tiles and word lists render in.
      museUnlocked: INITIAL_MUSE_UNLOCKED,
      categories: INITIAL_MUSE_UNLOCKED ? ROLE_CATEGORIES : OPEN_ROLE_CATEGORIES,
      wordCategories: WORD_CATEGORIES,
      roundJesterIndices: null,
      roundStarterIdx: null,
      roundCategory: 'Locations',
      roundWord: '',
      roundRoleMap: {},
      roundJesterRoleMap: {},
      roundJesterWordMap: {},
      // One hint for the round, shared by every jester in it — see
      // wordHintCatalog in src/data_words.js for why it isn't one each.
      roundJesterHint: null,
      secondsLeft: null,
      timeUp: false,
      timerPaused: false,
      wordListExpanded: [],
      // Results keeps the round word covered so the jester still has a shot at
      // guessing it, with the category's words on hand to pick from.
      resultsWordShown: false,
      resultsPoolOpen: false,
      disabledWords: INITIAL_DISABLED,
      customCategories: INITIAL_CUSTOM,
      customDraft: null,
      customError: '',
      customDeleteId: null,
      customFrom: 'settings',
    };

    // Past the highest saved id, so a new player can't collide with a restored
    // one and inherit their round card.
    __nextPlayerId = INITIAL_PLAYERS.reduce((max, p) => Math.max(max, p.id), -1) + 1;

    componentDidMount() {
      applyTheme(this.state.darkMode, this.state.jesterMode);
      this.__fitPhoneShell = this.__fitPhoneShell.bind(this);
      this.__fitPhoneShell();
      window.addEventListener('resize', this.__fitPhoneShell);
      // Jester mode: pointer spark trail, built outside React so it never
      // triggers a re-render.
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
      // Every edit, add and remove rebuilds the arrays, so identity spots them
      // all in one place.
      if (prev.playerList !== this.state.playerList || prev.playerKeys !== this.state.playerKeys) {
        savePlayers(this.state.playerList, this.state.playerKeys);
      }
      // Same for the crossings: every toggle and reset builds a new map rather
      // than editing the old one.
      if (prev.disabledWords !== this.state.disabledWords) {
        saveDisabledWords(this.state.disabledWords);
      }
      // And the lobby, written as one blob, so one sweep of the field list
      // covers every setting. Category picks are rebuilt rather than pushed
      // into, so identity works for the one field that isn't a scalar.
      if (SETTINGS_FIELDS.some(field => prev[field] !== this.state[field])) {
        saveSettings(this.state);
      }
    }

    componentWillUnmount() {
      this.__clearTimer();
      window.removeEventListener('resize', this.__fitPhoneShell);
      window.removeEventListener('pointermove', this.__spark);
      if (this.__audioCtx) this.__audioCtx.close();
    }

    // Jester mode: tilt the card toward the pointer and slide its foil sheen.
    // --hx/--hy feed the .j-holo gradient.
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

    // Fetches every image this round can put on a card, the moment it's dealt.
    // The card only mounts when a player opens their overlay, so otherwise the
    // request starts one tap before the curtain and the artwork lands late.
    // Worst on Music rounds: our cover size isn't one of Deezer's pre-renders,
    // so a cold cover costs ~0.3s against ~0.03s for a warm one.
    //
    // Fire and forget — the point is the bytes being cached by the time the
    // <img> mounts, and a failed preload costs nothing, since the card already
    // treats a dead URL as no art.
    __preloadRoundArt(round, gameMode) {
      if (typeof window === 'undefined' || !window.Image) return;
      const cat = round.roundCategory;
      // Mirrors how renderVals picks apArt: word-only rounds print no roles, so
      // their role artwork stays unfetched.
      const roleArt = gameMode === 'words' ? null
        : cat === 'Movie/TV Show Genres' ? posterFor
          : cat === 'Music Genres' ? albumFor
            : cat === 'Biomes' ? animalFor
              : cat === 'Cuisines' ? foodFor
                : cat === 'Muse' ? museCoverFor
                : null;
      const urls = new Set();
      const add = (fn, value) => { const url = fn(value); if (url) urls.add(url); };
      if (roleArt) {
        Object.values(round.roundRoleMap || {}).forEach(r => add(roleArt, r));
        Object.values(round.roundJesterRoleMap || {}).forEach(r => add(roleArt, r));
      }
      // Three word-only categories picture the word itself; a disguised jester
      // gets their fake word's picture instead.
      const wordArt = cat === 'Movies/TV' ? posterFor
        : cat === 'Food/Drinks' ? foodFor
          : cat === 'Animals' ? animalFor
            : cat === 'Objects' ? objectFor
              : null;
      if (wordArt) {
        add(wordArt, round.roundWord);
        Object.values(round.roundJesterWordMap || {}).forEach(w => add(wordArt, w));
      }
      urls.forEach((url) => { const img = new window.Image(); img.src = url; });
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

    __tick = () => {
      const left = (this.state.secondsLeft || 0) - 1;
      if (left <= 0) {
        this.__clearTimer();
        this.setState({ secondsLeft: 0, timeUp: true, timerPaused: false });
        this.__playTimerSound();
      } else {
        this.setState({ secondsLeft: left });
      }
    };

    // Pause clears the interval, resume starts a fresh one, so the countdown
    // always restarts on a whole second.
    __runTimer() {
      if (this.__timerId) return;
      this.__timerId = setInterval(this.__tick, 1000);
    }

    __startTimer(minutes) {
      this.__clearTimer();
      if (!minutes) {
        this.setState({ secondsLeft: null, timeUp: false, timerPaused: false });
        return;
      }
      if (this.state.soundEffects) this.__ensureAudioCtx();
      this.setState({ secondsLeft: minutes * 60, timeUp: false, timerPaused: false });
      this.__runTimer();
    }

    renderVals() {
      const st = this.state;
      const wine = '#6e141c', crimson = '#b3202f';
      const ivoryFace = '#efe4c8';

      const faceColors = st.jesterMode
        ? ['#fdf4ff', '#f3e8ff', '#fef9c3', '#fce7f3', '#ecfccb', '#e0f2fe']
        : ['#efe4c8', '#e7d9b6', '#e0cfa6', '#ecdfc0', '#e8ddb5', '#f0e6c9'];
      const lineColors = st.jesterMode
        ? ['#7b2ff7', '#db2777', '#16a34a', '#d97706', '#7c3aed', '#be185d']
        : ['#7a1620', '#14254a', '#2e5bb0', '#6e141c', '#4a3010', '#7a1620'];
      const { biomeCatalog, cuisineCatalog, locationCatalog, fakeLocationRoleCatalog, fakeBiomeRoleCatalog, fakeCuisineRoleCatalog, movieTvCatalog, fakeMovieTvRoleCatalog, musicGenreCatalog, fakeMusicGenreRoleCatalog, museCatalog, fakeMuseRoleCatalog } = window.MASQ_LOCATIONS_DATA;
      // Word Mode's own file: the word-only catalogs and their jester hints.
      const { wordOnlyCatalog, wordHintCatalog } = window.MASQ_WORDS;
      const biomeNames = Object.keys(biomeCatalog);
      const cuisineNames = Object.keys(cuisineCatalog);
      const locationNames = Object.keys(locationCatalog);
      const movieTvGenreNames = Object.keys(movieTvCatalog);
      const musicGenreNames = Object.keys(musicGenreCatalog);
      const museAlbumNames = Object.keys(museCatalog);
      const shuffle = (items) => {
        const next = [...items];
        for (let i = next.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [next[i], next[j]] = [next[j], next[i]];
        }
        return next;
      };
      const custom = Array.isArray(st.customCategories) ? st.customCategories : [];
      const customByName = custom.reduce((acc, c) => { acc[c.name] = c; return acc; }, {});
      // A role category with no roles left counts as word-only, so Role Mode
      // can never deal a roleless round.
      const customIsWordOnly = (c) => c.kind === 'words' || !c.entries.some(e => e.roles && e.roles.length);
      const customWordOnlyNames = custom.filter(customIsWordOnly).map(c => c.name);
      const customNames = custom.map(c => c.name);
      const wordOnlyNames = [...st.wordCategories, ...customWordOnlyNames];
      const allCategoryNames = [...st.categories, ...st.wordCategories, ...customNames];
      const rawWordPool = (category) => {
        if (customByName[category]) return customByName[category].entries.map(e => e.word);
        if (category === 'Biomes') return biomeNames;
        if (category === 'Cuisines') return cuisineNames;
        if (category === 'Movie/TV Show Genres') return movieTvGenreNames;
        if (category === MUSE_CATEGORY) return museAlbumNames;
        if (category === 'Music Genres') return musicGenreNames;
        if (category === 'Food/Drinks') return wordOnlyCatalog['Food/Drinks'];
        if (category === 'Animals') return wordOnlyCatalog.Animals;
        if (category === 'Objects') return wordOnlyCatalog.Objects;
        if (category === 'Movies/TV') return wordOnlyCatalog['Movies/TV'];
        return locationNames;
      };
      // Crossed-out words are skipped; the word list keeps at least one per
      // category, so a pool is never empty.
      const getWordPool = (category) => {
        const raw = rawWordPool(category);
        const off = (st.disabledWords || {})[category] || [];
        if (!off.length) return raw;
        const kept = raw.filter(w => !off.includes(w));
        return kept.length ? kept : raw;
      };
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
      const isProgressive = st.jesterSelection === 'progressive';
      const randMax = Math.min(st.jesterRandMax, maxJesters);
      const randMin = Math.min(st.jesterRandMin, randMax);
      // Derived, not read off state. Word Mode always shows the word; Role Mode
      // hides it while the jester is disguised, since a block everyone but them
      // carries would give them away.
      const wordLocked = st.gameMode === 'words' || st.jesterGetsRole;
      const showWord = st.gameMode === 'words' ? true : (st.jesterGetsRole ? false : st.showWord);
      // Same shape as wordLocked: a hint is a Word Mode idea, and it can only
      // reach a jester who hasn't been handed a fake word to believe in.
      const hintsAvailable = st.gameMode === 'words' && !st.jesterGetsRole;
      const roundJesterIndices = Array.isArray(st.roundJesterIndices) ? st.roundJesterIndices : [];
      const jesterIndices = new Set(roundJesterIndices);
      // Round state is keyed by this id, never by name: two players called
      // "Alex" are two players.
      const playerId = (i) => ((st.playerKeys && st.playerKeys[i] != null) ? st.playerKeys[i] : i);
      const players = st.playerList.map((name, i) => ({
        id: playerId(i),
        name,
        comedy: i % 2 === 0,
        tragedy: i % 2 !== 0,
        face: faceColors[i % faceColors.length],
        line: lineColors[i % lineColors.length],
        jester: jesterIndices.has(i),
      }));
      const playerIds = players.map(p => p.id);
      const jesterWeights = normalizeWeights(st.jesterWeights, playerIds);
      const weightTotal = playerIds.reduce((sum, id) => sum + (jesterWeights[id] || 0), 0);

      const roundCategory = st.roundCategory || 'Locations';
      const roundRoleMap = st.roundRoleMap || {};
      const roundJesterRoleMap = st.roundJesterRoleMap || {};
      const roundJesterWordMap = st.roundJesterWordMap || {};
      const isBiomeRound = roundCategory === 'Biomes';
      const isCuisineRound = roundCategory === 'Cuisines';
      const isMovieTvRound = roundCategory === 'Movie/TV Show Genres';
      const isMusicRound = roundCategory === 'Music Genres';
      const isMuseRound = roundCategory === MUSE_CATEGORY;
      const isFoodRound = roundCategory === 'Food/Drinks';
      const isAnimalsRound = roundCategory === 'Animals';
      const isObjectsRound = roundCategory === 'Objects';
      const isMoviesWordRound = roundCategory === 'Movies/TV';
      const isCustomRound = !!customByName[roundCategory];
      const actOnePlayers = players.map(p => {
        const seen = !!st.viewed[p.id];
        return {
          ...p, seen,
          rowBg: seen ? 'var(--m-ready-bg)' : 'var(--m-lift)',
          rowBorder: seen ? 'var(--m-ready-border)' : '1px solid var(--m-border-med)',
          labelColor: seen ? 'var(--m-ready-color)' : 'var(--m-idle-label)',
          label: seen ? '✓ Ready' : 'Tap →',
          onTap: () => this.setState({ activePlayer: p, cardOpen: false }),
        };
      });
      const allSeen = players.every(p => st.viewed[p.id]);
      const ap = st.activePlayer;
      const apIsJester = ap && !!ap.jester;
      const apRoundRole = ap && !apIsJester ? (roundRoleMap[ap.id] || 'PERFORMER') : null;
      // A disguise only holds if the round produced one. A single-word category
      // has nothing to fake with, so that jester is told they're the Jester.
      const apFakeRoleRaw = ap ? (roundJesterRoleMap[ap.id] || null) : null;
      const apFakeWordRaw = ap ? (roundJesterWordMap[ap.id] || null) : null;
      const apRoleDisguised = apIsJester && st.gameMode === 'roles' && st.jesterGetsRole && !!apFakeRoleRaw;
      const apWordDisguised = apIsJester && st.gameMode === 'words' && st.jesterGetsRole && !!apFakeWordRaw;
      const apFakeRole = apRoleDisguised ? apFakeRoleRaw : null;
      const apFakeWord = apWordDisguised ? apFakeWordRaw : null;
      const apIsUndisguisedJester = apIsJester && !apRoleDisguised && !apWordDisguised;
      // Artwork tracks what this player is shown, never the round's real answer:
      // a disguised jester gets their fake movie's poster.
      const apWordShown = apIsJester ? (apWordDisguised ? apFakeWord : null) : st.roundWord;
      const apRoleShown = apIsUndisguisedJester ? 'THE JESTER' : (apIsJester ? (apFakeRole || 'PERFORMER') : apRoundRole);
      // Movies/TV round: the word is a film or series. Hidden with the word.
      const apWordPoster = isMoviesWordRound && showWord ? posterFor(apWordShown) : null;
      // Food and Animals rounds picture the word the same way, off the same two
      // maps the Cuisines and Biomes roles read — a pizza is a pizza and a wolf
      // is a wolf, whether the round makes it a role or the answer.
      const apWordFood = isFoodRound && showWord ? foodFor(apWordShown) : null;
      const apWordAnimal = isAnimalsRound && showWord ? animalFor(apWordShown) : null;
      const apWordObject = isObjectsRound && showWord ? objectFor(apWordShown) : null;
      // Word Mode deals roles but never prints them, so their artwork stays off
      // too — a picture of a role nobody can read still gives it away.
      const apRoleVisible = st.gameMode !== 'words';
      // Movie/TV Show Genres round: the *role* is a title, so the poster belongs
      // to it. 'THE JESTER' and 'PERFORMER' aren't titles and match nothing.
      const apRolePoster = isMovieTvRound && apRoleVisible ? posterFor(apRoleShown) : null;
      // Music Genres round: the role is "Artist (Song)", pictured by that song's
      // album. Square, so it gets its own size rather than a poster's 2:3.
      const apRoleAlbum = isMusicRound && apRoleVisible ? albumFor(apRoleShown) : null;
      // Biomes round: the role is a creature, pictured by its photograph —
      // usually landscape, so it gets a shape of its own. See ART_SHAPES.
      const apRoleAnimal = isBiomeRound && apRoleVisible ? animalFor(apRoleShown) : null;
      // Cuisines round: the role is a food, pictured by its photograph. Same
      // landscape frame as an animal, cropped centrally — see ART_SHAPES.
      const apRoleFood = isCuisineRound && apRoleVisible ? foodFor(apRoleShown) : null;
      const apRoleMuseCover = isMuseRound && apRoleVisible ? museCoverFor(apRoleShown) : null;
      const apArt = apWordPoster || apWordFood || apWordAnimal || apWordObject
        || apRolePoster || apRoleAlbum || apRoleAnimal || apRoleFood || apRoleMuseCover;
      // Show Word stacks a word block and a role block under the artwork, and
      // either can wrap — at full size that clips against the card's
      // overflow:hidden. A word-only round prints no role, so nothing stacks
      // and its artwork stays full size.
      const apArtCompact = !!(apRolePoster || apRoleAlbum || apRoleAnimal || apRoleFood || apRoleMuseCover) && showWord;
      const apArtShape = ART_SHAPES[(apRoleFood || apWordFood || apWordObject) ? 'plate'
        : ((apRoleAnimal || apWordAnimal) ? 'photo'
          : ((apRoleAlbum || apRoleMuseCover) ? 'cover' : 'poster'))];
      const [apArtW, apArtH] = apArtShape[apArtCompact ? 'compact' : 'full'];
      const closeOverlay = () => {
        if (ap) this.setState(s => ({ activePlayer: null, cardOpen: false, viewed: { ...s.viewed, [ap.id]: true } }));
      };
      const openCurtain = () => this.setState({ cardOpen: true });
      // Backing out of a mis-tapped name leaves that player unviewed, so they
      // can still take their turn.
      const cancelOverlay = () => this.setState({ activePlayer: null, cardOpen: false });
      // The backdrop does whatever the visible button does: back out with the
      // curtain down, dismiss-as-read once it's up.
      const dismissOverlay = () => { if (st.cardOpen) closeOverlay(); else cancelOverlay(); };

      // Gated the same way the reveal card is, so results can never claim a
      // disguise the player was never shown.
      const jesterReveals = players.filter(p => p.jester).map((p) => {
        const fakeRole = st.gameMode === 'roles' && st.jesterGetsRole ? (roundJesterRoleMap[p.id] || null) : null;
        const fakeWord = st.gameMode === 'words' && st.jesterGetsRole ? (roundJesterWordMap[p.id] || null) : null;
        return {
          name: p.name,
          disguise: fakeRole
            ? 'Posed as ' + fakeRole
            : (fakeWord ? 'Held the fake word ' + fakeWord : null),
        };
      });
      // Everyone who held a real role, off the same map the reveal card read,
      // so it can only show what a player was actually dealt. Word Mode is
      // excluded outright: buildRound still fills roundRoleMap there, but the
      // cards never show a role, so those roles were dealt to nobody.
      const castReveals = st.gameMode === 'words' ? [] : players
        .filter(p => !p.jester && roundRoleMap[p.id])
        .map(p => ({ name: p.name, role: roundRoleMap[p.id] }));
      return {
        actOnePlayers, allSeen,
        showOverlay: !!ap,
        apName: ap ? ap.name : '',
        apComedy: ap ? ap.comedy : true, apTragedy: ap ? ap.tragedy : false,
        apFace: ap ? ap.face : '#efe4c8', apLine: ap ? ap.line : '#7a1620',
        apRole: apRoleShown,
        apRoleColor: apIsUndisguisedJester ? '#b3202f' : (isBiomeRound ? '#2e5bb0' : (isCuisineRound ? '#a85a2b' : (isMovieTvRound ? '#2f8f7a' : (isMuseRound ? '#8b5cf6' : (isMusicRound ? '#6b4ea8' : 'var(--m-accent)'))))),
        // Same reason as apWordSize: artwork leaves less room, and "Artist
        // (Song)" runs longer than a film title. Cuisines carry no artwork but
        // still sit below the default, for "Schwarzwalder Kirschtorte".
        apRoleSize: apIsUndisguisedJester ? '26px' : (apRolePoster ? '17px' : (apRoleAlbum ? '16px' : ((apRoleAnimal || apRoleFood) ? '18px' : (isBiomeRound ? '22px' : (isCuisineRound ? '20px' : (isMuseRound ? (apRoleMuseCover ? '15px' : '17px') : ((isMusicRound || isMovieTvRound) ? '19px' : '23px'))))))),
        apWord: apWordShown,
        apArt, apArtW, apArtH, apArtFocus: apArtShape.focus,
        apWordLabel: isCustomRound ? 'Word' : (isBiomeRound ? 'Biome' : (isCuisineRound ? 'Cuisine' : (isMovieTvRound ? 'Genre' : (isMuseRound ? 'Album' : (isMusicRound ? 'Genre' : (isFoodRound ? 'Food / Drink' : (isAnimalsRound ? 'Animal' : (isObjectsRound ? 'Object' : (isMoviesWordRound ? 'Movie / TV' : 'Location'))))))))),
        // Artwork eats most of the card, so long titles shrink to stay inside it
        // rather than clipping against overflow:hidden.
        apWordSize: apArt ? '17px' : (isBiomeRound ? '20px' : '22px'),
        apWordBlockStyle: showWord ? '' : 'display:none;',
        apIsUndisguisedJester,
        apIsDisguisedJester: apRoleDisguised,
        apIsPerformer: !apIsJester || apWordDisguised,
        // Excluded by id, so a jester who shares a name isn't struck from their
        // own ally list.
        apJesterAllies: apIsUndisguisedJester && st.jestersKnow && jesterReveals.length > 1
          ? players.filter(p => p.jester && p.id !== (ap ? ap.id : null)).map(p => p.name).join(', ')
          : null,
        apShowAllies: apIsUndisguisedJester && st.jestersKnow && jesterReveals.length > 1,
        // Dealt at the top of the round, so every jester reads the same one and
        // re-opening the card can't roll for a better clue.
        apJesterHint: apIsUndisguisedJester ? (st.roundJesterHint || null) : null,
        apShowHint: apIsUndisguisedJester && !!st.roundJesterHint,
        starterName: st.playerList[st.roundStarterIdx] || st.playerList[0],
        gameCategory: roundCategory,
        roundWordDisplay: st.roundWord,
        // The answer's own picture, for the categories that have one. Shaped
        // like the card's, two thirds the size — a poster stands, a plate and
        // an animal lie down.
        resultsArt: isMoviesWordRound ? posterFor(st.roundWord)
          : (isFoodRound ? foodFor(st.roundWord)
            : (isAnimalsRound ? animalFor(st.roundWord)
              : (isObjectsRound ? objectFor(st.roundWord) : null))),
        resultsArtW: isMoviesWordRound ? '84px' : '112px',
        resultsArtH: isMoviesWordRound ? '126px' : '84px',
        resultsArtFocus: isAnimalsRound ? '50% 25%' : '50% 50%',
        // Covered until someone taps it, so the jester can guess first. The
        // poster is part of the answer, so it waits too.
        roundWordShown: st.resultsWordShown,
        revealRoundWord: () => this.setState({ resultsWordShown: true }),
        // What the jester picks from: the pool the round was dealt out of,
        // crossed-out words included, sorted for scanning.
        roundWordPool: [...getWordPool(roundCategory)].sort((a, b) => a.localeCompare(b)),
        poolOpen: st.resultsPoolOpen,
        openWordPool: () => this.setState({ resultsPoolOpen: true }),
        closeWordPool: () => this.setState({ resultsPoolOpen: false }),
        cardOpen: st.cardOpen,
        openCurtain, closeOverlay, cancelOverlay, dismissOverlay,
        leftCurtain: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '50.5%', background: 'repeating-linear-gradient(90deg,var(--m-curt1) 0 12px,var(--m-curt2) 12px 22px)', boxShadow: 'inset -16px 0 30px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', transform: st.cardOpen ? 'translateX(-104%)' : 'translateX(0)', transition: 'transform 1.1s cubic-bezier(.7,0,.18,1)' },
        rightCurtain: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '50.5%', background: 'repeating-linear-gradient(90deg,var(--m-curt2) 0 12px,var(--m-curt1) 12px 22px)', boxShadow: 'inset 16px 0 30px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', transform: st.cardOpen ? 'translateX(104%)' : 'translateX(0)', transition: 'transform 1.1s cubic-bezier(.7,0,.18,1)' },
        curtainHint: st.cardOpen ? '' : 'TAP TO REVEAL',
        hasModal: !!st.modal,
        isModalCategories: st.modal === 'categories',
        isModalJesters: st.modal === 'jesters',
        isModalTime: st.modal === 'time',
        isModalHelp: st.modal === 'help',
        isModalSettings: st.modal === 'settings',
        isModalGameSettings: st.modal === 'gameSettings',
        isModalWordList: st.modal === 'wordList',
        isModalCredits: st.modal === 'credits',
        photoCredits: PHOTO_CREDITS,
        foodCredits: FOOD_CREDITS,
        objectCredits: OBJECT_CREDITS,
        isModalPlayers: st.modal === 'players',
        isModalCustom: st.modal === 'custom',
        isModalCustomEdit: st.modal === 'customEdit',
        closeModal: () => this.setState({ modal: null }),
        museUnlocked: st.museUnlocked,
        unlockMuse: () => {
          if (st.museUnlocked) return;
          saveMuseUnlocked();
          this.setState({ museUnlocked: true, categories: ROLE_CATEGORIES });
        },
        openPlayers: () => this.setState({ modal: 'players' }),
        openCategories: () => this.setState({ modal: 'categories' }),
        openJesters: () => this.setState({ modal: 'jesters' }),
        openTime: () => this.setState({ modal: 'time' }),
        openHelp: () => this.setState({ modal: 'help' }),
        openSettings: () => this.setState({ modal: 'settings' }),
        openGameSettings: () => this.setState({ modal: 'gameSettings' }),
        openWordList: () => this.setState({ modal: 'wordList', wordListExpanded: [] }),
        openCredits: () => this.setState({ modal: 'credits' }),
        // Reachable from Settings and from the Categories picker; close returns
        // to whichever you came in through.
        openCustom: () => this.setState(prev => ({ modal: 'custom', customFrom: prev.modal === 'categories' ? 'categories' : 'settings', customDeleteId: null })),
        closeCustom: () => this.setState(prev => ({ modal: prev.customFrom || 'settings', customDeleteId: null })),
        customCount: custom.length,
        customCountLabel: custom.length === 0 ? 'None yet' : custom.length === 1 ? '1 category' : custom.length + ' categories',
        customCats: custom.map((c) => {
          const roleCount = c.entries.reduce((n, e) => n + ((e.roles && e.roles.length) || 0), 0);
          const wordLabel = c.entries.length === 1 ? '1 word' : c.entries.length + ' words';
          const pendingDelete = st.customDeleteId === c.id;
          return {
            id: c.id,
            name: c.name,
            summary: c.kind === 'words'
              ? `Word category · ${wordLabel}`
              : `Role category · ${wordLabel} · ${roleCount === 1 ? '1 role' : roleCount + ' roles'}`,
            pendingDelete,
            inUse: st.selCategories.includes(c.name),
            onEdit: () => this.setState({
              modal: 'customEdit',
              customDraft: {
                id: c.id,
                kind: c.kind,
                name: c.name,
                entries: c.entries.map(e => ({ word: e.word, rolesText: (e.roles || []).join(', ') })),
                wordsText: c.entries.map(e => e.word).join(', '),
              },
              customError: '',
              customDeleteId: null,
            }),
            onDelete: (e) => {
              e.stopPropagation();
              if (!pendingDelete) {
                this.setState({ customDeleteId: c.id });
                return;
              }
              const list = custom.filter(x => x.id !== c.id);
              saveCustomCategories(list);
              const sel = st.selCategories.filter(n => n !== c.name);
              this.setState({
                customCategories: list,
                selCategories: sel.length ? sel : [...st.categories],
                customDeleteId: null,
              });
            },
          };
        }),
        // No kind yet — that's what shows the "role or words?" step first.
        newCustom: () => this.setState({
          modal: 'customEdit',
          customDraft: { id: null, kind: null, name: '', entries: [{ word: '', rolesText: '' }], wordsText: '' },
          customError: '',
          customDeleteId: null,
        }),
        draftIsNew: !(st.customDraft && st.customDraft.id),
        draftKind: st.customDraft ? st.customDraft.kind : null,
        draftIsWords: !!st.customDraft && st.customDraft.kind === 'words',
        // Switching kind carries the words across so nothing typed is lost.
        setDraftKind: (kind) => this.setState((prev) => {
          const d = prev.customDraft;
          if (!d || d.kind === kind) return null;
          if (kind === 'words') {
            const carried = d.entries.map(e => (e.word || '').trim()).filter(Boolean);
            return { customDraft: { ...d, kind, wordsText: carried.length ? carried.join(', ') : d.wordsText }, customError: '' };
          }
          const carried = parseWordList(d.wordsText);
          const entries = carried.length
            ? carried.map((word) => {
                const kept = d.entries.find(e => (e.word || '').trim().toLowerCase() === word.toLowerCase());
                return { word, rolesText: kept ? kept.rolesText : '' };
              })
            : d.entries;
          return { customDraft: { ...d, kind, entries: entries.length ? entries : [{ word: '', rolesText: '' }] }, customError: '' };
        }),
        draftWordsText: st.customDraft ? (st.customDraft.wordsText || '') : '',
        draftWordCount: (() => {
          if (!st.customDraft || st.customDraft.kind !== 'words') return 0;
          return parseWordList(st.customDraft.wordsText).length;
        })(),
        onDraftWordsChange: (ev) => {
          const value = ev.target.value;
          this.setState(prev => ({ customDraft: { ...prev.customDraft, wordsText: value }, customError: '' }));
        },
        draftName: st.customDraft ? st.customDraft.name : '',
        draftEntries: (st.customDraft ? st.customDraft.entries : []).map((e, i) => ({
          word: e.word,
          rolesText: e.rolesText,
          onlyOne: st.customDraft.entries.length === 1,
          onWordChange: (ev) => this.__setDraftEntry(i, { word: ev.target.value }),
          onRolesChange: (ev) => this.__setDraftEntry(i, { rolesText: ev.target.value }),
          onRemove: () => this.setState(prev => ({
            customDraft: { ...prev.customDraft, entries: prev.customDraft.entries.filter((_, j) => j !== i) },
            customError: '',
          })),
        })),
        customError: st.customError,
        onDraftNameChange: (ev) => this.setState(prev => ({ customDraft: { ...prev.customDraft, name: ev.target.value }, customError: '' })),
        addDraftEntry: () => this.setState(prev => ({
          customDraft: { ...prev.customDraft, entries: [...prev.customDraft.entries, { word: '', rolesText: '' }] },
          customError: '',
        })),
        cancelDraft: () => this.setState({ modal: 'custom', customDraft: null, customError: '' }),
        // Every built-in name, not just the ones on screen: Muse is missing from
        // the picker until it's found, and a custom category named after it
        // would shadow the real one everywhere the round is dealt.
        saveDraft: () => this.__saveCustomDraft(custom, [...ROLE_CATEGORIES, ...st.wordCategories]),
        // Role categories then word categories, alphabetical within each — the
        // same split and order the category picker uses.
        wordListGroups: [
          { cat: 'Biomes', words: biomeNames },
          { cat: 'Cuisines', words: cuisineNames },
          { cat: 'Locations', words: locationNames },
          { cat: 'Movie/TV Show Genres', words: movieTvGenreNames },
          ...(st.museUnlocked ? [{ cat: MUSE_CATEGORY, words: museAlbumNames }] : []),
          { cat: 'Music Genres', words: musicGenreNames },
          { cat: 'Animals', words: wordOnlyCatalog.Animals },
          { cat: 'Food/Drinks', words: wordOnlyCatalog['Food/Drinks'] },
          { cat: 'Movies/TV', words: wordOnlyCatalog['Movies/TV'] },
          { cat: 'Objects', words: wordOnlyCatalog.Objects },
        ].map(g => {
          const open = (st.wordListExpanded || []).includes(g.cat);
          const off = (st.disabledWords || {})[g.cat] || [];
          const kept = g.words.filter(w => !off.includes(w)).length;
          return {
            ...g, open,
            chevron: open ? 'rotate(90deg)' : 'rotate(0deg)',
            countLabel: kept === g.words.length ? `${g.cat} (${g.words.length})` : `${g.cat} (${kept}/${g.words.length})`,
            lastOne: kept === 1,
            hasCrossed: kept < g.words.length,
            resetCat: (e) => {
              e.stopPropagation();
              const map = { ...(this.state.disabledWords || {}) };
              delete map[g.cat];
              this.setState({ disabledWords: map });
            },
            toggle: () => {
              const cur = this.state.wordListExpanded || [];
              this.setState({ wordListExpanded: cur.includes(g.cat) ? cur.filter(c => c !== g.cat) : [...cur, g.cat] });
            },
            items: g.words.map(w => {
              const crossed = off.includes(w);
              // The last surviving word is locked; an empty category has
              // nothing to deal.
              const locked = !crossed && kept === 1;
              return {
                word: w, crossed, locked,
                style: crossed
                  ? "font-family:'EB Garamond',serif; font-size:13px; color:var(--m-dim); background:transparent; border:1px solid var(--m-border); border-radius:8px; padding:5px 10px; cursor:pointer; text-decoration:line-through; opacity:.55;"
                  : locked
                    ? "font-family:'EB Garamond',serif; font-size:13px; color:var(--m-body); background:var(--m-lift); border:1px dashed var(--m-border-strong); border-radius:8px; padding:5px 10px; cursor:default;"
                    : "font-family:'EB Garamond',serif; font-size:13px; color:var(--m-body); background:var(--m-lift); border:1px solid var(--m-border); border-radius:8px; padding:5px 10px; cursor:pointer;",
                toggleWord: () => {
                  if (locked) return;
                  const map = { ...(this.state.disabledWords || {}) };
                  const cur = map[g.cat] || [];
                  map[g.cat] = cur.includes(w) ? cur.filter(x => x !== w) : [...cur, w];
                  this.setState({ disabledWords: map });
                },
              };
            }),
          };
        }),
        // A disguised jester doesn't know they're one, so the summary drops that
        // claim.
        gameSettingsSummary: [st.showCategory ? 'Show Category' : null, showWord ? 'Show Word' : 'Word Hidden', (st.jestersKnow && !st.jesterGetsRole) ? 'Jesters Know Each Other' : null, st.jesterGetsRole ? (st.gameMode === 'words' ? 'Jester Gets Word' : 'Jester Gets Role') : null, (st.jesterHints && st.gameMode === 'words' && !st.jesterGetsRole) ? 'Jester Hints' : null].filter(Boolean).join(' · ') || 'Default',
        playerItems: st.playerList.map((name, i) => {
          const editing = st.editingIdx === i;
          const p = players[i];
          const pid = p.id;
          const removing = (st.removingIds || []).includes(pid);
          // An empty cast would open the trial with "undefined asks the first
          // question", so the last player's × goes inert.
          const onlyOne = st.playerList.length <= 1;
          return {
            name, pid, editing, removing, onlyOne,
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
              if (removing || onlyOne) return;
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
        addingPlayer: st.addingPlayer,
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
        // Word-only customs are hidden in Role Mode, like the built-in ones.
        customCategoryItems: (st.gameMode === 'words' ? custom : custom.filter(c => !customIsWordOnly(c))).map(c => mapCategoryItem(c.name)),
        hasCustomInPicker: (st.gameMode === 'words' ? custom.length : custom.filter(c => !customIsWordOnly(c)).length) > 0,
        catSummary: st.selCategories.length === allCategoryNames.length ? allCategoryNames.join(', ') : st.selCategories.join(', '),
        // Clamped to the cast: removing players can strand a saved count above
        // what the table seats.
        jesterCount,
        incJester: () => this.setState({ jesterCount: Math.min(jesterCount + 1, maxJesters) }),
        decJester: () => this.setState({ jesterCount: Math.max(jesterCount - 1, 0) }),
        jesterLabel: jesterCount === 0 ? 'No Jesters' : jesterCount === 1 ? '1 Jester' : jesterCount + ' Jesters',
        jesterRowValue: (jesterCount === 0 ? 'No Jesters' : jesterCount === 1 ? '1 Jester' : jesterCount + ' Jesters')
          + (st.randJesters ? ' · Random Count' : ''),
        jesterRandMin: randMin,
        jesterRandMax: randMax,
        incRandMin: () => this.setState({ jesterRandMin: Math.min(randMin + 1, randMax) }),
        decRandMin: () => this.setState({ jesterRandMin: Math.max(randMin - 1, 0) }),
        incRandMax: () => this.setState({ jesterRandMax: Math.min(randMax + 1, maxJesters) }),
        decRandMax: () => this.setState({ jesterRandMax: Math.max(randMax - 1, randMin) }),
        // Who gets picked, as opposed to how many.
        isProgressiveJester: isProgressive,
        setJesterSelection: (mode) => this.setState({ jesterSelection: mode }),
        randomPickBg: !isProgressive ? 'var(--m-tile-sel)' : 'var(--m-lift-soft)',
        randomPickBorder: !isProgressive ? '1.5px solid var(--m-accent)' : '1px solid var(--m-border-white)',
        randomPickColor: !isProgressive ? 'var(--m-tile-sel-text)' : 'var(--m-muted)',
        randomPickSubColor: !isProgressive ? 'var(--m-tile-sel-sub)' : 'var(--m-dim)',
        progressivePickBg: isProgressive ? 'var(--m-tile-sel)' : 'var(--m-lift-soft)',
        progressivePickBorder: isProgressive ? '1.5px solid var(--m-accent)' : '1px solid var(--m-border-white)',
        progressivePickColor: isProgressive ? 'var(--m-tile-sel-text)' : 'var(--m-muted)',
        progressivePickSubColor: isProgressive ? 'var(--m-tile-sel-sub)' : 'var(--m-dim)',
        // Each player's share of the next draw — invisible odds are hard to trust.
        jesterOdds: players.map(p => ({
          name: p.name,
          pct: weightTotal > 0
            ? Math.round(((jesterWeights[p.id] || 0) / weightTotal) * 100)
            : Math.round(100 / Math.max(1, players.length)),
          spent: (jesterWeights[p.id] || 0) === 0,
        })),
        randJesters: st.randJesters,
        randJestersBg: st.randJesters ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        randJestersThumb: st.randJesters ? 'translateX(22px)' : 'translateX(2px)',
        toggleRandJesters: () => this.setState({ randJesters: !st.randJesters }),
        showCategory: st.showCategory,
        showCatBg: st.showCategory ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        showCatThumb: st.showCategory ? 'translateX(22px)' : 'translateX(2px)',
        toggleShowCat: () => this.setState({ showCategory: !st.showCategory }),
        showWord,
        showWordDesc: st.gameMode === 'words'
          ? 'Always on in Word Mode — the word is the game'
          : st.jesterGetsRole
            ? 'Unavailable while the Jester gets a fake role — a jester with no word to show would stand out'
            : 'Players can see the word and their role',
        showWordBg: showWord ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        showWordThumb: showWord ? 'translateX(22px)' : 'translateX(2px)',
        showWordToggleOpacity: wordLocked ? '.55' : '1',
        showWordTogglePointerEvents: wordLocked ? 'none' : 'auto',
        toggleShowWord: () => {
          if (wordLocked) return;
          this.setState({ showWord: !st.showWord });
        },
        // Dimmed and inert while the jester is disguised.
        jestersKnow: st.jestersKnow && !st.jesterGetsRole,
        jestersKnowDesc: st.jesterGetsRole
          ? 'Unavailable while the Jester gets a fake role — a disguised jester doesn’t know they are one'
          : 'Jesters can see their fellow jesters',
        jestersKnowBg: (st.jestersKnow && !st.jesterGetsRole) ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        jestersKnowThumb: (st.jestersKnow && !st.jesterGetsRole) ? 'translateX(22px)' : 'translateX(2px)',
        jestersKnowToggleOpacity: st.jesterGetsRole ? '.55' : '1',
        jestersKnowTogglePointerEvents: st.jesterGetsRole ? 'none' : 'auto',
        toggleJestersKnow: () => {
          if (st.jesterGetsRole) return;
          this.setState({ jestersKnow: !st.jestersKnow });
        },
        jesterGetsRole: st.jesterGetsRole,
        jesterGetsRoleLabel: st.gameMode === 'words' ? 'Jester Gets Word' : 'Jester Gets Role',
        jesterGetsRoleDesc: st.gameMode === 'words' ? 'The Jester is handed a fake word instead of being told they’re the Jester' : 'The Jester is handed a fake role instead of being told they’re the Jester',
        jesterGetsRoleBg: st.jesterGetsRole ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        jesterGetsRoleThumb: st.jesterGetsRole ? 'translateX(22px)' : 'translateX(2px)',
        jesterGetsRoleToggleOpacity: '1',
        jesterGetsRoleTogglePointerEvents: 'auto',
        toggleJesterGetsRole: () => this.setState({ jesterGetsRole: !st.jesterGetsRole }),
        // Only the word categories carry hints, and only a jester who knows
        // they're the jester can be handed one — so the row dims outside Word
        // Mode and while the jester is disguised, the same treatment Jesters
        // Know Each Other gets for the same reason.
        jesterHints: st.jesterHints && hintsAvailable,
        jesterHintsDesc: st.gameMode !== 'words'
          ? 'Word Mode only — a role is already a clue of its own'
          : st.jesterGetsRole
            ? 'Unavailable while the Jester gets a fake word — a disguised jester doesn’t know they need a clue'
            : 'The Jester gets a clue as to what the real word is',
        jesterHintsBg: (st.jesterHints && hintsAvailable) ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        jesterHintsThumb: (st.jesterHints && hintsAvailable) ? 'translateX(22px)' : 'translateX(2px)',
        jesterHintsToggleOpacity: hintsAvailable ? '1' : '.55',
        jesterHintsTogglePointerEvents: hintsAvailable ? 'auto' : 'none',
        toggleJesterHints: () => {
          if (!hintsAvailable) return;
          this.setState({ jesterHints: !st.jesterHints });
        },
        timeLimitDisplay: st.timeLimit === 0 ? '∞' : String(st.timeLimit),
        timeLimitUnit: st.timeLimit === 0 ? 'No limit' : st.timeLimit === 1 ? 'minute' : 'minutes',
        timeLimitRow: st.timeLimit === 0 ? 'No limit' : st.timeLimit + ' min',
        // One cycle, both ways: no limit, 1, 2 … TIME_LIMIT_MAX, and round to no
        // limit again. Holding either arrow walks the whole dial rather than
        // parking at an end, so neither direction is a dead stop.
        incTime: () => this.setState({ timeLimit: (st.timeLimit + 1) % (TIME_LIMIT_MAX + 1) }),
        decTime: () => this.setState({ timeLimit: (st.timeLimit + TIME_LIMIT_MAX) % (TIME_LIMIT_MAX + 1) }),
        hasTimeLimit: st.timeLimit > 0,
        timerDisplay: (() => {
          const total = st.secondsLeft != null ? st.secondsLeft : st.timeLimit * 60;
          const m = Math.floor(total / 60);
          const s = total % 60;
          return m + ':' + String(s).padStart(2, '0');
        })(),
        timerColor: st.secondsLeft !== null && st.secondsLeft <= 30 ? '#e8a0a8' : 'var(--m-timer)',
        timerLabel: st.timerPaused ? 'Paused' : 'Time Remaining',
        timerOpacity: st.timerPaused ? '.5' : '1',
        timerIcon: st.timerPaused ? ICON_PLAY : ICON_PAUSE,
        timerPauseLabel: st.timerPaused ? 'Resume the timer' : 'Pause the timer',
        // No pausing at zero: resuming would just re-fire the time-up alarm.
        canPauseTimer: st.secondsLeft !== null && st.secondsLeft > 0,
        toggleTimerPause: () => {
          if (st.secondsLeft === null || st.secondsLeft <= 0) return;
          if (st.timerPaused) {
            this.setState({ timerPaused: false });
            this.__runTimer();
          } else {
            this.__clearTimer();
            this.setState({ timerPaused: true });
          }
        },
        lightMode: !st.darkMode,
        lightModeBg: !st.darkMode ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        lightModeThumb: !st.darkMode ? 'translateX(22px)' : 'translateX(2px)',
        toggleLightMode: () => this.setState({ darkMode: !st.darkMode }),
        jesterMode: st.jesterMode,
        toggleJesterMode: () => this.setState({ jesterMode: !st.jesterMode }),
        showJesterOdds: st.showJesterOdds,
        showJesterOddsBg: st.showJesterOdds ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        showJesterOddsThumb: st.showJesterOdds ? 'translateX(22px)' : 'translateX(2px)',
        toggleShowJesterOdds: () => this.setState({ showJesterOdds: !st.showJesterOdds }),
        soundEffects: st.soundEffects,
        soundEffectsBg: st.soundEffects ? 'var(--m-toggle-on)' : 'var(--m-lift-toggle)',
        soundEffectsThumb: st.soundEffects ? 'translateX(22px)' : 'translateX(2px)',
        soundEffectsNote: st.timeLimit === 0 ? 'Nothing to chime with no limit' : 'Chimes when the round runs out',
        toggleSoundEffects: () => this.setState({ soundEffects: !st.soundEffects }),
        playerCount: st.playerList.length,
        isLobby: st.screen === 'lobby',
        isReveal: st.screen === 'reveal',
        isVoting: st.screen === 'voting',
        isResults: st.screen === 'results',
        isWordsMode: st.gameMode === 'words',
        showRoleHeading: st.gameMode !== 'words',
        setRoleMode: () => {
          const nextSel = st.selCategories.filter(c => !wordOnlyNames.includes(c));
          this.setState({ gameMode: 'roles', selCategories: nextSel.length ? nextSel : st.categories });
        },
        // showWord is left alone: Word Mode shows the word regardless, and
        // writing it here would leave it on for every Role Mode round after.
        setWordMode: () => this.setState({ gameMode: 'words' }),
        roleTileBg: st.gameMode === 'roles' ? 'var(--m-tile-sel)' : 'var(--m-lift-soft)',
        roleTileBorder: st.gameMode === 'roles' ? '1.5px solid var(--m-accent)' : '1px solid var(--m-border-white)',
        roleTileColor: st.gameMode === 'roles' ? 'var(--m-tile-sel-text)' : 'var(--m-muted)',
        roleTileSubColor: st.gameMode === 'roles' ? 'var(--m-tile-sel-sub)' : 'var(--m-dim)',
        wordTileBg: st.gameMode === 'words' ? 'var(--m-tile-sel)' : 'var(--m-lift-soft)',
        wordTileBorder: st.gameMode === 'words' ? '1.5px solid var(--m-accent)' : '1px solid var(--m-border-white)',
        wordTileColor: st.gameMode === 'words' ? 'var(--m-tile-sel-text)' : 'var(--m-muted)',
        wordTileSubColor: st.gameMode === 'words' ? 'var(--m-tile-sel-sub)' : 'var(--m-dim)',
        wine, crimson, ivoryFace,
        hasJester: jesterReveals.length > 0,
        jesterReveals,
        revealNameSize: jesterReveals.length > 1 ? '26px' : '34px',
        jesterRevealHeading: jesterReveals.length === 0
          ? 'There Was No Jester'
          : jesterReveals.length === 1 ? 'The Jester was…' : 'The Jesters were…',
        castReveals,
        castRevealHeading: jesterReveals.length ? 'The Rest of the Company' : 'The Company',
        goReveal: () => {
          let newJesterCount = jesterCount;
          if (st.randJesters) {
            newJesterCount = randMin + Math.floor(Math.random() * (randMax - randMin + 1));
          }
          const drawCount = Math.min(newJesterCount, maxJesters);
          const allIndices = st.playerList.map((_, index) => index);
          // Progressive draws by weight then rebalances. Random is Fisher-Yates,
          // not sort(() => Math.random() - .5), which isn't uniform.
          const selectedJesterIndices = isProgressive
            ? weightedDraw(allIndices, (i) => jesterWeights[playerId(i)], drawCount)
            : shuffle(allIndices).slice(0, drawCount);
          const nextWeights = isProgressive
            ? applyProgressive(jesterWeights, playerIds, selectedJesterIndices.map(i => playerId(i)))
            : jesterWeights;
          const pickFrom = (category) => { const pool = getWordPool(category); return pool[Math.floor(Math.random() * pool.length)]; };
          let pickableCategories = st.selCategories.length ? st.selCategories : ['Locations'];
          if (st.gameMode === 'roles') {
            pickableCategories = pickableCategories.filter(c => !wordOnlyNames.includes(c));
            if (!pickableCategories.length) pickableCategories = st.categories;
          }
          const chosenCategory = pickableCategories[Math.floor(Math.random() * pickableCategories.length)];
          let nextRound;
          // From this round's draw, not `players`, which still carries last
          // round's jester flags.
          const jesterPlayerIds = selectedJesterIndices.map(i => playerId(i));
          const jesterIdSet = new Set(jesterPlayerIds);
          const rolePlayerIds = players.map(p => p.id).filter(id => !jesterIdSet.has(id));
          const useJesterRole = st.gameMode === 'roles' && st.jesterGetsRole;
          const useJesterWord = st.gameMode === 'words' && st.jesterGetsRole;
          const buildRound = (roundCategory, wordName, roleCatalog, fakeRoleCatalog) => {
            const roles = shuffle(roleCatalog[wordName]);
            const roundRoleMap = rolePlayerIds.reduce((acc, id, index) => {
              acc[id] = roles[index % roles.length];
              return acc;
            }, {});
            let roundJesterRoleMap = {};
            if (useJesterRole) {
              const fakeRoles = shuffle(fakeRoleCatalog[wordName] || []);
              roundJesterRoleMap = jesterPlayerIds.reduce((acc, id, index) => {
                acc[id] = fakeRoles[index % fakeRoles.length];
                return acc;
              }, {});
            }
            return { roundCategory, roundWord: wordName, roundRoleMap, roundJesterRoleMap };
          };
          const buildWordOnlyRound = (category) => ({ roundCategory: category, roundWord: pickFrom(category), roundRoleMap: {}, roundJesterRoleMap: {} });
          // Fake roles are borrowed from the category's other words — what the
          // built-in fake catalogs do by hand.
          const buildCustomRound = (c) => {
            const roleCatalog = {};
            const fakeRoleCatalog = {};
            c.entries.forEach((e) => {
              const own = (e.roles && e.roles.length) ? e.roles : ['PERFORMER'];
              roleCatalog[e.word] = own;
              const borrowed = [];
              c.entries.forEach((other) => {
                if (other.word === e.word) return;
                (other.roles || []).forEach((r) => {
                  if (!own.includes(r) && !borrowed.includes(r)) borrowed.push(r);
                });
              });
              fakeRoleCatalog[e.word] = borrowed;
            });
            return buildRound(c.name, pickFrom(c.name), roleCatalog, fakeRoleCatalog);
          };
          if (customByName[chosenCategory]) {
            nextRound = buildCustomRound(customByName[chosenCategory]);
          } else if (chosenCategory === 'Biomes') {
            nextRound = buildRound('Biomes', pickFrom('Biomes'), biomeCatalog, fakeBiomeRoleCatalog);
          } else if (chosenCategory === 'Cuisines') {
            nextRound = buildRound('Cuisines', pickFrom('Cuisines'), cuisineCatalog, fakeCuisineRoleCatalog);
          } else if (chosenCategory === 'Movie/TV Show Genres') {
            nextRound = buildRound('Movie/TV Show Genres', pickFrom('Movie/TV Show Genres'), movieTvCatalog, fakeMovieTvRoleCatalog);
          } else if (chosenCategory === MUSE_CATEGORY) {
            nextRound = buildRound(MUSE_CATEGORY, pickFrom(MUSE_CATEGORY), museCatalog, fakeMuseRoleCatalog);
          } else if (chosenCategory === 'Music Genres') {
            nextRound = buildRound('Music Genres', pickFrom('Music Genres'), musicGenreCatalog, fakeMusicGenreRoleCatalog);
          } else if (chosenCategory === 'Food/Drinks') {
            nextRound = buildWordOnlyRound('Food/Drinks');
          } else if (chosenCategory === 'Animals') {
            nextRound = buildWordOnlyRound('Animals');
          } else if (chosenCategory === 'Objects') {
            nextRound = buildWordOnlyRound('Objects');
          } else if (chosenCategory === 'Movies/TV') {
            nextRound = buildWordOnlyRound('Movies/TV');
          } else {
            nextRound = buildRound('Locations', pickFrom('Locations'), locationCatalog, fakeLocationRoleCatalog);
          }
          let roundJesterWordMap = {};
          if (useJesterWord) {
            const pool = getWordPool(nextRound.roundCategory).filter(w => w !== nextRound.roundWord);
            if (pool.length) {
              const fakeWords = shuffle(pool);
              roundJesterWordMap = jesterPlayerIds.reduce((acc, id, index) => {
                acc[id] = fakeWords[index % fakeWords.length];
                return acc;
              }, {});
            }
          }
          // A hint only means anything to a jester who knows they are one: a
          // disguised jester is holding a fake word and believes it, so handing
          // them a clue would tell them what the disguise exists to hide. Word
          // categories only — the role catalogs already give their jester a
          // fake role to work with.
          // Keyed by category then word: six words are in both Food and
          // Animals, and a flat lookup would deal the food's hints to an
          // Animals round.
          const hints = (wordHintCatalog[nextRound.roundCategory] || {})[nextRound.roundWord] || null;
          const roundJesterHint = st.jesterHints && !useJesterWord && hints && hints.length
            ? hints[Math.floor(Math.random() * hints.length)]
            : null;
          nextRound = { ...nextRound, roundJesterWordMap, roundJesterHint };
          // Ahead of the render, so the fetches are in flight while players are
          // still passing the phone around.
          this.__preloadRoundArt(nextRound, st.gameMode);
          const roundStarterIdx = Math.floor(Math.random() * st.playerList.length);
          // The dealt count stays in roundJesterIndices; writing it to
          // jesterCount would let a random round overwrite the host's choice.
          this.setState({ screen: 'reveal', viewed: {}, activePlayer: null, cardOpen: false, roundJesterIndices: selectedJesterIndices, roundStarterIdx, jesterWeights: nextWeights, ...nextRound });
        },
        goVoting: () => { this.setState({ screen: 'voting' }); this.__startTimer(st.timeLimit); },
        // Reset on the way in, so every trip to results starts covered.
        goResults: () => { this.__clearTimer(); this.setState({ screen: 'results', timerPaused: false, resultsWordShown: false, resultsPoolOpen: false }); },
        backToLobby: () => { this.__clearTimer(); this.setState({ screen: 'lobby', viewed: {}, activePlayer: null, cardOpen: false, roundJesterIndices: null, secondsLeft: null, timeUp: false, timerPaused: false }); },
        backToReveal: () => { this.__clearTimer(); this.setState({ screen: 'reveal', activePlayer: null, cardOpen: false, secondsLeft: null, timeUp: false, timerPaused: false }); },
        playAgain: () => { this.__clearTimer(); this.setState({ screen: 'lobby', viewed: {}, activePlayer: null, cardOpen: false, roundJesterIndices: null, secondsLeft: null, timeUp: false, timerPaused: false }); },
        dismissTimeUp: () => this.setState({ timeUp: false }),
        showTimeUpPopup: st.timeUp,
      };
    }

    __setDraftEntry(i, patch) {
      this.setState(prev => ({
        customDraft: {
          ...prev.customDraft,
          entries: prev.customDraft.entries.map((e, j) => (j === i ? { ...e, ...patch } : e)),
        },
        customError: '',
      }));
    }

    // Normalises the draft, rejects the unsaveable states, then persists.
    __saveCustomDraft(custom, builtInNames) {
      const draft = this.state.customDraft;
      if (!draft) return;
      const name = (draft.name || '').trim();
      if (!name) {
        this.setState({ customError: 'Give your category a name.' });
        return;
      }
      const taken = [...builtInNames, ...custom.filter(c => c.id !== draft.id).map(c => c.name)];
      if (taken.some(n => n.toLowerCase() === name.toLowerCase())) {
        this.setState({ customError: '“' + name + '” is already the name of another category.' });
        return;
      }
      const kind = draft.kind === 'words' ? 'words' : 'roles';
      let entries;
      if (kind === 'words') {
        entries = parseWordList(draft.wordsText).map(word => ({ word, roles: [] }));
      } else {
        const seen = new Set();
        entries = [];
        draft.entries.forEach((e) => {
          const word = (e.word || '').trim();
          if (!word || seen.has(word.toLowerCase())) return;
          seen.add(word.toLowerCase());
          const roles = [];
          (e.rolesText || '').split(',').forEach((r) => {
            const role = r.trim();
            if (role && !roles.includes(role)) roles.push(role);
          });
          entries.push({ word, roles });
        });
      }
      if (!entries.length) {
        this.setState({ customError: 'Add at least one word.' });
        return;
      }
      // A roleless role category would never come up in Role Mode — say so here
      // rather than let them find out mid-game.
      if (kind === 'roles' && !entries.some(e => e.roles.length)) {
        this.setState({ customError: 'Give at least one word some roles, or switch this to a word category.' });
        return;
      }
      const previous = draft.id ? custom.find(c => c.id === draft.id) : null;
      const list = draft.id
        ? custom.map(c => (c.id === draft.id ? { id: c.id, name, kind, entries } : c))
        : [...custom, { id: newCustomId(), name, kind, entries }];
      saveCustomCategories(list);
      const sel = previous && previous.name !== name
        ? this.state.selCategories.map(c => (c === previous.name ? name : c))
        : this.state.selCategories;
      this.setState({ customCategories: list, selCategories: sel, modal: 'custom', customDraft: null, customError: '' });
    }

    settingsRow({ onClick, iconBg, icon, label, value }) {
      return h('div', { ...press(onClick, label + ': ' + value), className: 'masq-btn', style: css('display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:12px; background:var(--m-lift); border:1px solid var(--m-border); cursor:pointer;') },
        h('div', { style: css(`width:34px; height:34px; border-radius:9px; background:${iconBg}; display:flex; align-items:center; justify-content:center; flex:none;`), dangerouslySetInnerHTML: { __html: icon } }),
        h('div', { style: css('flex:1;') },
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.15em; text-transform:uppercase; color:var(--m-label);") }, label),
          h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:var(--m-body); margin-top:1px;") }, value)
        ),
        h('div', { style: css('color:var(--m-dim2); font-size:18px;') }, '›')
      );
    }

    categoriesModal(v) {
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); animation:masq-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'Categories'),
          h('div', { ...press(v.closeModal, 'Close'), style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label); margin-bottom:8px;") }, 'Role Categories'),
        h('div', { style: css('display:grid; grid-template-columns:1fr 1fr; gap:8px;') },
          v.categoryItems.map((c, i) => h('div', { key: i, ...press(c.onToggle, null, { 'aria-pressed': String(c.sel) }), style: css(`padding:14px 12px; border-radius:12px; cursor:pointer; text-align:center; background:${c.tileBg}; border:${c.tileBorder};`) },
            h('div', { style: css(`font-family:'Cinzel',serif; font-weight:600; font-size:14px; color:${c.color};`) }, c.cat)
          ))
        ),
        v.isWordsMode && h(React.Fragment, null,
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label); margin:18px 0 8px;") }, 'Word Categories'),
          h('div', { style: css('display:grid; grid-template-columns:1fr 1fr; gap:8px;') },
            v.wordCategoryItems.map((c, i) => h('div', { key: i, ...press(c.onToggle, null, { 'aria-pressed': String(c.sel) }), style: css(`padding:14px 12px; border-radius:12px; cursor:pointer; text-align:center; background:${c.tileBg}; border:${c.tileBorder};`) },
              h('div', { style: css(`font-family:'Cinzel',serif; font-weight:600; font-size:14px; color:${c.color};`) }, c.cat)
            ))
          )
        ),
        v.hasCustomInPicker && h(React.Fragment, null,
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label); margin:18px 0 8px;") }, 'Your Categories'),
          h('div', { style: css('display:grid; grid-template-columns:1fr 1fr; gap:8px;') },
            v.customCategoryItems.map((c, i) => h('div', { key: i, ...press(c.onToggle, null, { 'aria-pressed': String(c.sel) }), style: css(`padding:14px 12px; border-radius:12px; cursor:pointer; text-align:center; background:${c.tileBg}; border:${c.tileBorder};`) },
              h('div', { style: css(`font-family:'Cinzel',serif; font-weight:600; font-size:14px; color:${c.color};`) }, c.cat)
            ))
          )
        ),
        h('div', { ...press(v.openCustom), className: 'masq-btn', style: css("margin-top:16px; padding:12px; text-align:center; border:1px dashed var(--m-border-hard); border-radius:12px; cursor:pointer; font-family:'EB Garamond',serif; font-size:14px; color:var(--m-soft);") },
          v.customCount ? 'Edit custom categories' : 'Make your own category…')
      );
    }

    jestersModal(v) {
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); animation:masq-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'Jesters'),
          h('div', { ...press(v.closeModal, 'Close'), style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; align-items:center; justify-content:center; gap:32px;') },
          h('div', { ...press(v.decJester, 'One fewer jester'), style: css('width:52px; height:52px; border-radius:50%; background:var(--m-lift-input); border:1px solid var(--m-border-hard); display:flex; align-items:center; justify-content:center; font-size:26px; color:var(--m-accent); cursor:pointer; line-height:1;') }, '−'),
          h('div', { style: css('text-align:center;') },
            h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:52px; color:var(--m-text); line-height:1;") }, v.jesterCount),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:15px; color:var(--m-label); margin-top:4px;") }, v.jesterLabel)
          ),
          h('div', { ...press(v.incJester, 'One more jester'), style: css('width:52px; height:52px; border-radius:50%; background:rgba(178,32,47,.25); border:1px solid rgba(178,32,47,.5); display:flex; align-items:center; justify-content:center; font-size:26px; color:#f4a0a8; cursor:pointer; line-height:1;') }, '+')
        ),
        h('div', { style: css('display:flex; align-items:center; gap:12px; margin:20px 0 14px;') },
          h('div', { style: css('flex:1; height:1px; background:var(--m-border-med);') }),
          h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-soft2);") }, 'or randomize'),
          h('div', { style: css('flex:1; height:1px; background:var(--m-border-med);') })
        ),
        h('div', { ...press(v.toggleRandJesters, 'Random jester count', { role: 'switch', 'aria-checked': String(v.randJesters) }), className: 'masq-btn', style: css('display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:12px; background:var(--m-lift-soft); border:1px solid var(--m-border); cursor:pointer; margin-bottom:14px;') },
          h('div', { style: css('flex:1;') },
            h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:var(--m-text);") }, 'Random Count'),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); margin-top:2px;") }, 'Pick a random number of jesters each round')
          ),
          h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.randJestersBg}; transition:background .25s; flex:none;`) },
            h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.randJestersThumb}; transition:transform .25s;`) })
          )
        ),
        v.randJesters && h('div', { style: css('display:flex; align-items:center; justify-content:center; gap:18px; animation:masq-rise .2s ease both;') },
          h('div', { style: css('display:flex; flex-direction:column; align-items:center; gap:7px;') },
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label);") }, 'Min'),
            h('div', { style: css('display:flex; align-items:center; gap:9px;') },
              h('div', { ...press(v.decRandMin, 'Lower the minimum jesters'), className: 'masq-btn', style: css('width:30px; height:30px; border-radius:50%; background:var(--m-lift-med); border:1px solid var(--m-border-strong); display:flex; align-items:center; justify-content:center; font-size:17px; color:var(--m-accent); cursor:pointer; line-height:1;') }, '−'),
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:26px; color:var(--m-text); min-width:28px; text-align:center; line-height:1;") }, v.jesterRandMin),
              h('div', { ...press(v.incRandMin, 'Raise the minimum jesters'), className: 'masq-btn', style: css('width:30px; height:30px; border-radius:50%; background:var(--m-lift-med); border:1px solid var(--m-border-strong); display:flex; align-items:center; justify-content:center; font-size:17px; color:var(--m-accent); cursor:pointer; line-height:1;') }, '+')
            )
          ),
          h('div', { style: css("font-family:'Cinzel',serif; font-size:16px; color:var(--m-arrow); padding-top:20px;") }, '→'),
          h('div', { style: css('display:flex; flex-direction:column; align-items:center; gap:7px;') },
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label);") }, 'Max'),
            h('div', { style: css('display:flex; align-items:center; gap:9px;') },
              h('div', { ...press(v.decRandMax, 'Lower the maximum jesters'), className: 'masq-btn', style: css('width:30px; height:30px; border-radius:50%; background:var(--m-lift-med); border:1px solid var(--m-border-strong); display:flex; align-items:center; justify-content:center; font-size:17px; color:var(--m-accent); cursor:pointer; line-height:1;') }, '−'),
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:26px; color:var(--m-text); min-width:28px; text-align:center; line-height:1;") }, v.jesterRandMax),
              h('div', { ...press(v.incRandMax, 'Raise the maximum jesters'), className: 'masq-btn', style: css('width:30px; height:30px; border-radius:50%; background:var(--m-lift-med); border:1px solid var(--m-border-strong); display:flex; align-items:center; justify-content:center; font-size:17px; color:var(--m-accent); cursor:pointer; line-height:1;') }, '+')
            )
          )
        ),
        h('div', { style: css('display:flex; align-items:center; gap:12px; margin:20px 0 12px;') },
          h('div', { style: css('flex:1; height:1px; background:var(--m-border-med);') }),
          h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-soft2);") }, 'who gets picked'),
          h('div', { style: css('flex:1; height:1px; background:var(--m-border-med);') })
        ),
        h('div', { style: css('display:grid; grid-template-columns:1fr 1fr; gap:8px;') },
          h('div', {
            ...press(() => v.setJesterSelection('random'), null, { 'aria-pressed': String(!v.isProgressiveJester) }),
            className: 'masq-btn',
            style: css(`padding:13px 14px; border-radius:12px; background:${v.randomPickBg}; border:${v.randomPickBorder}; cursor:pointer;`),
          },
            h('div', { style: css(`font-family:'Cinzel',serif; font-weight:700; font-size:13px; color:${v.randomPickColor};`) }, 'Truly Random'),
            h('div', { style: css(`font-family:'Archivo',sans-serif; font-size:10px; color:${v.randomPickSubColor}; margin-top:3px; line-height:1.35;`) }, 'Random jester each round')
          ),
          h('div', {
            ...press(() => v.setJesterSelection('progressive'), null, { 'aria-pressed': String(v.isProgressiveJester) }),
            className: 'masq-btn',
            style: css(`padding:13px 14px; border-radius:12px; background:${v.progressivePickBg}; border:${v.progressivePickBorder}; cursor:pointer;`),
          },
            h('div', { style: css(`font-family:'Cinzel',serif; font-weight:700; font-size:13px; color:${v.progressivePickColor};`) }, 'Progressive'),
            h('div', { style: css(`font-family:'Archivo',sans-serif; font-size:10px; color:${v.progressivePickSubColor}; margin-top:3px; line-height:1.35;`) }, 'Recent jesters get picked less often')
          )
        ),
        // Off by default. The switch sits here rather than in Settings: the odds
        // are a Progressive-only reading, so the toggle means nothing until this
        // branch is on screen, and a screen away it was hard to connect to.
        v.isProgressiveJester && h('div', { style: css('margin-top:12px; animation:masq-rise .2s ease both;') },
          h('div', { ...press(v.toggleShowJesterOdds, 'Show progressive jester odds', { role: 'switch', 'aria-checked': String(v.showJesterOdds) }), className: 'masq-btn', style: css('display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:12px; background:var(--m-lift-soft); border:1px solid var(--m-border); cursor:pointer; margin-bottom:12px;') },
            h('div', { style: css('flex:1;') },
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:var(--m-text);") }, 'Show Odds'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); margin-top:2px;") }, 'Each player’s chance of drawing the jester next round')
            ),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.showJesterOddsBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.showJesterOddsThumb}; transition:transform .25s;`) })
            )
          ),
          v.showJesterOdds && h(React.Fragment, null,
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label); margin-bottom:7px;") }, 'Odds next round'),
            h('div', { style: css('display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;') },
              v.jesterOdds.map((o, i) => h('div', {
                key: i,
                style: css(`display:flex; align-items:center; gap:6px; padding:5px 10px; border-radius:8px; background:var(--m-lift); border:1px solid var(--m-border); opacity:${o.spent ? '.5' : '1'};`),
              },
                h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-body);") }, o.name),
                h('div', { style: css("font-family:'Archivo',sans-serif; font-size:11px; color:var(--m-accent);") }, o.pct + '%')
              ))
            )
          ),
          h('div', { style: css("font-family:'EB Garamond',serif; font-size:12px; color:var(--m-muted); line-height:1.4;") },
            'Evens out over a game. Resets if you add or remove a player, or reload.')
        )
      );
    }

    timeModal(v) {
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); animation:masq-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'Time Limit'),
          h('div', { ...press(v.closeModal, 'Close'), style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; align-items:center; justify-content:center; gap:32px; padding:10px 0 6px;') },
          h('div', { ...press(v.decTime, 'Shorten the time limit'), style: css('width:52px; height:52px; border-radius:50%; background:var(--m-lift-input); border:1px solid var(--m-border-hard); display:flex; align-items:center; justify-content:center; font-size:26px; color:var(--m-accent); cursor:pointer; line-height:1;') }, '−'),
          h('div', { style: css('text-align:center; min-width:100px;') },
            h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:52px; color:var(--m-text); line-height:1;") }, v.timeLimitDisplay),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:15px; color:var(--m-label); margin-top:4px;") }, v.timeLimitUnit)
          ),
          h('div', { ...press(v.incTime, 'Lengthen the time limit'), style: css('width:52px; height:52px; border-radius:50%; background:rgba(178,32,47,.25); border:1px solid rgba(178,32,47,.5); display:flex; align-items:center; justify-content:center; font-size:26px; color:#f4a0a8; cursor:pointer; line-height:1;') }, '+')
        ),
        // The chime only ever plays when this timer expires, so it lives here
        // rather than in Settings. Dimmed at 'No limit', where nothing expires.
        h('div', { ...press(v.toggleSoundEffects, 'Timer sound effect', { role: 'switch', 'aria-checked': String(v.soundEffects) }), className: 'masq-btn', style: css(`display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 16px; margin-top:20px; background:var(--m-lift); border-radius:12px; cursor:pointer; opacity:${v.hasTimeLimit ? '1' : '.45'}; transition:opacity .2s;`) },
          h('div', null,
            h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:var(--m-text);") }, 'Timer Sound Effect'),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); margin-top:2px;") }, v.soundEffectsNote)
          ),
          h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.soundEffectsBg}; transition:background .25s; flex:none;`) },
            h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.soundEffectsThumb}; transition:transform .25s;`) })
          )
        )
      );
    }

    helpModal(v) {
      const cards = [
        { border: 'var(--m-accent)', title: 'The Setup', body: 'Add players, pick a mode, choose categories. Each round draws one at random.' },
        { border: '#7a1620', title: 'Role Mode', body: 'Everyone gets a secret role tied to the word. The Jester gets nothing.' },
        { border: '#14254a', title: 'Word Mode', body: 'Everyone gets the same secret word, no roles. The Jester gets nothing.' },
        { border: '#2e5bb0', title: 'The Round', body: 'Pass the phone so everyone reads their card in private, then take turns asking each other questions. Prove you know the secret without giving it away.' },
        { border: '#b5893c', title: 'The Unmasking', body: 'When you’re ready or the timer runs out argue it out, name your Jester, then tap to reveal.' },
        { border: '#2f8f7a', title: 'Make It Yours', body: 'Cross out any words you’d rather not see, or build categories of your own, from Settings.' },
      ];
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); max-height:80vh; overflow-y:auto; animation:masq-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'How to Play'),
          h('div', { ...press(v.closeModal, 'Close'), style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; flex-direction:column; gap:9px;') },
          cards.map((c, i) => h('div', { key: i, style: css(`padding:11px 13px; background:var(--m-lift-soft); border-radius:12px; border-left:3px solid ${c.border};`) },
            h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:14px; color:var(--m-brand); margin-bottom:2px;") }, c.title),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:var(--m-help); line-height:1.45;") }, c.body)
          ))
        )
      );
    }

    gameSettingsModal(v) {
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); animation:masq-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'Game Options'),
          h('div', { ...press(v.closeModal, 'Close'), className: 'masq-btn', style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; flex-direction:column; gap:0; border-radius:14px; overflow:hidden; border:1px solid var(--m-border);') },
          h('div', { ...press(v.toggleShowCat, 'Show category', { role: 'switch', 'aria-checked': String(v.showCategory) }), style: css('display:flex; align-items:center; gap:14px; padding:16px; background:var(--m-lift-soft); border-bottom:1px solid var(--m-border-soft); cursor:pointer;') },
            h('div', { style: css('flex:none; width:38px; height:38px; border-radius:10px; background:var(--m-icon-purple); display:flex; align-items:center; justify-content:center;'), dangerouslySetInnerHTML: { __html: ICON_CATEGORIES_18 } }),
            h('div', { style: css('flex:1;') },
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:var(--m-text);") }, 'Show Category'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); margin-top:2px;") }, 'Players can see the category of the secret word')
            ),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.showCatBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.showCatThumb}; transition:transform .25s;`) })
            )
          ),
          h('div', { ...press(v.toggleJesterGetsRole, 'Jester gets a fake role', { role: 'switch', 'aria-checked': String(v.jesterGetsRole) }), style: css(`display:flex; align-items:center; gap:14px; padding:16px; background:var(--m-lift-soft); border-bottom:1px solid var(--m-border-soft); cursor:pointer; opacity:${v.jesterGetsRoleToggleOpacity}; pointer-events:${v.jesterGetsRoleTogglePointerEvents};`) },
            h('div', { style: css('flex:none; width:38px; height:38px; border-radius:10px; background:var(--m-icon-gold); display:flex; align-items:center; justify-content:center;'), dangerouslySetInnerHTML: { __html: ICON_ROLE_18 } }),
            h('div', { style: css('flex:1;') },
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:var(--m-text);") }, v.jesterGetsRoleLabel),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); margin-top:2px;") }, v.jesterGetsRoleDesc)
            ),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.jesterGetsRoleBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.jesterGetsRoleThumb}; transition:transform .25s;`) })
            )
          ),
          h('div', { ...press(v.toggleShowWord, 'Show word', { role: 'switch', 'aria-checked': String(v.showWord) }), style: css(`display:flex; align-items:center; gap:14px; padding:16px; background:var(--m-lift-soft); border-bottom:1px solid var(--m-border-soft); cursor:pointer; opacity:${v.showWordToggleOpacity}; pointer-events:${v.showWordTogglePointerEvents};`) },
            h('div', { style: css('flex:none; width:38px; height:38px; border-radius:10px; background:var(--m-icon-blue); display:flex; align-items:center; justify-content:center;'), dangerouslySetInnerHTML: { __html: ICON_SHOW_WORD } }),
            h('div', { style: css('flex:1;') },
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:var(--m-text);") }, 'Show Word'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); margin-top:2px;") }, v.showWordDesc)
            ),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.showWordBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.showWordThumb}; transition:transform .25s;`) })
            )
          ),
          h('div', { ...press(v.toggleJestersKnow, 'Jesters know each other', { role: 'switch', 'aria-checked': String(v.jestersKnow) }), style: css(`display:flex; align-items:center; gap:14px; padding:16px; background:var(--m-lift-soft); border-bottom:1px solid var(--m-border-soft); cursor:pointer; opacity:${v.jestersKnowToggleOpacity}; pointer-events:${v.jestersKnowTogglePointerEvents};`) },
            h('div', { style: css('flex:none; width:38px; height:38px; border-radius:10px; background:var(--m-icon-crimson); display:flex; align-items:center; justify-content:center;'), dangerouslySetInnerHTML: { __html: ICON_JESTERS_18 } }),
            h('div', { style: css('flex:1;') },
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:var(--m-text);") }, 'Jesters Know Each Other'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); margin-top:2px;") }, v.jestersKnowDesc)
            ),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.jestersKnowBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.jestersKnowThumb}; transition:transform .25s;`) })
            )
          ),
          h('div', { ...press(v.toggleJesterHints, 'Jester hints', { role: 'switch', 'aria-checked': String(v.jesterHints) }), style: css(`display:flex; align-items:center; gap:14px; padding:16px; background:var(--m-lift-soft); cursor:pointer; opacity:${v.jesterHintsToggleOpacity}; pointer-events:${v.jesterHintsTogglePointerEvents};`) },
            h('div', { style: css('flex:none; width:38px; height:38px; border-radius:10px; background:var(--m-icon-crimson); display:flex; align-items:center; justify-content:center;'), dangerouslySetInnerHTML: { __html: ICON_JESTERS_18 } }),
            h('div', { style: css('flex:1;') },
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:15px; color:var(--m-text);") }, 'Jester Hints'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); margin-top:2px;") }, v.jesterHintsDesc)
            ),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.jesterHintsBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.jesterHintsThumb}; transition:transform .25s;`) })
            )
          )
        )
      );
    }

    wordListModal(v) {
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); max-height:80vh; overflow-y:auto; animation:masq-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'All Words'),
          h('div', { ...press(v.closeModal, 'Close'), style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; flex-direction:column; gap:10px;') },
          v.wordListGroups.map((g, i) => h('div', { key: i },
            h('div', { ...press(g.toggle), className: 'masq-btn', style: css('display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 14px; background:var(--m-lift); border-radius:12px; cursor:pointer;') },
              h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label);") }, g.countLabel),
              h('div', { style: css('display:flex; align-items:center; gap:10px;') },
                g.hasCrossed ? h('div', { ...press(g.resetCat), className: 'masq-btn', style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:var(--m-brand); border:1px solid var(--m-border); border-radius:8px; padding:4px 8px; cursor:pointer;") }, 'Reset') : null,
                h('div', { style: css(`color:var(--m-dim2); font-size:18px; transform:${g.chevron}; transition:transform .2s;`) }, '›')
              )
            ),
            g.open ? h('div', { style: css('display:flex; flex-wrap:wrap; gap:6px; padding:10px 4px 4px;') },
              g.items.map((it, j) => h('div', { key: j, ...press(it.toggleWord, it.word + (it.crossed ? ' (crossed out)' : ''), { 'aria-pressed': String(it.crossed) }), className: it.locked ? '' : 'masq-btn', style: css(it.style) }, it.word))
            ) : null,
            g.open && g.lastOne ? h('div', { style: css("font-family:'EB Garamond',serif; font-size:12px; color:var(--m-muted); padding:6px 4px 0;") }, 'Every category has to keep at least one word.') : null
          ))
        )
      );
    }

    customModal(v) {
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); max-height:80vh; display:flex; flex-direction:column; animation:masq-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'Custom Categories'),
          h('div', { ...press(v.closeCustom, 'Close'), className: 'masq-btn', style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); line-height:1.45; margin-bottom:16px;") },
          'Build a role category, where every word carries its own roles, or a word category that’s just a list of words. Both show up in the Categories picker and are saved on this device.'),
        h('div', { style: css('flex:1; overflow-y:auto; margin:0 -4px; padding:0 4px;') },
          v.customCats.length
            ? h('div', { style: css('display:flex; flex-direction:column; gap:8px;') },
                v.customCats.map(c => h('div', {
                  key: c.id,
                  ...press(c.onEdit),
                  className: 'masq-btn',
                  style: css('display:flex; align-items:center; gap:12px; padding:13px 14px; background:var(--m-lift); border-radius:14px; border:1px solid var(--m-border-med); cursor:pointer; animation:masq-rise .25s ease both;'),
                },
                  h('div', { style: css('flex:1; min-width:0;') },
                    h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:16px; color:var(--m-text);") }, c.name),
                    h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); margin-top:2px;") },
                      c.inUse ? c.summary + ' · in play' : c.summary)
                  ),
                  h('div', {
                    ...press(c.onDelete, c.pendingDelete ? 'Confirm deleting ' + c.name : 'Delete ' + c.name),
                    className: 'masq-btn',
                    style: c.pendingDelete
                      ? css("padding:6px 10px; border-radius:9px; background:rgba(178,32,47,.28); border:1px solid rgba(178,32,47,.5); font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:#f4c9cd; cursor:pointer; flex:none;")
                      : css('width:30px; height:30px; border-radius:50%; background:rgba(178,32,47,.2); border:1px solid rgba(178,32,47,.35); display:flex; align-items:center; justify-content:center; font-size:16px; color:#e6a0a8; cursor:pointer; line-height:1; flex:none;'),
                  }, c.pendingDelete ? 'Delete?' : '×')
                ))
              )
            : h('div', { style: css("padding:22px 16px; text-align:center; border:1px dashed var(--m-border-hard); border-radius:14px; font-family:'EB Garamond',serif; font-size:14px; color:var(--m-soft2);") },
                'No custom categories yet.')
        ),
        h('div', { style: css('padding-top:14px;') },
          h('div', { ...press(v.newCustom), className: 'masq-btn', style: css('padding:16px; text-align:center; border:1.5px dashed rgba(200,162,76,.4); border-radius:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px;') },
            h('div', { style: css("font-size:22px; color:var(--m-accent); line-height:1; font-family:'EB Garamond',serif;") }, '+'),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:16px; color:var(--m-soft);") }, 'New category…')
          )
        )
      );
    }

    // Step one for a new category. Skipped when editing — an existing category
    // already knows what it is.
    customKindModal(v) {
      const tile = (onClick, icon, title, body) => h('div', { ...press(onClick), className: 'masq-btn', style: css('display:flex; align-items:flex-start; gap:13px; padding:16px; background:var(--m-lift); border:1px solid var(--m-border-med); border-radius:14px; cursor:pointer;') },
        h('div', { style: css('flex:none; margin-top:1px;'), dangerouslySetInnerHTML: { __html: icon } }),
        h('div', { style: css('flex:1;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:15px; color:var(--m-text);") }, title),
          h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); margin-top:3px; line-height:1.45;") }, body)
        )
      );
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); animation:masq-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'New Category'),
          h('div', { ...press(v.cancelDraft, 'Cancel'), className: 'masq-btn', style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); line-height:1.45; margin-bottom:16px;") }, 'What kind of category is this?'),
        h('div', { style: css('display:flex; flex-direction:column; gap:10px;') },
          tile(() => v.setDraftKind('roles'), ICON_ROLE_20, 'Role Category',
            'Each word comes with its own list of roles, like Locations. Plays in both Role Mode and Word Mode.'),
          tile(() => v.setDraftKind('words'), ICON_WORD, 'Word Category',
            'Just a list of words, no roles, like Food. Plays in Word Mode.')
        )
      );
    }

    customEditModal(v) {
      if (!v.draftKind) return this.customKindModal(v);
      const inputStyle = "width:100%; padding:11px 13px; background:var(--m-lift-input); border:1px solid var(--m-border-strong); border-radius:10px; color:var(--m-text); font-family:'EB Garamond',serif; font-size:15px; outline:none;";
      const kindTab = (kind, label) => {
        const on = (kind === 'words') === v.draftIsWords;
        return h('div', {
          ...press(() => v.setDraftKind(kind), null, { 'aria-pressed': String(on) }),
          className: 'masq-btn',
          style: css(`flex:1; padding:10px; text-align:center; border-radius:10px; cursor:pointer; background:${on ? 'var(--m-tile-sel)' : 'var(--m-lift-soft)'}; border:${on ? '1.5px solid var(--m-accent)' : '1px solid var(--m-border-white)'}; font-family:'Cinzel',serif; font-weight:600; font-size:13px; color:${on ? 'var(--m-tile-sel-text)' : 'var(--m-muted)'};`),
        }, label);
      };
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); max-height:80vh; display:flex; flex-direction:column; animation:masq-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, v.draftIsNew ? 'New Category' : 'Edit Category'),
          h('div', { ...press(v.cancelDraft, 'Cancel'), className: 'masq-btn', style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('flex:1; overflow-y:auto; margin:0 -4px; padding:0 4px;') },
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label); margin-bottom:7px;") }, 'Category Type'),
          h('div', { style: css('display:flex; gap:8px;') }, kindTab('roles', 'Words & Roles'), kindTab('words', 'Words Only')),
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label); margin:18px 0 7px;") }, 'Category Name'),
          h('input', { onChange: v.onDraftNameChange, value: v.draftName, placeholder: 'e.g. Our Friend Group', style: css(inputStyle) }),
          v.draftIsWords
            ? h(React.Fragment, null,
                h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label); margin:18px 0 4px;") }, 'Words'),
                h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); line-height:1.45; margin-bottom:10px;") },
                  'Separate them with commas. Each round picks one at random.'),
                h('textarea', {
                  onChange: v.onDraftWordsChange,
                  value: v.draftWordsText,
                  rows: 7,
                  placeholder: 'Pizza, Sushi, Tacos, Ramen…',
                  style: css(inputStyle + " resize:vertical; line-height:1.6; min-height:130px;"),
                }),
                h('div', { style: css("font-family:'Archivo',sans-serif; font-size:11px; color:var(--m-dim); margin-top:7px;") },
                  v.draftWordCount === 1 ? '1 word' : v.draftWordCount + ' words')
              )
            : h(React.Fragment, null,
                h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label); margin:18px 0 4px;") }, 'Words & Roles'),
                h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); line-height:1.45; margin-bottom:10px;") },
                  'One word per card. Separate its roles with commas — a round hands each player one of them.'),
                h('div', { style: css('display:flex; flex-direction:column; gap:10px;') },
                  v.draftEntries.map((e, i) => h('div', { key: i, style: css('padding:12px; background:var(--m-lift-soft); border:1px solid var(--m-border); border-radius:14px; animation:masq-rise .2s ease both;') },
                    h('div', { style: css('display:flex; align-items:center; gap:8px;') },
                      h('input', { onChange: e.onWordChange, value: e.word, placeholder: 'Word', style: css(inputStyle + ' flex:1;') }),
                      h('div', {
                        ...press(e.onlyOne ? undefined : e.onRemove),
                        className: e.onlyOne ? '' : 'masq-btn',
                        style: css(`width:30px; height:30px; border-radius:50%; background:rgba(178,32,47,.2); border:1px solid rgba(178,32,47,.35); display:flex; align-items:center; justify-content:center; font-size:16px; color:#e6a0a8; line-height:1; flex:none; cursor:${e.onlyOne ? 'default' : 'pointer'}; opacity:${e.onlyOne ? '.35' : '1'};`),
                      }, '×')
                    ),
                    h('input', { onChange: e.onRolesChange, value: e.rolesText, placeholder: 'Roles, comma separated', style: css(inputStyle + ' margin-top:8px; font-size:14px;') })
                  ))
                ),
                h('div', { ...press(v.addDraftEntry), className: 'masq-btn', style: css('margin-top:10px; padding:13px; text-align:center; border:1.5px dashed rgba(200,162,76,.4); border-radius:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:9px;') },
                  h('div', { style: css("font-size:19px; color:var(--m-accent); line-height:1; font-family:'EB Garamond',serif;") }, '+'),
                  h('div', { style: css("font-family:'EB Garamond',serif; font-size:15px; color:var(--m-soft);") }, 'Add a word…')
                )
              )
        ),
        v.customError
          ? h('div', { style: css("margin-top:12px; padding:11px 13px; background:rgba(178,32,47,.15); border:1px solid rgba(178,32,47,.4); border-radius:10px; font-family:'EB Garamond',serif; font-size:14px; color:#e8a0a8; animation:masq-rise .2s ease both;") }, v.customError)
          : null,
        h('div', { style: css('display:flex; gap:9px; padding-top:14px;') },
          h('div', { ...press(v.cancelDraft), className: 'masq-btn', style: css("flex:none; padding:16px 20px; text-align:center; border:1px solid var(--m-border-btn); border-radius:12px; font-family:'Cinzel',serif; font-weight:700; font-size:15px; color:var(--m-soft); cursor:pointer;") }, 'Cancel'),
          h('div', { ...press(v.saveDraft), className: 'masq-btn', style: css("flex:1; padding:16px; text-align:center; background:var(--m-cta); color:var(--m-cta-text); font-family:'Cinzel',serif; font-weight:700; font-size:15px; letter-spacing:.06em; border-radius:12px; box-shadow:var(--m-cta-glow); cursor:pointer;") }, 'SAVE CATEGORY')
        )
      );
    }

    settingsModal(v) {
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); animation:masq-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'Settings'),
          h('div', { ...press(v.closeModal, 'Close'), style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; flex-direction:column; gap:10px;') },
          h('div', { ...press(v.openWordList), className: 'masq-btn', style: css('display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:var(--m-lift); border-radius:12px; cursor:pointer;') },
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:16px; color:var(--m-body);") }, 'View All Words'),
            h('div', { style: css('color:var(--m-dim2); font-size:18px;') }, '›')
          ),
          h('div', { ...press(v.openCustom), className: 'masq-btn', style: css('display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:var(--m-lift); border-radius:12px; cursor:pointer;') },
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:16px; color:var(--m-body);") }, 'Custom Categories'),
            h('div', { style: css('display:flex; align-items:center; gap:9px;') },
              h('div', { style: css("font-family:'Archivo',sans-serif; font-size:11px; color:var(--m-dim);") }, v.customCountLabel),
              h('div', { style: css('color:var(--m-dim2); font-size:18px;') }, '›')
            )
          ),
          h('div', { ...press(v.toggleLightMode, 'Light mode', { role: 'switch', 'aria-checked': String(v.lightMode) }), className: 'masq-btn', style: css('display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:var(--m-lift); border-radius:12px; cursor:pointer;') },
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:16px; color:var(--m-body);") }, 'Light Mode'),
            h('div', { style: css(`position:relative; width:44px; height:24px; border-radius:12px; background:${v.lightModeBg}; transition:background .25s; flex:none;`) },
              h('div', { style: css(`position:absolute; top:2px; left:0; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.4); transform:${v.lightModeThumb}; transition:transform .25s;`) })
            )
          ),
          h('div', { ...press(v.openCredits), className: 'masq-btn', style: css('display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:var(--m-lift); border-radius:12px; cursor:pointer;') },
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:16px; color:var(--m-body);") }, 'Credits'),
            h('div', { style: css('color:var(--m-dim2); font-size:18px;') }, '›')
          ),
          h('div', { style: css('padding:14px 16px; background:var(--m-lift); border-radius:12px; text-align:center;') },
            h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:16px; color:var(--m-brand);"), className: 'j-title' }, 'MASQ'),
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:11px; color:var(--m-dim); margin-top:4px; letter-spacing:.06em;") }, 'VERSION 1.11.1')
          )
        )
      );
    }

    creditsModal(v) {
      const company = [
        { border: 'var(--m-accent)', name: 'Arnav Podichetty', role: 'Creator & Code', secret: true },
        { border: '#7a1620', name: 'Richard Chen', role: 'Creator & Concept' },
        { border: '#2e5bb0', name: 'Esha Bansiya', role: 'Contributions' },
      ];
      const roleLine = (c) => {
        if (!c.secret) return c.role;
        const [before, after] = c.role.split('&');
        return h(React.Fragment, null,
          before,
          h('span', {
            ...press(v.unlockMuse, 'Unlock the secret category'),
            style: css('display:inline-block; padding:0 4px; margin:0 -4px; color:inherit;'),
          }, '&'),
          after
        );
      };
      // Where the reveal cards' artwork comes from. TMDB and Deezer ask to be
      // named; the photographers ask to be named individually, which is what
      // the list underneath is for.
      const sources = [
        { name: 'TMDB', of: 'Movie & TV posters', note: 'This product uses the TMDB API but is not endorsed or certified by TMDB.' },
        { name: 'Deezer', of: 'Album art', note: 'Not endorsed or certified by Deezer.' },
        { name: 'Wikimedia Commons', of: 'Animal, food & object photographs', note: 'Each under its own free licence, listed below.' },
      ];
      const label = (text) => h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.28em; text-transform:uppercase; color:var(--m-label); margin:22px 0 10px;") }, text);
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); max-height:80vh; overflow-y:auto; animation:masq-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'Credits'),
          h('div', { ...press(v.openSettings, 'Back to settings'), className: 'masq-btn', style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('display:flex; flex-direction:column; gap:14px;') },
          company.map((c, i) => h('div', { key: i, style: css(`padding:14px; background:var(--m-lift-soft); border-radius:12px; border-left:3px solid ${c.border};`) },
            h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:15px; color:var(--m-brand);") }, c.name),
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--m-label); margin-top:4px;") }, roleLine(c))
          ))
        ),
        label('Artwork'),
        h('div', { style: css('display:flex; flex-direction:column; gap:8px;') },
          sources.map((s, i) => h('div', { key: i, style: css('padding:12px 14px; background:var(--m-lift-soft); border-radius:12px;') },
            h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:13px; color:var(--m-brand);") }, s.name),
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--m-label); margin-top:3px;") }, s.of),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:12px; color:var(--m-soft2); margin-top:6px; line-height:1.4;") }, s.note)
          ))
        ),
        // The photographers, one line each. Each set is boxed and scrolled on
        // its own, so hundreds of names don't bury the three people who made
        // the game, and each name sits in the list it belongs to.
        ...[['Animal photographs', v.photoCredits], ['Food photographs', v.foodCredits], ['Object photographs', v.objectCredits]]
          .filter(([, rows]) => rows.length > 0)
          .map(([heading, rows]) => h(React.Fragment, { key: heading },
            label(`${heading} (${rows.length})`),
            h('div', { style: css('max-height:240px; overflow-y:auto; padding:12px 14px; background:var(--m-lift-soft); border-radius:12px; display:flex; flex-direction:column; gap:7px;') },
              rows.map((c, i) => h('div', { key: i, style: css('display:flex; justify-content:space-between; gap:10px; align-items:baseline;') },
                h('div', { style: css("font-family:'EB Garamond',serif; font-size:12px; color:var(--m-body); flex:0 0 auto;") }, c.name),
                h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; color:var(--m-dim2); text-align:right; line-height:1.35;") }, c.credit)
              ))
            )
          ))
      );
    }

    renderLobby(v) {
      return h('div', { style: css('position:absolute; inset:0; display:flex; flex-direction:column; background:var(--m-screen); animation:masq-fade-in .25s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; padding:24px 20px 18px;') },
          h('div', { ...press(v.openHelp, 'How to play'), className: 'masq-btn', style: css("width:36px; height:36px; border-radius:10px; background:var(--m-lift-med); border:1px solid var(--m-border-btn); display:flex; align-items:center; justify-content:center; cursor:pointer; font-family:'Cinzel',serif; font-weight:700; font-size:17px; color:var(--m-accent);") }, '?'),
          h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:22px; color:var(--m-text-title); letter-spacing:.04em; cursor:pointer;"), className: 'j-title', ...press(v.toggleJesterMode, 'Jester mode', { role: 'switch', 'aria-checked': String(v.jesterMode) }) },
            v.jesterMode
              ? 'MASQ'.split('').map((ch, i) => h('span', { key: i, className: 'j-title j-dance', style: { animationDelay: (i * 0.13) + 's, ' + (i * 0.13) + 's' } }, ch))
              : 'MASQ'
          ),
          h('div', { ...press(v.openSettings, 'Settings'), className: 'masq-btn', style: css('width:36px; height:36px; border-radius:10px; background:var(--m-lift-med); border:1px solid var(--m-border-btn); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:18px; color:var(--m-accent);') }, '⚙')
        ),
        h('div', { style: css('flex:1; overflow-y:auto; padding:0 20px 14px;') },
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.28em; text-transform:uppercase; color:var(--m-label); margin-bottom:10px;") }, 'Game Mode'),
          h('div', { style: css('display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:22px;') },
            h('div', { ...press(v.setRoleMode, null, { 'aria-pressed': String(!v.isWordsMode) }), className: 'masq-btn', style: css(`padding:13px 14px; border-radius:12px; background:${v.roleTileBg}; border:${v.roleTileBorder}; cursor:pointer;`) },
              h('div', { style: css('margin-bottom:6px;'), dangerouslySetInnerHTML: { __html: ICON_ROLE_20 } }),
              h('div', { style: css(`font-family:'Cinzel',serif; font-weight:700; font-size:13px; color:${v.roleTileColor};`) }, 'Role Mode'),
              h('div', { style: css(`font-family:'Archivo',sans-serif; font-size:10px; color:${v.roleTileSubColor}; margin-top:2px; line-height:1.35;`) }, 'Roles assigned to everyone but the Jester')
            ),
            h('div', { ...press(v.setWordMode, null, { 'aria-pressed': String(v.isWordsMode) }), className: 'masq-btn', style: css(`padding:13px 14px; border-radius:12px; background:${v.wordTileBg}; border:${v.wordTileBorder}; cursor:pointer;`) },
              h('div', { style: css('margin-bottom:6px;'), dangerouslySetInnerHTML: { __html: ICON_WORD } }),
              h('div', { style: css(`font-family:'Cinzel',serif; font-weight:700; font-size:13px; color:${v.wordTileColor};`) }, 'Word Mode'),
              h('div', { style: css(`font-family:'Archivo',sans-serif; font-size:10px; color:${v.wordTileSubColor}; margin-top:2px; line-height:1.35;`) }, 'Everyone gets the word but the Jester')
            )
          ),
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.28em; text-transform:uppercase; color:var(--m-label); margin-bottom:10px;") }, 'Game Settings'),
          h('div', { style: css('display:flex; flex-direction:column; gap:8px; margin-bottom:8px;') },
            this.settingsRow({ onClick: v.openPlayers, iconBg: 'var(--m-icon-gold)', icon: ICON_PLAYERS, label: 'Players', value: `${v.playerCount} Players` }),
            this.settingsRow({ onClick: v.openCategories, iconBg: 'var(--m-icon-purple)', icon: ICON_CATEGORIES_20, label: 'Categories', value: v.catSummary }),
            this.settingsRow({ onClick: v.openJesters, iconBg: 'var(--m-icon-crimson)', icon: ICON_JESTERS_20, label: 'Jesters', value: v.jesterRowValue }),
            this.settingsRow({ onClick: v.openTime, iconBg: 'var(--m-icon-blue)', icon: ICON_TIME, label: 'Time Limit', value: v.timeLimitRow }),
            this.settingsRow({ onClick: v.openGameSettings, iconBg: 'var(--m-icon-gold)', icon: ICON_OPTIONS, label: 'Options', value: v.gameSettingsSummary })
          )
        ),
        h('div', { style: css('padding:12px 20px 28px; background:linear-gradient(0deg,var(--m-screen) 70%,transparent);') },
          h('div', { ...press(v.goReveal), className: 'masq-btn j-glow', style: css("padding:17px; text-align:center; background:var(--m-cta); color:var(--m-cta-text); font-family:'Cinzel',serif; font-weight:700; font-size:17px; letter-spacing:.08em; border-radius:12px; box-shadow:var(--m-cta-glow); cursor:pointer;") }, 'RAISE THE CURTAIN')
        ),
        v.hasModal && h('div', { style: css('position:absolute; inset:0; background:var(--m-backdrop); display:flex; flex-direction:column; justify-content:flex-end; animation:masq-backdrop .2s ease both;') },
          // Tapping away closes any modal but the category editor, where it
          // would discard everything typed.
          h('div', { onClick: v.isModalCustomEdit ? undefined : v.closeModal, 'aria-hidden': 'true', style: css('flex:1;') }),
          v.isModalCategories && this.categoriesModal(v),
          v.isModalJesters && this.jestersModal(v),
          v.isModalTime && this.timeModal(v),
          v.isModalHelp && this.helpModal(v),
          v.isModalGameSettings && this.gameSettingsModal(v),
          v.isModalSettings && this.settingsModal(v),
          v.isModalWordList && this.wordListModal(v),
          v.isModalCredits && this.creditsModal(v),
          v.isModalPlayers && this.playersModal(v),
          v.isModalCustom && this.customModal(v),
          v.isModalCustomEdit && this.customEditModal(v)
        )
      );
    }

    playersModal(v) {
      return h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); max-height:80vh; display:flex; flex-direction:column; animation:masq-slide-up .3s ease both;') },
        h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'The Cast'),
          h('div', { ...press(v.closeModal, 'Close'), style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
        ),
        h('div', { style: css('flex:1; overflow-y:auto; margin:0 -4px; padding:0 4px;') },
          h('div', { style: css('display:flex; flex-direction:column;') },
            v.playerItems.map((p, i) => h('div', {
              key: p.pid,
              style: css(`display:grid; grid-template-rows:${p.removing ? '0fr' : '1fr'}; opacity:${p.removing ? 0 : 1}; margin-bottom:${p.removing ? '0px' : '8px'}; overflow:hidden; transition:grid-template-rows .28s ease, opacity .22s ease, margin-bottom .28s ease; pointer-events:${p.removing ? 'none' : 'auto'};`)
            },
              h('div', { style: css('overflow:hidden; min-height:0;') },
                h('div', { style: css('display:flex; align-items:center; gap:12px; padding:10px 14px; background:var(--m-lift); border-radius:14px; border:1px solid var(--m-border-med); animation:masq-rise .25s ease both;') },
                  h('div', { style: css('flex:none; width:40px; height:40px; border-radius:50%; background:var(--m-avatar-bg); border:1px solid var(--m-border-strong); display:flex; align-items:center; justify-content:center;') },
                    h(Mask, { comedy: p.comedy, tragedy: p.tragedy, cracked: false, faceColor: p.face, lineColor: p.line, size: 26, hat: v.jesterMode })
                  ),
                  p.editing
                    ? h('input', { onChange: p.onEditChange, onKeyDown: p.onEditKeyDown, onBlur: p.onEditBlur, value: p.editVal, style: css("flex:1; padding:6px 10px; background:var(--m-lift-strong); border:1px solid var(--m-accent); border-radius:8px; color:var(--m-text); font-family:'EB Garamond',serif; font-size:17px; outline:none;") })
                    : h('div', { ...press(p.onEditTap), style: css("flex:1; font-family:'EB Garamond',serif; font-size:17px; color:var(--m-text); cursor:text; padding:6px 2px;") }, p.name),
                  h('div', {
                    ...press(p.onlyOne ? undefined : p.onRemove, 'Remove ' + p.name),
                    className: p.onlyOne ? '' : 'masq-btn',
                    style: css(`width:30px; height:30px; border-radius:50%; background:rgba(178,32,47,.2); border:1px solid rgba(178,32,47,.35); display:flex; align-items:center; justify-content:center; font-size:16px; color:#e6a0a8; line-height:1; flex:none; cursor:${p.onlyOne ? 'default' : 'pointer'}; opacity:${p.onlyOne ? '.35' : '1'};`),
                  }, '×')
                )
              )
            ))
          )
        ),
        h('div', { style: css('padding-top:14px;') },
          v.addingPlayer
            ? h('div', { style: css('display:flex; gap:8px; align-items:center; animation:masq-rise .2s ease both;') },
                h('input', { onKeyDown: v.onNameKeyDown, onChange: v.onNameChange, value: v.newName, placeholder: 'Enter player name…', style: css("flex:1; padding:14px 16px; background:var(--m-lift-input); border:1px solid var(--m-accent); border-radius:12px; color:var(--m-text); font-family:'EB Garamond',serif; font-size:16px; outline:none;") }),
                h('div', { ...press(v.confirmAdd), className: 'masq-btn', style: css("padding:14px 16px; background:var(--m-cta); border-radius:12px; color:var(--m-cta-text); font-family:'Cinzel',serif; font-weight:700; font-size:14px; cursor:pointer;") }, 'Add'),
                h('div', { ...press(v.cancelAdd, 'Cancel'), className: 'masq-btn', style: css('padding:14px 12px; color:#7c6a46; font-size:20px; cursor:pointer;') }, '×')
              )
            : h('div', { ...press(v.onAddTap), className: 'masq-btn', style: css('padding:16px; text-align:center; border:1.5px dashed rgba(200,162,76,.4); border-radius:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px;') },
                h('div', { style: css("font-size:22px; color:var(--m-accent); line-height:1; font-family:'EB Garamond',serif;") }, '+'),
                h('div', { style: css("font-family:'EB Garamond',serif; font-size:16px; color:var(--m-soft);") }, 'Add a player…')
              )
        )
      );
    }

    renderReveal(v) {
      return h('div', { style: css('position:absolute; inset:0; display:flex; flex-direction:column; background:var(--m-screen); animation:masq-slide-in .3s ease both;') },
        h('div', { style: css('height:24px;') }),
        h('div', { style: css('position:relative; text-align:center; padding:0 20px 18px;') },
          h('div', { ...press(v.backToLobby, 'Back to the lobby'), className: 'masq-btn', style: css("position:absolute; left:0; top:0; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-family:'Cinzel',serif; font-size:22px; color:var(--m-accent); cursor:pointer; opacity:.8;") }, '‹'),
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:22px; color:var(--m-text);") }, 'Tap your name in secret'),
          h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:var(--m-muted); margin-top:4px;") }, 'Each player privately sees their role, then passes the phone.'),
          v.showCategory && h('div', { style: css('display:inline-flex; align-items:center; gap:8px; margin-top:12px; padding:7px 16px; border-radius:20px; border:1px solid var(--m-border-hard);') },
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-label);") }, 'Category'),
            h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:14px; color:var(--m-brand);") }, v.gameCategory)
          )
        ),
        h('div', { style: css('flex:1; overflow-y:auto; padding:0 20px;') },
          h('div', { style: css('display:flex; flex-direction:column; gap:8px;') },
            v.actOnePlayers.map((p, i) => h('div', { key: i, ...press(p.onTap), className: 'masq-btn', style: css(`display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:14px; cursor:pointer; background:${p.rowBg}; border:${p.rowBorder};`) },
              h('div', { style: css('flex:none; width:44px; height:44px; border-radius:50%; background:var(--m-avatar-bg); display:flex; align-items:center; justify-content:center; border:1px solid var(--m-border-strong);') },
                h(Mask, { comedy: p.comedy, tragedy: p.tragedy, cracked: false, faceColor: p.face, lineColor: p.line, size: 30, hat: v.jesterMode })
              ),
              h('div', { style: css("flex:1; font-family:'Cinzel',serif; font-weight:600; font-size:17px; color:var(--m-text);") }, p.name),
              h('div', { style: css(`font-family:'Archivo',sans-serif; font-size:12px; color:${p.labelColor};`) }, p.label)
            ))
          ),
          h('div', { style: css('height:16px;') })
        ),
        h('div', { style: css('padding:12px 20px 28px;') },
          v.allSeen
            ? h('div', { ...press(v.goVoting), className: 'masq-btn j-glow', style: css("padding:17px; text-align:center; background:var(--m-cta); color:var(--m-cta-text); font-family:'Cinzel',serif; font-weight:700; font-size:17px; letter-spacing:.08em; border-radius:12px; box-shadow:var(--m-cta-glow); cursor:pointer; animation:masq-rise .4s ease both;") }, 'BEGIN THE TRIAL')
            : h('div', { style: css("padding:17px; text-align:center; border:1px dashed var(--m-border-hard); color:var(--m-soft2); font-family:'Cinzel',serif; font-weight:700; font-size:15px; border-radius:12px;") }, 'ALL PLAYERS MUST TAP FIRST')
        ),
        v.showOverlay && h('div', { onClick: v.dismissOverlay, style: css('position:absolute; inset:0; background:var(--m-overlay); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:28px; animation:masq-fade-in .2s ease both;') },
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.35em; text-transform:uppercase; color:var(--m-accent); margin-bottom:6px;") }, 'Your Role'),
          h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:28px; color:var(--m-text-bright); margin-bottom:22px;") }, v.apName),
          // Stops its own click so tapping the card raises the curtain instead
          // of reaching the backdrop's dismiss handler.
          h('div', { ...press((e) => { e.stopPropagation(); v.openCurtain(); }), className: 'j-card', onPointerMove: this.__holoMove, onPointerLeave: this.__holoLeave, style: css('position:relative; width:240px; height:340px; border-radius:16px; cursor:pointer; overflow:hidden; box-shadow:0 20px 56px rgba(0,0,0,.7); border:1px solid rgba(180,140,50,.45);') },
            h('div', { style: css('position:absolute; inset:0; background:var(--m-card-bg); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:28px; text-align:center;') },
              h('div', { style: css('display:flex; justify-content:center; margin-bottom:14px;') },
                // On a Movies, Music, Biomes or Cuisines round the artwork
                // stands in for the mask. The name sits right underneath, so
                // the image is decorative and a dead URL just collapses.
                v.apArt
                  ? h('img', {
                      // Keyed by src so each image is a fresh element: onError
                      // hides the node, and React would otherwise reuse the
                      // hidden one for the next player's artwork.
                      key: v.apArt,
                      src: v.apArt, alt: '', draggable: false,
                      onError: (e) => { e.target.style.display = 'none'; },
                      style: css(`width:${v.apArtW}; height:${v.apArtH}; object-fit:cover; object-position:${v.apArtFocus}; border-radius:8px; border:1px solid rgba(20,37,74,.35); box-shadow:0 6px 18px rgba(0,0,0,.4);`),
                    })
                  : h(Mask, { comedy: v.apComedy, tragedy: v.apTragedy, cracked: v.apIsUndisguisedJester, faceColor: v.apFace, lineColor: v.apLine, size: 60, hat: v.jesterMode })
              ),
              v.apIsUndisguisedJester && h(React.Fragment, null,
                h('div', { style: css(`font-family:'Archivo',sans-serif; font-size:11px; letter-spacing:.15em; text-transform:uppercase; text-decoration:underline; color:${v.apRoleColor};`) }, 'Role'),
                h('div', { style: css(`font-family:'Cinzel',serif; font-weight:800; font-size:${v.apRoleSize}; color:${v.apRoleColor}; letter-spacing:.04em; text-wrap:balance; margin-top:4px;`) }, v.apRole),
                v.apShowAllies && h('div', { style: css('margin-top:12px; padding:8px 12px; background:rgba(178,32,47,.15); border:1px solid rgba(178,32,47,.4); border-radius:8px; text-align:center;') },
                  h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:#b3202f; margin-bottom:3px;") }, 'Your Fellow Jesters'),
                  h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:13px; color:#7a1620;") }, v.apJesterAllies)
                ),
                // Gold rather than the allies block's crimson: it's the one
                // thing on this card that helps rather than condemns.
                v.apShowHint && h('div', { style: css('margin-top:12px; padding:8px 12px; background:rgba(200,162,76,.18); border:1px solid rgba(200,162,76,.45); border-radius:8px; text-align:center;') },
                  h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:#8a6d28; margin-bottom:3px;") }, 'Your Only Clue'),
                  h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:15px; color:#6b5318; text-wrap:balance;") }, v.apJesterHint)
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
            ? h('div', { ...press(v.closeOverlay), className: 'masq-btn', style: css("margin-top:22px; padding:14px 32px; background:var(--m-lift-med); border:1px solid rgba(200,162,76,.4); color:var(--m-text-title); font-family:'Cinzel',serif; font-weight:700; font-size:14px; letter-spacing:.06em; border-radius:10px; cursor:pointer; animation:masq-rise .35s ease both;") }, 'GOT IT')
            : h('div', { ...press(v.cancelOverlay), className: 'masq-btn', style: css("margin-top:22px; padding:9px 18px; font-family:'EB Garamond',serif; font-size:13px; color:var(--m-soft2); border:1px solid var(--m-border-med); border-radius:9px; cursor:pointer;") }, 'Not your turn? Go back')
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
      return h('div', { style: css('position:absolute; inset:0; display:flex; flex-direction:column; background:var(--m-screen); animation:masq-slide-in .3s ease both;') },
        h('div', { style: css('height:24px;') }),
        h('div', { style: css('position:relative; text-align:center; padding:0 20px 18px;') },
          h('div', { ...press(v.backToReveal, 'Back to the card reveal'), className: 'masq-btn', style: css("position:absolute; left:0; top:0; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-family:'Cinzel',serif; font-size:22px; color:var(--m-accent); cursor:pointer; opacity:.8;") }, '‹'),
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
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.3em; text-transform:uppercase; color:var(--m-label); transition:color .2s;") }, v.timerLabel),
            h('div', { style: css(`font-family:'Cinzel Decorative',serif; font-weight:700; font-size:52px; color:${v.timerColor}; line-height:1.2; opacity:${v.timerOpacity}; transition:opacity .2s;`) }, v.timerDisplay),
            v.canPauseTimer
              ? h('div', {
                  ...press(v.toggleTimerPause, v.timerPauseLabel),
                  className: 'masq-btn',
                  style: css('margin-top:14px; width:42px; height:42px; border-radius:50%; background:var(--m-lift-med); border:1px solid var(--m-border-hard); display:flex; align-items:center; justify-content:center; cursor:pointer; flex:none;'),
                  dangerouslySetInnerHTML: { __html: v.timerIcon },
                })
              : null
          )
        ),
        h('div', { style: css('padding:12px 20px 28px;') },
          h('div', { ...press(v.goResults), className: 'masq-btn j-glow', style: css("padding:17px; text-align:center; background:var(--m-cta); color:var(--m-cta-text); font-family:'Cinzel',serif; font-weight:700; font-size:17px; letter-spacing:.08em; border-radius:14px; box-shadow:var(--m-cta-glow); cursor:pointer;") }, 'REVEAL THE JESTER')
        ),
        v.showTimeUpPopup && h('div', { style: css('position:absolute; inset:0; background:var(--m-overlay-vote); display:flex; align-items:center; justify-content:center; padding:28px; animation:masq-fade-in .2s ease both;') },
          h('div', { style: css('background:var(--m-modal); border-radius:18px; padding:30px 26px; text-align:center; border:1px solid var(--m-border-hard); max-width:300px; animation:masq-rise .3s ease both;') },
            h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:24px; color:var(--m-brand);") }, 'Time to Vote!'),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:var(--m-help); margin-top:8px; line-height:1.4;") }, 'The clock has run out. Cast your votes and unmask the jester.'),
            h('div', { ...press(v.dismissTimeUp), className: 'masq-btn', style: css("margin-top:22px; padding:14px; background:var(--m-cta); color:var(--m-cta-text); font-family:'Cinzel',serif; font-weight:700; font-size:15px; letter-spacing:.05em; border-radius:10px; cursor:pointer;") }, 'GOT IT')
          )
        )
      );
    }

    renderResults(v) {
      return h('div', { style: css('position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; background:var(--m-results-bg); animation:masq-scale-in .35s ease both;') },
        v.jesterMode && h('div', { className: 'j-burst' },
          Array.from({ length: 14 }, (_, i) => h('span', {
            key: i,
            className: 'jb b' + (i % 4),
            style: { '--ang': (i * 25.7) + 'deg', '--dist': (90 + (i % 4) * 45) + 'px', animationDelay: (i * 0.035) + 's' },
          }, ['◆', '✦', '♦', '✧'][i % 4]))
        ),
        h('div', { style: css('height:24px;') }),
        // No way back from here: the round is spent, and Play Again is the only
        // door out.
        h('div', { style: css('position:relative; width:100%; display:flex; justify-content:center; align-items:center; margin-bottom:2px;') },
          h('div', { style: css("font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.35em; text-transform:uppercase; color:var(--m-accent);") }, 'The Final Curtain')
        ),
        h('div', { style: css('flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;') },
          h('div', { style: css("font-family:'Cinzel',serif; font-weight:800; font-size:26px; color:var(--m-text-bright);") }, v.jesterRevealHeading),
          h('div', { style: css('margin-top:18px; animation:masq-float 5s ease-in-out infinite; position:relative;') },
            v.jesterMode && h('div', { className: 'j-rays' }),
            h(Mask, { comedy: !v.hasJester, tragedy: v.hasJester, cracked: v.hasJester, faceColor: v.ivoryFace, lineColor: v.hasJester ? v.crimson : v.wine, size: 120, hat: v.jesterMode })
          ),
          v.hasJester
            ? h('div', { style: css('margin-top:14px; display:flex; flex-direction:column; align-items:center; gap:9px; padding:0 26px;') },
                v.jesterReveals.map((j, i) => h('div', { key: i, style: css('text-align:center; animation:masq-rise .35s ease both;') },
                  h('div', { className: 'j-title', style: css(`font-family:'Cinzel Decorative',serif; font-weight:700; font-size:${v.revealNameSize}; color:var(--m-brand); line-height:1.15;`) }, j.name),
                  j.disguise && h('div', { style: css("font-family:'EB Garamond',serif; font-size:14px; color:var(--m-results-sub); margin-top:3px;") }, j.disguise)
                ))
              )
            : h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:34px; color:var(--m-brand); margin-top:14px;"), className: 'j-title' }, 'No One'),
          h('div', { style: css('display:flex; gap:14px; margin-top:24px; padding:0 26px; width:100%; justify-content:center;') },
            // Centred so this tile still reads as balanced when the word tile
            // beside it grows to fit a poster.
            h('div', { style: css('flex:1; max-width:140px; text-align:center; padding:14px 10px; border-radius:12px; background:rgba(46,91,176,.18); border:1px solid rgba(46,91,176,.4); display:flex; flex-direction:column; justify-content:center;') },
              h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; color:#9fb0cf;") }, 'ROUND CATEGORY'),
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:16px; color:#cfe0ff; margin-top:5px;") }, v.gameCategory)
            ),
            // Covered until tapped: the jester gets their guess in before the
            // answer is on screen. The picture is withheld with it.
            h('div', {
              ...(v.roundWordShown ? {} : press(v.revealRoundWord, 'Reveal the round word')),
              className: v.roundWordShown ? '' : 'masq-btn',
              style: css(`flex:1; max-width:140px; text-align:center; padding:14px 10px; border-radius:12px; background:rgba(178,32,47,.18); border:1px solid rgba(178,32,47,.45);${v.roundWordShown ? '' : ' cursor:pointer;'}`),
            },
              h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; color:#e3a6ac;") }, 'ROUND WORD'),
              v.roundWordShown && v.resultsArt && h('img', {
                key: v.resultsArt,
                src: v.resultsArt, alt: '', draggable: false,
                onError: (e) => { e.target.style.display = 'none'; },
                style: css(`display:block; width:${v.resultsArtW}; height:${v.resultsArtH}; object-fit:cover; object-position:${v.resultsArtFocus}; margin:8px auto 0; border-radius:6px; border:1px solid rgba(178,32,47,.4);`),
              }),
              v.roundWordShown
                ? h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:16px; color:#f4c9cd; margin-top:5px;") }, v.roundWordDisplay)
                : h(React.Fragment, null,
                    h('div', { style: css("font-family:'Cinzel Decorative',serif; font-weight:700; font-size:22px; color:#f4c9cd; margin-top:5px; letter-spacing:.12em;") }, '? ? ?'),
                    h('div', { style: css("font-family:'Archivo',sans-serif; font-size:8px; letter-spacing:.18em; color:#e3a6ac; margin-top:5px; opacity:.85;") }, 'TAP TO REVEAL')
                  )
            )
          ),
          // The jester's last chance: name the word and they still win. Kept
          // above the word tile so it reads while the answer is still covered.
          !v.roundWordShown && v.hasJester && h('div', { style: css('margin-top:14px; padding:0 26px; width:100%; max-width:360px; text-align:center;') },
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-results-sub); line-height:1.4;") },
              v.jesterReveals.length > 1 ? 'The jesters may still steal it by naming the word.' : 'The jester may still steal it by naming the word.'),
            h('div', { ...press(v.openWordPool), className: 'masq-btn', style: css("margin-top:8px; display:inline-block; padding:9px 16px; border-radius:10px; background:var(--m-lift); border:1px solid var(--m-border-hard); font-family:'Archivo',sans-serif; font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--m-accent); cursor:pointer;") },
              `See all ${v.roundWordPool.length} ${v.gameCategory} words`)
          ),
          // Scrolls inside its own box rather than growing the centred column,
          // which a full table would push off the top of the screen.
          v.castReveals.length > 0 && h('div', { style: css('margin-top:22px; padding:0 26px; width:100%; max-width:360px;') },
            h('div', { style: css("font-family:'Archivo',sans-serif; font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:var(--m-results-sub); text-align:center; margin-bottom:8px;") }, v.castRevealHeading),
            // Gives back the height the guess prompt takes while it's up — the
            // column can't scroll, so this box absorbs the difference.
            h('div', { style: css(`display:flex; flex-direction:column; gap:3px; max-height:${(!v.roundWordShown && v.hasJester) ? '132px' : '180px'}; overflow-y:auto;`) },
              // The roles come from the real word, so they stay masked until
              // it's tapped — the row itself stays put either way.
              v.castReveals.map((p, i) => h('div', { key: i, style: css('display:flex; align-items:baseline; justify-content:space-between; gap:14px; padding:7px 12px; background:var(--m-lift); border-radius:8px;') },
                h('div', { style: css("font-family:'Cinzel',serif; font-weight:600; font-size:13px; color:var(--m-text-bright); flex:none;") }, p.name),
                v.roundWordShown
                  ? h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-results-sub); text-align:right;") }, p.role)
                  : h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-dim); text-align:right; letter-spacing:.14em;") }, '??')
              ))
            )
          ),
          h('div', { style: css('margin-top:26px; padding:0 30px; text-align:center;') },
            !v.hasJester && h(React.Fragment, null,
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:20px; color:#9ad2a3;") }, 'Every performer was genuine.'),
              h('div', { style: css("font-family:'EB Garamond',serif; font-size:15px; color:var(--m-results-sub); margin-top:6px;") }, 'No one was pretending. This round had no jester.')
            )
          )
        ),
        h('div', { style: css('width:100%; padding:12px 20px 28px;') },
          h('div', { ...press(v.playAgain), className: 'masq-btn', style: css("padding:17px; text-align:center; background:var(--m-encore); color:var(--m-encore-text); font-family:'Cinzel',serif; font-weight:700; font-size:16px; letter-spacing:.05em; border-radius:10px; cursor:pointer;") }, 'PLAY AGAIN')
        ),
        // Every word the round could have dealt, for the jester to guess from.
        // Its own overlay rather than an inline panel, so a long category can't
        // push the reveal off the top of the screen.
        v.poolOpen && h('div', { style: css('position:absolute; inset:0; background:var(--m-backdrop); display:flex; flex-direction:column; justify-content:flex-end; animation:masq-backdrop .2s ease both;') },
          h('div', { onClick: v.closeWordPool, 'aria-hidden': 'true', style: css('flex:1;') }),
          h('div', { style: css('background:var(--m-modal); border-radius:22px 22px 0 0; padding:20px 20px 36px; border-top:1px solid var(--m-border-strong); max-height:75vh; display:flex; flex-direction:column; animation:masq-slide-up .3s ease both;') },
            h('div', { style: css('display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;') },
              h('div', { style: css("font-family:'Cinzel',serif; font-weight:700; font-size:18px; color:var(--m-text);") }, 'The Jester’s Guess'),
              h('div', { ...press(v.closeWordPool, 'Close'), className: 'masq-btn', style: css("font-family:'Archivo',sans-serif; font-size:22px; color:var(--m-label); cursor:pointer;") }, '×')
            ),
            h('div', { style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-muted); line-height:1.45; margin-bottom:14px;") },
              `Every word ${v.gameCategory} could have dealt. The jester names one — get it right and the round is theirs.`),
            h('div', { style: css('flex:1; overflow-y:auto; margin:0 -4px; padding:0 4px;') },
              h('div', { style: css('display:flex; flex-wrap:wrap; gap:6px;') },
                v.roundWordPool.map((w, i) => h('div', {
                  key: i,
                  style: css("font-family:'EB Garamond',serif; font-size:13px; color:var(--m-text); background:var(--m-lift); border:1px solid var(--m-border); border-radius:8px; padding:5px 10px;"),
                }, w))
              )
            )
          )
        )
      );
    }

    render() {
      const v = this.renderVals();
      const jester = this.state.jesterMode;
      const glyphs = ['◆', '✦', '♦', '✧'];
      return h('div', { style: css('width:100%; height:100dvh; background:radial-gradient(120% 70% at 50% -10%, var(--m-page-glow), transparent 60%), linear-gradient(180deg, var(--m-page-vignette) 0, var(--m-page-vignette) env(safe-area-inset-top, 0px), transparent env(safe-area-inset-top, 0px), transparent calc(100% - env(safe-area-inset-bottom, 0px)), var(--m-page-vignette) calc(100% - env(safe-area-inset-bottom, 0px))), linear-gradient(90deg, var(--m-page-vignette) 0%, transparent calc(50% - 240px), transparent calc(50% + 240px), var(--m-page-vignette) 100%), var(--m-page); padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom); display:flex; align-items:center; justify-content:center;') },
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
