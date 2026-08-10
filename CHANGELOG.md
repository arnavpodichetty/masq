# Changelog

Masq was never tagged — the in-app version string read `1.0` from the first
commit onward, through every feature below. These releases are reconstructed
from git history, grouped by what a player would have noticed changing. Dates
are the commit dates the work actually landed on.

Numbering follows the shape of the work. A minor bump is kept for the releases
that change what's in the box — a new category, a new mode, a set of artwork, or
a rewrite of something already there. Everything else is a patch, which is where
most of the game was actually built: the fixes, the wording, the settings that
finally stayed put.

The 1.0 line is drawn where the game stopped being a work in progress: the
accessibility pass and the jester reveal screen. Everything before it was 0.x,
whatever the label said at the time.

Where an entry names a count — 39 locations, 471 titles, 140 songs — it's the
count as of that release, read back out of the catalogs at that commit rather
than remembered.

## 1.11.0 — 2026-08-10

Word Mode gets pictures, and the other two word categories get their hints.

**Added**
- **Every Word Mode round now shows a picture of the answer.** Food, Animals and
  Objects put the photo on the card above the word, the way Movies/TV has always
  shown a poster, and the results screen shows it too once the round word is
  uncovered. A disguised jester gets their fake word's picture, never the real
  one — the same rule the poster has always followed.
- **`src/artwork/objects.js`**, 262 object photographs, and
  **`tools/fetch-objects.js`** to regenerate it. Objects needed a bigger table of
  hand-pinned answers than any catalog before it, because everyday words are
  taken: `Ring`, `Bolt`, `Tablet`, `Monitor` and a dozen more are disambiguation
  pages, and `Microwave`, `Radio`, `Sponge`, `Vacuum` and `Chalk` all resolve to
  the idea rather than the thing — radio masts, a sea sponge, a 19th-century
  vacuum pump, a chalk cliff.
- **786 hints across the Objects catalog** and **444 across Animals**, three for
  each word. Objects draws on a vocabulary of 103 — `Ceramic`, `Bristly`,
  `Squishy`, `Boxy`, `Stargazing`, `Laundry` — and Animals on 191, which is the
  widest of the three: `Tuxedoed`, `Cackling`, `Breaching`, `Wallowing`.
- **Animals grew from 100 words to 148** and **Objects from 100 to 262.** Eight
  animals went (`Alpaca`, `Bison`, `Elk`, `Gazelle`, `Panther`, `Rat`, `Toad`,
  `Tortoise`) and 56 arrived, from `Axolotl` and `Narwhal` to `Cockroach` and
  `Woodpecker`. Objects lost only `Mouse`, to `Computer Mouse`, and gained 163 —
  `Chandelier`, `Sewing Machine`, `Fire Extinguisher`, `Yo-yo`, `Zipper`.

**Changed**
- **The animal and dish photo maps now serve both modes.** An animal is a Biomes
  role and an Animals word; a dish is a Cuisines role and a Food word; the
  photograph is the same either way. So each map is the union of the two lists —
  animals 176 to 260, dishes 240 to 407 — rather than two maps drifting apart.
- **929 photographs are now credited by name** on the Credits screen, in three
  lists rather than two.
- **`fetch-cuisines.js` only refuses on two *roles* sharing a photograph.** That
  check exists because a Cuisines round deals several dishes at once and two
  identical cards spoil it; a Food word is the whole round on its own. Which is
  just as well, since the two lists sometimes name one dish twice — `Creme
  Brulee` and `Crème Brûlée`, `Mac and Cheese` and `Macaroni and Cheese` — and
  there is only one photograph of it.
