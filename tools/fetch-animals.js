// Regenerates src/artwork/animals.js — the animal -> photo map app.js reads for
// Biomes rounds. The generated file is committed, so the site ships no API key
// and makes no calls to Wikipedia at play time. Re-run when the biome catalogs
// in src/data_roles.js change.
//
//   node tools/fetch-animals.js [--verbose]
//
// Wikipedia needs no key and takes fifty titles per request, so the whole
// catalog resolves in a handful of calls and a couple of seconds — no pacing
// delay needed, unlike fetch-albums.js. What comes back is the article's lead
// image, which is usually exactly what a card wants.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.join(__dirname, '..');
const DATA = path.join(REPO, 'src', 'data_roles.js');
const OUT = path.join(REPO, 'src', 'artwork', 'animals.js');
const WIKI = 'https://en.wikipedia.org/w/api.php';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';

const VERBOSE = process.argv.includes('--verbose');

// Wikimedia asks automated clients to identify themselves and to say where to
// complain. An anonymous script is the kind that gets range-blocked.
const UA = 'MasqArtFetch/1.0 (https://github.com/arnavpodichetty/masq; art for a party game) node';

// The API caps anonymous title lists at fifty.
const BATCH = 50;

// Requested width. Wikimedia serves the next bucket up, so this yields ~500px
// — enough for the 148px-wide block the card draws at 3x.
const THUMB_PX = 400;

// Entries the plain lookup gets wrong, pinned to what to use instead: a page
// title, or 'file:Some File.jpg' to name a Commons image outright. Prefer a
// page — a lead image keeps improving as editors find better photographs, while
// a pinned file is frozen. Four things go wrong:
//
//   the name means something else    Cricket -> the sport
//   the name is ours, not science's  nothing is filed under Volcanic Mouse
//   the article is about a group     leads with a collage or a range map
//   the lead photo isn't free enough GFDL-1.2-only, so pinned to a CC one
//
// The trailing comment says why each is pinned. Sorted by entry.
const OVERRIDES = {
  'Anglerfish': 'Humpback anglerfish',            // the article leads with an order-wide collage
  'Black Bear': 'American black bear',            // "Black bear" alone is a disambiguation page
  'Blind Fish': 'Mexican tetra',                  // the blind cave form everyone pictures
  'Catfish': 'Wels catfish',                      // the order's article leads with a grid of thirty
  'Cricket': 'Cricket (insect)',                  // not the sport
  'Deer': 'White-tailed deer',                    // the family's article leads with five species at once
  'Deep Sea Jellyfish': 'Atolla wyvillei',        // the crown jellyfish of the deep sea
  'Elephant': 'African bush elephant',            // "Elephant" leads with a GFDL-1.2-only photo
  'Fangtooth Fish': 'Fangtooth',                  // filed without the "Fish"
  'Giraffe': 'Northern giraffe',                  // "Giraffe" leads with a GFDL-1.2-only photo
  'Gray Owl': 'Great grey owl',                   // not Grey Owl, the writer
  'Gulper Eel': 'Pelican eel',                    // "Gulper eel" is a list of several fish
  'Lynx': 'Eurasian lynx',                        // the genus article leads with a collage of heads
  'Meadowlark': 'Western meadowlark',             // the genus article carries no lead image at all
  'Poison Dart Frog': 'Dyeing poison dart frog',  // the family's lead photo is twice as tall as it is wide
  'River Dolphin': 'Amazon river dolphin',        // the group article leads with a range map
  'Salmon': 'Sockeye salmon',                     // "Salmon" leads with a 3:1 strip of a fish
  'Seal': 'Harbor seal',                          // "Seal" alone is a disambiguation page
  'Sparrow': 'House sparrow',                     // "Sparrow" alone is a disambiguation page
  'Squirrel': 'Eastern gray squirrel',            // the family's article leads with a montage of eight
  // the article leads with one fossil bone, 3:1; this is the whole skeleton
  'Spinosaurus': 'file:Spinosaurus Skeleton Cast at the National Geographic Museum.jpg',
  'Starfish': 'Common starfish',                  // the class article leads with a montage
  'Toucan': 'Toco toucan',                        // the family's article leads with a montage of six
  'Troglodyte Beetle': 'Leptodirus',              // the first cave beetle ever described
  'Volcanic Mouse': 'Neotomodon',                 // the Mexican volcano mouse
  // the article's CDC photo is credited to a lab and three people; this to one
  'Water Moccasin': 'file:Florida Water Moccasin 056.jpg',
  // both "Wildebeest" and "Blue wildebeest" lead with the same GFDL-1.2 photo
  'Wildebeest': 'file:Blue wildebeest (Connochaetes taurinus taurinus), male.jpg',
  'Zebra': 'Plains zebra',                        // "Zebra" leads with a GFDL-1.2-only photo
};

