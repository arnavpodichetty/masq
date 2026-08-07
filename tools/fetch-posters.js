// Regenerates src/artwork/posters.js — the title -> TMDB poster path map that
// app.js reads. The generated file is committed, so the site ships no API key and
// makes no TMDB calls while people are playing. Re-run it when the title lists in
// src/data.js change.
//
//   TMDB_API_KEY=xxxx node tools/fetch-posters.js [--verbose]

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.join(__dirname, '..');
const DATA = path.join(REPO, 'src', 'data.js');
const OUT = path.join(REPO, 'src', 'artwork', 'posters.js');
const API = 'https://api.themoviedb.org/3';

const KEY = process.env.TMDB_API_KEY;
const VERBOSE = process.argv.includes('--verbose');

// Titles that search gets wrong, pinned to a TMDB id: a number is a movie,
// 'tv:N' a series. Four things go wrong, none of them often a duplicate film:
//
//   a TV series outranks the film   21 Jump Street -> the 1987 series
//   a new release recycles a title  Anaconda -> the 2025 comedy
//   nothing matches the name        Wild -> The Wild Robot
//   another film owns it exactly    E.T. -> a 2015 film, since the 1982 one
//                                   is titled "E.T. the Extra-Terrestrial"
//
// A fifth reason to pin is drift: search is ranked by popularity, which moves.
// Where a title's runner-up is a *different work of the same name* polling within
// about 70% of the winner, it gets pinned even though today's answer is right.
//
// The trailing comment says what each id actually is — the point of pinning is
// that these can't drift, so verify before editing one. Sorted by title.
const OVERRIDES = {
  '12 Monkeys': 63,                         // Twelve Monkeys (1995)
  '21 Jump Street': 64688,                  // 21 Jump Street (2012)
  'Aladdin': 812,                           // Aladdin (1992)
  'Anaconda': 9360,                         // Anaconda (1997)
  'Avatar: The Last Airbender': 'tv:246',   // Avatar: The Last Airbender (2005)
  'Beauty and the Beast': 10020,            // Beauty and the Beast (1991)
  'Black Christmas': 16938,                 // Black Christmas (1974)
  'Candyman': 9529,                         // Candyman (1992)
  'Cinderella': 11224,                      // Cinderella (1950)
  'Dawn of the Dead': 924,                  // Dawn of the Dead (2004)
  'Death on the Nile': 505026,              // Death on the Nile (2022)
  'Demon Slayer': 'tv:85937',               // Demon Slayer: Kimetsu no Yaiba (2019)
  'E.T.': 601,                              // E.T. the Extra-Terrestrial (1982)
  'Fast and Furious': 9799,                 // The Fast and the Furious (2001)
  'Frequency': 10559,                       // Frequency (2000)
  'Friday the 13th': 4488,                  // Friday the 13th (1980)
  'Ghost in the Shell': 9323,               // Ghost in the Shell (1995)
  'Ghostbusters': 620,                      // Ghostbusters (1984)
  'Hairspray': 2976,                        // Hairspray (2007)
  'Home Alone': 771,                        // Home Alone (1990)
  'How to Train Your Dragon': 10191,        // How to Train Your Dragon (2010)
  'I Know What You Did Last Summer': 3597,  // I Know What You Did Last Summer (1997)
  'Indiana Jones': 85,                      // Raiders of the Lost Ark (1981)
  'It': 346364,                             // It (2017)
  'James Bond': 646,                        // Dr. No (1962)
  'Kingdom': 'tv:70593',                    // Kingdom (2019), Korean zombie series
  'Les Miserables': 82695,                  // Les Misérables (2012)
  'Lethal Weapon': 941,                     // Lethal Weapon (1987)
  'Moana': 277834,                          // Moana (2016)
  'Murder on the Orient Express': 392044,   // Murder on the Orient Express (2017)
  'Night of the Living Dead': 10331,        // Night of the Living Dead (1968)
  'Papillon': 5924,                         // Papillon (1973)
  'Pride and Prejudice': 4348,              // Pride & Prejudice (2005)
  'Resident Evil': 1576,                    // Resident Evil (2002)
  'RoboCop': 5548,                          // RoboCop (1987)
  'Scream': 4232,                           // Scream (1996)
  'Sherlock Holmes': 10528,                 // Sherlock Holmes (2009)
  'Snow White': 408,                        // Snow White and the Seven Dwarfs (1938)
  'Snowpiercer': 110415,                    // Snowpiercer (2013), the film not the series
  'Spotlight': 314365,                      // Spotlight (2015)
  'The Chronicles of Narnia': 411,          // The Lion, the Witch and the Wardrobe (2005)
  'The Hobbit': 49051,                      // The Hobbit: An Unexpected Journey (2012)
  'The Host': 1255,                         // The Host (2006), Korean monster film
  'The Jungle Book': 9325,                  // The Jungle Book (1967)
  'The Little Mermaid': 10144,              // The Little Mermaid (1989)
  'The Lord of the Rings': 120,             // The Fellowship of the Ring (2001)
  'The Texas Chainsaw Massacre': 30497,     // The Texas Chain Saw Massacre (1974)
  'Total Recall': 861,                      // Total Recall (1990)
  'Tremors': 9362,                          // Tremors (1990)
  'True Lies': 36955,                       // True Lies (1994)
  'WALL-E': 10681,                          // WALL·E (2008), spelled with an interpunct
  'War of the Worlds': 74,                  // War of the Worlds (2005)
  'Wild': 228970,                           // Wild (2014)
  'X': 760104,                              // X (2022) — see the norm() note below
};

