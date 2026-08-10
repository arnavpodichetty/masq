// Regenerates src/artwork/dishes.js — the dish -> photo map app.js reads for
// Cuisines rounds and for Word Mode's Food category. The generated file is
// committed, so the site ships no API key and makes no calls to Wikipedia at
// play time. Re-run when the cuisine catalogs in src/data_roles.js or the Food
// word list in src/data_words.js change.
//
//   node tools/fetch-cuisines.js [--verbose]
//
// fetch-animals.js pointed at food: same batching, same lead images, same rule
// that a photo needing a credit must have a name. What differs is what goes
// wrong — a dish has several names spelled several ways, and its article is as
// often about the technique or the whole cuisine as about the plate.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.join(__dirname, '..');
const DATA = path.join(REPO, 'src', 'data_roles.js');
const WORDS = path.join(REPO, 'src', 'data_words.js');
const OUT = path.join(REPO, 'src', 'artwork', 'dishes.js');
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
// page, for the same reason the animal fetcher does — a pinned file is frozen.
//
// The catalog spells dishes without accents, matching musicGenreCatalog, which
// costs nothing: Wikipedia redirects Spatzle to Spätzle on its own. Only the
// cases below need saying out loud. Five things go wrong:
//
//   the name means something else     Gyro -> the gyroscope
//   filed under another spelling      Fir Fir is written Fit-fit
//   the article is about the method   Rouladen -> Roulade, sweet ones included
//   the lead photo isn't free enough  GFDL-1.2-only, so pinned to a CC0 one
//   the name is the animal, not the   Chicken, Duck, Turkey, Crab, Lobster and
//   meat, or the plant, not the food  Shrimp are all filed as the creature
//
// That last one is the Food word list's doing, and it is most of what follows:
// a cuisine role is a dish by name (Bibimbap, Tlayuda), while a Food word is
// whatever people call it at the table, and the everyday word is usually taken
// — by a bird, a country, a comic strip, a dance, or a rib cage.
//
// The trailing comment says why each is pinned. Sorted by entry.
const OVERRIDES = {
  'Apple': 'Honeycrisp',             // "Apple" leads with a GFDL-1.2-only photo
  // "Avocado" leads with the tree; this is the fruit, whole and halved
  'Avocado': 'file:Avocado Hass - single and halved.jpg',
  'Beef': 'Steak',                   // "Beef" leads with a raw joint of it
  'Biscuit': 'Biscuit (bread)',      // the American one, per the hints beside it
  'Blueberries': 'file:Blueberries-In-Pack.jpg',  // "Blueberry" is the bush
  // "Broccoli" leads with a GFDL-1.2-only photo; this one is public domain
  'Broccoli': 'file:Basket of broccoli in Singapore market.jpg',
  'Brownie': 'Chocolate brownie',    // "Brownie" alone is a disambiguation page
  'Burger': 'Hamburger',             // filed under the older name
  // "Cantaloupe" leads with one still on the vine
  'Cantaloupe': 'file:Cucumis melo var. reticulatus (photo by Scott Bauer).jpg',
  'Causa': 'Causa limeña',           // "Causa" alone is a genus of sea snails
  'Cereal': 'Breakfast cereal',      // "Cereal" is the grass it's milled from
  'Cha Ca': 'Chả cá Lã Vọng',        // filed under the full Hanoi restaurant name
  'Chai': 'Masala chai',             // "Chai" alone is a disambiguation page
  'Chicken': 'Roast chicken',        // "Chicken" is the bird, alive
  'Chicken Wings': 'Buffalo wing',   // "Chicken wings" alone is a disambiguation page
  'Chili': 'Chili con carne',        // "Chili" alone is a disambiguation page
  'Coconut': 'Coconut water',        // "Coconut" leads with a botanical plate of the palm
  // the article's own lead photo is GFDL-1.2-only; this one is CC0
  'Corn Dog': 'file:Corn dog 001.jpg',
  'Crab': 'Crab meat',               // "Crab" is the crustacean
  'Crackers': 'Cracker (food)',      // "Crackers" alone is a disambiguation page
  'Cucumber': 'file:Board, knife and cucumbers.JPG',  // "Cucumber" is the vine
  'Dosa': 'Dosa (food)',             // "Dosa" alone is a disambiguation page
  'Duck': 'Duck as food',            // "Duck" is the bird
  'Fir Fir': 'Fit-fit',              // the spelling the article uses
  'Flan': 'Crème caramel',           // "Flan" alone is a disambiguation page
  // the article's own lead photo is GFDL-1.2-only; this one is CC BY
  'Green Beans': 'file:Green beans 169clue.jpg',
  'Gyro': 'Gyro (food)',             // not the gyroscope
  'Horiatiki Salad': 'Greek salad',  // the English title for the same salad
  'Hot Chocolate': 'Hot chocolate',  // capitalised, it's the British soul band
  'Kimchi': 'Baechu-kimchi',         // "Kimchi" leads with a six-panel collage
  // "Kiwi" is the bird; "Kiwifruit" leads with a botanical plate of cultivars
  'Kiwi': 'file:Kiwi (Actinidia chinensis) 1 Luc Viatour.jpg',
  'Kocho': 'Kocho (food)',           // "Kocho" alone is a Japanese given name
  // "Lamb" is the animal, and "Lamb and mutton" leads with raw meat credited
  // to a paragraph of licence terms with no name in it
  'Lamb': 'file:Kleftiko - Brunswick Centre - London 2026-06-04.jpg',
  'Lemon': 'file:Lemon-Whole-Split.jpg',  // "Lemon" leads with one on the tree
  // "Lime" alone is a disambiguation page and the fruit article is one on the
  // tree; this is the same shot as the lemon above, by the same photographer
  'Lime': 'file:Lime-Whole-Split.jpg',
  'Lobster': 'Lobster thermidor',    // "Lobster" is the crustacean
  'Mandu': 'Mandu (food)',           // "Mandu" alone is a disambiguation page
  'Mochi': 'Daifuku',                // "Mochi" leads with two unfilled white blocks
  // "Muffin" leads with a supermarket tray of them, shot through the plastic
  'Muffin': 'file:(301-365) Muffin (6100678703).jpg',
  'Mushrooms': 'Edible mushroom',    // "Mushroom" leads with a stump of wild ones
  'Oatmeal': 'Porridge',             // "Oatmeal" leads with a Copyrighted-free-use photo
  'Olives': 'file:Grüne Oliven.jpg',  // "Olive" leads with an olive tree
  'Orange': 'Orange (fruit)',        // "Orange" alone is a disambiguation page
  // "Panini" alone is the sticker company; the sandwich's photo names no author
  'Panini': 'file:Panini (Mozzarella, Pesto & Tomato) - Dyke Road Park Cafe.jpg',
  'Pastel': 'Pastel (Brazilian food)',  // "Pastel" alone is the art medium
  'Peach': 'file:White-Peaches-Bunch.jpg',  // "Peach" leads with a botanical plate
  // "Peanuts" is the comic strip; "Peanut" leads with a botanical illustration
  'Peanuts': 'file:Roasted Peanuts with shell.jpg',
  'Pear': 'file:Assortment of pears.jpg',  // "Pear" leads with pears on the tree
  // nothing is filed under Pesto Pasta, and "Pesto" is a bowl of the sauce
  'Pesto Pasta': 'file:Pasta with pesto.jpg',
  // the article's photo names no author at all, so there is nobody to credit
  'Philly Cheesesteak': 'file:Cheesesteak (19386149993).jpg',
  // "Pickles" alone is a disambiguation page, and "Pickled cucumber" leads with
  // a close-up too tight to read as anything
  'Pickles': 'file:Glasses of pickled cucumbers.jpg',
  // "Pineapple" leads with the plant it grows out of
  'Pineapple': 'file:Ananas comosus Victoria P1190459.jpg',
  'Poke': 'Poke (dish)',             // "Poke" alone is a disambiguation page
  // "Popcorn" leads with a field of unpopped kernels
  'Popcorn': 'file:Bowl of Popcorn (Unsplash).jpg',
  'Popsicle': 'Ice pop',             // Popsicle is a trademark; the article is generic
  'Pork': 'Roast pork',              // "Pork" leads with a raw slab of belly
  'Pudding': 'Chocolate pudding',    // "Pudding" leads with an unturned blancmange mould
  // "Raspberry" is the cane the fruit grows on
  'Raspberries': 'file:Raspberries-1426859 960 720.jpg',
  'Ribs': 'Pork ribs',               // "Ribs" is the rib cage
  'Rice': 'Cooked rice',             // "Rice" is the crop, still in the paddy
  'Rouladen': 'Rinderroulade',       // "Roulade" is any rolled dish, sweet included
  // "Salad" leads with a GFDL-1.2-only photo; this one is CC BY
  'Salad': 'file:Mixed Green Salad (15977106804).jpg',
  'Salmon': 'Salmon as food',        // "Salmon" is the fish, in a river
  'Salsa': 'Salsa (sauce)',          // "Salsa" alone is the dance
  'Sausage': 'Bratwurst',            // "Sausage" leads with a whole charcuterie board
  'Shiro': 'Shiro (food)',           // "Shiro" alone is a disambiguation page
  'Shrimp': 'Shrimp and prawn as food',  // "Shrimp" is the crustacean
  // "Spaghetti" leads with a bundle of it dry, which is not what anyone eats
  'Spaghetti': 'file:Espaguetis carbonara.jpg',
  'Tea': 'Black tea',                // "Tea" leads with the dry leaf, not a cup
  'Toast': 'Toast (food)',           // "Toast" alone is a disambiguation page
  // both "Tuna" and "Tuna as food" lead with the same NOAA drawing of the fish
  'Tuna': 'file:Seared Ahi Tuna Steak.jpg',
  'Turkey': 'Turkey as food',        // "Turkey" is the country
  // "Watermelon" leads with an unripe one lying in the leaf litter
  'Watermelon': 'file:Divided Water Melon.jpg',
};