const FILE_PIN = 'file:';
const isFilePin = (pin) => typeof pin === 'string' && pin.startsWith(FILE_PIN);

// Who to credit, where Commons' own answer can't be used as it stands. Keyed by
// file name, covering two cases: nobody is named (the photographer is in the
// file name or in prose only a person can read, and the run refuses to finish
// without a name), or too much is named (tidyCredit below unpicks the common
// shapes; these are the ones only a reader can untangle).
//
// Every one of these must keep every person and institution the original names
// — dropping a request or an address is fine, dropping a name is not.
const CREDIT_OVERRIDES = {
  'Antarctic krill (Euphausia superba).jpg': 'Uwe Kils',            // was: the name, an offer to Wikipedia, then the name again
  'Bombina bombina 1 (Marek Szczepanek).jpg': 'Marek Szczepanek',   // named only in the file name
  'Scarus frenatus by Ewa Barska.jpg': 'Ewa Barska',                // named only in the file name
  'Sockeye salmon swimming right.jpg': 'Milton Love, Marine Science Institute, UCSB',  // was: the same, plus a postal address
  'SpottedSalamander.jpg': 'Scott Camazine',                        // was: the surname, a stray bracket, then the full name
  // Someone cropped someone else's photo, so two people are owed a line and
  // Commons writes both into one field in either order. Which is which is what
  // no rule can read, so it's said here: photographer, then who worked on it in
  // brackets — the same shape fetch-cuisines.js writes, so one credits screen
  // doesn't punctuate the same relationship two ways.
  'Crotalus cerastes mesquite springs CA-2.jpg': 'Tigerhawkvok (edited by Victorrocha)',
  'Gyps rueppellii -Nairobi National Park, Kenya-8-4c.jpg': 'Jorge Láscar (edited by Snowmanradio)',
  'LA-Triceratops mount-2.jpg': 'Allie Caulfield (edited by MathKnight)',
  // the same chain, but both halves are one man cropping his own photograph
  'Lepus americanus 5459 cropped.jpg': 'Walter Siegmund',
  // the author line is a link to his own site; the name is on his user page.
  // Both of these are his — the skunk's Artist field is the bare link again.
  'Harpia harpyja 001 800.jpg': 'Tom Friedel (birdphotos.com)',
  'Striped Skunk.jpg': 'Tom Friedel (birdphotos.com)',
  // the author line records how the archive came by it, not who took it
  "SaltwaterCrocodile('Maximo').jpg": 'Molly Ebersold, St. Augustine Alligator Farm',
  // a four-photo collage credited to "his respective owners", i.e. nobody;
  // named here in the order they appear on the file page
  'Turtle diversity.jpg': 'Petra Karstedt, CLpramod, Matthew Field, Hoffryan',
};

// ---------------------------------------------------------------- entry lists

// The creatures used as roles in Biomes rounds, real and fake alike. data_roles.js is
// a browser file that assigns onto window, so give it a window.
function loadEntries() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(DATA, 'utf8'), sandbox, { filename: 'data_roles.js' });
  const d = sandbox.window.MASQ_LOCATIONS_DATA;

  const entries = new Set();
  for (const list of Object.values(d.biomeCatalog)) list.forEach(e => entries.add(e));
  for (const list of Object.values(d.fakeBiomeRoleCatalog)) list.forEach(e => entries.add(e));
  if (!entries.size) throw new Error(`Biome catalogs not found in ${DATA}`);
  return [...entries].sort();
}

// ----------------------------------------------------------------- mediawiki

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function api(endpoint, params) {
  const url = new URL(endpoint);
  for (const [k, v] of Object.entries({ format: 'json', formatversion: '2', ...params })) {
    url.searchParams.set(k, v);
  }
  for (let attempt = 0; ; attempt++) {
    const resp = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' } });
    if (resp.ok) return resp.json();
    if (attempt === 3) throw new Error(`HTTP ${resp.status}`);
    await sleep(2000 * (attempt + 1));
  }
}

const chunk = (arr, n) => arr.reduce((out, x, i) => ((i % n ? out[out.length - 1].push(x) : out.push([x])), out), []);

