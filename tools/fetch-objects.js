// Regenerates src/artwork/objects.js — the object -> photo map app.js reads for
// Word Mode's Objects category. The generated file is committed, so the site
// ships no API key and makes no calls to Wikipedia at play time. Re-run when the
// Objects word list in src/data_words.js changes.
//
//   node tools/fetch-objects.js [--verbose]
//
// fetch-animals.js pointed at everyday things: same batching, same lead images,
// same rule that a photo needing a credit must have a name. What differs is what
// goes wrong. A species has one article and one name; "Ring", "Bolt", "Tablet"
// and "Monitor" are ordinary English words that Wikipedia files under whichever
// meaning is most encyclopedic, which is almost never the thing on the table.
// So OVERRIDES below is long, and most of it is one word, disambiguated.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.join(__dirname, '..');
const WORDS = path.join(REPO, 'src', 'data_words.js');
const OUT = path.join(REPO, 'src', 'artwork', 'objects.js');
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
// page, for the same reason the other fetchers do — a lead image keeps
// improving as editors find better photographs, while a pinned file is frozen.
//
// Five things go wrong, and the first two are most of this table:
//
//   the word means something else    Bolt -> the fastener, not the sprinter
//   the word is a disambiguation     Ring, Tablet, Monitor, Router, Straw
//   the article is about the concept Shower -> plumbing, not a shower stall
//   the lead is a diagram or a plan  a labelled drawing, not a photograph
//   the lead photo isn't free enough GFDL-1.2-only, so pinned to a CC one
//
// The trailing comment says why each is pinned. Sorted by entry.
const OVERRIDES = {
  // "Apron" leads with a painting of a cook wearing one
  'Apron': 'file:Woodworking apron.webp',
  // "Bandage" leads with a red-figure vase painting of Achilles binding a wound
  'Bandage': 'file:HK Plaster Strips 1.JPG',
  'Baseball': 'file:Baseball.jpg',    // "Baseball" is the sport, shot from the stands
  'Basketball': 'Basketball (ball)',  // "Basketball" is the sport, mid-game
  // "Blanket" leads with a Toulouse-Lautrec painting of two people under one
  'Blanket': 'file:Baby blanket.jpg',
  'Battery': 'Electric battery',      // "Battery" alone is a disambiguation page
  'Bell': 'file:Small Bell.png',      // "Bell" leads with a labelled cutaway diagram
  'Belt': 'Belt (clothing)',          // "Belt" alone is a disambiguation page
  // "Bench" alone is a disambiguation page, and the furniture article's photo
  // names no photographer
  'Bench': 'file:City of London Cemetery Memorial Gardens memorial bench seat 03.jpg',
  'Binder': 'Ring binder',            // "Binder" alone is a disambiguation page
  'Bolt': 'Bolt (fastener)',          // not the sprinter
  'Cabinet': 'Cabinetry',             // "Cabinet" alone is the group of ministers
  'Chalk': 'Sidewalk chalk',          // "Chalk" is the rock, and leads with a cliff
  'Charger': 'Battery charger',       // "Charger" alone is a disambiguation page
  'Coat': 'Overcoat',                 // "Coat" leads with a Cézanne portrait
  'Computer': 'Desktop computer',     // "Computer" leads with a 1950s mainframe room
  // "Door" leads with a labelled engineering drawing from a 1904 dictionary
  'Door': 'file:23 1-2-Fuji Reala pushed 2 stops (5826165749).jpg',
  'Dresser': 'Chest of drawers',      // "Dresser" alone is a disambiguation page
  'Drone': 'Unmanned aerial vehicle',  // "Drone" alone is a disambiguation page
  // "Earbuds" alone is a disambiguation page, and "Headphones" is already the
  // picture for Headphones — two words, two pictures
  'Earbuds': 'file:B&O A8.JPG',
  // "Earring" leads with a numbered diagram of where an ear can be pierced
  'Earrings': 'file:Pair of Earrings, 600s AD, Early Byzantine, gold, pearls, glass, and emeralds - Cleveland Museum of Art - DSC08327.JPG',
  'Fan': 'Fan (machine)',             // not the enthusiast
  // "Feather" leads with a plate of feather types from a 1900s encyclopedia
  'Feather': 'file:GuineaFeather.jpg',
  'Flute': 'Western concert flute',   // "Flute" leads with a collage of a dozen
  'Folder': 'File folder',            // "Folder" alone is a disambiguation page
  // "Highlighter" carries no lead image, and "Marker pen" is already Marker's
  'Highlighter': 'file:Yellow Green Orange fluorescent marker on white background (5417788017).jpg',
  // "Hairbrush" leads with a still from a 1900s silent film
  'Hairbrush': 'file:Conair-brush.jpg',
  'Hat': 'Fedora',                    // "Hat" leads with a Victorian engraving of shapes
  'Key': 'Key (lock)',                // "Key" alone is a disambiguation page
  'Keyboard': 'Computer keyboard',    // "Keyboard" alone is a disambiguation page
  // "Ladle" alone is a disambiguation page, and the spoon article's photo is a
  // corroded Byzantine one from a museum case
  'Ladle': 'file:A copper ladle.JPG',
  'Lamp': 'Lampshade',                // "Lamp" alone is a disambiguation page
  // "Laptop" leads with a four-way montage of four different machines
  'Laptop': 'file:Lenovo G500s laptop-2905.jpg',
  // "Lock" alone is a disambiguation page, and "Lock and key" is already Key's
  'Lock': 'Padlock',
  'Magnet': 'Horseshoe magnet',       // "Magnet" leads with a lump of lodestone
  // "Mailbox" lands on "Letter box", i.e. a slot in a front door
  'Mailbox': 'file:Green letterbox by Martin Vorel.jpeg',
  'Marker': 'Marker pen',             // "Marker" alone is a disambiguation page
  'Microwave': 'Microwave oven',      // "Microwave" is the radiation, pictured as masts
  'Monitor': 'Computer monitor',      // "Monitor" alone is a disambiguation page
  'Nail': 'Nail (fastener)',          // not the fingernail
  'Perfume': 'Eau de toilette',       // "Perfume" carries no lead image
  'Phone': 'Smartphone',              // "Telephone" leads with a 1940s rotary set
  'Plate': 'Plate (dishware)',        // "Plate" alone is a disambiguation page
  'Pliers': 'file:Tool-pliers.jpg',   // "Pliers" leads with a high-contrast art photo
  // "Pot" alone is a disambiguation page, and "Stock pot" names no photographer
  'Pot': 'file:AMC pot.jpg',
  'Printer': 'Printer (computing)',   // not the trade
  // "Purse" alone is a disambiguation page, and "Handbag" leads with a woven
  // ceremonial bag from a museum case
  'Purse': "file:Rachel's New Purse.jpg",
  'Radio': 'Radio receiver',          // "Radio" is the medium, pictured as masts
  // "Rake" alone is the Restoration libertine, and the tool article leads with
  // three rake heads hung on a wall
  'Rake': 'file:Wooden rake.jpg',
  'Ring': 'Ring (jewellery)',         // "Ring" alone is a disambiguation page
  'Router': 'Router (computing)',     // not the woodworking tool
  // "Sandal" leads with a GFDL-1.2-only photo
  'Sandals': "file:Birki's sandals.JPG",
  // "Sewing machine" leads with a labelled parts diagram
  'Sewing Machine': 'file:Singer 29 D 62 nähmaschine.jpg',
  'Shampoo': 'file:Mild shampoo.jpg',  // "Shampoo" leads with a child's foamed-up hair
  'Shelf': 'Shelf (storage)',         // "Shelf" alone is a disambiguation page
  'Shovel': 'file:Grain shovels, Eling Tide Mill.jpg',  // "Shovel" leads with a shovel in use
  'Skis': 'file:Carving-ski 1.jpg',   // "Ski" carries no lead image
  'Spatula': 'file:Fishslice1.jpg',   // "Spatula" carries no lead image
  'Speaker': 'Computer speakers',     // "Speaker" alone is a disambiguation page
  'Sponge': 'Sponge (tool)',          // "Sponge" is the animal, on a reef
  'Stamp': 'Postage stamp',           // "Stamp" alone is a disambiguation page
  // "Post-it note" leads with the brand's own logo
  'Sticky Note': 'file:Drawing of a Post-It Note on Post-It Note.jpg',
  'Stool': 'Stool (seat)',            // the other meaning is not a party game word
  'Stove': 'Kitchen stove',           // "Stove" leads with a mud one in a village kitchen
  'Straw': 'Drinking straw',          // "Straw" is the crop, baled
  'Swing': 'Swing (seat)',            // "Swing" alone is a disambiguation page
  'Table': 'Table (furniture)',       // "Table" alone is a disambiguation page
  'Tablet': 'Tablet computer',        // "Tablet" alone is a disambiguation page
  'Tape': 'Adhesive tape',            // "Tape" alone is a disambiguation page
  // "Ticket" alone is a disambiguation page, and the admission article leads
  // with a 1920s German paper stub
  'Ticket': 'file:Azkals versus Maldives Ticket.jpg',
  // "Trophy" leads with the Ashes urn, which is a trophy only if you know
  'Trophy': 'file:Benin, Championnats nationaux de scrabble 2019, trophées.jpg',
  'Tie': 'Necktie',                   // "Tie" alone is a disambiguation page
  // "Tissue" alone is the biological kind; "Facial tissue" names nobody
  'Tissue': 'file:A tissue box.jpg',
  'Vacuum': 'Vacuum cleaner',         // "Vacuum" is the physics, pictured as a 19th-century pump
  'Vase': 'file:Asian vase.jpg',      // "Vase" leads with a GFDL-only photo
  'Wardrobe': 'Chifforobe',           // "Wardrobe" carries no lead image
};

