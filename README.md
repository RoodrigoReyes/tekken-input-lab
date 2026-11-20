<h1 align="center">Tekken Input Lab</h1>
<p align="center">Turn Tekken combo notation into arcade command graphics, and keep your own combo library.</p>
<p align="center">
  <img src="docs/assets/ewgf.svg" alt="EWGF inputs: forward, neutral, down, down-forward plus 2" width="320">
</p>
<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license">
  <img src="https://img.shields.io/badge/React-19-149eca" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6" alt="TypeScript strict">
  <img src="https://img.shields.io/badge/Tekken-6%20·%20TTT2%20·%207%20·%208-e0262b" alt="Tekken 6, TTT2, 7 and 8">
</p>

Tekken Input Lab reads combo notation and draws every direction, button press, transition and combo event the way an arcade stick shows it: white arrows, and a 2×2 button cluster with each pressed button in its in-game color. It supports **Tekken 6**, **Tekken Tag Tournament 2**, **Tekken 7** and **Tekken 8**.

It runs entirely in the browser. Combos are stored locally in IndexedDB, with no account and no server.

**[Open Tekken Input Lab →](https://roodrigoreyes.github.io/tekken-input-lab/)**

## From notation to commands

Type this:

```text
df+2 > 1,2 > T! > dash > f+2,1 > df+1,2 > b+1+2
```

And get this, live as you type, and exportable as SVG or PNG:

<img src="docs/assets/example-t8.svg" alt="The Tekken 8 combo drawn as arcade commands: arrows, button clusters, a Tornado badge and a dash label">

Tag Tournament 2 team combos get one row per character, with `B!` and the Tag Assault marked:

```text
Kazuya:
EWGF > b+2,4 > db+2 B! TA!
Nina:
ss+1~f~2
Kazuya:
cd+4,1
```

<img src="docs/assets/example-ttt2.svg" alt="A Kazuya and Nina team combo drawn in three rows: Kazuya, Nina, Kazuya">

## Screenshots

<img src="docs/screenshots/editor.png" alt="Combo editor: Tekken 8 notation on the left, live arcade display on the right">

<details>
<summary><strong>TTT2 combo generator</strong></summary>
<br>
<img src="docs/screenshots/generator.png" alt="TTT2 combo generator building a Kazuya and Nina team combo">
</details>

## Features

- **Live visualizer:** simultaneous inputs (`1+2`) share one cluster, and sequential inputs (`df+1,2`) get one each. The drawing wraps to the screen width, has an adjustable size, and can mirror the arrows for the 2P side.
- **Named moves:** `EWGF`, `DU`, `HS` and others are drawn as labels. Click one to see its input, or turn on **Expand named moves** to show them all.
- **Game-aware validation:** a mechanic that does not exist in the selected game gets a warning, such as `S!` in Tekken 8 or the TAG button outside TTT2. Notation is never silently reinterpreted.
- **TTT2 combo generator:** builds team combos from the bundled "TTT2 BNB Combos" guide, one phase at a time: a route to `B!`, the Tag Assault filler, then the ender.
- **Explore community combos:** browse thousands of Tekken 8 and Tekken 7 combos from the Kage combo sites, filter by character, launcher, tags and damage, and save any of them to your library. Every combo links back to its source and author. For Tekken 6, build combos from the launchers, routes and enders of Merlin's Tekken 6 Combo Library.
- **Combo library:** create, edit and duplicate combos, then search and filter by game, character, partner, difficulty, launcher, position, tags and favorites. Combos can carry damage, hits, position and a video link.
- **Share links:** every combo has a link that opens it drawn, ready to save. No account and no server: the combo travels inside the URL.
- **Practice mode:** step through a combo one stage at a time with the arrow keys.
- **OBS overlay:** a transparent view of a combo to use as a browser source on stream.
- **Installable and offline:** install it as an app on desktop or mobile, and it keeps working without a connection.
- **Export, backup and packs:** save any combo as SVG or PNG, back up or restore the whole library as versioned JSON, or import a combo pack from a URL with `#/import?url=https://…`.

## Getting started

You need Node.js 22 or later.

```sh
npm install
npm start
```

Then open `http://localhost:5173`.

> [!NOTE]
> The library lives in your browser's IndexedDB. Clearing site data deletes it, so use **Export JSON** in the library first.

<details>
<summary><strong>Tests and build</strong></summary>

```sh
npm test            # unit tests (Vitest)
npm run typecheck
npm run coverage    # coverage report, 80% line minimum on the engine and storage
npm run e2e         # Playwright browser tests, desktop and mobile
npm run build       # type check and production build to dist/
```

</details>

## Notation

The basics:

| Symbol | Meaning | Example |
|---|---|---|
| `+` | pressed together | `df+1`, `1+2` |
| `,` | next input | `df+1,2` |
| `~` | immediately | `1~b~uf+4` |
| `:` | just frame | `f,n,d,df:2` |
| `>` | next combo stage | `df+2 > 1,2 > T!` |
| `B!` `T!` `W!` … | combo events | `db+2 B!` |

The full reference covers motions, prefixes, events by game, mechanics and dialects: [`docs/NOTATION.md`](docs/NOTATION.md).

## TTT2 combo generator

The generator joins three pieces at the Tag Assault: the point character's route up to `B!`, a filler from the partner's TA! list, and an ender. You pick the team, open ground or the wall, and who performs each part. Pieces that break the guide's rules are left out, and conditions such as hit counts or opponent size are flagged so you know what to check.

Its sources ship as plain text in `src/data/ttt2/`: the guide, and the TTT2 move lists as wikitext. To rebuild `movelists.json` from the wikitext, run:

```sh
node scripts/ttt2/parseMovelists.mjs
```

How it works: [`docs/TTT2_TEAM_COMBOS.md`](docs/TTT2_TEAM_COMBOS.md). Abbreviations used by the guide: [`docs/TTT2_ABBREVIATIONS.md`](docs/TTT2_ABBREVIATIONS.md).

> [!IMPORTANT]
> The guide states that its routes were not independently tested. Treat every generated combo as a suggestion until you try it in practice mode.

## Community combos

The Explore page bundles combos from [tekken8combo.kagewebsite.com](https://tekken8combo.kagewebsite.com/) and [tekken7combo.kagewebsite.com](https://tekken7combo.kagewebsite.com/). The original text of each combo is kept and converted to this app's notation in the browser; anything the converter does not recognize, such as some stance names, is shown as a note instead of being guessed.

To refresh the data (it downloads politely, one page at a time):

```sh
node scripts/kage/scrapeCombos.mjs t8 t7
```

Tekken 6 routes come from Merlin's [Tekken 6 Combo Library](https://docs.google.com/spreadsheets/d/e/2PACX-1vSrQDVLlXLCnW7Bo1LnF2yBjObEBWady8sfX4Fz8j2lUIpAINFQWa0f5-qBLUR8QMcjEX5NtCx1pgUU/pubhtml). The sheet lists combo pieces, not full combos, so the app lets you assemble a combo from the author's own launchers, routes and enders. To refresh it:

```sh
scripts/merlin/fetchSheet.sh
node scripts/merlin/parseSheet.mjs
```

## Project layout

```text
src/notation/    Lexicon, mechanics, dialects, games and character dictionaries
src/parser/      Tokenizer, recursive-descent parser and semantic validation
src/render/      Pure layout engine (AST to positioned boxes) and theme
src/components/  Arcade SVG components and shared UI
src/features/    Library, editor, details, explore, share, import, generator and export screens
src/storage/     Dexie database, ComboRepository, zod schemas, JSON backup
src/ttt2/        Guide importer, move lists and combo generator
src/data/ttt2/   Bundled guide and move list sources
src/data/community/  Community combos from the Kage sites
src/data/t6-merlin/  Merlin's Tekken 6 Combo Library (CSV) and its parsed JSON
scripts/ttt2/    Move list parser
scripts/kage/    Community combo downloader
scripts/merlin/  Tekken 6 sheet downloader and parser
tests/, e2e/     Vitest unit tests and Playwright browser tests
```

The parser and the renderer are independent:

- **Parser:** `parseNotation(text, { game, dialect, characters })` returns tokens with spans into the original text, the AST, normalized text and diagnostics. It never throws.
- **Renderer:** `layoutCombo()` is a pure function. The same SVG is drawn on screen and in exports, so exported images match the screen exactly.

## Stack

| Area | Tools |
|---|---|
| App | React 19, TypeScript and Vite |
| Styling | Tailwind CSS 4, with Chakra Petch and Rajdhani from Fontsource |
| Storage and validation | Dexie for IndexedDB, zod for validation |
| Tests | Vitest and Testing Library for unit tests, Playwright for browser tests |

## Credits

- The visual approach was inspired by [T8 Notation Maker](https://github.com/LinSDK/t8-notation-maker). That repository has no license, so no code or assets were reused. All icons here are original SVG components.
- The "TTT2 BNB Combos" guide was compiled from Tekken Zaibatsu, YouTube and community contributors.
- TTT2 move lists come from [Tekken Wiki](https://tekken.fandom.com/) on Fandom, licensed under CC BY-SA.
- Community combos in `src/data/community/` come from the Kage combo sites and belong to their authors, credited on each combo with a link to its source page.
- Tekken 6 routes in `src/data/t6-merlin/` come from the Tekken 6 Combo Library by Merlin ([@Merlin_FGC](https://twitter.com/Merlin_FGC)).
- The code is released under the [MIT License](LICENSE). The bundled guide, move lists, community combos and Tekken 6 routes keep their original authors and terms and are not covered by the MIT License.
