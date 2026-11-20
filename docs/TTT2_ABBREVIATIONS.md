# TTT2: abbreviations, symbols and how to perform them

Cross-check of two sources against the app's parser:

- **ttt2combo.kagewebsite.com**: the *Help & Legend* page and the **2,604 combos** it publishes (every pair). Each combo comes with named icons (for example, the `kde` icon is called "Setsunagake") and the notation as text.
- **"TTT2 BNB Combos" guide** (the shared Google Doc; it is the same one already bundled in `src/data/ttt2/ttt2-bnb-combos.md`).

## Result

| Source | Without warnings before | Without warnings now |
|---|---|---|
| kagewebsite combos (`kage-ttt2` dialect) | 2,410 / 2,604 (92.5%) | **2,579 / 2,604 (99.0%)** |
| Guide pieces | 1,379 / 1,508 (91.4%) | **1,442 / 1,508 (95.6%)** |

What still warns is mostly prose from the guide's author ("or", "wall grab", "Not listed in October master") or real ambiguities (`12` without `+`). Warning on those is correct.

## 1. Website symbols (Help & Legend)

| Symbol on the website | Meaning | In the app |
|---|---|---|
| `,` | Separates two moves | Same (`,` or `>`) |
| space | Inputs in a row inside one move: `d/f 1 4` is df+1 then 4 | Read as a sequence, with an info warning |
| `*` | Hold | Same |
| `<` | Delay the input | Same |
| `:` | Just frame (exact timing) | Same |
| `~` | Slide the finger between buttons | Same |
| `( … )` | Input that can be skipped; the website also uses it for `( W! )` | Optional |
| `;` | Automatic character switch on Tag Assault | `;` = TA only in the `kage-ttt2` dialect |
| `F`, `D/F`, `U/F`… (uppercase) | Held direction | Same |
| `N` | Release the stick (neutral) | Same |
| `qcf/qcb`, `hcf/hcb` | Quarter and half circle | Same |
| `fcf/fcb` | Full circle | **New** |
| `5` | TAG | Same |
| `2+5` | Tag Throw | Drawn as 2+TAG |
| `1+2+5` | Direct Tag Assault | Drawn as 1+2+TAG |
| `1+2+3+4` | Charge | Drawn as 4 buttons |
| `any` | Any button except TAG | Not supported (3 combos) |
| `LP` | Low parry: tap df against a low; leaves the opponent in bound | Same |
| `iWS` | Crouch and stand up quickly | Same |
| `cc` | Crouch cancel: crouching, up or a quick dash | Same |
| `W!` / `WB!` / `F!` / `BB!` | Wall Splat / Wall Break / Floor Break / Balcony Break | Same |

## 2. New or corrected abbreviations

"How to enter" is what appears right before the abbreviation in the website's combos (text exactly as the website writes it, with spaces). It is evidence of use, not the game's move list.

### Named moves

| Abbreviation | Meaning | Character | Notes |
|---|---|---|---|
| `HS` | Hell Sweep (f,n,d,df+4) | Devil Jin, Kazuya, Heihachi, Jin | The guide writes `CH HS,4 B!`. In TTT2 it is never Heat Smash |
| `TGF` | Thunder God Fist | Heihachi | The label used to say just "TGF" |
| `OTGF` | Omen Thunder God Fist | Heihachi | `EWGF > OTGF > EWGF` |
| `WGF` | Wind God Fist | Armor King | The website uses it in Armor King combos |
| `Demoman` | Demolition Man | Paul | Guide ender |
| `Debugger` | Debugger | Prototype Jack | Guide ender |

### Direction and movement shortcuts

| Abbreviation | Meaning | Example |
|---|---|---|
| `bf` | b,f | Jin `bf+2,1`, Heihachi `bf+2` |
| `fb` | f,b | Lars `fb+2,1 B!` |
| `fn` | f,n | Lee `fn,3,4` |
| `microdash`, `wavedash`, `backdash` | Same as `micro`, `WD`, `BD` | Now accepted when written out in full |

### Stances