const FILE_PIN = 'file:';
const isFilePin = (pin) => typeof pin === 'string' && pin.startsWith(FILE_PIN);

// Who to credit, where Commons' own answer can't be used as it stands. Keyed by
// file name. Same two cases as the other fetchers: nobody is named, so the run
// refuses to ship a photo crediting no one; or too much is named, and only a
// reader can tell which words are the name.
//
// Every one of these must keep every person and institution the original names
// — dropping a request or an address is fine, dropping a name is not.
const CREDIT_OVERRIDES = {
  // uploads predating {{Information}}, so the author is in the caption prose
  // ("Photo by Mark A. Taff", "Photo by Sean Lamb") where no field can read it
  'Assorted forks.jpg': 'Mark A. Taff',
  "CNW brakeman's kerosene lantern.JPG": 'Sean Lamb',
  'Israel 2 021 Sleeping Rucksack-Tourist.jpg': 'Daniel Maleck Lewy',
  // the author field is a bare link to the shop that took it, and the account
  // that uploaded it links to the same place. The site is the only name given
  'Słuchawki referencyjne K-701 firmy AKG.jpg': 'muzyczny.pl',
  '100% Kaschmir Wolle vonk kaschmirprodukte.de.jpg': 'Deepakkr18',
  // "own work" by an account, so the author field reads "Own work" and names
  // nobody; the uploader is the photographer, and the licence template says so
  'Clou 127.jpg': 'Christophe.Finot',
  // the uploader cropped it from someone else's; the photographer is credited
  // in the caption prose, which no field can read
  'Lampshades.jpg': 'John Hubbard',
  // a crop of a crop: the file name of the original, then its photographer,
  // then whoever cropped it. Written the way the other fetchers write it
  'Carving-ski 1.jpg': 'Kunstpiste (edited by Bobek)',
  // the same relationship, phrased three different ways by three uploaders:
  // whoever took it, then whoever worked on it afterwards
  'Moka Express sideview.png': 'Hans Chr. R. (edited by Saibo)',
  'MonitorLCDlcd.svg': 'Михајло Анђелковић (edited by Mielon)',
  'Nightstand 2184073576.jpg': 'Allie (edited by Herrick)',
  // a signature: the account, then links to its own talk page and gallery
  '2008-04-12 Freilichtmuseum Detmold (11).jpg': 'R-E-AL',
  // the illustrator, then the account that scanned the plate in
  'Types de plumes. - Larousse pour tous, -1907-1910-.jpg': 'Adolphe Millot (scanned by Gothance)',
};