// Batches titles and hands back what each *requested* title ended up at.
// MediaWiki reports capitalization fixes and redirects as separate from-to
// lists rather than on the page, so the hops have to be walked back.
async function fetchPages(titles) {
  const pages = new Map();
  for (const group of chunk([...new Set(titles)], BATCH)) {
    const { query } = await api(WIKI, {
      action: 'query',
      prop: 'pageimages|pageprops|description',
      piprop: 'thumbnail|name',
      pithumbsize: String(THUMB_PX),
      titles: group.join('|'),
      redirects: '1',
    });
    const hop = new Map();
    for (const n of query.normalized || []) hop.set(n.from, n.to);
    for (const r of query.redirects || []) hop.set(r.from, r.to);
    const settle = (t) => { let x = t; for (let i = 0; i < 5 && hop.has(x); i++) x = hop.get(x); return x; };
    const byTitle = new Map((query.pages || []).map(p => [p.title, p]));
    for (const t of group) pages.set(t, byTitle.get(settle(t)) || null);
  }
  return pages;
}

// A page is only usable if it's a real article carrying a lead image.
// Disambiguation pages are the trap worth naming: "Seal" and "Sparrow" are
// perfectly real pages that resolve, and picture nothing.
const usable = (p) => !!(p && !p.missing && p.thumbnail
  && !(p.pageprops && 'disambiguation' in p.pageprops));

// Wikipedia titles are case-sensitive past the first letter and species
// articles use sentence case, so "Polar Bear" is a different title from "Polar
// bear". Asking both ways costs nothing in a batch.
const sentenceCase = (s) => s.charAt(0) + s.slice(1).toLowerCase();

// Wikidata descriptions are formulaic for animals — "species of bird", "genus
// of beetles" — so an article not describing itself that way is usually about
// something else. Loose on purpose: this only flags entries for a human to
// check, never rejects one. The trap is the article that resolves cleanly,
// carries a handsome photo, and is about a cricket match. Left open at the end,
// since these read as "superfamily of crustaceans" more often than not.
const ZOOLOGICAL = /\b(speci(es|men)|genus|genera|subspecies|famil(y|ies)|subfamily|superfamily|order|suborder|infraorder|class|tribe|breed|taxon|clade|population|group of|index of animal|animal|bird|fish|mammal|reptile|amphibian|insect|dinosaur|theropod|pterosaur|arachnid|crustacean|mollus[ck]|cephalopod|invertebrate|primate|rodent|marsupial|ruminant|carnivore|omnivore|herbivore|felid|canid|bovid|seabird|whale|dolphin|shark|frog|toad|snake|lizard|urchin|krill|monkey|ape|cat|dog|bear|owl|penguin|antelope|sheep|goat|pinniped|arthropod|beetle|spider|crab|eel|hawk|eagle|falcon|wolf|fox|deer|squirrel|rabbit|hare|rat|mouse|bat)/i;

// The thumbnail URL arrives with campaign tracking on the end — harmless, but
// untrue, and it would be baked into a committed file forever.
const cleanUrl = (u) => (u || '').split('?')[0];

// -------------------------------------------------------------------- credits

// Most of these photos are licensed on terms requiring a credit by name, so the
// credit is written into the generated file as data and read by the Credits
// screen. A run that can't find a name for a photo that needs one refuses to
// finish.

// MediaWiki treats underscore and space alike and answers in spaces, while
// pageimages reports the file in underscores. Key both sides the same way or
// every lookup quietly misses.
const fileKey = (name) => (name || '').replace(/^File:/, '').replace(/_/g, ' ');

// A wiki username signs itself with a link to its own talk page, worded in
// whatever language the uploader writes in. That's a signature, not a name.
const TALK_LINK = /\(\s*(?:talk|thảo luận|diskussion|discussion|discussione|discusión|discussão|обсуждение|討論|토론|会話)\s*(?:[·|]\s*contribs\s*)?\)/gi;