| Abbreviation | Meaning | Character | How to enter (according to the website) |
|---|---|---|---|
| `KDE` = `SET` | Setsunagake | Kunimitsu | `f 4 F` (f+4 holding F). The guide writes SET, the website KDE |
| `DUS` | Duston | Kunimitsu | `d 1+2` |
| `GEN` | Genjutsu Stance | Jun, Unknown | `1 b 1+2`, `f f 1+2` |
| `IZU` | Izumo | Jun, Unknown | `f 1+2 ~` |
| `KNK` | Kinkei Dokuritsu | Leo | `BOK 4`. **Corrected**: it used to say "Kenpo stance" |
| `BOK` | Bokuho | Leo | `f 3 D`, `KNK 1 D` |
| `KNP` | Kenpo Step | Feng | |
| `STC` | Shifting Clouds | Feng | |
| `CRA` = `CRN` | Art of Crane | Lei | `u/f 3` |
| `DGN` | Art of Dragon | Lei | from `SNA 2 f` |
| `SNA` | Art of Snake | Lei | `d 4 U` |
| `PAN` | Art of Panther | Lei | from `SNA d` |
| `TGR` | Art of Tiger | Lei | `4 1 F` |
| `PHX` | Phoenix Illusion Stance | Lei | |
| `DRU` | Drunken Master Walk | Lei | |
| `SWY` | Swaying | Paul | `d/f 1 ~ B` |
| `SDW` | Shadow Stance | Raven | `b 3+4 ~` |
| `HAZ` | Haze Stance | Raven | `qcf 1 ~` |
| `SAV` | Savage Stance | Miguel | `d/f 1 F` |
| `VTS` | Vale Tudo Stance | Marduk | `1 2 3+4` |
| `CDS` | Crouching Demon Stance | Jin | `b 3 F`, `3 ~ f` |
| `CES` | Clockwise Evasive Spin | Jaycee, Michelle | `D/F 1 4` |
| `BRG` = `Bridge` | Bridge | Jaycee, Michelle | `d/b 1+2` |
| `FWR` | Forward Roll | Jaycee, Michelle | |
| `MAD` | Mad Pain | Dr. B | `b 1 2` |
| `PND` | Panic Doctor | Dr. B | |
| `MTS` | Muay Thai Stance | Bruce | `d/f 4 ~`, `3 4 ~` |
| `ROC` | Rocket Stance | Alex, Roger Jr. | |
| `AKS` | Animal Kick Stance | Alex, Roger Jr. | `u/f 4` |
| `PKB` = `PAB` | Peekaboo | Steve | |
| `LWV` | Left Weave | Steve | |
| `ALB` | Albatross Spin | Steve | `3+4`, `1 FLK 1` |
| `SBT` / `DBT` | Single Boot / Dual Boot | Alisa | |
| `AP` | Astral Projection | Jinpachi | |
| `DFS` | Dragon Fake Step | Marshall Law | |
| `LCT` | Leg Cutter | Asuka | `SSL` |
| `BAL` | Spinning Ball | Bob | |
| `DGF` | Dragonfly Stance | Yoshimitsu | |
| `SIT` | Sit Stance | Ganryu | |
| `ROL` = `ROLL` | Prowling Grizzly Roll | Kuma, Panda | |
| `MS` | Mist Step | Lee, Violet | `ms+3,4` |
| `DEN` / `SEN` | Dynamic Entry / Silent Entry | Lars | `f 3` / `d/b 2 F`. **Corrected**: TTT2 accepts DEN/SEN as well as DE/SE |
| `RDS` | Rain Dance Stance | Xiaoyu, Miharu | The label used to say "RDS stance" |

## 3. Abbreviations without a confirmed meaning

They are accepted (no warning) but shown as the abbreviation itself, because no source says what they mean:

- **Kunimitsu:** `MUS` (the website has an icon but no name; it appears after `f f 3`).
- **Lei:** `KNDs`, `PLDs`, `FCDs`, `SLDs`. From context they look like ground positions.
- **Guide:** `ISW` (Jaycee/Michelle, Armor King, King), `GS` (Armor King), `VAN` (Raven), `HHS` (Ganryu), `PAN`/`PAD` (Dr. B). Searched in the ludo.guide TTT2 move lists (Nov. 2026) with no match.

