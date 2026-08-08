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
- **Animal photographs on Biomes cards**, from Wikipedia lead images, with
  photographer credits in Settings → Credits, as their licences require.
- `tools/fetch-animals.js`, the generator behind them. It collects the credit
  alongside the photo and refuses to write the file at all if a picture needs a
  name and hasn't got one — a missing credit is a licence problem, not a cosmetic
  one, so it stops the run rather than shipping.

## 1.2.1 — 2026-08-06

**Fixed**
- Background gradient, and top/bottom chrome coloring, fixed for Safari.

**Changed**
- README rewritten around what the game actually is now.

## 1.2.0 — 2026-08-06

**Added**
- **Album art on Music Genres cards**, from Deezer.
- `tools/fetch-albums.js`, the generator behind that map, with a table of
  hand-pinned answers for tracks that plain search gets wrong.

## 1.1.0 — 2026-08-05

Artwork. The first cards that can carry a picture do.

**Added**
- **Movie and TV posters on Movies and Movie/TV Show Genres cards**, from TMDB.
- `tools/fetch-posters.js`. Output is committed, so a round never waits on
  someone else's API and the site ships no API key.
- A favicon: the comedy mask, simplified for 16px.

**Changed**
- Source moved into `src/`, splitting the generated maps from hand-written code.
- Page title, description and social tags filled in.

## 1.0.2 — 2026-08-05

**Added**
- A dedicated jester reveal screen.

**Changed**
- Jester-facing wording rewritten.

**Fixed**
- A run of bugs across the reveal and voting flow.

## 1.0.1 — 2026-08-05

**Added**
- **Progressive jester odds** — an option to weight selection toward players who
  haven't been the jester yet, instead of drawing uniformly at random. Weights
  are in-memory; a reload or roster change resets the cycle.

## 1.0.0 — 2026-08-04

The game stopped being a draft.

**Changed**
- Accessibility overhaul: controls that are `div`s given proper button and
  switch roles, keyboard focus, and `aria-checked` state throughout.
- Instructions rewritten to match how the game actually plays.

**Fixed**
- A run of bugs across the lobby and the deal.

## 0.9.1 — 2026-08-04

**Added**
- Timer pause and resume.

**Fixed**
- Assorted bugs found while the custom-category work was going in.

## 0.9.0 — 2026-08-04

**Added**
- **Custom Categories** — build your own word/role lists from Settings, saved to
  `localStorage` so they stay on the device. Word-only customs are hidden in
  Role Mode, matching how the built-ins behave.

## 0.8.2 — 2026-08-04

**Changed**
- The last of the old name scrubbed from the code — CSS class prefixes and
  animation names went from `impfall-*` to `masq-*`.
- Search title and description for the public page, and the game description
  rewritten around the credits section.

## 0.8.1 — 2026-08-03

**Changed**
- Both new catalogs revised the day after they landed — genre lists rebalanced
  and titles moved to where they belonged.
- Site verification for the public page.

## 0.8.0 — 2026-08-02 → 2026-08-03

Two catalogs arrived.

**Added**
- **Music Genres** and **Movie/TV Show Genres** categories.

## 0.7.3 — 2026-08-02

**Added**
- Crossing out words in Settings, so anything you'd rather not see never comes
  up. A category always keeps at least one live word, so a pool is never empty.
- Spoiler dropdowns in View All Words, so opening settings mid-game doesn't
  hand the table the answer.
- A reset button.

## 0.7.2 — 2026-07-30

**Added**
- A preview image for the README and the shared link.

## 0.7.1 — 2026-07-29

**Changed**
- Jester Mode revised, and an easter egg added for finding it.

## 0.7.0 — 2026-07-28

**Added**
- **Jester Mode** — the alternate presentation.

## 0.6.1 — 2026-07-28

**Added**
- Settings screen, rebuilt around what had accumulated in it.
- How to Play rules cards.
- Credits.

## 0.6.0 — 2026-07-28

**Changed**
- Roles and words overhauled across the board, and the data file restructured
  around it — roughly half of every catalog rewritten.

## 0.5.3 — 2026-07-24

**Added**
- View All Words, browsable per category, from Settings.

**Changed**
- Player list and word list UI reworked.

## 0.5.2 — 2026-07-23

**Added**
- Timer sound effect, as a Settings toggle.

**Fixed**
- Categories displaying the wrong list.

## 0.5.1 — 2026-07-23

**Changed**
- **impfall → Masq.** Data files renamed to match.
- README, licence, and project naming settled.

## 0.5.0 — 2026-07-23

**Added**
- **Historical Eras** and **Biomes** categories.

## 0.4.1 — 2026-07-09

**Added**
- Starting player is chosen and shown.

**Changed**
- Minimum jester count can be 0.
- Player names sort predictably.
- Instructions updated.

## 0.4.0 — 2026-07-09

The rewrite that made the rest possible.

**Changed**
- Dropped the visual-builder scaffolding the project started in: `support.js`
  (1,581 lines) and the `.dc.html` shells deleted, game logic extracted into a
  hand-written `app.js` against plain React. Roughly 2,700 lines removed.

## 0.3.2 — 2026-07-08

**Changed**
- A much longer Movies list.
- General styling.

## 0.3.1 — 2026-07-08

**Added**
- Round timer.

## 0.3.0 — 2026-07-08

**Added**
- **Word Mode** — everyone gets the same secret word, no roles — with its own
  categories and a fake-word setting.

## 0.2.1 — 2026-07-08

**Added**
- Published to GitHub Pages.

**Changed**
- Mobile coloring, an upscaled layout, and a spelling pass.

## 0.2.0 — 2026-07-07

**Added**
- The first extra categories, hours after the first build.

## 0.1.1 — 2026-07-07

**Fixed**
- The first round of fixes on the first build.

## 0.1.0 — 2026-07-07

**Added**
- First playable build: pass-the-phone social deduction, secret roles tied to a
  location, one player left out.
