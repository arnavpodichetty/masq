// Regenerates src/artwork/animals.js — the animal -> photo map that app.js
// reads for Biomes rounds, where every role is a creature. The generated file is
// committed, so the site ships no API key and makes no calls to Wikipedia while
// people are playing. Re-run it when the biome catalogs in src/data.js change.
//
//   node tools/fetch-animals.js [--verbose]
//
// Wikipedia needs no key. Its Action API also takes fifty titles per request,
// so the whole catalog resolves in a handful of calls rather than a hundred and
// sixty-odd — which is why this one has no pacing delay to speak of and
// finishes in a couple of seconds, unlike fetch-albums.js.
//
// What comes back is the article's lead image: the picture an encyclopedia
// chose to represent the animal, already cropped and captioned by people who
// care about it. That is usually exactly what a card wants.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.join(__dirname, '..');
const DATA = path.join(REPO, 'src', 'data.js');
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
// page — the lead image of the right article keeps improving as editors find
// better photographs, while a pinned file is frozen. Four things go wrong:
//
//   the name means something else   Cricket -> the sport; Gray Owl -> the
//   more famous                     Canadian conservationist who took the name
//
//   the name is ours, not science's Troglodyte Beetle, Volcanic Mouse and Deep
//                                   Sea Jellyfish are descriptions rather than
//                                   species, so nothing is filed under them
//
//   the article is about a group    which usually means it leads with a collage
//                                   of members, or — for River Dolphin — a
//                                   range map. Neither reads as an animal at
//                                   132 pixels, so those point at one
//                                   representative species instead
//
//   the lead photo isn't free       four of the savanna animals lead with
//   enough to use                   GFDL-1.2-only photographs, which can only
//                                   be reused by shipping the whole licence
//                                   text alongside. Pinned past to Creative
//                                   Commons ones, which the credit line can
//                                   actually satisfy
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
  'Poison Dart Frog': 'Dyeing poison dart frog',  // the family's lead photo is twice as tall as it is wide
  'River Dolphin': 'Amazon river dolphin',        // the group article leads with a range map
  'River Otter': 'North American river otter',    // "River otter" alone is a disambiguation page
  'Salmon': 'Sockeye salmon',                     // "Salmon" leads with a 3:1 strip of a fish
  'Seal': 'Harbor seal',                          // "Seal" alone is a disambiguation page
  'Sparrow': 'House sparrow',                     // "Sparrow" alone is a disambiguation page
  'Squirrel': 'Eastern gray squirrel',            // the family's article leads with a montage of eight
  // Spinosaurus leads with a photograph of one fossil bone, three times as wide
  // as it is tall. This is the skeleton, framed like the other dinosaurs'.
  'Spinosaurus': 'file:Spinosaurus Skeleton Cast at the National Geographic Museum.jpg',
  'Starfish': 'Common starfish',                  // the class article leads with a montage
  'Toucan': 'Toco toucan',                        // the family's article leads with a montage of six
  'Troglodyte Beetle': 'Leptodirus',              // the first cave beetle ever described
  'Volcanic Mouse': 'Neotomodon',                 // the Mexican volcano mouse
  // The species article leads with a CDC photograph credited to a laboratory
  // and three named people — accurate, but it fills the credits screen. This
  // one is a closer portrait of the snake and is credited to one person.
  'Water Moccasin': 'file:Florida Water Moccasin 056.jpg',
  // Both "Wildebeest" and "Blue wildebeest" lead with the same GFDL-1.2-only
  // photo, so this is the one entry with no article to fall back on.
  'Wildebeest': 'file:Blue wildebeest (Connochaetes taurinus taurinus), male.jpg',
  'Zebra': 'Plains zebra',                        // "Zebra" leads with a GFDL-1.2-only photo
};

const FILE_PIN = 'file:';
const isFilePin = (pin) => typeof pin === 'string' && pin.startsWith(FILE_PIN);

