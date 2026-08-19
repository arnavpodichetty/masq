// Regenerates src/artwork/albums.js — the "Artist (Song)" -> album art map app.js reads.
// The generated file is committed, so the site ships no API key and makes no calls at play
// time. Re-run when the music catalogs in src/data_roles.js change.
//
//   node tools/fetch-albums.js [--verbose]
//
// Deezer needs no key, so unlike fetch-posters.js there's nothing to set up. Apple's
// iTunes Search API answers the same question but throttles at ~20 calls a minute, taking
// a quarter hour and mostly 403s. This run takes about one.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.join(__dirname, '..');
const DATA = path.join(REPO, 'src', 'data_roles.js');
const OUT = path.join(REPO, 'src', 'artwork', 'albums.js');
const API = 'https://api.deezer.com';

const VERBOSE = process.argv.includes('--verbose');

// Deezer allows 50 requests per 5 seconds; sitting well under that costs under a minute
// across the whole catalog.
const PACE_MS = 150;

// Entries that search gets wrong, pinned to a Deezer id: 'album:N' is an album, 'track:N'
// a song. Both failures are about who gets credited — Deezer credits the performer, so a
// composer lands on whichever budget compilation ranks highest this week, and an act
// recording under another name (Diplo's "Lean On" is credited to Major Lazer) lands on
// remixes.
//
// Album ids win over track ids: a song ships on many releases, and pinning the album says
// exactly which cover to show. The trailing comment says what each id is — pins can't
// drift, so verify before editing one. Sorted by entry.
const OVERRIDES = {
  'Bach (Air on the G String)': 'album:387441267',              // English Baroque Soloists — Bach: Orchestral Suites BWV 1066-1069
  'Beethoven (Fur Elise)': 'album:254829962',                   // Stephanie McCallum — Für Elise: Bagatelles for Piano
  'Brahms (Lullaby)': 'album:95830652',                         // Renée Fleming — Brahms: Wiegenlied (Lullaby), Op. 49 No. 4
  'Chopin (Nocturne in E-flat Major)': 'album:556230022',       // Olga Scheps — Chopin Nocturnes
  'Debussy (Clair de Lune)': 'album:282737252',                 // Daniel Barenboim — Debussy: Suite bergamasque: III. Clair de lune
  'Diplo (Lean On)': 'album:458930985',                         // Major Lazer — Peace Is the Mission
  'Grieg (In the Hall of the Mountain King)': 'album:6585186',  // Berliner Philharmoniker — Grieg: Peer Gynt Suites
  'Handel (Hallelujah Chorus)': 'album:389933',                 // Monteverdi Choir — Handel: Messiah
  'Mozart (Eine kleine Nachtmusik)': 'album:477390715',         // George Szell — Mozart: Eine kleine Nachtmusik, K. 525
  'Pachelbel (Canon in D)': 'album:46605972',                   // London Baroque — Pachelbel: Canon & Gigue
  'Ravel (Bolero)': 'album:13702452',                           // Charles Dutoit — Ravel: Boléro
  'Strauss (The Blue Danube)': 'album:6425403',                 // Wiener Philharmoniker — The Blue Danube & Famous Viennese Waltzes
  'Tchaikovsky (Swan Lake)': 'album:239084412',                 // Berliner Philharmoniker — Tchaikovsky: Ballet Suites
  'Vivaldi (The Four Seasons)': 'album:1171382',                // La Petite Bande — Vivaldi: The Four Seasons
  'Wagner (Ride of the Valkyries)': 'album:6585319',            // Berliner Philharmoniker — Wagner: Die Walküre
  'Wallows (Are You Bored Yet?)': 'album:87808862',             // Nothing Happens, not the live EP
};

// ---------------------------------------------------------------- entry lists

// The "Artist (Song)" entries used as roles in Music Genres rounds, real and fake alike.
// data_roles.js assigns onto window, so it's given one.
function loadEntries() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(DATA, 'utf8'), sandbox, { filename: 'data_roles.js' });
  const d = sandbox.window.MASQ_LOCATIONS_DATA;

  const entries = new Set();
  for (const list of Object.values(d.musicGenreCatalog)) list.forEach(e => entries.add(e));
  for (const list of Object.values(d.fakeMusicGenreRoleCatalog)) list.forEach(e => entries.add(e));
  if (!entries.size) throw new Error(`Music catalogs not found in ${DATA}`);
  return [...entries];
}

// One sleeve per album rather than per song, except the B-sides.
function loadMuseCatalog() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(DATA, 'utf8'), sandbox, { filename: 'data_roles.js' });
  const catalog = sandbox.window.MASQ_LOCATIONS_DATA.museCatalog;
  if (!catalog) throw new Error(`museCatalog not found in ${DATA}`);
  return catalog;
}

