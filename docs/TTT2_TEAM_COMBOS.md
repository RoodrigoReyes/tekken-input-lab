# TTT2 combo generator

How Tekken Input Lab builds Tekken Tag Tournament 2 team combos from the bundled **"TTT2 BNB Combos"** guide.

## The idea

The guide does not list combos per team. TTT2 has more than 1,700 possible pairs, so instead it gives each character a set of pieces and expects you to combine them. In its own words: *learn your character's starting theory and mix it with the available TA fillers and enders*.

The guide never writes `TA!` inside a combo. Every team combo is three pieces joined at the Tag Assault:

```text
[Point]  Route up to B!  ──►  TA!  ──►  [Filler]  ──►  [Ender]
         (Solo / CH / LP / Wall)        (TA! list)      (Ender list)
```

## What the guide provides

The guide has 57 character sections, and every section follows the same structure:

| Section | Role in a team combo |
|---|---|
| Solo Combos, by starter | The part **up to `B!`** is the opener |
| Counter Hit Combos | Same, starting with `CH …` |
| Low Parry Combos | Same, starting with `LP >` |
| Solo Wall Combos | Openers in the **wall** context |
| **TA!** / **Wall TA!** | Fillers performed after the Tag Assault |
| **Ender** / **Wall Ender** | Finishers that close the combo |

- **Shared kits:** clones share their pieces. The pairs are Alex & Roger Jr., Eddy & Christie, Jun & Unknown, Kuma & Panda, Lee & Violet, and Xiaoyu & Miharu.
- **Forms:** Kazuya and Devil Kazuya have separate TA and Ender lists. Each route says which form it works for.
- **Conditional pieces:** lines such as `Additional TA!: <notation>. <condition>` are extra pieces that only work under a condition, for example "Ogre/big-body option" or "Only for very early bound".

After import, the guide yields 1,508 pieces: 628 routes (423 of them reach `B!`), 327 TA!, 178 Wall TA!, 210 Ender, 165 Wall Ender and 23 Additional.

## Import

`src/ttt2/guideImporter.ts` reads the guide's text format and turns it into `ComboPiece` records:

- **Headings:** `#` for a character, `##` for a section, and `Starter:`.
- **Routes:** numbered and unnumbered routes.
- **Lists:** `|` lists, where every alternative becomes its own piece.
- **Extras:** `Note:` and `Additional …:` lines, forms, and shared kits.

| Structure | What it stores |
|---|---|
| `ComboPiece` | Character, form, role (`route` / `taFiller` / `ender`), context (`open` / `wall`), route type (`normal` / `counterHit` / `lowParry` / `wall`), starter, **literal** notation, condition and notes |
| `CharacterKit` | One character's pieces, their name in the guide, and the clones that share the kit |
| `GuideLibrary` | Every kit, plus the lines that could not be classified |
| `RouteAnalysis` | What each route gives: the opener up to `B!`, the move that caused the Bound, estimated hits before the TA, and whether it uses the wall |

Lines the importer cannot classify are reported, never guessed.

## Generation

For a team (point character A, tag-in partner B) and the chosen options, the generator works like this:

```text
routes   = A's routes that reach B!        (filtered by starter, CH/LP and form)
fillers  = TA! or Wall TA! list of whoever performs the filler
enders   = Ender or Wall Ender list of whoever performs the ender
combo    = A: <route up to B!> TA!  →  <filler>  →  <ender>
```

By default the partner performs the filler and the point character performs the ender. Both can be changed under **Advanced**.

### Rules that exclude a piece

| Rule | Requirement |
|---|---|
| R1 | The route reaches `B!` |
| R2 | The piece's context matches the setup (open ground or wall) |
| R3 | The form matches (Kazuya or Devil Kazuya) |
| R4 | The filler and the ender do not add a second `B!`, and no piece uses a mechanic TTT2 does not have |
| R5 | *(optional)* Only pieces without notation warnings |
| R6 | *(optional)* Conditional "Additional" pieces only when they are enabled |

### Things shown as "verify" instead of excluded

The generator does not drop these. It flags them:

- Conditions from the guide: hits before the TA, the Bound's hit count, which Bound the partner used, opponent size, and wall angle.
- Notes, attached only to the piece they mention.
- Notation warnings.
- Open-ground routes used at the wall, which may not reach it.

Combos with fewer things to verify are listed first. After those come normal starters, then Counter Hit, Low Parry and wall routes.

## In the app

The **TTT2 Generator** page builds a combo one phase at a time (Route → TA filler → Ender), with a live arcade preview. You can set it up in these sections:

- **Team & setup:** pick the point character, the tag-in partner and their forms, then choose open ground or the wall.
- **Search by move:** limit the routes to ones that use a move the point character landed.
- **Advanced:** choose who performs the filler and who performs the ender. You can also include conditional pieces, keep only pieces without warnings, and suggest enders from the move list.
- **Mark as tested:** "I tested this ender" remembers an ender you confirmed in practice mode.
- **Hand off to the editor:** the finished combo can be sent to the editor, where the notation stays editable and is the source of truth.

## Enders suggested from the move list

This option is off by default. When you turn it on, the generator suggests extra enders for the point character on open ground. It draws them from the TTT2 move lists in `src/data/ttt2/movelists.json`, which are parsed from Tekken Wiki wikitext by `scripts/ttt2/parseMovelists.mjs`.

- **Heuristic** (`src/ttt2/candidateEnders.ts`): a move is a candidate if its last hit is mid or low, or if the character already ends a guide route with it.
- **Exclusions:** enders that are already confirmed, and moves that need a special state (a grounded opponent, a stance or a transformation).
- **Limits:** the move lists do not mark Bound or juggle properties, so expect false positives. Every suggestion is marked as untested, and at most 12 are shown.
- **Name matching** (`src/ttt2/movelistData.ts`): maps roster names to wiki names, for example Marduk → "Craig Marduk". Mokujin has no move list.

> [!IMPORTANT]
> Every generated combo is a suggestion built from the guide's pieces and rules. The guide states that its routes were not independently tested, so try each combo in practice mode before relying on it.

## Known gaps

| Case | Example |
|---|---|
| `<` right after `;` or at the end of a line | `; < DEN 1`, `MTS <,` |
| `+` next to an optional input | `(1)+4`, `df+(1),3` |
| Throws written as prose | `Air Throw`, `wall grab`, `(any airgrab)` |
| `FC` attached to a direction | `FCdf+2` |

Abbreviations and their sources are documented in [`TTT2_ABBREVIATIONS.md`](TTT2_ABBREVIATIONS.md).