// ---------------------------------------------------------------- title lists

// Two lists need posters, and they search differently:
//
//   films  — the Movies word category, where the secret word is a film.
//   screen — titles used as roles in Movie/TV Show Genres rounds (including the
//            jester's fake roles). Many are TV series, so these search TV too.
//
// data.js is a browser file that assigns onto window, so give it a window.
function loadTitles() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(DATA, 'utf8'), sandbox, { filename: 'data.js' });
  const d = sandbox.window.MASQ_LOCATIONS_DATA;

  const films = d.wordOnlyCatalog.Movies;
  const screen = new Set();
  for (const list of Object.values(d.movieTvCatalog)) list.forEach(t => screen.add(t));
  for (const list of Object.values(d.fakeMovieTvRoleCatalog)) list.forEach(t => screen.add(t));
  if (!films.length || !screen.size) throw new Error(`Title lists not found in ${DATA}`);

  // A title in both lists keeps its film match: that list is curated and pinned.
  const filmSet = new Set(films);
  return [
    ...films.map(title => ({ title, endpoint: '/search/movie' })),
    ...[...screen].filter(t => !filmSet.has(t)).map(title => ({ title, endpoint: '/search/multi' })),
  ];
}

// ---------------------------------------------------------------------- TMDB

async function tmdb(urlPath, params) {
  const url = new URL(API + urlPath);
  url.searchParams.set('api_key', KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const resp = await fetch(url, { headers: { accept: 'application/json' } });
  if (!resp.ok) throw new Error(`${urlPath} -> HTTP ${resp.status}`);
  return resp.json();
}

// TMDB names films with title/release_date and series with name/first_air_date.
const nameOf = (r) => r.title || r.name || '';
const yearOf = (r) => (r.release_date || r.first_air_date || '').slice(0, 4);
const isTv = (r) => r.media_type === 'tv';

// Compare loosely: "Amélie", "AMELIE" and "Amelie" are all the same title.
// Keep any letter, not just a-z: dropping non-Latin script would collapse a
// title like "X调查" to plain "x", making it an exact match for a title of "X".
const norm = (s) => s
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

async function fetchPinned(spec) {
  const tv = typeof spec === 'string' && spec.startsWith('tv:');
  const r = await tmdb(`/${tv ? 'tv' : 'movie'}/${tv ? spec.slice(3) : spec}`, {});
  return { name: nameOf(r), year: yearOf(r), poster: r.poster_path, tv, match: 'pin' };
}

async function resolve({ title, endpoint }) {
  if (OVERRIDES[title]) return fetchPinned(OVERRIDES[title]);

  const data = await tmdb(endpoint, { query: title, include_adult: 'false' });
  const hits = (data.results || []).filter(r =>
    r.poster_path && (endpoint === '/search/movie' || r.media_type === 'movie' || isTv(r)));
  if (!hits.length) return null;

  // Results arrive in popularity order. Prefer an exact title match among them,
  // so "Up" doesn't lose to a more popular film merely containing the word.
  const exact = hits.filter(r => norm(nameOf(r)) === norm(title));
  const best = (exact.length ? exact : hits).reduce((a, b) => (b.popularity > a.popularity ? b : a));
  return { name: nameOf(best), year: yearOf(best), poster: best.poster_path, tv: isTv(best), match: exact.length ? 'exact' : 'fuzzy' };
}

// A few hundred titles sits well inside TMDB's rate limit, but there's no reason
// to open a socket for every one at once.
async function mapPool(items, size, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }));
  return out;
}