// Who to credit, where Commons' own answer can't be used as it stands. Keyed by
// file name, and covering two cases:
//
//   nobody is named  The photographer is written into the file's own name or
//                    into prose only a person can read. These photos require
//                    attribution, so without this they would ship crediting
//                    nobody, and the run refuses to finish.
//
//   too much is      The field holds a name wrapped in a sentence, or the same
//   named            name twice. tidyCredit below unpicks the common shapes;
//                    these are the ones where only a reader can tell which
//                    words are the name.
//
// Every one of these must keep every person and institution the original names
// — dropping a request or an address is fine, dropping a name is not.
const CREDIT_OVERRIDES = {
  'Antarctic krill (Euphausia superba).jpg': 'Uwe Kils',            // was: the name, an offer to Wikipedia, then the name again
  'Bombina bombina 1 (Marek Szczepanek).jpg': 'Marek Szczepanek',   // named only in the file name
  'Scarus frenatus by Ewa Barska.jpg': 'Ewa Barska',                // named only in the file name
  'Sockeye salmon swimming right.jpg': 'Milton Love, Marine Science Institute, UCSB',  // was: the same, plus a postal address
  'SpottedSalamander.jpg': 'Scott Camazine',                        // was: the surname, a stray bracket, then the full name
};

// ---------------------------------------------------------------- entry lists

// One category needs animal photos: the creatures used as roles in Biomes
// rounds, the real ones and the jester's fakes alike.
//
// data.js is a browser file that assigns onto window, so give it a window.
function loadEntries() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(DATA, 'utf8'), sandbox, { filename: 'data.js' });
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

// Asks for a batch of titles at once and hands back what each *requested* title
// ended up at. MediaWiki reports capitalization fixes and redirects as separate
// from-to lists rather than on the page, so the hops have to be walked back.
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

// Wikipedia titles are case-sensitive past the first letter, and species
// articles are written in sentence case — so the catalog's "Polar Bear" is a
// different title from the article "Polar bear", and lands on whatever else
// claims the capitalized form. Asking both ways costs nothing in a batch.
const sentenceCase = (s) => s.charAt(0) + s.slice(1).toLowerCase();

// Wikidata's one-line descriptions are formulaic for animals — "species of
// bird", "genus of beetles" — so an article that doesn't describe itself in
// those terms is usually about something other than the creature. Loose on
// purpose: this only picks out entries to look at by hand, it never rejects
// one. The trap it's aimed at is the article that resolves cleanly, carries a
// handsome photo, and is about a cricket match.
//
// Open at the end rather than anchored on both sides, because these read as
// "superfamily of crustaceans" far more often than as one crustacean.
const ZOOLOGICAL = /\b(speci(es|men)|genus|genera|subspecies|famil(y|ies)|subfamily|superfamily|order|suborder|infraorder|class|tribe|breed|taxon|clade|population|group of|index of animal|animal|bird|fish|mammal|reptile|amphibian|insect|dinosaur|theropod|pterosaur|arachnid|crustacean|mollus[ck]|cephalopod|invertebrate|primate|rodent|marsupial|ruminant|carnivore|omnivore|herbivore|felid|canid|bovid|seabird|whale|dolphin|shark|frog|toad|snake|lizard|urchin|krill|monkey|ape|cat|dog|bear|owl|penguin|antelope|sheep|goat|pinniped|arthropod|beetle|spider|crab|eel|hawk|eagle|falcon|wolf|fox|deer|squirrel|rabbit|hare|rat|mouse|bat)/i;

// The thumbnail URL arrives with campaign tracking on the end. It works either
// way, but the parameters say "someone browsed Wikipedia", which isn't what
// happened, and they'd be baked into a committed file forever.
const cleanUrl = (u) => (u || '').split('?')[0];

// -------------------------------------------------------------------- credits

// Every one of these photos is somebody's work, and most are licensed on terms
// that require crediting them by name. So the credit is collected here and
// written into the generated file as data, not just as a comment: the game's
// Credits screen reads it and lists every photographer. A run that can't find a
// name for a photo that needs one says so and refuses to finish.

