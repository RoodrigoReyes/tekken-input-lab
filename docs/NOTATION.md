# Notation reference

Everything the Tekken Input Lab parser understands. The original text is always kept as typed: the parser never rewrites your notation. Anything it does not recognize is flagged with a warning instead of being guessed.

## Symbols

| Symbol | Meaning | Example |
|---|---|---|
| `+` | pressed together | `df+1`, `1+2` |
| `,` | next input | `df+1,2` |
| `~` | immediately | `1~b~uf+4` |
| `:` | just frame | `f,n,d,df:2` |
| `<` | delayed | `df+3,2,<1` |
| `*` | hold (uppercase directions are held too) | `df+1*`, `F+2` |
| `>` | next combo stage | `df+2 > 1,2 > T!` |
| `;` | section break, or Tag Assault in the TTT2 dialect | `… ; 3+4,2` |
| `[ ]` | optional part | `df+2 [dash] f+2` |
| `( )` | optional input, or a note when it is not notation | `(1,2),2`, `1,2 (wall)` |
| `x3` | repeat | `b+1 x3` |
| `5` | TAG button (TTT2) | `df+1,2~5` |

## Directions, motions and prefixes

- **Directions:** `f b u d df db uf ub n`. The `d/f` style, arrows (`→ ↘ ↓`) and `df1` for `df+1` are accepted too.
- **Motions:** `qcf qcb hcf hcb cd ff bb fff`.
- **State prefixes:** `WS FC BT WR CH iWS`, and `H.` for Heat.
- **Movements:** `dash SSL SSR SS SW BD WD CC micro`.
- **Character notation:** named moves and stances, such as `EWGF`, `PEWGF`, `ZEN`, `AOP`, `RDS` and `HMS`. Named moves are drawn as labels. Click one to see its input, or turn on **Expand named moves** to show them all.

## Combo events by game

| Event | Meaning | T6 | TTT2 | T7 | T8 |
|---|---|---|---|---|---|
| `B!` | Bound | ✓ | ✓ | ⚠ not an extender | ⚠ only after airborne Heat Burst |
| `S!` | Screw / Tailspin | ✗ | ✗ | ✓ | ✗ |
| `T!` | Tornado | ✗ | ✗ | ✗ | ✓ |
| `W!` | Wall Splat | ✓ | ✓ | ✓ | ✓ |
| `WB!` | Wall Break (default dialect) | ✓ | ✓ | ✓ | ✓ |
| `F!` / `FB!` | Floor Break | ✓ | ✓ | ✓ | ✓ |
| `BB!` | Balcony Break | ✗ | ✓ | ✓ | ✓ |
| `WBl!` / `FBl!` | Wall / Floor Blast | ✗ | ✗ | ✗ | ✓ |
| `WBo!` | Wall Bound | character-specific | ✗ | Season 2+ | ✓ |
| `TA!` | Tag Assault | ✗ | ✓ | ✗ | ✗ |

Mechanic keywords:

| Keyword | Mechanic | Games |
|---|---|---|
| `RA` | Rage Art | T7, T8 |
| `RD` | Rage Drive | T7 |
| `HB` `HS` `HD` `HE` | Heat Burst, Heat Smash, Heat Dash, Heat Engager | T8 |

Only one juggle extender (`B!`, `S!` or `T!`) is allowed per combo.

## Dialects

Community notation is not uniform. Ambiguous symbols follow the **dialect** chosen in the editor, never a global rule.

| Dialect | `;` means | `WB!` means | Source |
|---|---|---|---|
| Standard | section break | Wall Break | [Wavu Wiki](https://wavu.wiki/t/Notation) |
| TTT2 Combo | **Tag Assault** | Wall Break | [ttt2combo.kagewebsite.com](https://ttt2combo.kagewebsite.com/) |
| Community | section break | **Wall Bound** | various guides |

## TTT2 sections

In Tekken Tag Tournament 2, the character who performs each section is chosen in this order:

1. A manual assignment in the editor.
2. A `Name:` label in the notation.
3. The main character, for the first section.
4. The other teammate, after an explicit `5` / `TA!` or a Tag Assault `;`.
5. Otherwise the section stays unassigned, and the editor asks you to pick one.

A plain `;` never implies a character switch by itself.

TTT2-specific abbreviations, with their sources, are listed in [`TTT2_ABBREVIATIONS.md`](TTT2_ABBREVIATIONS.md).