If you know any of them, just change the label in `src/notation/characters/dictionary.ts`.

### Resolved with the TTT2 move lists (ludo.guide, Nov. 2026)

| Abbreviation | Meaning | Character | Command | Confidence |
|---|---|---|---|---|
| `DU` | Dark Upper | Armor King | `f,n,d,df+2` (juggle) | Confirmed |
| `GS` | Giant Swing | King | `f,hcf+1` | Confirmed (not listed for Armor King; his `f,hcf+1` is called Armlock Swing) |
| `CDc` | Crouch Dash cancel | Dragunov | `f+3~d/f~u` (the guide itself writes it this way) | Confirmed |
| `MUS` | Musasabi Flip | Kunimitsu | `f,f+3`; `MUS 2` = Ankle Slashout (juggle) | Confirmed |
| `groundgrab` | Throw on a grounded opponent | Armor King | `d/b+1+3` or `d/b+2+4` | Confirmed |
| `groundgrab` | Throw on a grounded opponent | King | `d/b+2+4` in any position; face up with the feet toward King, also `D/B+2+4` (Figure-4 Leglock) and `D/F+2+4` (Crotch Dive) | Confirmed |
| `groundgrab` | Airlift (juggles) | Marduk | `d/b+1+3` in any position; `d/b+2+4` depending on the position | Confirmed |
| `wallgrab` | Angry Ape | Marduk | `1+3`, `2+4` or `f,f+1+2` | Confirmed |
| `wallgrab` | Wall throw | King | No reliable command (the page lists Shining Torpedo with doubtful inputs) | No command |

Also verified with Tekken Wiki (Fandom), the TTT2 lists for Armor King (Spanish version) and Kazuya, copy saved in Nov. 2026:

- **Armor King ground throws:** they match. With the opponent face up, `d/b+1+3` (or `d/b+2+4`) gives Seesaw Whip or Standing Heel Hold if you are on the feet side, Enzui Knee or Wake-Up Lariat if you are on the head side, and Turn Over or Back Mount if you are at their side. `d/b+2+4` on a downed opponent can also be Stand Up, which lifts them up without damage.
- **Armor King air throws:** Muscle Driver `f,b,d/b,d,d/f,f+1` and Running Cross Driver `f,f,f+2+4`.
- **`DU`:** the command `f,N,d,d/f+2` matches. The wiki calls it "Palm Upper"; the Ki-charged version is "Charge Dark Upper".
- **No data on the wiki:** it has no Giant Swing, `ISW`, `GS` or wall throws for Armor King, and it does not mark which moves cause Bound. So it does not confirm that Kazuya's `d/b+2` (Lion Slayer) causes Bound. The only evidence is the two guide routes that write `db+2 B!`.

Likely, **not** loaded into the dictionary because the source does not fully confirm them:

| Abbreviation | Possible meaning | Character | Command | Why it is not certain |
|---|---|---|---|---|
| `AGF` | Animal Godfist | Alex, Roger Jr. | `f,n,d,df+1` | The initials match; no source uses it as an ender |
| `BOOT` | Booter | True Ogre | `f+3+4` | The page is Ogre's, not True Ogre's |
| `MAD+1` | Mad Pain Stance → 1 (Mosquito Thumbing) | Dr. B | MPS is entered with `b+1,2` on hit | The reading of "+1" is inferred |
| `Air Throw` | Air throw | Jinpachi | Not found | No TTT2 source lists it |

### Air throws (opponent airborne, as a combo ender)

According to the ludo.guide TTT2 lists (Nov. 2026); Armor King also matches Tekken Wiki. In the guide they appear as `Air Throw` (Jinpachi), `f,F+1+2(any airgrab)` (Marduk) and `f+4,1,2,4*(with airgrab)` (Kunimitsu filler so the partner can grab in the air).