// ---------------------------------------------------------------- entry lists

// The Objects word list, and nothing else — no role catalog names an everyday
// object, so unlike animals and dishes this map has one source. data_words.js is
// a browser file that assigns onto window, so give it a window.
function loadEntries() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(WORDS, 'utf8'), sandbox, { filename: 'data_words.js' });
  const w = sandbox.window.MASQ_WORDS;
  const words = (w.wordOnlyCatalog || {})['Objects'] || [];
  if (!words.length) throw new Error(`Objects word list not found in ${WORDS}`);
  return [...new Set(words)].sort();
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
// Disambiguation pages are the trap worth naming, and this catalog is full of
// them: "Ring", "Bolt", "Straw" and a dozen more resolve perfectly and picture
// nothing at all.
const usable = (p) => !!(p && !p.missing && p.thumbnail
  && !(p.pageprops && 'disambiguation' in p.pageprops));

// Wikipedia titles are case-sensitive past the first letter, so "Alarm Clock" is
// a different title from "Alarm clock" — and object articles use sentence case
// almost without exception. Asking both ways costs nothing in a batch.
const sentenceCase = (s) => s.charAt(0) + s.slice(1).toLowerCase();

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

// A wiki username signs itself with a talk-page link, in whichever language the
// uploader writes in. As in the other fetchers: signature goes, name stays.
const TALK_LINK = /\(\s*(?:talk|thảo luận|diskussion|discussion|discussione|discusión|discussão|обсуждение|討論|토론|会話)\s*(?:[·|]\s*contribs\s*)?\)/gi;

