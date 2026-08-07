// Regenerates src/artwork/albums.js — the "Artist (Song)" -> album art map that
// app.js reads. The generated file is committed, so the site ships no API key and
// makes no calls to Deezer while people are playing. Re-run it when the music
// catalogs in src/data.js change.
//
//   node tools/fetch-albums.js [--verbose]
//
// Deezer needs no key, so unlike fetch-posters.js there's nothing to set up
// first. Apple's iTunes Search API answers the same question, but it throttles
// at about twenty calls a minute — a couple of hundred entries there takes a
// quarter of an hour and comes back mostly 403s. This run takes about a minute.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.join(__dirname, '..');
const DATA = path.join(REPO, 'src', 'data.js');
const OUT = path.join(REPO, 'src', 'artwork', 'albums.js');
const API = 'https://api.deezer.com';

const VERBOSE = process.argv.includes('--verbose');

// Deezer allows 50 requests per 5 seconds. Sitting well under that costs less
// than a minute across the whole catalog.
const PACE_MS = 150;

// Entries that search gets wrong, pinned to a Deezer id: 'album:N' is an album,
// 'track:N' a song. Two things go wrong, and both are about who gets credited:
//
//   the composer never recorded it  Bach -> whichever budget compilation of the
//                                   piece ranks highest this week, since Deezer
//                                   credits the performer
//   the act records under another   Diplo (Lean On) -> remixes of it, since the
//   name                            record is credited to Major Lazer
//
// Album ids win over track ids: a song ships on many releases, and pinning the
// album says exactly which cover to show.
//
// The trailing comment says what each id actually is — the point of pinning is
// that these can't drift, so verify before editing one. Sorted by entry.
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

// One list needs album art: the "Artist (Song)" entries used as roles in Music
// Genres rounds, the real ones and the jester's fakes alike.
//
// data.js is a browser file that assigns onto window, so give it a window.
function loadEntries() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(DATA, 'utf8'), sandbox, { filename: 'data.js' });
  const d = sandbox.window.MASQ_LOCATIONS_DATA;

  const entries = new Set();
  for (const list of Object.values(d.musicGenreCatalog)) list.forEach(e => entries.add(e));
  for (const list of Object.values(d.fakeMusicGenreRoleCatalog)) list.forEach(e => entries.add(e));
  if (!entries.size) throw new Error(`Music catalogs not found in ${DATA}`);
  return [...entries];
}

// Song titles hold parentheses of their own, so split on the last group — the
// one data.js added.
function split(entry) {
  const m = /^(.+?)\s*\(([^()]+)\)$/.exec(entry);
  return m ? { artist: m[1], track: m[2] } : null;
}

// -------------------------------------------------------------------- Deezer

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function deezer(urlPath, params) {
  const url = new URL(API + urlPath);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  // Going over quota arrives as HTTP 429, or as a 200 carrying an error object;
  // Deezer uses both, and either way the fix is to wait a beat.
  for (let attempt = 0; ; attempt++) {
    const resp = await fetch(url, { headers: { accept: 'application/json' } });
    const body = resp.ok ? await resp.json() : null;
    if (body && !body.error) return body;
    if (attempt === 3) throw new Error(resp.ok ? `API error ${JSON.stringify(body.error)}` : `HTTP ${resp.status}`);
    await sleep(5000 * (attempt + 1));
  }
}

