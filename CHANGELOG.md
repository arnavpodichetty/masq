# Changelog

Masq was never tagged — the in-app version string read `1.0` from the first
commit onward, through every feature below. These releases are reconstructed
from git history, grouped by what a player would have noticed changing. Dates
are the commit dates the work actually landed on.

The 1.0 line is drawn where the game stopped being a work in progress: the
accessibility pass and the jester reveal screen. Everything before it was 0.x,
whatever the label said at the time.

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
