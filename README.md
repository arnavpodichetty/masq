# Masq

<img src="masq.png" alt="Masq" width="267" height="500">

Masq is a pass-and-play social deduction party game for one phone and a group of friends. Everyone but the Jester gets the secret word (and a role to match); the Jester has to bluff their way through questioning without getting caught.

**Play it live:**
- [arnavpodichetty.github.io/masq](https://arnavpodichetty.github.io/masq/)
- [masq-self.vercel.app](https://masq-self.vercel.app/)

## Playing

Open `index.html` in a browser (or use the live link above) — no install or build step. Add your players, pick a game mode and categories, then pass the phone around so each player can privately view their card.

### Game Modes

- **Role Mode** — every performer gets a role tied to the secret word/category (e.g. a location and a job at that location), while the Jester gets no word and has to fly blind.
- **Word Mode** — everyone sees the same secret word except the Jester, who sees nothing (or an optional fake word, see below).

### Categories

- Role categories: Locations, Biomes, Historical Eras, Movie/TV Show Genres, Music Genres
- Word categories (Word Mode only): Food, Animals, Objects, Movies
- Custom categories: your own, made in Settings → Custom Categories

### Custom Categories

Settings → Custom Categories. Making one starts by picking its type:

- **Role category** — each word gets its own list of roles, like Locations. Add a word, list its roles separated by commas, repeat. A round deals one of that word's roles to every performer. Plays in both Role Mode and Word Mode.
- **Word category** — just the category name and a list of words separated by commas (newlines work too, so a pasted list is fine), like Food. Plays in Word Mode.

You can switch a category between the two types while editing; the words carry over either way.

When the Jester is set to receive a fake role, role categories borrow one from a different word in the same category. A category with only one word (or with no spare roles to borrow) simply tells the Jester they're the Jester instead.

Custom categories are saved in the browser's `localStorage`, so they persist across reloads on that device but don't travel between devices or browsers.

### How a Round Plays Out

1. **Opening Statements** — whoever opens the round asks a question to another player.
2. **Drop Clues** — each player asks a question to another player, who answers and then asks the next question, giving clues that fit their role/word without giving it away.
3. **Cast Your Vote** — once everyone's had a turn (or the timer runs out), the group discusses and votes on who they think the Jester is.
4. **Unmask the Jester** — reveal who the Jester really was. If the group votes correctly, the Cast wins; if not, the Jester escapes.

### Options

- Number of Jesters (fixed or randomized within a min/max range)
- Who gets picked: **Truly Random** (an even draw every round) or **Progressive**, which nudges the role away from whoever just had it. Progressive weights live in memory only — adding or removing a player, or reloading, starts the cycle over. Settings → Show Progressive Jester Odds puts each player's chance on screen.
- Show/hide the category and word
- Jesters know each other
- Jester gets a fake role/word instead of knowing nothing
- Optional round timer with an audio cue when time's up

Some options rule each other out and are dimmed rather than hidden: *Jesters Know Each Other* is unavailable while the Jester wears a disguise (a disguised jester doesn't know they're one), and *Show Word* is forced on in Word Mode and forced off in Role Mode while the Jester gets a fake role — the disguised jester has no word to display, so showing one to everybody else would give them away.

## Tech

Plain React 18 + ReactDOM, loaded via CDN `<script>` tags — no bundler, package manager, or build step required.

```
index.html              page shell, fonts, meta, and the CSS for Jester Mode
favicon.svg             tab icon (the comedy mask)
src/app.js              all game state, logic, and rendering
src/data.js             word/role catalogs, exposed on window.MASQ_LOCATIONS_DATA
src/posters.js          generated poster map, exposed on window.MASQ_POSTERS
tools/fetch-posters.js  Node script that regenerates src/posters.js from TMDB
masq.png                screenshot, used by this README and as the link-preview image
```

`index.html` stays at the repo root because both hosts serve the repository root as a static site — moving it would take the live links down. It loads `src/data.js`, then `src/posters.js`, then `src/app.js`.

## Credits

Created by Arnav Podichetty and Richard Chen, with contributions by Esha Bansiya. Inspired by Spyfall and Imposter.

Movie and TV posters come from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.

## License

All Rights Reserved — see [LICENSE](LICENSE). Feel free to play the game via the live link above; the source code is not licensed for reuse or redistribution.