// ---------------------------------------------------------------------- main

function write(posters) {
  const lines = Object.keys(posters).sort()
    .map(t => `    ${JSON.stringify(t)}: ${JSON.stringify(posters[t])},`);
  fs.writeFileSync(OUT, [
    '// GENERATED by tools/fetch-posters.js — do not edit by hand.',
    '// Maps a movie/TV title to its TMDB poster path, for both the Movies word',
    '// category and the titles used as roles in Movie/TV Show Genres rounds.',
    '// app.js builds the full URL as https://image.tmdb.org/t/p/w342<path>.',
    '(function () {',
    '  window.MASQ_POSTERS = {',
    ...lines,
    '  };',
    '})();',
    '',
  ].join('\n'), 'utf8');
}

(async () => {
  if (!KEY) {
    console.error('Set TMDB_API_KEY. Example: TMDB_API_KEY=xxxx node tools/fetch-posters.js');
    process.exit(1);
  }

  const jobs = loadTitles();
  const films = jobs.filter(j => j.endpoint === '/search/movie').length;
  console.log(`Resolving ${films} film titles + ${jobs.length - films} screen-role titles…`);

  const results = await mapPool(jobs, 5, async (job) => {
    try {
      return { title: job.title, hit: await resolve(job) };
    } catch (err) {
      return { title: job.title, error: err.message };
    }
  });

  const posters = {};
  const missing = [];
  const fuzzy = [];
  for (const { title, hit, error } of results) {
    if (!hit) { missing.push(error ? `${title} (${error})` : title); continue; }
    posters[title] = hit.poster;
    const line = `${title}  ->  ${hit.name} (${hit.year || '?'})`;
    // 'fuzzy' means the resolved name differs from ours. Those are worth a look,
    // but so is the whole --verbose list: the matches that bite are the ones
    // that came back exact and still picked the wrong film.
    if (hit.match === 'fuzzy') fuzzy.push(`  ${line}`);
    if (VERBOSE) {
      const flag = { pin: 'pin ', exact: '    ', fuzzy: '?   ' }[hit.match];
      console.log(`  ${flag}${hit.tv ? 'TV ' : '   '}${line}`);
    }
  }

  write(posters);
  console.log(`\nWrote ${Object.keys(posters).length}/${jobs.length} posters to ${OUT}`);
  if (fuzzy.length) console.log(`\nNot an exact title match — check these:\n${fuzzy.join('\n')}`);
  if (missing.length) console.log(`\nNo poster found:\n  ${missing.join('\n  ')}`);
})();
