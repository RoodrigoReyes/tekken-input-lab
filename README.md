# Tekken Input Lab

A local-first web app that turns Tekken combo notation into arcade-style command
graphics and keeps a personal combo library. Supports **Tekken 6**, **Tekken 7**,
**Tekken 8** and **Tekken Tag Tournament 2**.

```
qcf+1 > uf+2,1 B! > SSL 1~b~uf+4 > f+1,2,1+2
```

Paste notation like the above and every direction, button press, transition and
combo event is drawn with 2×2 arcade buttons (each pressed button in its in-game color:
1 pink, 2 teal, 3 light blue, 4 coral red), white arrows, and labels.
Combos are saved in your browser (IndexedDB). No account and no server.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (Vitest)
npm run coverage   # coverage report (≥80% enforced on engine + storage)
npm run e2e        # end-to-end tests (Playwright, desktop + mobile)
npm run build      # type-check + production build to dist/
```

## Features

- **Live visualizer.** Simultaneous inputs (`1+2`) share one button cluster.
  Sequential inputs (`df+1,2`) get separate clusters. The visual wraps to the
  screen width and the command size is adjustable.
- **Game-aware validation.** Using a mechanic that does not exist in the
  selected game produces a warning. Examples: `S!` in Tekken 8, `B!` as a juggle
  extender in Tekken 7, `RD` in Tekken 8, and the TAG button outside TTT2.
  Notation is never silently reinterpreted.
- **TTT2 team combos.** Choose a primary character and a partner, and assign a
  character to each section. `Name:` labels inside the notation are recognized.
- **TTT2 combo generator.** It builds team combos from the bundled
  "TTT2 BNB Combos" guide: a route that reaches `B!`, then `TA!`, then a TA
  filler, then an ender. You choose:
  - the team
  - open ground or the wall
  - the starter: normal, Counter Hit or Low Parry
  - the form (Kazuya or Devil Kazuya)
  - who performs the filler and who performs the ender after `TA!`

  Only combinations that follow the guide's rules are listed. Its conditions and
  notes are shown as things to verify, and each result stays a suggestion until
  you test it in practice mode.
- **Combo library.** Create, edit, duplicate and delete combos. Search them, and
  filter by game, character, partner, difficulty, tags and favorites.
- **Export.** Save a combo as SVG or PNG. Back up or restore the whole library
  as versioned JSON.

## Notation

| Symbol | Meaning | Example |
|---|---|---|
| `+` | pressed together | `df+1`, `1+2`, `df+1+2` |
| `,` | next input | `df+1,2` |
| `~` | immediately / rapid transition | `1~b~uf+4` |
| `:` | just frame | `f,n,d,df:2` |
| `<` or `,<` | delayed | `df+3,2,<1` |
| `*` | hold | `df+1*` (uppercase directions are held too: `F+2`) |
| `>` | next combo stage | `df+2 > 1,2 > T!` |
| `;` | section break or Tag Assault (depends on dialect) | `… ; 3+4,2` |
| `[ ]` | optional part | `df+2 [dash] f+2` |
| `( )` | optional input when the content is valid notation, otherwise a note | `(1,2),2`, `uf+4,(3,)4`, `1,2 (wall)` |
| `x3` | repeat | `b+1 x3` |
| `5` | TAG button (TTT2) | `df+1,2~5` |

The parser also accepts these aliases: `d/f`, `u/b`, arrows `→ ← ↑ ↓ ↗ ↖ ↘ ↙`,
and `df1` for `df+1`. Motions are `qcf qcb hcf hcb cd ff bb fff`. State prefixes
are `WS FC BT WR CH iWS` and `H.` (Heat). Movements are `dash SSL SSR SS SW BD
WD CC micro`.

Character notation (Layer 3) covers named moves and stances, such as `EWGF`,
`PEWGF`, `ZEN`, `AOP`, `RDS` and `HMS`. Named moves are always shown as labels.
The "Expand named moves" toggle shows their inputs.

### Combo events by game

| Event | Meaning | T6 | TTT2 | T7 | T8 |
|---|---|---|---|---|---|
| `B!` | Bound | ✓ | ✓ | ⚠ not an extender | ⚠ only after airborne Heat Burst |
| `S!` | Screw / Tailspin | ✗ | ✗ | ✓ | ✗ |
| `T!` | Tornado | ✗ | ✗ | ✗ | ✓ |
| `W!` | Wall Splat (Wavu also uses it for Wall Bounce) | ✓ | ✓ | ✓ | ✓ |
| `WB!` | Wall Break (default dialect) | ✓ | ✓ | ✓ | ✓ |
| `F!` / `FB!` | Floor Break | ✓ | ✓ | ✓ | ✓ |
| `BB!` | Balcony Break | ✗ | ✓ | ✓ | ✓ |
| `WBl!` / `FBl!` | Wall / Floor Blast | ✗ | ✗ | ✗ | ✓ |
| `WBo!` | Wall Bound | character-specific | ✗ | Season 2+ | ✓ (not after a Floor Break) |
| `TA!` | Tag Assault | ✗ | ✓ | ✗ | ✗ |

Mechanic keywords: `RA` (Rage Art: T7, T8), `RD` (Rage Drive: T7 only),
`HB HS HD HE` (Heat Burst, Heat Smash, Heat Dash, Heat Engager: T8 only).
The juggle extender (`B!`, `S!` or `T!`) is allowed once per combo.

### Dialects: where sources disagree

Community notation is not uniform. Ambiguous symbols are resolved by the
**dialect** selected in the editor, never by a global rule.

| Dialect | `;` | `WB!` | Source |
|---|---|---|---|
| Standard (Wavu Wiki) | character section break | Wall Break | [wavu.wiki/t/Notation](https://wavu.wiki/t/Notation) |
| TTT2 Combo (kagewebsite) | **Tag Assault** | Wall Break | [ttt2combo.kagewebsite.com](https://ttt2combo.kagewebsite.com/) |
| Community (WB! = Wall Bound) | character section break | **Wall Bound** | various guides |

In TTT2, the character performing each section is resolved in this order:

1. A manual assignment.
2. A `Name:` label in the notation.
3. The primary character, for the first section.
4. The other teammate, after an explicit `5`/`TA!` or a Tag Assault `;`.
5. Otherwise the section stays unassigned, and the editor asks you to pick a
   character.

A plain `;` never implies a character switch on its own.

## Architecture

```
src/
├── types/          AST, tokens, Combo model
├── notation/       Layer 1 lexicon · Layer 2 mechanics, dialects, games · Layer 3 character dictionaries
├── parser/         tokenizer → recursive-descent parser → semantic validation (+ sections, normalizer)
├── render/         pure layout engine (AST → positioned boxes) + theme
├── components/     arcade SVG components, shared UI
├── features/       library, editor, details, export
├── storage/        Dexie DB, ComboRepository, zod schemas, JSON backup
└── hooks/          hash routing, repository hooks
```

- **Parser is independent of the renderer.** `parseNotation(text, { game, dialect, characters })`
  returns the tokens (with spans into the original text), the AST, normalized
  text, and diagnostics. It never throws. The full grammar is in `src/parser/grammar.ts`.
- **One SVG for screen and export.** `layoutCombo()` is a pure function, and
  `ComboSvg` draws it using SVG attributes only. Exported files therefore match
  the screen exactly.
- **Original notation is the source of truth.** Parse results are cached in
  memory and keyed by `PARSER_VERSION`, so they are regenerated whenever parsing
  rules change.
- **Repository pattern.** The UI depends only on the `ComboRepository`
  interface. A cloud-sync implementation can be added later without changing
  any feature code.

## TTT2 combo guide

The generator ships the original text of the "TTT2 BNB Combos" guide in
`src/data/ttt2/` and converts it on first use with `src/ttt2/guideImporter.ts`.
The original text is the source of truth. The importer recognizes:

- `#` character, `##` section, `Starter:`
- numbered and unnumbered routes
- `|` lists, where each `|` separates alternatives and every alternative becomes
  its own piece
- `Note:`, `Additional …:`, forms, and shared kits

Lines the importer cannot classify are reported, never guessed. Generator rules
are documented in `docs/TTT2_TEAM_COMBOS.md`.

Guide credits: compiled from Tekken Zaibatsu, YouTube and community
contributors. The guide notes that its routes have not been independently tested.

## Credits

The visual approach was inspired by [T8 Notation Maker](https://github.com/LinSDK/t8-notation-maker).
That repository has no license, so no code or assets were reused. All icons here
are original SVG components.