const FILE_PIN = 'file:';
const isFilePin = (pin) => typeof pin === 'string' && pin.startsWith(FILE_PIN);

// Who to credit, where Commons' own answer can't be used as it stands. Keyed by
// file name. Same two cases as the animal fetcher: nobody is named, so the run
// refuses to ship a photo crediting no one; or too much is named, and only a
// reader can tell which words are the name.
//
// Every one of these must keep every person and institution the original names
// — dropping a request or an address is fine, dropping a name is not.
const CREDIT_OVERRIDES = {
  // a 2004 upload predating {{Information}}, so the author is in hand-written
  // prose ("Fotograf: User:FloSch") that extmetadata can't read
  'Maultaschensuppe.jpg': 'FloSch',
  // a signature, not a name: the account plus a talk-page link in Hebrew. The
  // attribution line beside it is the name his other photos here carry.
  'Bánh mì thịt nướng.png': 'Nsaum75',
  'Empanada flor de Calabaza.jpg': 'Nsaum75',
  // two people, one field; the second only moved it to Commons
  'Quail 07 bg 041506.jpg': 'Jon Sullivan',
  // by account in the author field, in full in the attribution line
  'Tlayuda12-05oaxaca013x.jpg': "Bobak Ha'Eri",
  // the Fir Fir / Himbasha pair, punctuated differently by the same uploader —
  // one dish should not read as a different photographer
  'Taita and shiro.jpg': 'Temesgen Woldezion (edited by Merhawie Woldezion)',
  // a 2005 upload predating {{Information}}: both names are in the caption
  // prose, in the same photographer-then-editor relationship as the line above
  'Cheese platter.jpg': 'Dorina Andress (edited by Neutrality)',
  // the name with the thank-you note that follows it on Flickr stripped off
  'Mixed Green Salad (15977106804).jpg': 'Prayitno',
  // 2005 uploads whose author is in the caption prose, not a readable field
  'Korean Gimchi01.jpg': 'Johannes Barre',
  // a Flickr display name wrapped in its own decoration — "|| UggBoy♥UggGirl ||
  // PHOTO || WORLD || TRAVEL ||". The handle is the only name there is
  "After The St. Patrick's Parade Late Lunch @ Lemon, Dawson Street, Dublin, Rep. Of Ireland A Fine Tradition! (6992614913).jpg": 'UggBoy♥UggGirl',
};

