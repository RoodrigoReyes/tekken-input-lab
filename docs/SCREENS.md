# TekkenInputLab — Screen content specification

This document lists **what each screen must contain**: purpose, information, actions, states and rules.
It deliberately says **nothing about layout, order, grouping or visual treatment**. Those decisions are left to the designer (Google Stitch).
Visual tokens and components are defined in `DESIGN.md`. All UI text is in English.

Conventions:
- **Must** = required content. **Should** = expected unless the design has a better solution. **May** = optional.
- "Arcade display" is the component that draws a combo's commands; its content is specified at the end.

---

## 0. App shell (present on every screen)

**Purpose:** identify the app and give access to the main actions from anywhere.

Must contain:
- The app name "TekkenInputLab" and its logo, which links back to the Combo Library.
- An action to create a new combo.
- A place for transient feedback messages (toasts):
  - **success:** "Combo saved", "Notation copied"
  - **info:** "Import: 3 added, 1 updated"
  - **error:** "Could not copy: …". Error messages must stay visible longer and be dismissible.

Rules:
- No login, accounts or settings pages. Everything is stored in the browser.
- No dashboards, statistics or charts anywhere in the app.

---

## 1. Combo Library (home)

**Purpose:** browse, search and manage saved combos.

Must contain:
- A screen title (e.g. "Combo Library").
- Library actions:
  - **New combo**
  - **Import JSON:** restore or merge a backup file.
  - **Export JSON:** download the whole library.
- Search across combo name, notation and tags.
- Filters:
  - **Game:** all, Tekken 8, Tekken 7, Tekken Tag Tournament 2, Tekken 6.
  - **Character.** Suggests characters from the library and the game roster, but accepts free text.
  - **Partner:** only meaningful for Tekken Tag Tournament 2.
  - **Difficulty:** any, Beginner, Intermediate, Advanced.
  - **Favorites only.**
  - **Tags.** Every tag used in the library is selectable; several tags can be combined.
  - A way to **clear all filters** when any is active.
- A result count, e.g. "12 of 40 combos".
- The list of combos. Each combo must show:
  - combo name, game, and character(s), e.g. "Kazuya + Nina" for TTT2;
  - difficulty;
  - damage, if set;
  - favorite status, togglable directly from the list;
  - a compact arcade display preview of the combo;
  - its tags;
  - a warning indicator with a count when the notation has warnings for its game.
  Selecting a combo opens its details.

States:
- **Loading:** while the library loads.
- **Empty library:** explain what the app does in one line ("Paste your first combo notation and see it as arcade commands.") and offer to create a combo.
- **No results:** "No combos match these filters", with a way to clear filters.
- **Load error:** a readable message.
- **Import results:**
  - summary of how many combos were added, updated, and kept because the local copy was newer;
  - how many invalid entries were skipped;
  - clear errors for files that are not valid backups, are too large, or come from a newer version of the app.

---

## 2. Combo Editor (New combo / Edit combo)

**Purpose:** create or edit a combo, see the notation drawn live, and save it.

Must contain:
- A title that says whether this is a new combo or an edit.
- **Game** selection: Tekken 8, Tekken 7, Tekken Tag Tournament 2, Tekken 6.
- **Character** input. Suggests the selected game's roster and accepts any name.
- **Partner** input: Tekken Tag Tournament 2 only.
- **Notation dialect** selection, shown only when the game has more than one dialect, with a one-line explanation of the selected dialect:
  - Standard (Wavu Wiki): `WB!` = Wall Break, `;` = character section break.
  - TTT2 Combo (kagewebsite): `;` = Tag Assault.
  - Community: `WB!` = Wall Bound.
- **Combo name** (required).
- **Notation** text input, multi-line, with a note that the text is saved exactly as typed.
- **Live preview:**
  - The arcade display of the current notation, updating as the user types.
  - A **size** control for the commands.
  - An **"Expand named moves"** toggle (e.g. show EWGF as its inputs).
  - The **diagnostics** list (see rules below).
