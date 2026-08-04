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

### How a Round Plays Out

1. **Opening Statements** — whoever opens the round asks a question to another player.
2. **Drop Clues** — each player asks a question to another player, who answers and then asks the next question, giving clues that fit their role/word without giving it away.
3. **Cast Your Vote** — once everyone's had a turn (or the timer runs out), the group discusses and votes on who they think the Jester is.
4. **Unmask the Jester** — reveal who the Jester really was. If the group votes correctly, the Cast wins; if not, the Jester escapes.

### Options

- Number of Jesters (fixed or randomized within a min/max range)
- Show/hide the category and word
- Jesters know each other
- Jester gets a fake role/word instead of knowing nothing
- Optional round timer with an audio cue when time's up

## Tech

Plain React 18 + ReactDOM, loaded via CDN `<script>` tags — no bundler, package manager, or build step required.

## Credits

Created by Arnav Podichetty and Richard Chen, with contributions by Esha Bansiya. Inspired by Spyfall and Imposter.

## License

All Rights Reserved — see [LICENSE](LICENSE). Feel free to play the game via the live link above; the source code is not licensed for reuse or redistribution.