// ---------------------------------------------------------------- entry lists

// Everything edible the game can put on a card: the dishes used as roles in
// Cuisines rounds, real and fake alike, plus the Food word list — where the dish
// is the secret word rather than a role, and wants the same photograph. Every
// fake is a real dish from another cuisine, so the fake list adds no titles;
// it's unioned in anyway, so a fake that stops matching can't slip through
// picture-less. Both files assign onto window, so give them a window.
//
// The Food list is a plainer vocabulary than the cuisine catalogs — Pizza and
// Toast rather than Pastel and Fir Fir — which is why so many of the OVERRIDES
// above disambiguate an everyday English word from what Wikipedia files it as.
function loadEntries() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(DATA, 'utf8'), sandbox, { filename: 'data_roles.js' });
  vm.runInContext(fs.readFileSync(WORDS, 'utf8'), sandbox, { filename: 'data_words.js' });
  const d = sandbox.window.MASQ_LOCATIONS_DATA;
  const w = sandbox.window.MASQ_WORDS;

  const roles = new Set();
  for (const list of Object.values(d.cuisineCatalog)) list.forEach(e => roles.add(e));
  for (const list of Object.values(d.fakeCuisineRoleCatalog)) list.forEach(e => roles.add(e));
  if (!roles.size) throw new Error(`Cuisine catalogs not found in ${DATA}`);
  const words = (w.wordOnlyCatalog || {})['Food'] || [];
  if (!words.length) throw new Error(`Food word list not found in ${WORDS}`);
  return { entries: [...new Set([...roles, ...words])].sort(), roles };
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
// Disambiguation pages are the trap worth naming: "Gyro" and "Shiro" are
// perfectly real pages that resolve, and picture nothing edible.
const usable = (p) => !!(p && !p.missing && p.thumbnail
  && !(p.pageprops && 'disambiguation' in p.pageprops));

