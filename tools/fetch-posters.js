// Regenerates src/artwork/posters.js — the title -> TMDB poster path map app.js
// reads. The generated file is committed, so the site ships no API key and makes
// no TMDB calls at play time. Re-run when the title lists in src/data_roles.js change.
//
//   TMDB_API_KEY=xxxx node tools/fetch-posters.js [--verbose]

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.join(__dirname, '..');
const DATA = path.join(REPO, 'src', 'data_roles.js');
const WORDS = path.join(REPO, 'src', 'data_words.js');
const OUT = path.join(REPO, 'src', 'artwork', 'posters.js');
const API = 'https://api.themoviedb.org/3';

const KEY = process.env.TMDB_API_KEY;
const VERBOSE = process.argv.includes('--verbose');

// Titles that search gets wrong, pinned to a TMDB id: a number is a movie, 'tv:N' a
// series. Four things go wrong:
//
//   a TV series outranks the film   21 Jump Street -> the 1987 series
//   a new release recycles a title  Anaconda -> the 2025 comedy
//   nothing matches the name        Wild -> The Wild Robot
//   another film owns it exactly    E.T. -> a 2015 film, since the 1982 one
//                                   is titled "E.T. the Extra-Terrestrial"
//
// A fifth reason is drift: results are ranked by popularity, so where the runner-up is a
// *different work of the same name* polling within ~70% of the winner, it gets pinned even
// though today's answer is right.
//
// The trailing comment says what each id is — pins can't drift, so verify before editing
// one. Sorted by title.
const OVERRIDES = {
  '101 Dalmatians': 12230,                  // One Hundred and One Dalmatians (1961), not the 1996 live action
  '12 Monkeys': 63,                         // Twelve Monkeys (1995)
  '21 Jump Street': 64688,                  // 21 Jump Street (2012)
  'Aladdin': 812,                           // Aladdin (1992)
  'Alice in Wonderland': 12092,             // Alice in Wonderland (1951), not the 2010 remake
  'Anaconda': 9360,                         // Anaconda (1997)
  'Austin Powers': 816,                     // International Man of Mystery (1997), not the sequel
  'Avatar: The Last Airbender': 'tv:246',   // Avatar: The Last Airbender (2005)
  'Bambi': 3170,                            // Bambi (1942), not the 1948 series
  'Beauty and the Beast': 10020,            // Beauty and the Beast (1991)
  'Beetlejuice': 4011,                      // Beetlejuice (1988), not the 1989 animated series
  'Black Christmas': 16938,                 // Black Christmas (1974)
  'Borat': 496,                             // Borat (2006), not Subsequent Moviefilm
  'Candyman': 9529,                         // Candyman (1992)
  'Cinderella': 11224,                      // Cinderella (1950)
  'Clueless': 9603,                         // Clueless (1995), not the 1996 series
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
  'Harry Potter': 671,                      // The Philosopher's Stone (2001), not the 2026 series
  'Home Alone': 771,                        // Home Alone (1990)
  'How to Train Your Dragon': 10191,        // How to Train Your Dragon (2010)
  'I Know What You Did Last Summer': 3597,  // I Know What You Did Last Summer (1997)
  'Indiana Jones': 85,                      // Raiders of the Lost Ark (1981)
  'It': 346364,                             // It (2017)
  'James Bond': 646,                        // Dr. No (1962)
  'Kingdom': 'tv:70593',                    // Kingdom (2019), Korean zombie series
  'Kingsman': 207703,                       // Kingsman: The Secret Service (2015), not the 2021 prequel
  'Les Misérables': 82695,                 // Les Misérables (2012)
  'Lethal Weapon': 941,                     // Lethal Weapon (1987)
  'Love Actually': 508,                     // Love Actually (2003), not the 2021 series
  'Miracle': 14292,                         // Miracle (2004), the hockey film
  'Mission Impossible': 954,                // Mission: Impossible (1996), not the 1966 series
  'Moana': 277834,                          // Moana (2016)
  'Murder on the Orient Express': 392044,   // Murder on the Orient Express (2017)
  'Night of the Living Dead': 10331,        // Night of the Living Dead (1968)
  'Papillon': 5924,                         // Papillon (1973)
  'Percy Jackson': 32657,                   // The Lightning Thief (2010), not the 2023 series
  'Peter Pan': 10693,                       // Peter Pan (1953), not the 2003 live action
  'Planet of the Apes': 871,                // Planet of the Apes (1968), not the 2001 remake
  'Poltergeist': 609,                       // Poltergeist (1982), not the 2015 remake
  'Pride and Prejudice': 4348,              // Pride & Prejudice (2005)
  'Resident Evil': 1576,                    // Resident Evil (2002)
  'RoboCop': 5548,                          // RoboCop (1987)
  'Scream': 4232,                           // Scream (1996)
  'Sherlock Holmes': 10528,                 // Sherlock Holmes (2009)
  'Snow White and the Seven Dwarfs': 408,   // Snow White and the Seven Dwarfs (1938), not the 2025 remake
  'Snowpiercer': 110415,                    // Snowpiercer (2013), the film not the series
  'Spotlight': 314365,                      // Spotlight (2015)
  'Star Trek': 13475,                       // Star Trek (2009), not the 1966 series
  'Taken': 8681,                            // Taken (2008), not the 2017 series
  'Taxi Driver': 103,                       // Taxi Driver (1976), not the 2021 series
  'The Chronicles of Narnia': 411,          // The Lion, the Witch and the Wardrobe (2005)
  'The Equalizer': 156022,                  // The Equalizer (2014), not the 2021 series
  'The Hobbit': 49051,                      // The Hobbit: An Unexpected Journey (2012)
  'The Host': 1255,                         // The Host (2006), Korean monster film
  'The Jungle Book': 9325,                  // The Jungle Book (1967)
  'The Little Mermaid': 10144,              // The Little Mermaid (1989)
  'The Lord of the Rings': 120,             // The Fellowship of the Ring (2001)
  'The Purge': 158015,                      // The Purge (2013), not the 2018 series
  'The Texas Chainsaw Massacre': 30497,     // The Texas Chain Saw Massacre (1974)
  'Total Recall': 861,                      // Total Recall (1990)
  'Tremors': 9362,                          // Tremors (1990)
  'True Lies': 36955,                       // True Lies (1994)
  'WALL-E': 10681,                          // WALL·E (2008), spelled with an interpunct
  'War of the Worlds': 74,                  // War of the Worlds (2005)
  'Wild': 228970,                           // Wild (2014)
  'Willow': 847,                            // Willow (1988), not the 2022 series
  'X': 760104,                              // X (2022) — see the norm() note below
  'X-Men': 36657,                           // X-Men (2000), not the 1992 animated series
};