// Song titles hold parentheses of their own, so split on the last group — ours.
function split(entry) {
  const m = /^(.+?)\s*\(([^()]+)\)$/.exec(entry);
  return m ? { artist: m[1], track: m[2] } : null;
}

// -------------------------------------------------------------------- Deezer

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function deezer(urlPath, params) {
  const url = new URL(API + urlPath);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  // Over quota arrives as HTTP 429 or as a 200 carrying an error object; Deezer uses
  // both, and either way the fix is to wait a beat.
  for (let attempt = 0; ; attempt++) {
    const resp = await fetch(url, { headers: { accept: 'application/json' } });
    const body = resp.ok ? await resp.json() : null;
    if (body && !body.error) return body;
    if (attempt === 3) throw new Error(resp.ok ? `API error ${JSON.stringify(body.error)}` : `HTTP ${resp.status}`);
    await sleep(5000 * (attempt + 1));
  }
}

// Compare loosely: "ROSALÍA", "Rosalia" and "rosalía" are one artist. Any letter is kept,
// not just a-z, so a name in another script doesn't collapse to ''; an ampersand is
// spelled out so "KC and the Sunshine Band" matches "KC & The Sunshine Band".
const norm = (s) => (s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/&/g, ' and ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// Either side may carry the extra: ours is "The Village People" to Deezer's "Village
// People", and Deezer's "Nicky Jam & J Balvin" to our "Nicky Jam".
const nameMatch = (a, b) => a.includes(b) || b.includes(a);

// Re-recordings crowd the results for a famous song and carry covers nobody would
// recognize. The credit can be read strictly — no real act is called "Rockabye Baby!" —
// but the title only loosely, since Brahms did write a "Lullaby".
const IMPOSTOR_CREDIT = /karaoke|tribute|made famous|made popular|in the style of|kidz bop|8-bit|8 bit|rockabye|music box|lullaby/i;
const IMPOSTOR_TITLE = /karaoke|instrumental version|cover version|in the style of/i;
const isImpostor = (r) => IMPOSTOR_CREDIT.test(`${r.artist.name} ${r.album.title}`)
  || IMPOSTOR_TITLE.test(r.title || '');

// A hit ships on a dozen releases ranked by popularity, so the top result is often a
// remix, a live record or a hits package. Three things separate the cover people picture,
// weighted in that order: a name that *is* the act's rather than merely containing it
// (loose matching lets "Fleetwood Mac Experience" answer for Fleetwood Mac); an
// unqualified title, since a "(Thin White Duke Mix)" wears a sleeve nobody has seen; and
// a release that introduced the song, last because a compilation at least shows the right
// artist.
//
// Preferences, not filters — where a song only ever appeared live, every candidate takes
// the same hit and relevance order decides.
const REISSUE = /greatest hits|best of|\bhits\b|the essential|essential |collection|anthology|compilation|singles|soundtrack|\bvol\.? ?\d|\d+th anniversary|\blive\b|unplugged|in concert|remixes|re-?record/i;
const penalty = (r, a, t) => (norm(r.artist.name) === a ? 0 : 4)
  + (norm(r.title) === t ? 0 : 2)
  + (REISSUE.test(r.album.title) ? 1 : 0);

// cover_medium ends in the size asked for; everything before is a prefix app.js appends
// its own size to.
function artPrefix(album) {
  const m = /^(.*\/)\d+x\d+-[\d-]+\.jpg$/.exec((album && album.cover_medium) || '');
  return m ? m[1] : null;
}

async function fetchPinned(spec) {
  const [kind, id] = spec.split(':');
  const r = await deezer(`/${kind}/${id}`, {});
  const album = kind === 'album' ? r : r.album;
  return {
    art: artPrefix(album),
    artist: (r.artist || {}).name,
    track: kind === 'track' ? r.title : null,
    album: album ? album.title : null,
    match: 'pin',
  };
}

// Deezer's field search is exact on the artist name: precise when it lands, empty when it
// doesn't ("The Village People" finds nothing). Ask precisely, then fall back to free text.
async function search(artist, track) {
  const strict = await deezer('/search', { q: `artist:"${artist}" track:"${track}"`, limit: 25 });
  if ((strict.data || []).length) return strict.data;
  const loose = await deezer('/search', { q: `${artist} ${track}`, limit: 25 });
  return loose.data || [];
}

async function resolve(entry) {
  if (OVERRIDES[entry]) return fetchPinned(OVERRIDES[entry]);

  const parts = split(entry);
  if (!parts) throw new Error('not in "Artist (Song)" form');
  const { artist, track } = parts;

  let hits = (await search(artist, track)).filter(r => r.album && artPrefix(r.album));
  const genuine = hits.filter(r => !isImpostor(r));
  if (genuine.length) hits = genuine;
  if (!hits.length) return null;

  const a = norm(artist);
  const t = norm(track);
  // title_short drops the "(feat. …)" and "(Original Mix)" tails, so a song is recognized
  // however that release named it.
  const titles = (r) => [norm(r.title_short), norm(r.title)];
  const artistOk = (r) => nameMatch(norm(r.artist.name), a);
  const trackOk = (r) => titles(r).includes(t);
  //   exact    the artist we named, singing the song we named
  //   partial  the right artist on a longer title — a remix, or a classical
  //            movement listed as "Serenade in G Major: I. Allegro"
  //   loose    the right song credited to someone else — the classical case,
  //            where Deezer credits the orchestra and we credit the composer,
  //            whose name then shows up in the title or album instead
  const tiers = [
    ['exact', hits.filter(r => artistOk(r) && trackOk(r))],
    ['partial', hits.filter(r => artistOk(r) && titles(r).some(x => x.includes(t)))],
    ['loose', hits.filter(r => trackOk(r) && `${norm(r.title)} ${norm(r.album.title)}`.includes(a))],
    ['fuzzy', hits],
  ];
  const [match, list] = tiers.find(([, l]) => l.length);
  // Preferring a release only makes sense once the artist is confirmed — down in loose
  // and fuzzy the candidates aren't one recording, so relevance order stands.
  const ranked = match === 'exact' || match === 'partial';
  const best = ranked ? list.reduce((x, y) => (penalty(y, a, t) < penalty(x, a, t) ? y : x)) : list[0];
  return { art: artPrefix(best.album), artist: best.artist.name, track: best.title, album: best.album.title, match };
}

// Searched by title, not by song. Re-releases carry their own artwork and often outrank
// the record people picture, so prefer the exact title and its plainest edition.
const ALT_EDITION = /anniversary|deluxe|remaster|expanded|edition|re-?issue|\blive\b|instrumental/i;

// Catalog keys that aren't the name of a record. B-Sides is a bucket: the key falls back
// to Hullabaloo's sleeve, but each track resolves to its own single — see resolveMuseTrack.
const MUSE_SLEEVE_OF = { 'B-Sides': 'Hullabaloo Soundtrack' };
const MUSE_PER_TRACK = 'B-Sides';

async function resolveMuseAlbum(name) {
  const title = MUSE_SLEEVE_OF[name] || name;
  const strict = await deezer('/search/album', { q: `artist:"Muse" album:"${title}"`, limit: 25 });
  let list = (strict.data || []).filter(a => norm(a.artist.name) === 'muse');
  if (!list.length) {
    const loose = await deezer('/search/album', { q: `Muse ${title}`, limit: 25 });
    list = (loose.data || []).filter(a => norm(a.artist.name) === 'muse');
  }
  if (!list.length) return null;
  const target = norm(title);
  const rank = (a) => (norm(a.title) === target ? 0 : (norm(a.title).startsWith(target) ? 2 : 4))
    + (ALT_EDITION.test(a.title) ? 1 : 0);
  const best = list.reduce((x, y) => (rank(y) < rank(x) ? y : x));
  return { art: artPrefix(best), album: best.title, exact: norm(best.title).startsWith(target) };
}

// A B-side shipped on a single, but reissues scatter it across bonus editions, Hullabaloo
// and the odd live record. Single first, then the compilation, studio album last — a
// B-side wearing 'Absolution' would read as an Absolution round.
async function resolveMuseTrack(title, studio) {
  const r = await deezer('/search', { q: `artist:"Muse" track:"${title}"`, limit: 25 });
  const want = norm(title);
  const hits = (r.data || []).filter(t => norm(t.artist.name) === 'muse'
    && (norm(t.title) === want || norm(t.title).startsWith(want + ' ')));
  if (!hits.length) return null;
  const rank = (t) => (studio.has(norm(t.album.title)) ? 5 : 0)
    + (ALT_EDITION.test(t.album.title) ? 3 : 0)
    + (/hullabaloo/i.test(t.album.title) ? 1 : 0);
  const best = hits.reduce((x, y) => (rank(y) < rank(x) ? y : x));
  return { art: artPrefix(best.album), album: best.album.title, exact: rank(best) === 0 };
}

// One at a time, spaced out: a pool would finish seconds sooner and spend the rest of the
// run apologizing for it.
async function mapPaced(items, fn) {
  const out = [];
  for (let i = 0; i < items.length; i++) {
    if (i) await sleep(PACE_MS);
    out.push(await fn(items[i], i));
  }
  return out;
}

// ---------------------------------------------------------------------- main

function write(albums, museAlbums, museTracks) {
  const rows = (map) => Object.keys(map).sort()
    .map(e => `    ${JSON.stringify(e)}: ${JSON.stringify(map[e])},`);
  fs.writeFileSync(OUT, [
    '// GENERATED by tools/fetch-albums.js — do not edit by hand.',
    '// Maps a Music Genres "Artist (Song)" entry to the prefix of that song\'s',
    '// album art on the Deezer CDN. app.js appends the size, so the full URL is',
    '// <prefix>300x300-000000-80-0-0.jpg.',
    '//',
    '// MASQ_MUSE_ALBUMS is the same keyed by album, for the Muse category, where',
    '// every song on a record shows that one sleeve. MASQ_MUSE_TRACKS overrides',
    '// that per song, for B-sides that each came off a different single.',
    '(function () {',
    '  window.MASQ_ALBUMS = {',
    ...rows(albums),
    '  };',
    '',
    '  window.MASQ_MUSE_ALBUMS = {',
    ...rows(museAlbums),
    '  };',
    '',
    '  window.MASQ_MUSE_TRACKS = {',
    ...rows(museTracks),
    '  };',
    '})();',
    '',
  ].join('\n'), 'utf8');
}

(async () => {
  const entries = loadEntries();
  console.log(`Resolving album art for ${entries.length} music entries…`);

  const results = await mapPaced(entries, async (entry) => {
    try {
      return { entry, hit: await resolve(entry) };
    } catch (err) {
      return { entry, error: err.message };
    }
  });

  const albums = {};
  const missing = [];
  const review = [];
  for (const { entry, hit, error } of results) {
    if (!hit || !hit.art) { missing.push(error ? `${entry} (${error})` : entry); continue; }
    albums[entry] = hit.art;
    const line = `${entry}  ->  ${hit.artist}${hit.track ? ` — ${hit.track}` : ''}  [${hit.album}]`;
    // 'loose' and 'fuzzy' mean the artist, song or both came back as something else.
    // Worth a look — but so is the whole --verbose list, since the ones that bite came
    // back exact and still picked an unrecognizable cover.
    if (hit.match === 'loose' || hit.match === 'fuzzy') review.push(`  ${hit.match.padEnd(6)}${line}`);
    if (VERBOSE) console.log(`  ${{ pin: 'pin ', exact: '    ', partial: '~   ', loose: '?   ', fuzzy: '??  ' }[hit.match]}${line}`);
  }

  const museCatalog = loadMuseCatalog();
  const museNames = Object.keys(museCatalog);
  console.log(`\nResolving sleeves for ${museNames.length} Muse albums…`);
  const museResults = await mapPaced(museNames, async (name) => {
    try {
      return { name, hit: await resolveMuseAlbum(name) };
    } catch (err) {
      return { name, error: err.message };
    }
  });
  const museAlbums = {};
  for (const { name, hit, error } of museResults) {
    if (!hit || !hit.art) { missing.push(error ? `${name} (${error})` : name); continue; }
    museAlbums[name] = hit.art;
    // Printed unconditionally — a remaster's artwork is silent otherwise.
    console.log(`  ${hit.exact ? '    ' : '?   '}${name}  ->  ${hit.album}`);
  }

  const bsides = museCatalog[MUSE_PER_TRACK] || [];
  const studio = new Set(museNames.filter(n => n !== MUSE_PER_TRACK).map(norm));
  console.log(`\nResolving sleeves for ${bsides.length} B-sides…`);
  const trackResults = await mapPaced(bsides, async (title) => {
    try {
      return { title, hit: await resolveMuseTrack(title, studio) };
    } catch (err) {
      return { title, error: err.message };
    }
  });
  const museTracks = {};
  for (const { title, hit, error } of trackResults) {
    if (!hit || !hit.art) { missing.push(error ? `${title} (${error})` : title); continue; }
    museTracks[title] = hit.art;
    // '?' means no single carried it and the sleeve came off a record instead.
    console.log(`  ${hit.exact ? '    ' : '?   '}${title.padEnd(44)}${hit.album}`);
  }

  write(albums, museAlbums, museTracks);
  console.log(`\nWrote ${Object.keys(albums).length}/${entries.length} albums, ${Object.keys(museAlbums).length}/${museNames.length} Muse sleeves and ${Object.keys(museTracks).length}/${bsides.length} B-side sleeves to ${OUT}`);
  if (review.length) console.log(`\nNot an exact artist+song match — check these:\n${review.join('\n')}`);
  if (missing.length) console.log(`\nNo album art found:\n  ${missing.join('\n  ')}`);
})();