| Character | Command | Name |
|---|---|---|
| King | `1+3` / `2+4` / `d+1+3` or `d+2+4` | Inverted Leg Lace / Leg Whipdown / Catching Ankle Breaker |
| Armor King | `f,hcf+1` (= `f,b,d/b,d,d/f,f+1`) / `f,f,f+2+4` | Muscle Driver / Running Cross Driver (ludo: Running Cross Bomb) |
| Marduk | `1+3` / `2+4` / `f,f+1+2` | Whip Slam / Whiparound Toss / Scoop Suplex (the guide's `f,F+1+2`) |
| Jinpachi | `1+3` or `2+4` / `u/f+3+4 1,1,2:2` | Raging Tempest / Air Transmigration |
| Jaycee | running `2+4` | Burning Hammer |
| Michelle | running `2+4` | Crucifix Bomb |
| Lars | running `2+4`, or `DE 2+3` | Rejection |
| Baek | `d/f+3+4` | Hawk's Talons |
| Ogre | `hcb+2` | Epsilon (grabs on hit or in the air) |

Armor King also has team air throws finished with the tag input (`5`), one per partner: King `qcb+1+2,5`, Jaycee `1+3,5`, Kuma/Panda `2+4,5`, Marduk `f,n,d,d/f+1+4,5`. No ludo.guide page: Christie, Tiger, Bryan, Steve, Feng, Miharu, True Ogre.

### Changes to the bundled guide (`src/data/ttt2/ttt2-bnb-combos.md`)

The copy shipped with the app is no longer identical to the original document:

- **Kazuya:** added `B!` to the `db+2` of `EWGF > 3,1,4 > db+2 > CD+4,1` and of `CH df+2 > 1,2,4,3 > db+2 > CD+4,1`. Two other guide routes already marked `db+2 B!`.
- **Kazuya's EWGF:** added as a Kazuya `Additional Ender` (open ground), a relaunching finisher on request; not in the original guide, untested.
- **Air throws:** added as `Additional Air Ender` with their condition. Armor King: `f,hcf+1` and `fff+2+4`. King: `1+3`, `2+4` and `d+1+3`. The generator only offers them when the ender is done by the character who started the combo, and marks them "to verify".

## 5. Enders suggested from the move list (heuristic)

Data source: TTT2 move lists from Tekken Wiki (Fandom), downloaded through the MediaWiki API to `src/data/ttt2/movelists-src/*.wikitext` and parsed into `src/data/ttt2/movelists.json` with `scripts/ttt2/parseMovelists.mjs` (`node scripts/ttt2/parseMovelists.mjs` regenerates it).

- The generator can suggest extra enders for the character who **starts** the combo (`enderBy = point`, open ground only), after turning on the "Suggest enders from the starter's move list" switch in Advanced (off by default).
- Heuristic (`src/ttt2/candidateEnders.ts`): a candidate is a move whose last hit is mid or low, **or** a move the character already ends a guide route with (this catches high launchers such as `cd3`). It excludes enders that are already confirmed and commands that need a special state (grounded opponent, stance, transformation). Everything is marked "to verify"; at most 12.
- The move lists do **not** mark Bound/Juggle, so it is a suggester with false positives, not absolute truth.
- Name resolver (`src/ttt2/movelistData.ts`): matches the roster's short name with the wiki's long key (e.g. Marduk → "Craig Marduk", Bob → "Robert Richards", Ancient Ogre → "Ogre"). It covers the whole roster except **Mokujin** (no move list on Fandom).

## 4. Pending (not implemented)

| Case | Where | Occurrences |
|---|---|---|
| `<` at the start after `;` (`; < DEN 1`) or at the end (`MTS <,`) | website | 7 |
| `,,` (double comma, typo) | website | 7 |
| `any` (any button) | website | 3 |
| `+` next to an optional part: `(1)+4`, `df+(1),3` | guide | 5 |
| Throws written as prose that the parser does not read as a move: `Air Throw`, `wall grab`, `(any airgrab)`. Their meaning is already resolved in §3 | guide | 4 |
| `FCdf+2` (FC attached to the direction) | guide | 1 |