// ---------------------------------------------------------------- title lists

// Every title used in Movie/TV Show Genres rounds, real role or jester's fake. The
// Movies/TV word category draws from that same set, so it adds nothing.
//
// Everything searches /search/multi, since the list is roughly half TV: forcing
// /search/movie on a series quietly resolves it to an unrelated film of the same name, and
// resolve() drops person results, so multi is safe for films too.
//
// Both data files assign onto window and both are needed — the genre catalog is in
// data_roles.js, the Movies/TV word list in data_words.js.
function loadTitles() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(DATA, 'utf8'), sandbox, { filename: 'data_roles.js' });
  vm.runInContext(fs.readFileSync(WORDS, 'utf8'), sandbox, { filename: 'data_words.js' });
  const d = sandbox.window.MASQ_LOCATIONS_DATA;
  const w = sandbox.window.MASQ_WORDS;

  const screen = new Set();
  for (const list of Object.values(d.movieTvCatalog)) list.forEach(t => screen.add(t));
  for (const list of Object.values(d.fakeMovieTvRoleCatalog)) list.forEach(t => screen.add(t));
  for (const t of w.wordOnlyCatalog['Movies/TV'] || []) screen.add(t);
  if (!screen.size) throw new Error(`Title lists not found in ${DATA}`);

  return [...screen].map(title => ({ title, endpoint: '/search/multi' }));
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

// Compare loosely: "Amélie", "AMELIE" and "Amelie" are one title. Any letter is kept, not
// just a-z — dropping non-Latin script would collapse "X调查" to "x", matching a title "X".
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

  // Results arrive in popularity order, so prefer an exact title match — otherwise "Up"
  // loses to a more popular film merely containing the word.
  const exact = hits.filter(r => norm(nameOf(r)) === norm(title));
  const best = (exact.length ? exact : hits).reduce((a, b) => (b.popularity > a.popularity ? b : a));
  return { name: nameOf(best), year: yearOf(best), poster: best.poster_path, tv: isTv(best), match: exact.length ? 'exact' : 'fuzzy' };
}

// A few hundred titles sits well inside TMDB's rate limit, but there's no need to open a
// socket for every one at once.
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
    '// Maps a movie/TV title to its TMDB poster path, for the Movies/TV word',
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
  console.log(`Resolving ${jobs.length} movie/TV titles…`);

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
    // 'fuzzy' means the resolved name differs from ours. Worth a look — but so is the
    // whole --verbose list, since the ones that bite came back exact and still picked the
    // wrong film.
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