// Commons' author field is free text, so a name arrives wearing whatever its
// uploader wrapped it in: a sentence announcing it, contact details, the licence
// restated. Every rule below removes only words certainly not part of a name.
// Nothing trims by length and nothing stops at the first name found, since a
// photo can have two authors and both have to survive. Where no rule can tell,
// CREDIT_OVERRIDES says the answer outright.
const TIDY = [
  // Two answers that name nobody. Emptying them beats printing them: an empty
  // name is what the missing-name check looks for, so the run stops and asks.
  [/^own(?:\s+work)?$/i, ''],
  [/^pd-\S*\b.*$/i, ''],
  // "This illustration was made by Citron" -> "Citron"
  [/^this\s+(?:illustration|image|file|photo(?:graph)?|picture)\s+(?:was\s+)?(?:made|taken|created|produced|drawn)\s+by\s+/i, ''],
  // "Photography captured by Giles Laurent" -> "Giles Laurent"
  [/^(?:photo(?:graph)?y?\s+)?(?:captured|photographed|shot|taken)\s+by\s+/i, ''],
  // Hand-typed field labels, and user-page prefixes — which can arrive as an
  // interwiki link, "w:en:User:Kguirnela".
  [/^(?:source|photo|photograph|photographer|image|author|credit|copyright)\s*:\s*/i, ''],
  [/^(?:w|c|wikipedia|commons)\s*:\s*(?:[a-z]{2,3}\s*:\s*)?/i, ''],
  [/\bUser\s*:\s*/g, ''],
  [/^User\s+(?=\S)/, ''],
  [/^(?:\(c\)|©)\s*/i, ''],
  // "…, some rights reserved (CC BY-SA)" — the licence is its own column here.
  [/,?\s*(?:all|some)\s+rights\s+reserved\s*(?:\([^)]*\))?\s*$/i, ''],
  // "You must credit this : Citron / CC-BY-SA-3.0" — an instruction about the
  // credit, not the credit.
  [/\s*you\s+must\s+credit\s+this\s*:.*$/i, ''],
  // Requests the photographer added — an email first, a link back. Worth
  // honouring, but the credits screen has room for the name.
  [/[.,]?\s*\bif\s+you\s+(?:plan|intend|wish|want|would)\b.*$/i, ''],
  // Contact details: a bracket holding an email is never a name.
  [/\s*\((?:to\s+contact|contact|for\s+permission)[^)]*\)\s*$/i, ''],
  [/\s*\([^()]*@[^()]*\)/g, ' '],
  // "Renee Comet (photographer)" — a disambiguator this list doesn't need.
  [/\s*\((?:photographer|photograph|photo)\)\s*$/i, ''],
  // A footnote marker left standing where a link used to be.
  [/\s*\[\d+\]/g, ''],
  // Where the picture was posted is not who took it.
  [/\s+on\s+(?:flickr|instagram|500px|deviantart)\b\s*$/i, ''],
  // "Camazine at English Wikipedia" -> "Camazine", by either spelling.
  [/\s+at\s+(?:the\s+)?(?:english(?:-language)?\s+)?wikipedia\b/gi, ''],
  [/\s+at\s+[a-z]{2,3}\.wikipedia\b/gi, ''],
  // A wiki username spells a space as an underscore.
  [/_/g, ' '],
  // Tidying leaves gaps and orphaned punctuation. Brackets aren't swept up with
  // it: a credit can legitimately end in one, "Becker1999 (Paul and Cathy)".
  [/\s+([.,;:])/g, '$1'],
  [/\(\s+/g, '('],
  [/\s+\)/g, ')'],
  [/\s*\(\s*\)\s*/g, ' '],
  [/\s+/g, ' '],
  [/^[\s,;:·-]+|[\s,;:·-]+$/g, ''],
];

// "X from Y" is either a name then a place ("Steve Sayles from Rankin Inlet") or
// a place then a name ("Obtained from Molly Ebersold of the St. Augustine
// Alligator Farm"). So the clause only goes when what precedes it already reads
// as a name — two words at least, which "Obtained" is not — and what follows
// neither belongs to somebody nor introduces a second author.
function dropTrailingOrigin(s) {
  const m = /^(.+?)\s+from\s+([^()]*)$/i.exec(s);
  if (!m) return s;
  const [, before, after] = m;
  if (/\bderivative\b|\bof the\b/i.test(after)) return s;
  if (before.trim().split(/\s+/).length < 2) return s;
  return before.trim();
}

const tidyCredit = (s) => dropTrailingOrigin(TIDY.reduce((out, [re, to]) => out.replace(re, to), s || ''));

// Thumbnails for files named outright, which don't come from any article and so
// never pass through pageimages.
async function fetchFiles(fileNames) {
  const thumbs = new Map();
  for (const group of chunk([...new Set(fileNames)], BATCH)) {
    const { query } = await api(COMMONS, {
      action: 'query',
      prop: 'imageinfo',
      iiprop: 'url',
      iiurlwidth: String(THUMB_PX),
      titles: group.map(f => 'File:' + f).join('|'),
    });
    for (const p of query.pages || []) {
      const url = p.imageinfo && p.imageinfo[0] && p.imageinfo[0].thumburl;
      if (url) thumbs.set(fileKey(p.title), cleanUrl(url));
    }
  }
  return thumbs;
}