// MediaWiki treats an underscore and a space as the same character and answers
// in spaces, while pageimages reports the file in underscores. Key both sides
// the same way or every lookup quietly misses.
const fileKey = (name) => (name || '').replace(/^File:/, '').replace(/_/g, ' ');

// Commons' author field is a free-text box, so a name arrives wearing whatever
// its uploader wrapped it in: a sentence announcing it, a note about how to
// reach them, the licence restated, where they live. The credits screen wants
// the name.
//
// Every rule here removes only words that are certainly not part of one — a
// stock phrase, a licence name, an address. Nothing trims by length and nothing
// stops at the first name it finds, because a photo can have two authors (one
// took it, one edited it) and both have to survive. Where that can't be done by
// rule, CREDIT_OVERRIDES says the answer outright rather than guessing.
const TIDY = [
  // "This illustration was made by Citron" -> "Citron"
  [/^this\s+(?:illustration|image|file|photo(?:graph)?|picture)\s+(?:was\s+)?(?:made|taken|created|produced|drawn)\s+by\s+/i, ''],
  // Field labels the uploader typed by hand, and wiki user-page prefixes.
  [/^(?:source|photo|image|author|credit|copyright)\s*:\s*/i, ''],
  [/\bUser:\s*/g, ''],
  [/^\(c\)\s*/i, ''],
  // "…, some rights reserved (CC BY-SA)" — the licence is its own column here.
  [/,?\s*(?:all|some)\s+rights\s+reserved\s*(?:\([^)]*\))?\s*$/i, ''],
  // "You must credit this : Citron / CC-BY-SA-3.0" — an instruction about the
  // credit, not the credit.
  [/\s*you\s+must\s+credit\s+this\s*:.*$/i, ''],
  // A trailing note on how to reach the photographer.
  [/\s*\((?:to\s+contact|contact|for\s+permission)[^)]*\)\s*$/i, ''],
  // "Camazine at English Wikipedia" -> "Camazine"
  [/\s+at\s+(?:the\s+)?(?:english\s+)?wikipedia\b/gi, ''],
  // A wiki username spells a space as an underscore.
  [/_/g, ' '],
  // Tidying leaves gaps and orphaned punctuation behind. Brackets are not swept
  // up with the rest: a credit can legitimately end in one — "Becker1999 (Paul
  // and Cathy)" — and taking that closing bracket away leaves the pair open.
  [/\s+([.,;:])/g, '$1'],
  [/\(\s+/g, '('],
  [/\s+\)/g, ')'],
  [/\s*\(\s*\)\s*/g, ' '],
  [/\s+/g, ' '],
  [/^[\s,;:·-]+|[\s,;:·-]+$/g, ''],
];

// Uploaders sign off with where they were, and the sentence for that looks
// exactly like the sentence for who gave them the picture:
//
//   Steve Sayles from Rankin Inlet, Nunavut, Canada        a name, then a place
//   Obtained from Molly Ebersold of the St. Augustine       a place, then a name
//   Alligator Farm
//
// So the clause only goes when what stands in front of it already reads as a
// name — two words at least, which "Obtained" is not — and when what follows
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
      // the credit for a photo someone has since cropped or retouched arrives
      // as a chain: "original.jpg : first author, derivative work: second".
      // Strip the plumbing and keep the people. What's left goes on screen, so
      // the URL a photographer signed with, the file name at the head of the
      // chain, and the "( talk · contribs )" trailing every wiki username are
      // all noise in a list of names.
      const text = (k) => (meta[k]
        ? String(meta[k].value)
          .replace(/<[^>]*>/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/https?:\/\/\S+/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/\S+\.(jpe?g|png|gif|svg|tiff?)\s*:\s*/gi, '')
          .replace(/\(\s*talk\s*([·|]\s*contribs\s*)?\)/gi, '')
          .replace(/\s+/g, ' ')
          .replace(/^[\s,;:·-]+|[\s,;:·-]+$/g, '')
        : '');
      const file = fileKey(p.title);
      // Three fields can hold the name and any of them may be the only one
      // filled in. Where Commons records it nowhere at all, fall back to what
      // was read off the file page by hand.
      // A hand-written answer wins outright — it exists precisely because the
      // fields below it are unusable.
      const artist = CREDIT_OVERRIDES[file]
        || tidyCredit(text('Artist') || text('Attribution') || text('Credit'));
      credits.set(file, {
        artist,
        license: text('LicenseShortName') || 'unknown',
        // Commons states this outright, which beats inferring it from the
        // licence name — a public-domain photo needs no credit, and saying so
        // is what lets the missing-name check be strict about the rest.
        required: text('AttributionRequired') !== 'false',
      });
    }
  }
  return credits;
}