// Commons' author field is free text, so a name arrives wearing whatever its
// uploader wrapped it in. Same rules and principle as the other two fetchers:
// remove only words certainly not part of a name, never trim by length, never
// stop at the first name found — a photo can have two authors.
const TIDY = [
  [/^own(?:\s+work)?$/i, ''],
  [/^pd-\S*\b.*$/i, ''],
  [/^this\s+(?:illustration|image|file|photo(?:graph)?|picture)\s+(?:was\s+)?(?:made|taken|created|produced|drawn)\s+by\s+/i, ''],
  [/^(?:photo(?:graph)?y?\s+)?(?:captured|photographed|shot|taken)\s+by\s+/i, ''],
  [/^(?:source|photo|photograph|photographer|image|author|credit|copyright)\s*:\s*/i, ''],
  [/^(?:w|c|wikipedia|commons)\s*:\s*(?:[a-z]{2,3}\s*:\s*)?/i, ''],
  [/\bUser\s*:\s*/g, ''],
  [/^User\s+(?=\S)/, ''],
  [/^(?:\(c\)|©)\s*/i, ''],
  [/,?\s*(?:all|some)\s+rights\s+reserved\s*(?:\([^)]*\))?\s*$/i, ''],
  [/\s*you\s+must\s+credit\s+this\s*:.*$/i, ''],
  [/[.,]?\s*\bif\s+you\s+(?:plan|intend|wish|want|would)\b.*$/i, ''],
  [/\s*\((?:to\s+contact|contact|for\s+permission)[^)]*\)\s*$/i, ''],
  [/\s*\([^()]*@[^()]*\)/g, ' '],
  [/\s*\((?:photographer|photograph|photo)\)\s*$/i, ''],
  [/\s*\[\d+\]/g, ''],
  [/\s+on\s+(?:flickr|instagram|500px|deviantart)\b\s*$/i, ''],
  // Commons' own boilerplate for a pre-{{Information}} upload with no author
  // field: it says it doesn't know, then names the account it inferred from the
  // licence tag. That account is the only name there is.
  [/^no machine-readable author provided\.\s*(.+?)\s+assumed\s*\(based on copyright claims\)\.?$/i, '$1'],
  // "The original uploader was X at Y Wikipedia" is provenance, not a name; so
  // is the move to Commons, which names whoever pressed the button
  [/^(?:the\s+)?original\s+uploader\s+was\s+/i, ''],
  [/\.?\s*uploaded\s+to\s+commons\s+by\s+.*$/i, ''],
  // a bracket holding contact details is never a name, in either shape
  [/\s*\[[^\]]*\bmail\s*:[^\]]*\]\s*$/i, ''],
  // "This file was donated to Wikimedia Commons as part of a project by the
  // Metropolitan Museum of Art. See the…" — a sentence about the donation, with
  // the one name in it worth keeping buried in the middle
  [/^this file was donated to wikimedia commons as part of a project by (?:the\s+)?(.+?)\.\s.*$/i, '$1'],
  // an accession or catalogue number is filing, not authorship
  [/[.,]?\s*\b(?:image|photo|accession|catalog(?:ue)?)\s+(?:number|no\.?|id)\s*:?\s*\S+\.?\s*$/i, ''],
  // any language's Wikipedia, not only English
  [/\s+at\s+(?:the\s+)?(?:[A-Za-z]+(?:-language)?\s+)?wikipedia\b/gi, ''],
  [/\s+at\s+[a-z]{2,3}\.wikipedia\b/gi, ''],
  [/_/g, ' '],
  [/\s+([.,;:])/g, '$1'],
  [/\(\s+/g, '('],
  [/\s+\)/g, ')'],
  [/\s*\(\s*\)\s*/g, ' '],
  [/\s+/g, ' '],
  [/^[\s,;:·-]+|[\s,;:·-]+$/g, ''],
  // Commons answers "author unknown" by filling two fields with the same words,
  // and both come through. Said once is an answer; said twice is a stutter.
  [/^(.+?)\s+\1$/i, '$1'],
];