async function fetchCredits(fileNames) {
  const credits = new Map();
  for (const group of chunk([...new Set(fileNames)], BATCH)) {
    const { query } = await api(COMMONS, {
      action: 'query',
      prop: 'imageinfo',
      iiprop: 'extmetadata',
      iiextmetadatafilter: 'LicenseShortName|Artist|Attribution|Credit|AttributionRequired',
      titles: group.map(f => 'File:' + f).join('|'),
    });
    for (const p of query.pages || []) {
      const meta = (p.imageinfo && p.imageinfo[0] && p.imageinfo[0].extmetadata) || {};
      // These arrive as scraps of HTML — a link, sometimes a whole vcard — and
      // a cropped photo's credit arrives as a chain: "original.jpg : first
      // author, derivative work: second". Strip the plumbing, keep the people.
      const text = (k) => (meta[k]
        ? String(meta[k].value)
          .replace(/<[^>]*>/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/https?:\/\/\S+/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/\S+\.(jpe?g|png|gif|svg|tiff?)\s*:\s*/gi, '')
          .replace(TALK_LINK, '')
          .replace(/\s+/g, ' ')
          .replace(/^[\s,;:·-]+|[\s,;:·-]+$/g, '')
        : '');
      const file = fileKey(p.title);
      // Three fields can hold the name and any may be the only one filled in.
      // A hand-written answer wins outright — it exists precisely because the
      // fields below it are unusable.
      const artist = CREDIT_OVERRIDES[file]
        || tidyCredit(text('Artist') || text('Attribution') || text('Credit'));
      credits.set(file, {
        artist,
        license: text('LicenseShortName') || 'unknown',
        // Commons states this outright, which beats inferring it from the
        // licence — and is what lets the missing-name check be strict.
        required: text('AttributionRequired') !== 'false',
      });
    }
  }
  return credits;
}

// Free licences all name themselves; anything else is worth a human deciding
// about before it ships. (Locally hosted files aren't on Commons, so their
// lookup comes back empty rather than wrong.)
const FREE = /^(cc0|cc by|cc by-sa|public domain|pd|no restrictions)/i;

// ---------------------------------------------------------------------- main

function write(rows) {
  const urls = rows.map(({ entry, url, page }) => (
    `    ${JSON.stringify(entry)}: ${JSON.stringify(url)},  // ${page}`
  ));
  // [animal, photographer, licence] — a triple rather than an object, since the
  // Credits screen prints all three and wants nothing else.
  const credits = rows.map(({ entry, credit }) => (
    `    [${JSON.stringify(entry)}, ${JSON.stringify(credit.artist)}, ${JSON.stringify(credit.license)}],`
  ));
  fs.writeFileSync(OUT, [
    '// GENERATED by tools/fetch-animals.js — do not edit by hand.',
    '// Maps a Biomes-catalog animal to its Wikipedia lead photo, as a finished',
    '// URL — unlike the album art, there is no size to append. Each trailing',
    '// comment is the article the photo came from.',
    '(function () {',
    '  window.MASQ_ANIMALS = {',
    ...urls,
    '  };',
    '',
    '  // Photographer and licence for each photo above — what most of those',
    '  // licences ask in return. Read by the Credits screen. An empty name is a',
    '  // public-domain photo with no author on record, so there is nobody owed.',
    '  window.MASQ_ANIMAL_CREDITS = [',
    ...credits,
    '  ];',
    '})();',
    '',
  ].join('\n'), 'utf8');
}

