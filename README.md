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

- Either mode: Locations, Biomes, Historical Eras, Movie/TV Show Genres, Music Genres
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
index.html              page shell, fonts, meta, and the CSS for Jester Mode
favicon.svg             tab icon (the comedy mask)
src/app.js              all game state, logic, and rendering
src/data.js             word/role catalogs, exposed on window.MASQ_LOCATIONS_DATA
src/posters.js          generated poster map, exposed on window.MASQ_POSTERS
src/albums.js           generated album art map, exposed on window.MASQ_ALBUMS
tools/fetch-posters.js  Node script that regenerates src/posters.js from TMDB
tools/fetch-albums.js   Node script that regenerates src/albums.js from Deezer
masq.png                screenshot, used by this README and as the link-preview image
```

`index.html` stays at the repo root because both hosts serve the repository root as a static site — moving it would take the live links down. It loads `src/data.js`, then `src/posters.js` and `src/albums.js`, then `src/app.js`.

## Credits

Created by Arnav Podichetty and Richard Chen, with contributions by Esha Bansiya. Inspired by Spyfall and Imposter.

Movie and TV posters come from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB. Album art comes from [Deezer](https://www.deezer.com/), which likewise does not endorse or certify it.

## License

All Rights Reserved — see [LICENSE](LICENSE). Feel free to play the game via the live link above; the source code is not licensed for reuse or redistribution.