// "X from Y" is either a name then a place, or a place then a name. So the
// clause only goes when what precedes it already reads as a name — two words at
// least — and what follows neither belongs to somebody nor introduces a second
// author.
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
  // [object, photographer, licence] — a triple rather than an object, since the
  // Credits screen prints all three and wants nothing else.
  const credits = rows.map(({ entry, credit }) => (
    `    [${JSON.stringify(entry)}, ${JSON.stringify(credit.artist)}, ${JSON.stringify(credit.license)}],`
  ));
  fs.writeFileSync(OUT, [
    '// GENERATED by tools/fetch-objects.js — do not edit by hand.',
    '// Maps a word from the Objects category to its Wikipedia lead photo, as a',
    '// finished URL; unlike the album art, there is no size to append. Each',
    '// trailing comment is the article it came from.',
    '(function () {',
    '  window.MASQ_OBJECTS = {',
    ...urls,
    '  };',
    '',
    '  // Photographer and licence for each photo above — what most of those',
    '  // licences ask in return. Read by the Credits screen. An empty name is a',
    '  // public-domain photo with no author on record, so there is nobody owed.',
    '  window.MASQ_OBJECT_CREDITS = [',
    ...credits,
    '  ];',
    '})();',
    '',
  ].join('\n'), 'utf8');
}

(async () => {
  const entries = loadEntries();
  console.log(`Resolving photos for ${entries.length} objects…`);

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
  console.log(`\nWrote ${rows.length}/${entries.length} objects to ${OUT}`);

  // Worth a look, in the order a wrong picture is easiest to miss. There is no
  // useful "is this an object" test — Wikidata describes a hammer as a "tool",
  // a hoodie as a "garment" and a drone as an "unmanned aerial vehicle", with
  // nothing in common — so what's reported instead is every entry that didn't
  // land on the article its own name asked for. Those are where the wrong
  // meaning hides, and there is no substitute for looking at the picture.
  const strayed = rows.filter(r => !r.pinned
    && r.page.toLowerCase().replace(/[^a-z]/g, '') !== r.entry.toLowerCase().replace(/[^a-z]/g, ''));
  const unfree = rows.filter(r => !FREE.test(r.credit.license));
  // A picture crediting a crowd is a picture of a crowd: a broad article leads
  // with a montage, and every photographer in it has to be named. One object
  // per card, so these want pinning to a single example.
  const composite = rows.filter(r => !r.pinned && r.credit.artist.length > 180);

  if (strayed.length) {
    console.log(`\nRedirected to another title — check these:\n${
      strayed.map(r => `  ${r.entry}  ->  ${r.page}  [${r.description || 'no description'}]`).join('\n')}`);
  }
  if (unfree.length) {
    console.log(`\nNot a recognized free licence — do not ship without checking:\n${
      unfree.map(r => `  ${r.entry}  ->  ${r.file}  [${r.credit.license}]`).join('\n')}`);
  }
  if (composite.length) {
    console.log(`\nCredited to a crowd, so probably a montage — check these:\n${
      composite.map(r => `  ${r.entry}  ->  ${r.file}`).join('\n')}`);
  }
  if (missing.length) {
    console.log(`\nNo photo found — pin these in OVERRIDES:\n  ${missing.join('\n  ')}`);
  }
  if (VERBOSE) {
    console.log('\nAll entries:');
    for (const r of rows) {
      console.log(`  ${r.pinned ? 'pin ' : '    '}${r.entry.padEnd(20)} -> ${r.page.padEnd(30)} ${r.credit.license}`);
    }
  }
})();