- All three Wikipedia fetchers learned the same four credit-tidying rules, since
  the same boilerplate turns up in all three catalogs: Commons' "no
  machine-readable author provided, X assumed", "the original uploader was X at
  Y Wikipedia", a bracket holding an email, and the doubled `Unknown author
  Unknown author` that comes of two fields answering the same way.

**Fixed**
- **Crossed-out words are swept against the catalogs on load.** A crossing for a
  word a release has since dropped was inert but permanent, sitting in
  `localStorage` on that device for good — the eight animals and one object this
  release retired would have haunted every table that had crossed them out. Only
  ever a sweep: with no catalogs to check against, nothing is called stray.
- Photographs that pictured the idea rather than the thing: `Popcorn` was
  unpopped kernels, `Rice` a paddy field, `Turkey` the country's flag, `Ribs` a
  rib cage, `Hot Chocolate` the British soul band, and `Chicken`, `Duck`, `Crab`,
  `Lobster`, `Shrimp` and `Salmon` were all the living animal. Fruit that was
  still on the tree — `Avocado`, `Cantaloupe`, `Pear`, `Pineapple`, `Olives`,
  `Lemon`, `Lime` — is now fruit on a plate.
- Photographs that were a collage, a diagram or a painting rather than a
  photograph: `Beetle`, `Hummingbird`, `Ostrich`, `Lemur` and `Kimchi` led with
  montages; `Bell`, `Earrings`, `Sewing Machine` and `Speaker` with labelled
  diagrams; `Blanket`, `Coat` and `Bandage` with paintings, one of them a Greek
  vase. `Rooster` and `Chicken` shared one photograph of both birds together.
- Photographs under licences the game doesn't ship: eight were GFDL-1.2-only —
  the leads for `Apple`, `Broccoli`, `Salad`, `Baboon`, `Mosquito`, `Sandals`,
  `Vase` and `Green Beans` — one was Free Art Licence (`Bear`) and one
  Copyrighted-free-use (`Oatmeal`).

**Removed**
- **The parked Historical Eras catalogs**, and the branches that read them. The
  category has been commented out of `data_roles.js`, the word pool, the picker
  and the round builder for some time, but `isHistoricalRound` was still live and
  still feeding a colour and a card label that no round could reach. Git has the
  drafted catalog if it comes back.

## 1.10.0 — 2026-08-09

The Word Mode jester gets something to work with.

**Added**
- **Jester Hints.** A Word Mode jester was told the category and nothing else,
  which left them guessing at two hundred words — so with this on they're dealt
  one of the round word's three hints. `Pizza` might come up as `Cheesy`, `Baked`
  or `Party`; `Clam Chowder` as `Creamy`, `Warm` or `Comfort`. It
  prints on the jester's card under their role, in gold rather than the crimson the
  fellow-jesters block uses — it's the one thing on that card that helps rather
  than condemns.
- **606 hints across the Food catalog**, three for each of its 202 words, from a
  vocabulary of 76: `Crunchy`, `Saucy`, `Steamed`, `Fudgy`, `Wobbly`, `Sizzling`,
  `Brunch`, `Comfort`, `Party` and the rest. Three per word so the same word
  doesn't play the same way twice, and so a lucky draw and an unlucky one both
  exist.
- **The Food category was rebuilt around them** — 100 words to 202. Twelve went
  (`Bao`, `Barbecue`, `Club Sandwich`, `Deviled Eggs`, `Goulash`, `Jelly`,
  `Maple Syrup`, `Paella`, `Pie`, `Pierogi`, `Risotto`, `Steak`) and 114 arrived,
  from `Banh Mi` and `Xiao Long Bao` to `Cotton Candy` and `Sloppy Joe`. Drinks
  are in it now: `Boba Milk Tea`, `Espresso`, `Matcha`, `Soda`.
- **The hint catalog is keyed by category, then by word.** Six words live in both
  Food and Animals — `Chicken`, `Crab`, `Duck`, `Lobster`, `Shrimp`, `Turkey` —
  and a flat map would hand an Animals round the food's hints, telling the jester
  their chicken was `Roasted` for `Dinner`.
- **`src/data_words.js`**, holding the word-only catalogs and the hints, on
  `window.MASQ_WORDS`. They had outgrown the data file — Food alone is 202 words
  and 606 hints — and they belong to nothing else in it: a word-only category has
  no roles, so none of the fake-role machinery there applies to it, and the hints
  are keyed by the very categories the word lists define.

**Changed**
- **`src/data.js` is now `src/data_roles.js`**, keeping the role catalogs and
  dropping from 730 lines to 413. The pair names itself: roles in one file, words
  in the other. All four fetchers read the renamed file, and `fetch-posters.js`
  now loads both — the genre catalog is in one and the Movies/TV word list that
  shares its posters is in the other.
- The hint is drawn once for the round and shared by every jester in it, not
  dealt one each — two jesters comparing notes would otherwise be holding two
  thirds of the answer between them.

**Changed**
- The option is on by default, since being unable to win as the jester is the
  complaint it exists to answer. It dims in Role Mode, where a role is already a
  clue of its own, and while **Jester Gets Word** is on, because a disguised
  jester believes their fake word — handing them a clue would tell them the one
  thing the disguise exists to hide.
- A word with no hints deals no hint. Animals, Objects, Movies/TV and every
  custom category play exactly as they did until their hints are written.

## 1.9.3 — 2026-08-08

**Changed**
- **No animal appears in two biomes.** Nine of them did — `Rattlesnake` sat in
  Desert, Prairie and Chaparral at once, `Rat` in Cave System, House and the
  City — which is the one thing a Biomes role must not do: naming your animal is
  how you prove you know the biome, and an animal that lives in three of them
  proves nothing. Each kept the biome it reads strongest in and the other slots
  were rewritten: Cave System takes a `Swiftlet`, House loses the vermin and
  becomes eight pets (`Hamster`, `Parakeet`), Chaparral takes `Mule Deer` and
  `Tarantula`, Prairie a `Meadowlark`, Taiga a `Grizzly Bear` where Temperate
  Forest keeps the black one, Temperate Forest a `Porcupine`, and the City a
  `Skunk`. 176 animals, 176 of them distinct.
- **Swamp and Freshwater River stop sharing a cast.** They had `Beaver` and
  `Heron` in common outright, and `Otter` against `River Otter` — different
  strings for what a player would describe the same way. The river keeps all
  three; the swamp takes `Crayfish`, `Egret` and `Muskrat`.
- Twelve new photographs to match, from the same Wikipedia lead images as the
  rest, with their photographers added to Settings → Credits. `Meadowlark` is
  pinned to `Western meadowlark`, the genus article carrying no lead image at
  all, and the striped skunk's photograph turns out to be by Tom Friedel — whose
  author line is a bare link to his own site, the same case as the harpy eagle's.
- The fake roles a disguised jester is handed still draw from other biomes, which
  is the trick and not a repeat.

## 1.9.2 — 2026-08-08

**Changed**
- The Jesters row in the lobby reads as a count again. It had been naming the
  selection mode alongside it — `1 Jester · Progressive` — which spent the row on
  a setting that doesn't change what the row is for. `· Random Count` still
  shows, because that one changes what the number means.

## 1.9.1 — 2026-08-08

**Changed**
- A comment pass over the whole source — `src/app.js`, `src/data.js`,
  `index.html` and all four fetchers. Comments that restated the line below them
  are gone; what's left says why the code is shaped the way it is, which is the
  part that isn't recoverable by reading it. The fetchers lost the most: each one
  now opens with what it writes and what it refuses to write, rather than a
  running commentary on its own control flow.

## 1.9.0 — 2026-08-08

The table you set up is still standing when you come back to it.

**Added**
- **The lobby is saved**, under `masq.settings` — game mode, category picks,
  jester count and how jesters are drawn, the random-count range, the time limit,
  the sound toggle, every round option, and light or dark. A group that plays
  Word Mode on a three-minute clock plays that way again next Friday, and none of
  it was a decision about a single round. Written as one blob rather than a key
  each: the fields are read together at startup and written together on any
  change, and half a restored lobby is worse than a default one. Anything in
  storage that isn't a known field is ignored; anything missing or unusable falls
  back to its opening value.
- **Crossed-out words outlast the tab**, under `masq.disabledWords`. Whoever
  doesn't want to explain that word to their family doesn't want to cross it out
  again tomorrow. Checked for shape only, never against the catalogs — a crossing
  names a word in a category, either of which can be renamed or retired out from
  under it, and one that no longer matches anything is looked up by name and
  quietly never fires.
- **The Muse unlock is remembered**, under `masq.museUnlocked`. Finding a secret
  once should be enough; a refresh shouldn't hide it again. One flag, written the
  moment it's found and never unwritten — it isn't a setting, it's something that
  happened.

**Changed**
- **Progressive is the default jester selection.** Across an evening it passes
  the jester around the table, which is what most groups expect a random draw to
  feel like and what a truly random one keeps failing to do.
- The stage is painted in the saved theme before React mounts, so a light-mode
  table no longer watches the screen go dark and back again on every load.
- Still deliberately per-session: the round itself, and the progressive jester's
  running weights. A cycle in progress is not a setting, and the Jesters screen
  says outright that it starts over.

**Fixed**
- **A custom category can no longer be named after a built-in that isn't on
  screen.** The name check ran against the categories currently listed, and Muse
  isn't listed until it's found — so a custom `Muse` was accepted, then found
  first everywhere a round is dealt, leaving the real category unreachable and
  two identical tiles in the picker with nothing in the app to undo it but
  renaming your own.
- Restored category picks are checked against what exists *now* rather than what
  existed when they were saved. A custom category can be renamed or deleted, and
  Muse can be locked, between one visit and the next; a name that no longer
  stands for anything would still be drawn to deal a round and would quietly deal
  Locations instead. A list that lost everything it named falls back to the
  categories the game opens with, since an empty picker has nothing to deal.

## 1.8.2 — 2026-08-08

**Fixed**
- **The photographer credits read like names again.** Commons' author field is a
  free-text box, and the tidier in `fetch-animals.js` and `fetch-cuisines.js` was
  leaving the box behind with the name still in it. It now strips talk-page
  signatures in any language rather than only English, interwiki `User:`
  prefixes, `(photographer)` disambiguators, footnote markers, email addresses
  and contact notes, requests about how to be credited, and where the picture was
  posted — none of which is who took it.
- `Own work` and bare licence tags are emptied rather than printed. They answer
  where a picture came from, not who made it, and they reach the author line only
  when that line held nothing readable. Emptying them trips the missing-name
  check, so the run stops and asks for a real one instead of shipping a credit
  that names nobody.
- Fourteen credits that no rule could read are named outright in the override
  tables, with the reason beside each: a photograph one person took and another
  cropped (which Commons writes into a single field, in either order), a collage
  crediting "his respective owners", an author line that's a link to the
  photographer's own site, and an account whose signature is in Hebrew while the
  attribution line beside it holds the name he asks for.

## 1.8.1 — 2026-08-08

**Added**
- **B-Sides**, a Muse album that was never an album — 27 tracks that shipped on
  singles, in one bucket. They get sleeves of their own through a new
  `MASQ_MUSE_TRACKS` map, because unlike a record's songs, no two of them came
  off the same release. `resolveMuseTrack` ranks the single first, the
  compilation second, and the studio album last: streaming reissues scatter a
  B-side across bonus editions, and a B-side wearing `Absolution` would read as
  an Absolution round.

**Changed**
- Songs sit in track order rather than alphabetically. Every other catalog is
  sorted because nothing orders it; a record's running order is how people who
  know it know it.
- Album titles resolve on a prefix match rather than an exact one, so a bucket
  key like `B-Sides` can borrow `Hullabaloo Soundtrack`'s sleeve without the
  fetcher calling it a miss.
- 11 keys, 140 songs.

**Removed**
- The unlock note that appeared in Credits, and — for the moment — the saved
  unlock behind it. Both were reworked rather than dropped; 1.9.0 brings the
  saved unlock back without the note.

## 1.8.0 — 2026-08-07

A category that isn't in the picker until someone finds it.

**Added**
- **Muse**, a secret role category. The word is a studio album and your role is a
  song off it — 10 albums at launch, the whole discography, minus the spoken
  interludes: `[Drill Sergeant]`, `[JFK]`, `Intro`, `Interlude` and `Prelude` are
  tracks but not songs, and none of them gives a player anything to describe.
- **It's unlocked by tapping the ampersand** in `Creator & Code`, in the Credits.
  The row has to look exactly like the two below it — no cursor, no colour,
  nothing to say it does anything — so the role line is split around that one
  character and only the character carries the tap, padded to a finger-sized
  target without moving the text. Until it's found, Muse is missing from the
  category picker *and* from Settings → View All Words, where a listed name would
  give the whole thing away.
- **Album sleeves on Muse cards**, keyed by record rather than by song, so
  everyone holding a song off the same album sees the same cover. That gives
  nothing away — the album is the word they were all just told. A disguised
  jester holds a song off a *different* record, so their sleeve is the wrong one,
  which is the entire trick.
- `fetch-albums.js` learned to resolve by album title as well as by song, and to
  distrust the result: a re-release carries its own artwork and often outranks
  the record people picture, so it prefers the exact title and the plainest
  edition of it. Origin of Symmetry's 2021 "XX Anniversary RemiXX" is the case
  that made the rule.

**Changed**
- Muse sorts between Movie/TV Show Genres and Music Genres once it's visible —
  `Mus` beats `Mov`, and `Muse` beats `Music`. It carries its own accent, and its
  cards label the word `Album` rather than `Genre`.

## 1.7.0 — 2026-08-07

**Changed**
- **The lobby icons were redrawn as one set**, on a shared 24×24 grid at a
  single stroke weight. Role Mode is a Venetian domino mask, where it was two
  overlapping ellipses that turned to mush at 20px; Word Mode is an open script,
  where it was a box of text lines nearly identical to Categories. Players is one
  figure forward with the rest of the table behind it, Categories a deck of cards
  marked with a harlequin lozenge, Jesters a cap and bells rather than a third
  mask in a row that already had two, Time Limit an hourglass with the sand
  running, and Options a lighting board's faders — a gear there echoed the ⚙ in
  the header, which opens a different screen.
- The cap and bells is filled where the rest of the set is stroked. Outlining
  each horn put four thin lines through the same few pixels at 20px and the shape
  stopped reading as a hat; filled, the horns can tuck behind the crown's toothed
  rim with no seams to line up.
- The 18px icons are now derived from their 20px twins by a resize helper rather
  than kept as second copies, which had already drifted apart from them.
- **No back arrow on the results screen.** The round is spent by the time it
  shows, and `PLAY AGAIN` is the only door out of it.

**Fixed**
- Alpha values corrected across the icon palette, where a few strokes were
  carrying opacity meant for a different background.

## 1.6.0 — 2026-08-07

The jester gets one last chance to steal the round.

**Added**
- **The jester can still win by naming the word.** The results screen keeps the
  round word covered until someone taps it — `? ? ?` where the word goes, and
  the poster held back with it on Movies/TV rounds — so an unmasked jester can
  take their guess before the answer is on screen. Everyone else's roles are
  covered along with it, showing `??` in the rows they already occupied: those
  are roles from the real word, so reading them out would hand the jester the
  answer. One tap fills in the word, the poster and every role at once, and the
  cover is back the next time the results screen opens.
- **Every word the round could have dealt**, behind a button under the tiles, so
  the jester picks from a list rather than out of the air. It's the same pool the
  deal came from — words crossed out in Settings → View All Words are excluded
  here too, so the list can never hold a word that couldn't have been the answer
  — sorted alphabetically and scrolling in its own sheet, which keeps a long
  category from pushing the reveal off the top of the screen. It shows only while
  the word is still covered, and only when the round had a jester.

## 1.5.1 — 2026-08-07

**Changed**
- The results button reads `PLAY AGAIN` instead of `ENCORE · PLAY AGAIN`.
- `BEGIN THE TRIAL` lost its trailing arrow.

## 1.5.0 — 2026-08-07

A new category, pictured.

**Added**
- **Cuisines**, a new role category for either mode — the secret word is a
  cuisine and your role is a dish from it. 20 cuisines, 12 dishes each. Same
  shape as Biomes: the fake roles handed to a disguised jester are real dishes
  from a *different* cuisine, so an Italian card holding `Pad Thai` gives them
  away the moment they describe it. Dish names are deaccented to match the house
  style in `musicGenreCatalog`; Wikipedia redirects `Spatzle` to `Spätzle` on its
  own, so nothing is lost by it.
- **Dish photographs on Cuisines cards**, from Wikipedia lead images, the same
  source as the Biomes animals. All 240 dishes are pictured. They sit in the
  animals' landscape frame but cropped centrally rather than high — food is
  photographed centred on the plate, where an upright animal keeps its head near
  the top. Their photographers are named in Settings → Credits, in a list of
  their own beneath the animal photographers rather than mixed in with them —
  405 names between the two, and a name is easier to find in the list it
  belongs to.
- `tools/fetch-cuisines.js`, the generator behind `src/artwork/dishes.js`.
  Output is committed, so a round never waits on Wikipedia. Like
  `fetch-animals.js` it collects photographer credits and refuses to write if a
  photo needs one and hasn't got one. It adds a check that fetcher didn't need:
  it refuses when two dishes resolve to the same photograph, which would hand
  two players the same card. That check earned itself immediately — `Niter
  Kibbeh`'s article leads with a kitfo photo, so it and `Kitfo` collided.

## 1.4.2 — 2026-08-07

**Added**
- **The player list is saved** to `localStorage` under `masq.players`, so the
  same group is waiting when you reopen the game instead of `Player 1` through
  `Player 4`. Names and their ids are stored together as one list — round state
  keys off the id, so a name coming back attached to the wrong one would hand a
  player someone else's card. A corrupt or hand-edited entry falls back to the
  four defaults rather than starting with an empty table; entries with a usable
  name but a missing or duplicate id keep the name and get a fresh id.

**Changed**
- Custom categories are no longer the only thing that outlives a reload. The
  jester's progressive weights still are in-memory by design, and still reset on
  a reload or a roster change.

## 1.4.1 — 2026-08-07

**Fixed**
- **Card artwork no longer lands late.** Every image a round can show is now
  fetched the moment the round is dealt, instead of when a player opens their
  overlay — one tap before the curtain, which wasn't enough. Worst on Music
  rounds: the cover size isn't one of Deezer's four pre-renders, so their CDN
  generates it on first request, and a cold cover costs ~0.3s against ~0.03s
  warm.

## 1.4.0 — 2026-08-07

The screen and music catalogs got a pass.

**Changed**
- **Movie/TV Show Genres reworked** — 39 genres, 467 titles. `Alien Invasion`
  became `Aliens` and took in the rest of the first-contact material; `Biopic`
  and `Docudrama` merged into `Biopic / Docudrama`; the coming-of-age titles
  moved out of `Romance` into `Teen Drama` and the rom-coms went the other way;
  `Back to the Future` moved from `Sci-Fi / Space Opera` to `Time Travel`.
  Genres now run 8–15 titles by how much material each really has, instead of
  everything padded to 12.
- **The Movies word category is now Movies/TV**, drawn from the same 467 titles
  as Movie/TV Show Genres rather than its own 204-film list. The two can no
  longer disagree about what counts as a screen title. Cards label it
  `Movie / TV`.
- **Music Genres expanded** from 250 to 338 tracks across the same 25 genres —
  Classical, Country, EDM, Heavy Metal, Hip Hop, Indie, Jazz, K-Pop, Latin, Pop
  and R&B all grew to 15.
- `tools/fetch-posters.js` resolves one merged title list against
  `/search/multi`. It used to split the list and send the films-only category to
  `/search/movie`; with the merge, that endpoint would quietly resolve a series
  to an unrelated film of the same name. New pins for `Austin Powers`, `Borat`,
  `Clueless`, `Harry Potter`, `Mission Impossible`, `Percy Jackson`,
  `Star Trek` and `Willow`, each of which has a remake or series that outranks
  the intended one in search.
- `tools/fetch-albums.js` pins the new Classical additions and `Wallows
  (Are You Bored Yet?)`, which otherwise matches a live EP.

## 1.3.2 — 2026-08-07

**Added**
- **The results screen lists the rest of the company** — every non-jester and
  the role they held, under the jester reveal. It reads off the same map the
  reveal cards did, so it can only show what was actually dealt, and it scrolls
  inside its own box rather than pushing a full table off the top of the screen.
  Word Mode is excluded: a role category picked there still fills the role map,
  but the cards never print those roles, so they were dealt to nobody.

## 1.3.1 — 2026-08-07

Housekeeping and one setting in a better place.

**Changed**
- Category order is alphabetical everywhere it shows: Biomes, Locations,
  Movie/TV Show Genres, Music Genres, then Animals, Food, Movies, Objects in
  Word Mode. Same order in the category picker and in Settings → View All Words.
- **Timer Sound Effect** moved out of Settings and into the Time Limit dial,
  next to the value it depends on. It now carries a one-line explanation and
  dims at "No limit", where nothing can chime.
- The three generated artwork maps moved to `src/artwork/`; `src/data.js` stayed
  where it was. `tools/fetch-*.js` write to the new paths.
- `data.js` reordered: real catalogs first, then the fake-role catalogs that
  shadow them, alphabetical within each group.

**Removed**
- **Historical Eras** is parked. The catalog is drafted but needs substantial
  rework before it's fit to play, so it ships commented out at the bottom of
  `src/data.js` with every use in `app.js` commented out to match. Nothing was
  deleted — restoring is uncommenting both sides.

## 1.3.0 — 2026-08-07

**Added**
- **Animal photographs on Biomes cards**, from Wikipedia lead images — the
  picture an encyclopedia chose to stand for the animal, already cropped and
  captioned by people who care about it, which is usually exactly what a card
  wants. Every role in a Biomes round is a creature, so every card in one is
  now pictured.
- **Photographer credits in Settings → Credits.** Wikimedia's licences require
  the name, so `tools/fetch-animals.js` collects it alongside the photo and
  refuses to write the file at all if a picture needs a credit and hasn't got
  one. A missing name is a licence problem rather than a cosmetic one, so it
  stops the run instead of shipping without it.
- `tools/fetch-animals.js`, the generator behind `src/animals.js`. Wikipedia
  needs no key, and its Action API takes fifty titles per request, so the whole
  catalog resolves in a handful of calls and a couple of seconds — where
  `fetch-albums.js` has to pace itself for a minute.

## 1.2.1 — 2026-08-06

**Fixed**
- The stage renders in Safari again: the background gradient, and the top and
  bottom chrome coloring around it, which had been picking up the browser's own
  colour rather than the page's.

**Changed**
- README rewritten around what the game actually is now, rather than what it was
  when the file was first written.

## 1.2.0 — 2026-08-06

**Added**
- **Album art on Music Genres cards**, from Deezer — the sleeve for the record
  each `Artist (Song)` role came off.
- `tools/fetch-albums.js`, the generator behind `src/albums.js`. Deezer needs no
  key, so unlike `fetch-posters.js` there's nothing to set up first. Apple's
  iTunes Search API answers the same question but throttles at about twenty calls
  a minute — a couple of hundred entries there takes a quarter of an hour and
  comes back mostly 403s, where this run takes about one. It stays well under
  Deezer's fifty-per-five-seconds and keeps a pin table for tracks plain search
  gets wrong.

## 1.1.0 — 2026-08-05

Artwork. The first cards that can carry a picture do.

**Added**
- **Movie and TV posters on Movies and Movie/TV Show Genres cards**, from TMDB.
- `tools/fetch-posters.js`, and the committed `src/posters.js` it writes — so the
  site ships no API key and makes no TMDB calls while people are playing. It
  carries a table of titles pinned to a TMDB id, because search fails in four
  distinct ways and none of them is rare: a series outranks the film of the same
  name (`21 Jump Street` finds the 1987 show), a new release recycles an old
  title (`Anaconda` finds the 2025 comedy), nothing matches at all (`Wild` finds
  `The Wild Robot`), or the right title belongs to the wrong franchise entry.
- A favicon: the comedy mask, simplified for 16px.

**Changed**
- Source moved into `src/`, splitting the generated maps from hand-written code.
- Page title, description and social tags filled in.

## 1.0.2 — 2026-08-05

**Added**
- A dedicated jester reveal screen, and a way back off it. Tapping the wrong
  name is the one mistake the reveal can't undo by itself — without a door out
  you'd have to open a card that isn't yours to be rid of it. Backing out before
  the curtain rises leaves that player unviewed, so they can still take their
  turn. Tapping the dark space around the card does whatever the visible button
  does: back out while the curtain is down, dismiss-as-read once it's up. The
  card swallows its own clicks, so reading your role never closes the screen out
  from under you.

**Changed**
- Jester-facing wording rewritten throughout.
- **Show Word is derived rather than obeyed.** Two modes force its hand: Word
  Mode always shows the word, because that is the mode, and Role Mode with a
  disguised jester always hides it, because the jester's fake role is borrowed
  from some *other* word — there is no word that fits their card, and printing
  one for everyone else would out them at a glance. The stored setting now only
  ever means "what the host picked for an ordinary Role Mode round".

**Fixed**
- An empty cast is no longer possible. The round would deal nothing and the
  trial would open with "undefined asks the first question", so the last
  player's × goes inert rather than disappearing — the row doesn't reflow the
  moment the cast gets short.
- A run of further bugs across the reveal and voting flow.

## 1.0.1 — 2026-08-05

**Added**
- **Progressive jester odds** — an option to weight selection toward players who
  haven't been the jester yet, instead of drawing uniformly at random. Random is
  memoryless, which is why the same player can land it three rounds running;
  progressive nudges the role around the table instead. Weights are shares:
  everyone starts on one, a player's chance is their share of the table's total,
  and taking the role costs five percentage points of the whole table's chance,
  split evenly among everyone who didn't. The total never drifts, so the cost is
  exactly five points every time whatever the player count — at a table of six,
  one share is 16.7%, and a fresh jester drops to 11.7% while the other five
  each gain one. It's a nudge, not a lockout: one turn barely dents your odds,
  and only about four picks in quick succession can bottom anyone out.
- Weights are in-memory, and any change to the roster starts the cycle over —
  stored weights only mean anything for the exact set of players that earned
  them.

## 1.0.0 — 2026-08-04

The game stopped being a draft.

**Changed**
- **Accessibility overhaul.** Every control in the app is a styled `div`; one
  `press()` helper now gives each of them real semantics — reachable by Tab,
  activated with Enter or Space, and announced with a name. A label is only
  supplied where the visible content is a bare glyph like `×`; everywhere else
  the element's own text is the accessible name. Toggles carry `switch` and
  `aria-checked`, category tiles carry `aria-pressed`, and keyboard focus is
  visible on top of the dark stage.
- **Round state is keyed by player id, never by name.** Two players called Alex
  are two players. Allies are excluded by id too, so a jester sharing a name
  with someone else isn't struck from their own ally list.
- Instructions rewritten to match how the game actually plays.

**Fixed**
- The Jesters summary no longer claims what the round won't do — a disguised
  jester doesn't know they're a jester, so there's nobody to introduce them to,
  and the "Jesters Know Each Other" row is dimmed and inert while a disguise is
  in play.

## 0.9.1 — 2026-08-04

**Added**
- Timer pause and resume.

**Fixed**
- **The shuffle wasn't uniform.** `sort(() => Math.random() - .5)` is not a
  shuffle — the comparator is inconsistent, and the result quietly favours
  certain seats. Replaced with Fisher-Yates.
- A randomized jester count no longer overwrites the number the host chose. The
  dealt count lives on the round; writing it back into the setting meant one
  random round silently rewrote the Jesters modal.
- Jester counts are shown clamped to the current cast. Removing players could
  strand a saved count above what the table can seat, leaving the lobby
  promising more jesters than the round would deal.
- Every jester is named at the final curtain with the disguise they actually
  held, gated the same way the reveal card was — results can never print a fake
  role the player was never shown.

## 0.9.0 — 2026-08-04

**Added**
- **Custom Categories** — build your own word/role lists from Settings, saved to
  `localStorage` under `masq.customCategories`, the only thing at this point that
  survives a reload. Two kinds: a role category, where every word carries its own
  role list like Locations, and a word category, which is just a list like Food.
  Word categories are hidden in Role Mode, since there'd be no roles to deal —
  and so is a role category that somehow lost all of its roles, so Role Mode can
  never deal a roleless round. Words for a word category are typed as one blob,
  with commas and newlines both separating, so a pasted list works as-is.
  Categories saved before the `kind` field existed are classified by whether
  anyone ever gave them a role.
- A disguise only holds if the round actually produced one: a category with a
  single word, or a custom one with no spare roles, has nothing to fake with, so
  those jesters are told they're the Jester rather than handed a blank card.
- The custom-category editor is reachable from Settings and from the Categories
  picker, and its close button returns to whichever one you came in through.

## 0.8.2 — 2026-08-04

**Changed**
- The last of the old name scrubbed from the code — CSS class prefixes and
  animation names went from `impfall-*` to `masq-*`.
- Search title and description for the public page, and the game description
  rewritten around the credits section.

## 0.8.1 — 2026-08-03

**Changed**
- Both catalogs revised within a day of landing: Music Genres to 25 genres and
  250 tracks, Movie/TV Show Genres to 475 titles, with genre lists rebalanced and
  titles moved to where they belonged.
- Site verification for the public page.

## 0.8.0 — 2026-08-02 → 2026-08-03

Two catalogs, one of them new.

**Added**
- **Music Genres** — 23 genres, 10 tracks each. The word is the genre and your
  role is a track in it, written `Artist (Song)`.

**Changed**
- **Movie Genres became Movie/TV Show Genres.** The category had shipped with the
  first extras back in July as 12 film genres holding 8 films each; television
  went in beside them and it came out at 40 genres and 471 titles. `Sci-Fi` split,
  the genres that had been padded to eight grew to ten and twelve, and the ones
  that only ever existed to hold four good films went away.

## 0.7.3 — 2026-08-02

**Added**
- **Crossing out words in Settings**, so anything you'd rather not see never
  comes up. A crossed word is dropped from the pool before the round is dealt.
  The last surviving word in a category is locked and drawn with a dashed border
  rather than a solid one — an empty category would leave a round with no word
  to deal.
- **Spoiler dropdowns in View All Words.** Every category is collapsed behind its
  own name and count, so opening Settings mid-game doesn't hand the table the
  answer. A category that's had words crossed out reads `Locations (34/37)`
  rather than `Locations (37)`.
- **A per-category reset**, next to the chevron and only on categories that have
  something crossed out, so undoing a session's crossings doesn't mean tapping
  back through them one at a time.

## 0.7.2 — 2026-07-30

**Added**
- A preview image for the README and the shared link.

## 0.7.1 — 2026-07-29

**Changed**
- **Jester Mode became the easter egg.** Its Settings toggle was removed, and the
  mode is now turned on by tapping the `MASQ` wordmark in the lobby header —
  nothing marks it, and nothing in Settings admits the mode exists.
- The neon palette revised once more against the screens it hadn't been checked
  on.

## 0.7.0 — 2026-07-28

**Added**
- **Jester Mode** — a chaotic neon-carnival take on the whole stage, and the
  first thing to prove the app could be themed at all. Every colour the interface
  uses moved behind CSS custom properties in the same commit, split into a dark
  theme and a jester theme that overrides it — the curtain, the card stock, the
  call-to-action gradient and its glow, the selected-tile treatment, the toggles.

## 0.6.1 — 2026-07-28

**Added**
- **A real Settings screen**, rebuilt around what had accumulated in it: Game
  Options split off from Settings proper, with Show Category, Show Word, Jesters
  Know Each Other and Sound Effects on one side, and All Words, Credits, How to
  Play and Light Mode on the other. Light Mode arrives here — the first time the
  app could be anything but dark.
- **How to Play**, as rules cards rather than a wall of text: The Setup, The
  Round, Role Mode and Word Mode, each with the voting steps under it.
- **Credits**, naming the three people the game came from.

## 0.6.0 — 2026-07-28

**Changed**
- **Roles and words overhauled across the board**, and the data file restructured
  around it — 227 lines rewritten against 247 removed, roughly half of every
  catalog. Locations went from 39 words to 37 and Biomes from 21 to 22, but the
  churn is almost entirely inside them: weak words retired, better ones written
  in their place, and the role lists reworked so that eight roles per word are
  eight things a player can actually describe.

## 0.5.3 — 2026-07-24

**Added**
- **All Words**, reachable from Settings: every category listed with its word
  count, each word a chip, so a table can see what's in the box before they play
  it. Eight groups at this point — Locations, Biomes, Historical Eras and Movie
  Genres on the role side, Food, Animals, Objects and Movies on the word side.

**Changed**
- The player list and the word list reworked together, since they were the two
  screens that had grown by accretion rather than design.

## 0.5.2 — 2026-07-23

**Added**
- Timer sound effect, as a Settings toggle — a chime when the clock runs out, for
  tables that put the phone face down.

**Fixed**
- **Categories displaying the wrong list.** Every category shipped selected —
  all four role categories *and* all four word categories — so a Role Mode round
  could be dealt out of Food or Objects, which have no roles in them. The
  selection now opens on the role categories alone, and the mode decides which
  half is on offer.
- The default roster is `Player 1` through `Player 4` rather than the three names
  of the people who wrote the game.

## 0.5.1 — 2026-07-23

**Changed**
- **impfall → Masq**, and `MASQUERADE` → `MASQ` in the app itself. Data files
  renamed to match.
- README, licence, and project naming settled.

## 0.5.0 — 2026-07-23

Both role catalogs rewritten, not added — Biomes shipped with the first build
and Historical Eras arrived the same evening.

**Changed**
- **Historical Eras rewritten**, from 21 eras to 17, and every role in them made
  specific to its era. `Scribe` became `Hieroglyph Scribe`, `Philosopher` became
  `Athenian Philosopher`, `Emperor` became `Toga-Clad Emperor`, `Ninja` became
  `Ninja Assassin`. The old lists had the same generic role — `Slave`,
  `Blacksmith`, `Farmer`, `Merchant` — sitting in four eras at once, which gave a
  jester a card they could describe without knowing anything, and gave everyone
  else no way to prove they did. The four eras cut were the ones that couldn't be
  saved by rewriting.
- **Biomes rewritten** on the same principle, 20 biomes to 21, all 168 roles
  reworked. Roles that appeared in three biomes at once — `Beaver`, `Rattlesnake`,
  `Owl`, `Black Bear` — were the whole problem, since naming one told the table
  nothing about which biome you were in.
- A spacing pass over the lobby and the modals: headers, padding and the gap
  under each section brought to one measure.

## 0.4.1 — 2026-07-09

**Added**
- **A starting player**, drawn at random each round and named on the way into the
  trial, so nobody has to decide who goes first.

**Changed**
- **The minimum jester count can be 0**, which makes a jesterless round a real
  round rather than a broken one. The final curtain gets its own ending for it —
  an uncracked comedy mask instead of the cracked tragedy one, "Every performer
  was genuine", and no accusation to be right or wrong about, where before the
  results screen would have declared a wrong vote against a jester who didn't
  exist.
- Player names sort predictably.
- Instructions updated.

## 0.4.0 — 2026-07-09

The rewrite that made the rest possible.

**Changed**
- Dropped the visual-builder scaffolding the project started in: `support.js`
  (1,581 lines) and the `.dc.html` shells deleted, game logic extracted into a
  hand-written `app.js` (985 lines) against plain React, and `index.html` cut from
  1,112 lines to a shell that loads three scripts. Roughly 2,700 lines removed
  against 994 added. Nothing about the game changed; everything about working on
  it did.

## 0.3.2 — 2026-07-08

**Added**
- **Movies as a word category** — 204 titles, twice the size of the three word
  lists it joined, bringing Word Mode to four categories and 504 words.

**Changed**
- The catalogs reflowed to a consistent shape in the data file — ten words to a
  line, one category per block.

## 0.3.1 — 2026-07-08

**Added**
- **A round timer**, set from the lobby, counting down through the trial. When it
  runs out the screen says so outright — "Time to Vote!", over a dimmed stage —
  rather than letting a table argue past a clock nobody was watching.

## 0.3.0 — 2026-07-08

**Added**
- **Word Mode** — everyone gets the same secret word, no roles — with three word
  categories of its own: Food, Animals and Objects, 100 words each. A flat pool
  per category, no per-word role lists, since there are no roles to deal.
- **A fake-word setting** for it, the Word Mode counterpart to the disguised
  jester: rather than being told they're the jester, they're handed a word of
  their own and left to work out that nobody else has it.

## 0.2.1 — 2026-07-08

**Added**
- **Published to GitHub Pages**, and given a title to be published under.
- **A phone shell for desktop.** The game is a phone game, so on anything wider
  than 640px it now renders into a fixed 480×900 frame and scales that up to
  1.7× rather than stretching a phone layout across a monitor. Below the
  breakpoint it goes full-bleed as before.

**Changed**
- Mobile coloring: `theme-color` and `color-scheme` meta tags, and a page
  background behind the stage, so the browser's own chrome stops flashing white
  around a dark game.
- A spelling pass over the interface copy.

## 0.2.0 — 2026-07-07

**Added**
- **Historical Eras** — 21 eras, 8 roles each.
- **Movie Genres** — 12 genres, 8 films each. The word is the genre and your role
  is a film in it.
- Both arrive with fake-role lists of their own, so the disguised jester works in
  them the way it already worked in Locations and Biomes.

## 0.1.1 — 2026-07-07

**Fixed**
- The first round of fixes on the first build, hours after it existed.

## 0.1.0 — 2026-07-07

**Added**
- **First playable build**: pass-the-phone social deduction, one phone, a secret
  word and a role apiece, and one player left out of it.
- **Locations** — 39 words, 8 roles each — and **Biomes** — 20 biomes, 8 animals
  each. Both shipped on day one; the changelog above only ever added to them.
- **The disguised jester**, from the very first commit: alongside each catalog is
  a shadow catalog of three fake roles per word, drawn from somewhere else
  entirely, so the jester can be handed a plausible-looking card instead of being
  told what they are.
