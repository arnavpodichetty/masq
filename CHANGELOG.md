# Changelog

Masq was never tagged — the in-app version string read `1.0` from the first
commit onward, through every feature below. These releases are reconstructed
from git history, grouped by what a player would have noticed changing. Dates
are the commit dates the work actually landed on.

The 1.0 line is drawn where the game stopped being a work in progress: the
accessibility pass and the jester reveal screen. Everything before it was 0.x,
whatever the label said at the time.

## 1.3.0 — 2026-08-07

A new category, the table stays set between sessions, the screen catalogs got a
pass, and the results screen finally shows what everyone was holding.

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
- **The player list is saved** to `localStorage` under `masq.players`, so the
  same group is waiting when you reopen the game instead of `Player 1` through
  `Player 4`. Names and their ids are stored together as one list — round state
  keys off the id, so a name coming back attached to the wrong one would hand a
  player someone else's card. A corrupt or hand-edited entry falls back to the
  four defaults rather than starting with an empty table; entries with a usable
  name but a missing or duplicate id keep the name and get a fresh id.
- **The results screen lists the rest of the company** — every non-jester and
  the role they held, under the jester reveal. It reads off the same map the
  reveal cards did, so it can only show what was actually dealt, and it scrolls
  inside its own box rather than pushing a full table off the top of the screen.
  Word Mode is excluded: a role category picked there still fills the role map,
  but the cards never print those roles, so they were dealt to nobody.

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
- Custom categories are no longer the only thing that outlives a reload. The
  jester's progressive weights still are in-memory by design, and still reset on
  a reload or a roster change.
- The results button reads `PLAY AGAIN` instead of `ENCORE · PLAY AGAIN`.

**Fixed**
- **Card artwork no longer lands late.** Every image a round can show is now
  fetched the moment the round is dealt, instead of when a player opens their
  overlay — one tap before the curtain, which wasn't enough. Worst on Music
  rounds: the cover size isn't one of Deezer's four pre-renders, so their CDN
  generates it on first request, and a cold cover costs ~0.3s against ~0.03s
  warm.

## 1.2.0 — 2026-08-07

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

## 1.1.0 — 2026-08-05 → 2026-08-07

Artwork. Every card that can carry a picture now does.

**Added**
- Movie and TV posters from TMDB on Movies and Movie/TV Show Genres cards.
- Album art from Deezer on Music Genres cards.
- Animal photographs from Wikipedia lead images on Biomes cards, with
  photographer credits in Settings → Credits, as their licences require.
- `tools/fetch-posters.js`, `tools/fetch-albums.js`, `tools/fetch-animals.js` —
  the generators behind those three maps. Output is committed, so a round never
  waits on someone else's API and the site ships no API key. Each keeps a table
  of hand-pinned answers for titles that plain search gets wrong.
- A favicon: the comedy mask, simplified for 16px.

**Changed**
- Source moved into `src/`, splitting the generated maps from hand-written code.
- Background gradient, and top/bottom chrome coloring fixed for Safari.

## 1.0.0 — 2026-08-04 → 2026-08-05

The game stopped being a draft.

**Added**
- **Progressive jester odds** — an option to weight selection toward players who
  haven't been the jester yet, instead of drawing uniformly at random. Weights
  are in-memory; a reload or roster change resets the cycle.
- A dedicated jester reveal screen.

**Changed**
- Accessibility overhaul: controls that are `div`s given proper button and
  switch roles, keyboard focus, and `aria-checked` state throughout.
- Jester-facing wording rewritten.

**Fixed**
- A run of bugs across the reveal and voting flow.

## 0.8.0 — 2026-08-04

**Added**
- **Custom Categories** — build your own word/role lists from Settings, saved to
  `localStorage` so they stay on the device. Word-only customs are hidden in
  Role Mode, matching how the built-ins behave.
- Timer pause and resume.

**Changed**
- The last of the old name scrubbed from the code — CSS class prefixes and
  animation names went from `impfall-*` to `masq-*`.
- Search title, description, and site verification for the public page.

## 0.7.0 — 2026-08-02 → 2026-08-03

Word lists became yours to edit, and two catalogs arrived.

**Added**
- **Music Genres** and **Movie/TV Show Genres** categories.
- Crossing out words in Settings, so anything you'd rather not see never comes
  up. A category always keeps at least one live word, so a pool is never empty.
- Spoiler dropdowns in View All Words, so opening settings mid-game doesn't
  hand the table the answer.
- A reset button.

## 0.6.0 — 2026-07-28 → 2026-07-29

**Added**
- **Jester Mode** — the alternate presentation, revised once, plus an easter egg
  for finding it.

## 0.5.0 — 2026-07-24 → 2026-07-28

The app grew a settings screen and an identity.

**Added**
- Settings screen.
- View All Words, browsable per category.
- How to Play rules cards.
- Credits.

**Changed**
- Roles and words overhauled across the board, and the data file restructured
  around it — roughly half of every catalog rewritten.
- Player list and word list UI reworked.

## 0.4.0 — 2026-07-23

Renamed, and two categories richer.

**Added**
- **Historical Eras** and **Biomes** categories.
- Timer sound effect, as a Settings toggle.

**Changed**
- **impfall → Masq.** Data files renamed to match.
- README, licence, and project naming settled.

**Fixed**
- Categories displaying the wrong list.

## 0.3.0 — 2026-07-09

The rewrite that made the rest possible.

**Changed**
- Dropped the visual-builder scaffolding the project started in: `support.js`
  (1,581 lines) and the `.dc.html` shells deleted, game logic extracted into a
  hand-written `app.js` against plain React. Roughly 2,700 lines removed.
- Minimum jester count can be 0.
- Starting player is chosen and shown.
- Player names sort predictably.

## 0.2.0 — 2026-07-08

**Added**
- Round timer.
- **Word Mode** — everyone gets the same secret word, no roles — with its own
  categories and a fake-word setting.
- A much longer Movies list.
- Published to GitHub Pages.

**Changed**
- Mobile coloring and general styling.

## 0.1.0 — 2026-07-07

**Added**
- First playable build: pass-the-phone social deduction, secret roles tied to a
  location, one player left out. The first extra categories landed the same day.