// Wikipedia titles are case-sensitive past the first letter and food articles
// use sentence case, so "Pad Thai" is a different title from "Pad thai".
// Asking both ways costs nothing in a batch.
const sentenceCase = (s) => s.charAt(0) + s.slice(1).toLowerCase();

// Wikidata descriptions are reliably food-shaped for a dish — "Brazilian
// snack", "Vietnamese noodle dish" — so an article not describing itself that
// way is usually about something else. Loose on purpose: this only flags
// entries for a human to check, never rejects one. The trap is the article that
// resolves cleanly, carries a handsome photo, and is a Japanese given name.
const CULINARY = /\b(dish|food|cuisine|meal|soup|stew|broth|salad|bread|flatbread|cake|gateau|pastry|pie|tart|dessert|sweet|confection|snack|noodle|pasta|dumpling|rice|porridge|sandwich|wrap|roll|sauce|relish|condiment|spread|paste|spice|seasoning|marinade|curry|cheese|yogurt|egg|omelette|seafood|fish|shellfish|meat|chicken|pork|beef|lamb|sausage|vegetable|bean|lentil|legume|fruit|breakfast|appetizer|starter|side|drink|beverage|beer|wine|liquor|cooking|culinary|fried|grilled|baked|roast|steamed|pickled|fermented|street)/i;

// The thumbnail URL arrives with campaign tracking on the end. It works either
// way, but the parameters say "someone browsed Wikipedia", which isn't what
// happened, and they'd be baked into a committed file forever.
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
// uploader writes in. As in the animal fetcher: signature goes, name stays.
const TALK_LINK = /\(\s*(?:talk|thảo luận|diskussion|discussion|discussione|discusión|discussão|обсуждение|討論|토론|会話)\s*(?:[·|]\s*contribs\s*)?\)/gi;

// Commons' author field is free text, so a name arrives wearing whatever its
// uploader wrapped it in. Same rules and principle as the animal fetcher:
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
        // licence name — a public-domain photo needs no credit, and saying so
        // is what lets the missing-name check be strict about the rest.
        required: text('AttributionRequired') !== 'false',
      });
    }
  }
  return credits;
}

// Free licences all name themselves; anything else is worth a human deciding
// about before it ships. (Locally hosted files aren't on Commons, so their
// lookup comes back empty rather than wrong.)
//
// KOGL Type 1 appears here and not in the animal fetcher: it's the Korean
// government's open licence, and Type 1 alone — the only type Commons accepts —
// permits commercial use and derivatives given a credit, which is what the
// Credits screen does. The other three types forbid one or the other.
const FREE = /^(cc0|cc by|cc by-sa|public domain|pd|no restrictions|kogl type 1)/i;

// ---------------------------------------------------------------------- main