- **Character sections:** TTT2 only, when the notation has more than one section. For each section:
  - its number, plus a "Tag Assault" marker when the section starts with one;
  - a snippet of its notation;
  - the automatically detected character and the reason: from a label, starts the combo, after TAG, after Tag Assault, or needs assignment;
  - a way to override it manually.
- **Notation reference** for the selected game. It may be collapsible.
  - operators: `+ , ~ : < * > [ ] ( ) xN ;` and what each means;
  - the combo events and mechanics, each marked as available, conditional or unavailable in that game;
  - the named moves and stances of the selected character(s).
- **Difficulty:** Beginner, Intermediate, Advanced.
- **Damage:** optional whole number from 0 to 999.
- **Tags:** add and remove free-text tags, with suggestions from existing tags.
- **Notes:** free text.
- **Save** and **Cancel** actions.
- **Generate from guide:** TTT2 only, see section 3. It may live inside the editor or be reachable from it.

Diagnostics rules:
- Two severities:
  - **warning:** a problem, e.g. a mechanic that does not exist in the selected game.
  - **info:** a note, e.g. "(1,2) is read as an optional input".
- Each diagnostic should point to the exact piece of notation it refers to.
- Warnings never block saving and never change the user's text.

States:
- **Empty notation:** a hint inviting the user to type or paste notation.
- **Validation errors on save** (missing name, missing notation, invalid damage): readable and associated with the form.
- **Edit mode for a combo that no longer exists:** a clear message.
- **Saving in progress:** the save action is disabled.

---

## 3. TTT2 Combo Generator

**Purpose:** build Tekken Tag Tournament 2 team combos from the bundled "TTT2 BNB Combos" guide.
A team combo follows the structure: point character's route up to a Bound (B!) → Tag Assault (TA!) → a TA filler → an ender.

Must contain:
- A one-line explanation of what it does, and that results are **suggestions until tested in practice mode**.
- **Team selection:**
  - the **point** character, who starts the combo;
  - the **tag-in teammate**.
  Only characters present in the guide can be chosen, and the two must be different.
- **Where:** open ground or at the wall.
- **Starter:** any, or one specific starter from the point character's routes (e.g. EWGF, ff+3).
- **Starter types** to include: normal, Counter Hit, Low Parry.
- **After TA!:** who performs the filler and who performs the ender (point or teammate, each selectable).
- **Form:** only for characters with forms, e.g. Kazuya / Devil Kazuya.
- Toggles:
  - include conditional ("Additional") options from the guide;
  - only pieces whose notation has no warnings.
- A **summary**, e.g. "36 combos · 2 routes reaching B! × 9 TA fillers × 2 enders".
- The **list of generated combos**, ranked so the ones with the fewest things to verify come first. Each result must show:
  - its rank;
  - the starter and starter type;
  - an estimate of hits before the Tag Assault, labeled as an estimate;
  - the move that caused the Bound;
  - the arcade display, split by character section (e.g. KAZUYA → NINA → KAZUYA);
  - the full notation as text;
  - a list of **things to verify**: conditions, notes and notation issues from the guide;
  - a **"Use this combo"** action. It fills the editor with the notation, the team, a suggested name ("Kazuya + Nina: EWGF → TA!"), a "generated" tag, and notes saying it is untested plus what to verify.
- A way to load more results (results can number in the hundreds).
- The guide's **source credit**: compiled from Tekken Zaibatsu, YouTube and community contributors, with routes not independently tested.

States:
- **Loading the guide.**
- **Guide failed to load:** readable error.
- **Same character chosen twice:** ask for two different characters.
- **No combos for these options:** explain why when possible, e.g. "The guide has no Anna route reaching a Bound", "No TA fillers for this side/context".

Sample content:
```
Kazuya:
EWGF > b+2,4 > db+2 B! > TA!
Nina:
ss+1~f~2
Kazuya:
cd+4,1
```

---

## 4. Combo Details

**Purpose:** view one saved combo in full and act on it.