// Compare loosely: "ROSALÍA", "Rosalia" and "rosalía" are all the same artist.
// Keep any letter, not just a-z, so a name in another script doesn't collapse to
// ''. An ampersand is spelled out rather than dropped, so "KC and the Sunshine
// Band" still reads as the same name as "KC & The Sunshine Band".
const norm = (s) => (s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/&/g, ' and ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// Either side may carry the extra: we say "The Village People" where Deezer says
// "Village People", and Deezer says "Nicky Jam & J Balvin" where we say "Nicky
// Jam".
const nameMatch = (a, b) => a.includes(b) || b.includes(a);

// Re-recordings are cheap to publish, so they crowd the results for a famous
// song, and none of them carry a cover anyone would recognize. Who released it
// can be read strictly — no real act is called "Rockabye Baby!" — but the title
// only loosely, since Brahms really did write a "Lullaby".
const IMPOSTOR_CREDIT = /karaoke|tribute|made famous|made popular|in the style of|kidz bop|8-bit|8 bit|rockabye|music box|lullaby/i;
const IMPOSTOR_TITLE = /karaoke|instrumental version|cover version|in the style of/i;
const isImpostor = (r) => IMPOSTOR_CREDIT.test(`${r.artist.name} ${r.album.title}`)
  || IMPOSTOR_TITLE.test(r.title || '');

// A hit ships on a dozen releases and search ranks them by popularity, so the
// top result is often a remix, a live record or a hits package. Three things
// separate the cover people picture, weighted in the order they matter: a name
// that *is* the act's rather than merely containing it (loose matching is what
// lets "Village People" answer for "The Village People", and equally lets
// "Fleetwood Mac Experience" answer for Fleetwood Mac); an unqualified title,
// since a "(Thin White Duke Mix)" is a different recording wearing a sleeve
// nobody has seen; and a release that introduced the song rather than one that
// re-issues it, last because a compilation at least shows the right artist.
//
// Preferences, not filters. Where a song only ever appeared live — plenty of the
// gospel entries — every candidate takes the same hit and relevance order
// decides, exactly as it would have without any of this.
const REISSUE = /greatest hits|best of|\bhits\b|the essential|essential |collection|anthology|compilation|singles|soundtrack|\bvol\.? ?\d|\d+th anniversary|\blive\b|unplugged|in concert|remixes|re-?record/i;
const penalty = (r, a, t) => (norm(r.artist.name) === a ? 0 : 4)
  + (norm(r.title) === t ? 0 : 2)
  + (REISSUE.test(r.album.title) ? 1 : 0);

// cover_medium ends in the size it was asked for; everything before that is a
// prefix any size can be appended to. app.js appends the size it displays.
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

// Deezer's field search is exact on the artist name, which is precise when it
// lands and empty when it doesn't — "The Village People" finds nothing, since
// Deezer files them without the "The". So ask precisely, then fall back to the
// same words as free text.
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
  // title_short drops the "(feat. …)" and "(Original Mix)" tails, so a song is
  // recognized as itself whichever way that release happened to name it.
  const titles = (r) => [norm(r.title_short), norm(r.title)];
  const artistOk = (r) => nameMatch(norm(r.artist.name), a);
  const trackOk = (r) => titles(r).includes(t);
  //
  //   exact    the artist we named, singing the song we named
  //   partial  the right artist on a longer title — a remix, or a classical
  //            movement listed as "Serenade in G Major: I. Allegro"
  //   loose    the right song, credited to someone else. This is the classical
  //            case: Deezer credits the orchestra, we credit the composer, so
  //            the composer's name shows up in the title or the album instead
  const tiers = [
    ['exact', hits.filter(r => artistOk(r) && trackOk(r))],
    ['partial', hits.filter(r => artistOk(r) && titles(r).some(x => x.includes(t)))],
    ['loose', hits.filter(r => trackOk(r) && `${norm(r.title)} ${norm(r.album.title)}`.includes(a))],
    ['fuzzy', hits],
  ];
  const [match, list] = tiers.find(([, l]) => l.length);
  // Preferring a release only makes sense once the artist is confirmed: down in
  // loose and fuzzy the candidates aren't one recording — the song may not even
  // be by whom we asked — so relevance order stands. Where it does apply,
  // reduce() keeps the first of an equal pair, so ties still fall that way.
  const ranked = match === 'exact' || match === 'partial';
  const best = ranked ? list.reduce((x, y) => (penalty(y, a, t) < penalty(x, a, t) ? y : x)) : list[0];
  return { art: artPrefix(best.album), artist: best.artist.name, track: best.title, album: best.album.title, match };
}

// One at a time, spaced out. A pool would finish a few seconds sooner and spend
// the rest of the run apologizing for it.
async function mapPaced(items, fn) {
  const out = [];
  for (let i = 0; i < items.length; i++) {
    if (i) await sleep(PACE_MS);
    out.push(await fn(items[i], i));
  }
  return out;
}

// ---------------------------------------------------------------------- main

function write(albums) {
  const lines = Object.keys(albums).sort()
    .map(e => `    ${JSON.stringify(e)}: ${JSON.stringify(albums[e])},`);
  fs.writeFileSync(OUT, [
    '// GENERATED by tools/fetch-albums.js — do not edit by hand.',
    '// Maps an "Artist (Song)" entry from the Music Genres catalogs to the prefix',
    '// of that song\'s album art on the Deezer CDN. app.js appends the size it',
    '// wants, so the full URL is <prefix>300x300-000000-80-0-0.jpg.',
    '(function () {',
    '  window.MASQ_ALBUMS = {',
    ...lines,
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
    // 'loose' and 'fuzzy' mean the artist, the song, or both came back as
    // something other than what we asked for. Those are worth a look, but so is
    // the whole --verbose list: the ones that bite are the matches that came
    // back exact and still picked a cover nobody recognizes.
    if (hit.match === 'loose' || hit.match === 'fuzzy') review.push(`  ${hit.match.padEnd(6)}${line}`);
    if (VERBOSE) console.log(`  ${{ pin: 'pin ', exact: '    ', partial: '~   ', loose: '?   ', fuzzy: '??  ' }[hit.match]}${line}`);
  }

  write(albums);
  console.log(`\nWrote ${Object.keys(albums).length}/${entries.length} albums to ${OUT}`);
  if (review.length) console.log(`\nNot an exact artist+song match — check these:\n${review.join('\n')}`);
  if (missing.length) console.log(`\nNo album art found:\n  ${missing.join('\n  ')}`);
})();