function write(rows) {
  const urls = rows.map(({ entry, url, page }) => (
    `    ${JSON.stringify(entry)}: ${JSON.stringify(url)},  // ${page}`
  ));
  // [dish, photographer, licence] — a triple rather than an object, since the
  // Credits screen prints all three and wants nothing else.
  const credits = rows.map(({ entry, credit }) => (
    `    [${JSON.stringify(entry)}, ${JSON.stringify(credit.artist)}, ${JSON.stringify(credit.license)}],`
  ));
  fs.writeFileSync(OUT, [
    '// GENERATED by tools/fetch-cuisines.js — do not edit by hand.',
    '// Maps a dish — a Cuisines role, or a word from the Food category — to its',
    '// Wikipedia lead photo, as a finished URL; unlike the album art, there is',
    '// no size to append. Each trailing comment is the article it came from.',
    '(function () {',
    '  window.MASQ_DISHES = {',
    ...urls,
    '  };',
    '',
    '  // Photographer and licence for each photo above — what most of those',
    '  // licences ask in return. Read by the Credits screen. An empty name is a',
    '  // public-domain photo with no author on record, so there is nobody owed.',
    '  window.MASQ_DISH_CREDITS = [',
    ...credits,
    '  ];',
    '})();',
    '',
  ].join('\n'), 'utf8');
}

(async () => {
  const { entries, roles } = loadEntries();
  console.log(`Resolving photos for ${entries.length} dishes…`);

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

  // Two roles sharing one photo is the failure this catalog invites and the
  // animal one didn't: a Cuisines round deals several dishes at once, and two
  // cards carrying the same picture spoils it for whoever holds either. Pin one
  // somewhere more specific, or replace it.
  //
  // Roles only. A Food word is the whole round on its own, so it can share a
  // photo with a role harmlessly — which is just as well, since the two lists
  // sometimes name one dish twice (Creme Brulee and Crème Brûlée, Mac and
  // Cheese and Macaroni and Cheese) and there is only one photograph of it.
  const byUrl = new Map();
  rows.filter(r => roles.has(r.entry)).forEach(r => byUrl.set(r.url, [...(byUrl.get(r.url) || []), r.entry]));
  const shared = [...byUrl.entries()].filter(([, list]) => list.length > 1);

  if (shared.length) {
    console.error(`\nTwo roles resolved to the same photo — pin or replace one of each pair:\n${
      shared.map(([url, list]) => `  ${list.join(' + ')}  ->  ${url}`).join('\n')}`);
    console.error('\nNothing written.');
    process.exitCode = 1;
    return;
  }

  write(rows);
  console.log(`\nWrote ${rows.length}/${entries.length} dishes to ${OUT}`);

  // Worth a look, in the order a wrong picture is easiest to miss: an article
  // that doesn't describe food is probably the wrong one, and a name we didn't
  // ask for may be the wrong dish.
  const odd = rows.filter(r => !r.pinned && !CULINARY.test(r.description));
  const strayed = rows.filter(r => !r.pinned
    && r.page.toLowerCase().replace(/[^a-z]/g, '') !== r.entry.toLowerCase().replace(/[^a-z]/g, ''));
  const unfree = rows.filter(r => !FREE.test(r.credit.license));

  if (odd.length) {
    console.log(`\nArticle doesn't describe food — check these:\n${
      odd.map(r => `  ${r.entry}  ->  ${r.page}  [${r.description || 'no description'}]`).join('\n')}`);
  }
  if (strayed.length) {
    console.log(`\nRedirected to another title — check these:\n${
      strayed.map(r => `  ${r.entry}  ->  ${r.page}  [${r.description || 'no description'}]`).join('\n')}`);
  }
  if (unfree.length) {
    console.log(`\nNot a recognized free licence — do not ship without checking:\n${
      unfree.map(r => `  ${r.entry}  ->  ${r.file}  [${r.credit.license}]`).join('\n')}`);
  }
  if (missing.length) {
    console.log(`\nNo photo found — pin these in OVERRIDES:\n  ${missing.join('\n  ')}`);
  }
  if (VERBOSE) {
    console.log('\nAll entries:');
    for (const r of rows) {
      console.log(`  ${r.pinned ? 'pin ' : '    '}${r.entry.padEnd(26)} -> ${r.page.padEnd(30)} ${r.credit.license}`);
    }
  }
})();
