# Masq

<img src="masq.png" alt="Masq" width="267" height="500">

Masq is a pass-and-play social deduction party game for one phone and a group of friends. Everyone but the Jester gets the secret word (and a role to match); the Jester has to bluff their way through questioning without getting caught.

**Play it live:**
- [arnavpodichetty.github.io/masq](https://arnavpodichetty.github.io/masq/)
- [masq-self.vercel.app](https://masq-self.vercel.app/)

## Playing

Open `index.html` in a browser (or use the live link above) — no install or build step. Add your players, pick a game mode and categories, then pass the phone around.

**Game modes**

- **Role Mode** — every performer gets a role tied to the secret word; the Jester flies blind.
- **Word Mode** — everyone sees the same secret word except the Jester.

**Categories**

- Either mode: Locations, Biomes, Movie/TV Show Genres, Music Genres
- Word Mode only: Food, Animals, Objects, Movies
- Your own, via Settings → Custom Categories — saved in `localStorage`, so they stay on that device

**A round**

1. Whoever opens asks a question to another player.
2. That player answers, then asks the next — clues that fit your role without giving it away.
3. Once everyone's had a turn (or the timer runs out), the group votes.
4. The Jester is unmasked. Guess right and the Cast wins; guess wrong and the Jester escapes.

**Options**

- Number of Jesters, fixed or randomized
- Truly Random or Progressive selection (nudges the role away from whoever just had it)
- Show/hide the category and word
- Jesters know each other
- A fake role/word for the Jester
- A round timer with an audio cue

Options that conflict with each other are dimmed rather than hidden.

## Tech

Plain React 18 + ReactDOM, loaded via CDN `<script>` tags — no bundler, package manager, or build step required.

```
src/
├── artwork/           the three generated artwork maps
│   ├── albums.js      album art map, exposed on window.MASQ_ALBUMS
│   ├── animals.js     animal photo map and photo credits, on
│   │                  window.MASQ_ANIMALS and window.MASQ_ANIMAL_CREDITS
│   └── posters.js     poster map, exposed on window.MASQ_POSTERS
├── app.js             all game state, logic, and rendering
└── data.js            word/role catalogs, on window.MASQ_LOCATIONS_DATA
tools/
├── fetch-albums.js    Node script, regenerates src/artwork/albums.js from Deezer
├── fetch-animals.js   Node script, regenerates src/artwork/animals.js from Wikipedia
└── fetch-posters.js   Node script, regenerates src/artwork/posters.js from TMDB
CHANGELOG.md           what changed in each version
favicon.svg            tab icon (the comedy mask)
index.html             page shell, fonts, meta, and the CSS for Jester Mode
LICENSE
masq.png               screenshot, used by this README and as the link-preview image
README.md
```

`index.html` stays at the repo root because both hosts serve the repository root as a static site — moving it would take the live links down. It loads `src/data.js`, then `src/artwork/posters.js`, `src/artwork/albums.js` and `src/artwork/animals.js`, then `src/app.js`.

The three artwork maps are generated and committed, so a round never waits on someone else's API. Re-run the matching script after changing a catalog in `src/data.js`; each prints the entries it wasn't sure about, and each keeps a table of hand-pinned answers for the ones a plain search gets wrong. `fetch-animals.js` also collects the photo credits shown in-game, and refuses to write anything if it finds a photo that needs crediting and no name to credit.

## Credits

Created by Arnav Podichetty and Richard Chen, with contributions by Esha Bansiya. Inspired by Spyfall and Imposter.

Movie and TV posters come from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB. Album art comes from [Deezer](https://www.deezer.com/), which likewise does not endorse or certify it.

Animal photographs are the lead images of [Wikipedia](https://en.wikipedia.org/) articles, hosted by [Wikimedia Commons](https://commons.wikimedia.org/). Each is under its own free licence — mostly Creative Commons, the rest public domain — and most of those licences ask that the photographer be credited by name. So every one of them is named in the game itself, under **Settings → Credits**, and in `src/artwork/animals.js` next to the photo they took.

## License

All Rights Reserved — see [LICENSE](LICENSE). Feel free to play the game via the live link above; the source code is not licensed for reuse or redistribution.

That covers this repository's own code and word lists. It doesn't cover the artwork, which belongs to the people credited above and stays under the licences they chose. Those licences don't reach back the other way either: the photographs are shown unaltered and merely sit alongside the game rather than being built into it, so the ShareAlike terms on many of them place no condition on the code here.