Must contain:
- A way back to the library.
- Combo name.
- Game, character(s), difficulty and damage (if set).
- Favorite status, togglable.
- Actions:
  - **Edit**
  - **Duplicate:** creates a copy named "… (copy)" and opens it.
  - **Copy notation** to the clipboard.
  - **Export SVG** and **Export PNG** of the arcade display. The exported image includes the combo name, game, characters and damage.
  - **Delete**, with confirmation.
- The full **arcade display**, with size and "Expand named moves" controls.
- The **diagnostics** for this combo's notation.
- The **original notation**, exactly as saved, plus the dialect used to read it.
- Tags.
- Notes, including the "to verify" list for generated combos.
- Created and last-updated dates.

States:
- **Loading.**
- **Combo not found:** e.g. it was deleted. Show a message and a way back.
- **Export or copy failure:** readable error.

---

## 5. Delete confirmation

**Purpose:** prevent accidental deletion.

Must contain:
- A question title, e.g. "Delete combo?".
- The name of the combo being deleted and a statement that it is permanently removed from this browser.
- **Cancel** and **Delete** actions. Delete is clearly destructive.
- Dismissible with the keyboard (Escape).

---

## 6. Arcade display — content it must represent

Applies wherever a combo is drawn: library previews, editor preview, generator results, details and exports.
The visual style comes from `DESIGN.md`. This list only defines **what must be distinguishable**.

**One look everywhere:** every combo view must be inspired by the editor's live preview, with the same look at different sizes. The reference captures are in `docs/reference/combo-preview-*.png`, and `DESIGN.md` → "Arcade display → Reference look" describes them.
- A single dark panel.
- Commands as a horizontal strip that wraps.
- One tile per input.
- Events and named moves as solid colored labels.
- Quiet separators, with a green triangle between stages.
- TTT2 sections on their own lines under character headers.

- **Directions:** the 8 directions plus neutral, as arrows. Held directions (uppercase `F`, `DF`) must look different from tapped ones.
- **Motions** (qcf, qcb, hcf, hcb, cd, ff, bb, fff): one compact symbol with its abbreviation.
- **Buttons:** a 2×2 arcade cluster per input.
  - Simultaneous buttons (`1+2`) are lit together in **one** cluster.
  - Sequential buttons (`df+1,2`) are **separate** clusters.
  - This distinction is mandatory.
- **TAG button (5):** its own indicator, joinable with buttons (`2+5`).
- **Relations between inputs**, each distinct:
  - next (`,`)
  - immediately (`~`)
  - just frame (`:`)
  - delayed (`<`)
  - next stage (`>`)
- **Named moves** (EWGF, PEWGF, WGF): shown as labels, never expanded unless the user asks.
- **States and stances** before an input: WS, FC, BT, CH, LP, Heat `H.`, character stances such as ZEN or IZU.
- **Movements:** dash, SSL, SSR, SS, backdash, wavedash…
- **Combo events,** with the abbreviation kept as written and a readable name: B! Bound, S! Screw, T! Tornado, W! Wall Splat, WB! Wall Break, F!/FB! Floor Break, BB! Balcony Break, WBl! Wall Blast, FBl! Floor Blast, WBo! Wall Bound, TA! Tag Assault.
- **Mechanics:** RA Rage Art, RD Rage Drive, HB Heat Burst, HS Heat Smash.
- **Modifiers:** hold (`*`), repeat (`x3`), optional parts (`[ ]` or `( )`), free-text notes in parentheses.
- **Problems:** anything covered by a warning must be marked, and unknown notation must be shown as-is and marked.
- **TTT2 sections:** each section labeled with its character, or "Unassigned"; a section that starts with a Tag Assault must say so.
- The display must **wrap** on narrow screens without breaking an input apart, and must stay readable at small preview sizes.

---

## Data each combo carries (for reference)

name · game · character · partner (TTT2) · notation (original text, the source of truth) · dialect · per-section character overrides (TTT2) · tags · difficulty · damage (optional) · notes · favorite · created date · updated date.