// Locally hosted files aren't on Commons, so their credit lookup comes back
// empty rather than wrong. Free licences all name themselves; anything else is
// worth a human deciding about before it ships.
const FREE = /^(cc0|cc by|cc by-sa|public domain|pd|no restrictions)/i;

// ---------------------------------------------------------------------- main

function write(rows) {
  const urls = rows.map(({ entry, url, page }) => (
    `    ${JSON.stringify(entry)}: ${JSON.stringify(url)},  // ${page}`
  ));
  // [animal, photographer, licence]. A triple per line rather than an object
  // because the Credits screen prints all three and wants nothing else.
  const credits = rows.map(({ entry, credit }) => (
    `    [${JSON.stringify(entry)}, ${JSON.stringify(credit.artist)}, ${JSON.stringify(credit.license)}],`
  ));
  fs.writeFileSync(OUT, [
    '// GENERATED by tools/fetch-animals.js — do not edit by hand.',
    '// Maps an animal from the Biomes catalogs to its lead photo on Wikipedia,',
    '// as a ready-to-use URL — unlike the album art, there is no size to append.',
    '// The comment on each line is the article the photo was taken from.',
    '(function () {',
    '  window.MASQ_ANIMALS = {',
    ...urls,
    '  };',
    '',
    '  // Who took each of the photos above and under what licence, which is what',
    '  // most of those licences ask for in return. Read by the Credits screen.',
    '  // An empty name is a picture in the public domain with no author on',
    '  // record — there is nobody to credit, and its licence asks for nobody.',
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

  // Every title this run might want, asked for in as few round trips as
  // possible: the pin if there is one, otherwise the entry both ways up.
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
      // A pinned file has no article behind it, so there's no description to
      // check and nothing it could have strayed from — it is the answer.
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

  // A photo whose licence demands a credit, with no name to put in it, is the
  // one failure here that can't be left for someone to notice later — it ships
  // looking finished and isn't. Name it in CREDIT_OVERRIDES and run again.
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

  // Worth a look, in the order that a wrong picture is easiest to miss: an
  // article that doesn't describe an animal is probably the wrong article, and
  // one reached under a name we didn't ask for may be the wrong animal.
  const odd = rows.filter(r => !r.pinned && !ZOOLOGICAL.test(r.description));
  const strayed = rows.filter(r => !r.pinned
    && r.page.toLowerCase().replace(/[^a-z]/g, '') !== r.entry.toLowerCase().replace(/[^a-z]/g, ''));
  const unfree = rows.filter(r => !FREE.test(r.credit.license));
  // A picture crediting a crowd is a picture of a crowd: the articles about a
  // whole family tend to lead with a grid of members, and the giveaway is that
  // every photographer in the grid has to be named. One animal per card, so
  // these want pinning to whichever species stands for the group.
  //
  // The cutoff is high because a single photographer can run long all on their
  // own — a chain of derivative-work credits, or a note asking to be emailed
  // before you use it. Those land near 130 characters; a genuine grid of eight
  // ran to several hundred.
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