(async () => {
  const entries = loadEntries();
  console.log(`Resolving photos for ${entries.length} biome animals…`);

  // Every title this run might want, in as few round trips as possible: the pin
  // if there is one, otherwise the entry both ways up.
  const wanted = [];
  const pinnedFiles = [];
  for (const entry of entries) {
    const pin = OVERRIDES[entry];
    if (isFilePin(pin)) pinnedFiles.push(pin.slice(FILE_PIN.length));
    else if (pin) wanted.push(pin);
    else wanted.push(entry, sentenceCase(entry));
  }
  const pages = await fetchPages(wanted);
  const files = await fetchFiles(pinnedFiles);

  const resolved = [];
  const missing = [];
  for (const entry of entries) {
    const pin = OVERRIDES[entry];

    if (isFilePin(pin)) {
      const file = pin.slice(FILE_PIN.length);
      const url = files.get(fileKey(file));
      if (!url) { missing.push(`${entry} (${file}: no such file on Commons)`); continue; }
      // A pinned file has no article behind it: nothing to check, nothing to
      // stray from — it is the answer.
      resolved.push({ entry, page: file, file, url, description: '', pinned: true });
      continue;
    }

    const candidates = pin ? [pin] : [entry, sentenceCase(entry)];
    const title = candidates.find(t => usable(pages.get(t)));
    if (!title) {
      const tried = candidates.map(t => {
        const p = pages.get(t);
        if (!p || p.missing) return `${t}: no article`;
        if (p.pageprops && 'disambiguation' in p.pageprops) return `${t}: disambiguation page`;
        return `${t}: no lead image`;
      });
      missing.push(`${entry} (${tried.join('; ')})`);
      continue;
    }
    const page = pages.get(title);
    resolved.push({
      entry,
      page: page.title,
      file: page.pageimage,
      url: cleanUrl(page.thumbnail.source),
      description: page.description || '',
      pinned: !!pin,
    });
  }

  const credits = await fetchCredits(resolved.map(r => r.file));
  const rows = resolved.map(r => ({
    ...r,
    credit: credits.get(fileKey(r.file)) || { artist: '', license: 'unknown', required: true },
  }));

  // A photo whose licence demands a credit with no name to put in it ships
  // looking finished and isn't — the one failure that can't wait to be noticed.
  // Name it in CREDIT_OVERRIDES and run again.
  const uncredited = rows.filter(r => r.credit.required && !r.credit.artist);
  if (uncredited.length) {
    console.error(`\nAttribution required but no photographer named — add these to CREDIT_OVERRIDES:\n${
      uncredited.map(r => `  ${r.entry}  ->  ${r.file}  [${r.credit.license}]`).join('\n')}`);
    console.error('\nNothing written.');
    process.exitCode = 1;
    return;
  }

  write(rows);
  console.log(`\nWrote ${rows.length}/${entries.length} animals to ${OUT}`);

  // Worth a look, in the order a wrong picture is easiest to miss: an article
  // that doesn't describe an animal is probably the wrong one, and a name we
  // didn't ask for may be the wrong animal.
  const odd = rows.filter(r => !r.pinned && !ZOOLOGICAL.test(r.description));
  const strayed = rows.filter(r => !r.pinned
    && r.page.toLowerCase().replace(/[^a-z]/g, '') !== r.entry.toLowerCase().replace(/[^a-z]/g, ''));
  const unfree = rows.filter(r => !FREE.test(r.credit.license));
  // A picture crediting a crowd is a picture of a crowd: family articles lead
  // with a grid, and every photographer in it has to be named. One animal per
  // card, so these want pinning to a representative species. The cutoff is high
  // because one photographer can run to ~130 characters on their own; a genuine
  // grid of eight ran to several hundred.
  const composite = rows.filter(r => !r.pinned && r.credit.artist.length > 180);

  if (odd.length) {
    console.log(`\nArticle doesn't describe an animal — check these:\n${
      odd.map(r => `  ${r.entry}  ->  ${r.page}  [${r.description || 'no description'}]`).join('\n')}`);
  }
  if (strayed.length) {
    console.log(`\nRedirected to another title — check these:\n${
      strayed.map(r => `  ${r.entry}  ->  ${r.page}`).join('\n')}`);
  }
  if (unfree.length) {
    console.log(`\nNot a recognized free licence — do not ship without checking:\n${
      unfree.map(r => `  ${r.entry}  ->  ${r.file}  [${r.credit.license}]`).join('\n')}`);
  }
  if (composite.length) {
    console.log(`\nCredited to a crowd, so probably a grid of species — check these:\n${
      composite.map(r => `  ${r.entry}  ->  ${r.file}`).join('\n')}`);
  }
  if (missing.length) {
    console.log(`\nNo photo found — pin these in OVERRIDES:\n  ${missing.join('\n  ')}`);
  }
  if (VERBOSE) {
    console.log('\nAll entries:');
    for (const r of rows) {
      console.log(`  ${r.pinned ? 'pin ' : '    '}${r.entry.padEnd(22)} -> ${r.page.padEnd(28)} ${r.credit.license}`);
    }
  }
})();
