---
version: alpha
name: Frame Zero — Tekken Input Lab
description: A stark dark-mode editorial system with bold techno-gaming contrast and restrained motion, extended with the arcade command display used by Tekken Input Lab.
colors:
  primary: "#ff571f"
  primary-hover: "#ff5f2a"
  on-primary: "#08090b"
  secondary: "#e9e7e2"
  tertiary: "#8b93a0"
  neutral: "#08090b"
  surface: "#0e1013"
  on-surface: "#e9e7e2"
  error: "#ff5a1f"
  danger-surface: "#3a1410"
  border: "#333a45"
  border-strong: "#21262e"
  muted-surface: "#21262d"
  muted-text: "#8b93a0"
  warning: "#f5a524"
  info: "#8b93a0"
  success: "#22c55e"
  # Arcade display — functional data colors, keep exactly
  arcade-button-1: "#de7fb7"
  arcade-button-2: "#29b1a9"
  arcade-button-3: "#7996ca"
  arcade-button-4: "#f14b46"
  arcade-button-off: "#3d4a4c"
  arcade-button-outline: "#000000"
  arcade-arrow: "#f4f2ef"
  arcade-arrow-outline: "#15191d"
  arcade-arrow-held: "#ffd166"
  arcade-stage-marker: "#16d61f"
  arcade-relation: "#9aa3b5"
  arcade-tile: "#161a23"
  arcade-tile-border: "#2a303d"
  arcade-named-move: "#7c5cff"
  arcade-movement: "#0284c7"
  arcade-stance: "#475569"
  arcade-heat: "#ea580c"
  arcade-tag: "#22c55e"
  arcade-unknown: "#ef4444"
  event-bound: "#f97316"
  event-screw: "#06b6d4"
  event-tornado: "#14b8a6"
  event-wall-splat: "#eab308"
  event-wall-break: "#a855f7"
  event-floor-break: "#b45309"
  event-balcony-break: "#db2777"
  event-wall-blast: "#e11d48"
  event-floor-blast: "#be123c"
  event-wall-bound: "#ca8a04"
  event-tag-assault: "#16a34a"
  mechanic-rage: "#dc2626"
typography:
  headline-display:
    fontFamily: Archivo
    fontStretch: 75%
    fontSize: 40px
    fontWeight: 800
    lineHeight: 40px
    letterSpacing: -0.4px
  headline-lg:
    fontFamily: Archivo
    fontStretch: 75%
    fontSize: 32px
    fontWeight: 800
    lineHeight: 36px
    letterSpacing: -0.3px
  headline-md:
    fontFamily: Archivo
    fontStretch: 75%
    fontSize: 24px
    fontWeight: 700
    lineHeight: 29px
    letterSpacing: 0px
  headline-sm:
    fontFamily: Archivo
    fontSize: 20px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: 0px
  headline-xs:
    fontFamily: Archivo
    fontSize: 18px
    fontWeight: 600
    lineHeight: 22px
    letterSpacing: 0px
  body-lg:
    fontFamily: Archivo
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
    letterSpacing: 0px
  body-md:
    fontFamily: Archivo
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0px
  body-sm:
    fontFamily: Archivo
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  label-lg:
    fontFamily: Archivo
    fontSize: 14px
    fontWeight: 600
    lineHeight: 18px
    letterSpacing: 0.04em
  label-md:
    fontFamily: Archivo
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0.12em
  notation:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: 500
    lineHeight: 22px
    letterSpacing: 0px
  arcade-label:
    fontFamily: Archivo
    fontStretch: 87.5%
    fontSize: 0.4em
    fontWeight: 800
    lineHeight: 1
    letterSpacing: 0px
  arcade-caption:
    fontFamily: Archivo
    fontStretch: 87.5%
    fontSize: 0.2em
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.04em
rounded:
  none: 0px
  sm: 2px
  md: 4px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  2xs: 4px
  xs: 8px
  sm: 16px
  sm-plus: 24px
  md: 58px
  lg: 94px
  xl: 108px
  gutter-mobile: 8px
  gutter-desktop: 16px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.muted-surface}"
    textColor: "{colors.on-surface}"
    borderColor: "{colors.border}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.border-strong}"
    textColor: "{colors.on-surface}"
  button-small:
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "6px 10px"
    height: "30px"
  button-danger:
    backgroundColor: "{colors.danger-surface}"
    textColor: "{colors.error}"
    borderColor: "{colors.error}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.muted-text}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.muted-surface}"
    textColor: "{colors.on-surface}"
    borderColor: "{colors.border}"
    focusBorderColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  textarea-notation:
    backgroundColor: "{colors.muted-surface}"
    textColor: "{colors.on-surface}"
    borderColor: "{colors.border}"
    typography: "{typography.notation}"
    rounded: "{rounded.md}"
    padding: "12px"
  field-label:
    textColor: "{colors.muted-text}"
    typography: "{typography.label-md}"
  chip:
    backgroundColor: "{colors.border-strong}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "6px 10px"
  chip-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "6px 10px"
  game-badge:
    backgroundColor: "{colors.border-strong}"
    textColor: "{colors.on-surface}"
    borderColor: "{colors.border}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  diagnostic-warning:
    textColor: "{colors.warning}"
    typography: "{typography.body-sm}"
  diagnostic-info:
    textColor: "{colors.info}"
    typography: "{typography.body-sm}"
  toast:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  modal:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "20px"
  arcade-display:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "4px"
  arcade-input-tile:
    backgroundColor: "{colors.arcade-tile}"
    borderColor: "{colors.arcade-tile-border}"
    rounded: "{rounded.lg}"
  arcade-button-cluster:
    layout: "2x2 — 1 top-left, 2 top-right, 3 bottom-left, 4 bottom-right"
    centerSpacing: "D (scales with the command size)"
    buttonRadius: "0.41 × D"
    rightColumnOffsetY: "-0.14 × D (buttons 2 and 4 raised; rows rise ≈ 8° left to right)"
    columns: "vertical — only the right column is shifted, the cluster is not rotated"
    outlineColor: "{colors.arcade-button-outline}"
    outlineWidth: "0.35 × button radius, merged into one black silhouette behind all four buttons"
    pressedColors: "{colors.arcade-button-1} {colors.arcade-button-2} {colors.arcade-button-3} {colors.arcade-button-4}"
    unpressedColor: "{colors.arcade-button-off}"
    fill: "flat — no gradient, gloss or shadow"
    showNumbers: false
  arcade-arrow:
    fillColor: "{colors.arcade-arrow}"
    outlineColor: "{colors.arcade-arrow-outline}"
    heldOutlineColor: "{colors.arcade-arrow-held}"
  arcade-event-badge:
    textColor: "#ffffff"
    typography: "{typography.arcade-label}"
    captionTypography: "{typography.arcade-caption}"
    rounded: "{rounded.lg}"
  arcade-tag-pill:
    backgroundColor: "{colors.arcade-tag}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.md}"
  arcade-stage-separator:
    shape: "solid right-pointing triangle"
    color: "{colors.arcade-stage-marker}"
  arcade-section-header:
    textColor: "{colors.muted-text}"
    typography: "{typography.label-md}"
  generator-result:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "12px"
---

# Frame Zero — Tekken Input Lab

## Overview

Tekken Input Lab is a local-first tool for Tekken players covering Tekken 6, Tekken 7, Tekken 8 and Tekken Tag Tournament 2. It turns written combo notation, such as `qcf+1 > uf+2,1 B! > SSL 1~b~uf+4`, into arcade-style command graphics. It also keeps a personal combo library and generates TTT2 team combos from a bundled guide.

The interface uses **Frame Zero**: a dark, cinematic tech-publication look with a strong editorial point of view. The tone is confident, minimal and slightly industrial. Typography and color carry the hierarchy, not decoration or motion.

The system has two layers:

1. **Chrome** (layout, forms, cards, buttons, navigation). This layer follows Frame Zero strictly: near-black canvas, off-white text and a single electric-orange accent.
2. **Arcade display** (the rendered combo commands). These colors are functional data colors that mirror the in-game command list: per-button colors, white arrows and a green stage triangle. They are exempt from Frame Zero's "no colorful secondary palettes" rule. They must not be restyled, and they must not be reused for chrome.

## Colors

### Chrome

- **Primary (#ff571f):** electric orange, the signature accent. Use it for primary actions, active filter chips, focus borders and key emphasis only. Hover is #ff5f2a. Text on orange is always **on-primary (#08090b)**; never orange on orange.
- **Secondary / On-surface (#e9e7e2):** soft off-white for main text and the wordmark.
- **Tertiary / Muted-text (#8b93a0):** cool gray-blue for labels, helper text, metadata, links and info diagnostics.
- **Neutral (#08090b):** the near-black page background.
- **Surface (#0e1013):** cards, panels, the arcade display container, modals and toasts.
- **Muted-surface (#21262d):** inputs, secondary buttons and inactive controls.
- **Border (#333a45) / Border-strong (#21262e):** 1px edges for cards and inputs, and denser structural lines.
- **Error (#ff5a1f) / Danger-surface (#3a1410):** destructive actions (Delete) and form errors.
- **Warning (#f5a524):** parser and validator warnings, the "to verify" lists in the generator, the dashed outline around warned commands, and unassigned TTT2 sections.
- **Success (#22c55e):** success toasts only.

### Arcade display (functional, keep exactly)

- **Buttons 1–4, when pressed** (flat fills):
  - 1 = pink #de7fb7
  - 2 = teal #29b1a9
  - 3 = lavender blue #7996ca
  - 4 = coral red #f14b46

  Every button, pressed or not, has a thick black outline (#000000). Unpressed buttons are dark gray #3d4a4c.
- **Arrows:** white #f4f2ef with a dark #15191d outline. Held directions keep the white fill and switch to a yellow #ffd166 outline.
- **Stage separator (`>`):** solid green triangle #16d61f.
- **Other relation marks:** gray #9aa3b5 for `,` chevron, `~` wave and `delay`. Yellow for `JF` (just frame).
- **Labels:** named moves are violet #7c5cff, movements (SSL, dash) sky #0284c7, stances and states slate #475569, Heat `H.` orange #ea580c, the TAG pill green #22c55e, and unknown notation red #ef4444 with a dashed outline.
- **Combo events:**
  - Bound #f97316
  - Screw #06b6d4
  - Tornado #14b8a6
  - Wall Splat #eab308
  - Wall Break #a855f7
  - Floor Break #b45309
  - Balcony Break #db2777
  - Wall Blast #e11d48
  - Floor Blast #be123c
  - Wall Bound #ca8a04
  - Tag Assault #16a34a
  - Rage Art / Rage Drive #dc2626

## Typography

The system uses two families: **Archivo** and **JetBrains Mono**. Do not add a third.

**Archivo** (variable font, with a width axis of 62–125% and a weight axis of 100–900) is the voice of the whole interface.

- **Headlines** (`headline-display`, `headline-lg`, `headline-md`) use **Archivo Condensed**: width 75%, weight 700–800, tight tracking and compact line heights. This gives a fighting-game, tournament-poster punch without changing family.
  - `headline-lg` for page titles: "Combo Library", "New combo", a combo's name.
- **Small headings** (`headline-sm`, `headline-xs`) use normal width at weight 600. `headline-xs` is for card titles.
- **Body text** uses normal width at regular weight: `body-md` for inputs and `body-sm` for helper text, diagnostics and notes.
- **Labels** (`label-md`, 12px, 0.08em tracking, uppercase spacing) for:
  - field labels (GAME, CHARACTER, NOTATION)
  - button text
  - arcade section headers (KAZUYA, NINA)

**JetBrains Mono** is used for notation and technical details. It was chosen over Azeret Mono because combo notation depends on small symbols (`~ , + > : < * !`). JetBrains Mono draws them large and distinct, separates `1` / `l` / `I` and `0` / `O`, and keeps the comma clearly different from the period.

- `notation` (14px, weight 500) for the notation textarea, the original-notation block and the raw notation in generator results.
- `label-sm` (12px, 0.12em tracking) for game badges, chips, result counts ("36 combos · 2 routes × 9 fillers × 2 enders") and the guide source credit.

Inside the arcade display, labels use **Archivo SemiCondensed** (width 87.5%), so long event captions such as "WALL SPLAT" or "TAG ASSAULT" fit compact tiles. They scale with the user-selected command size:

- `arcade-label` is about 0.4 × size, weight 800.
- `arcade-caption` is about 0.2 × size, weight 700.

### Font loading and export

- **Loading.** Load both families from Google Fonts:
  - Archivo as a variable font with both axes: `wdth` 62–125 and `wght` 100–900.
  - JetBrains Mono at weights 400, 500 and 700.
  - Use `font-display: swap`.
- **Fallbacks:**
  - Archivo → `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
  - JetBrains Mono → `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
- **Text measurement.** The arcade layout measures text widths, so measure only after the fonts have loaded (`document.fonts.ready`). Otherwise label tiles may be sized for the fallback font.
- **Export.** SVG and PNG exports must **embed the fonts** as `@font-face` rules with base64 data inside the SVG `<style>`. Subset them to the characters used when possible. An exported image cannot load web fonts on its own, and without embedding it falls back to a different typeface.

Abbreviations are always shown exactly as written (`EWGF`, `B!`, `W!`, `TA!`, `cd`).

## Layout & Spacing

- **Full width.** The app has no max-width container. Content spans the viewport with 8px gutters on mobile and 16px on desktop, so long combos have room before wrapping.
- **Sticky top bar.** On the left: the logo, which is the tilted arcade button cluster with all four buttons lit (see Components), plus the "Tekken Input Lab" wordmark. On the right: a primary "+ New" button. The bar sits on the neutral background with a 1px bottom border.
- **Screens are a single column.** Within a screen, use responsive grids: 2–4 columns of fields in forms, and 2 columns of combo cards on desktop (1 on mobile).
- **Spacing:**
  - `xs` (8px) and `sm` (16px) inside components.
  - `sm-plus` (24px) between form sections.
  - `md` and above only for empty states and page-level breathing room.
- **Arcade display wrapping.** Commands flow left to right and wrap only after a separator. A line never starts with `,`, `~`, `>` or a closing bracket. Each TTT2 character section starts a new line under its header.

## Elevation & Depth

Flat. Hierarchy comes from tonal steps (neutral → surface → muted-surface) and 1px borders. Do not use shadows, glows, gradients or glass. Modals use a black 70% backdrop with no blur. Toasts are bordered surfaces.

## Shapes

- **4px (`rounded.md`)** is the default for buttons, cards, inputs and the arcade display container.
- **8px (`rounded.lg`)** for arcade input tiles, event badges and modals.
- **Full pills** only for chips and filter tags.
- **2px** for game badges ("T8", "TTT2").
- **Arcade buttons** are circles in a tilted 2×2 cluster: the right column sits higher, like a real arcade panel. Their thick black outlines merge into one silhouette. **Direction arrows** are chunky block arrows with rounded joins.

## Components

### Chrome

- **Buttons:**
  - Primary: orange fill, dark label-md text, 40px tall. Used for "+ New", "Save combo" and "Use this combo".
  - Secondary: muted-surface fill with a 1px border. Used for Edit, Duplicate, Copy notation, Export SVG, Export PNG, Import JSON and Export JSON.
  - Danger: dark red tint with orange-red text. Used for Delete.
  - Link: transparent, muted, underlined. Used for Cancel, "Clear filters" and "← Library".
  - Small variant: 30px tall, for action rows.
  - Hover changes only the fill tone, with no motion.
- **Inputs, selects and textareas:** muted-surface fill, 1px border and off-white text. On focus, the border turns orange; there is no glow. Each field has a `label-md` muted label above it and optional `body-sm` helper text below. Comboboxes suggest the game's roster but accept any name.
- **Cards:** surface fill, 1px border, 4px radius and 16px padding. Combo cards are fully clickable and show a visible focus outline. They contain the name, a metadata row (game badge, characters, difficulty, damage, warning count), a favorite star, a mini arcade preview and tag chips.
- **Chips:** border-strong fill, `label-sm`, full radius. Active filter chips are orange with dark text.
- **Tag input:** removable chips inside an input-styled container. Enter or comma adds a tag; × removes one.
- **Diagnostics list:** each item shows a ⚠ (warning color) or ℹ (muted), a small code chip with the offending notation, and the message.
- **Modal (delete confirmation):** surface panel, 8px radius, title, body text, then Cancel (link) and Delete (danger).
- **Toasts:** bottom-center bordered surface panels. Errors use `role=alert`, stay longer and include a × button.
- **Collapsible panels** (`details`): surface fill with a 1px border and a bold summary line. Used for the TTT2 generator and the notation reference.

### Arcade display

**Reference look:** the editor's live preview (`//*[@id="root"]/div[1]/main/form/section/div[2]`). Captures:
- `docs/reference/combo-preview-t6.png`
- `docs/reference/combo-preview-t8.png`
- `docs/reference/combo-preview-ttt2.png`

**Every** combo view uses this same look at different sizes: library cards, the editor preview, generator results, combo details and exports. Do not invent a second style. One difference from the captures: the button cluster inside the tiles follows the tilted geometry and colors defined above (the captures show an older straight grid).

What defines the reference look:
- **A command strip, not a table.** Commands sit on one horizontal line, left-aligned and vertically centered, at a consistent height. Lines wrap only after a separator. It reads like the in-game command list.
- **One dark panel** around the whole combo: a slightly lifted dark fill, a 1px border, a 12px radius and very small inner padding, so the commands use almost the full width.
- **One tile per input.** Everything pressed at the same moment shares a single tile, in this order: stance/state chips, the arrow or motion pill, a small gray "+", the button cluster, then TAG / HOLD / ×N. The tile is a subtle dark tile with a 1px border and an 8px radius. Consecutive inputs are separate tiles with a small gap.
- **Labels stand alone, without a tile:**
  - Named moves (`EWGF`): solid violet, white bold text.
  - Movements (`dash`, `SS`, `SSL`): solid sky blue.
  - Combo events: solid colored, with a big abbreviation and a tiny uppercase caption (`B!` / BOUND, `T!` / TORNADO, `TA!` / TAG ASSAULT).
- **Separators are quiet glyphs between tiles:**
  - `,` small gray chevron
  - `~` gray wave
  - `:` yellow "JF"
  - `<` gray "delay"
  - `>` solid green triangle, the strongest separator
  - whitespace: just a gap
- **Motions** (`qcf`, `cd`): a darker inset pill inside the tile, with mini arrows on top and the abbreviation below.
- **Optional parts** (`[dash]`, `(3,)`) are wrapped in dashed gray brackets.
- **TTT2 sections:** each character's section starts on a new line, under a small uppercase, letter-spaced gray header (KAZUYA, NINA). A Tag Assault boundary adds a green "TAG ASSAULT" pill before the name.
- **Warnings** add a dashed amber outline to the affected tile or label only. The rest of the strip is unchanged.

- **Container:** a surface card with a 1px border. Size is adjustable from 20 to 72px per button cluster, and there is an "Expand named moves" toggle.
- **Input tile:** a subtle dark tile (#161a23, #2a303d border, 8px radius) holding, in order: prefix chips (WS, FC, ZEN, H.), then a direction arrow or motion pill, then a small gray "+", then the 2×2 button cluster, then a TAG pill and a HOLD tag when present.
- **Button cluster (2×2 — 1 2 / 3 4, tilted):**
  - **Geometry.** Let D be the center-to-center distance:
    - Buttons 1 (top-left) and 3 (bottom-left) form the left column; 2 (top-right) and 4 (bottom-right) form the right column. Horizontal and vertical spacing are both D.
    - The **right column is raised by 0.14 × D**, so each row rises about 8° from left to right. The columns stay vertical; do not rotate the whole cluster.
    - The button radius is 0.41 × D, so the buttons almost touch.
  - **Outline.** Each button has a black outline about 35% of its radius thick. The outlines merge into one continuous black silhouette, so no background shows between buttons.
  - **Fill.** Pressed buttons use their own flat color (pink, teal, lavender blue, coral red). Unpressed buttons are dark gray inside the same black outline.
  - No numbers.
  - Simultaneous presses (`1+2`) light up several circles in ONE cluster.
  - Sequential presses (`df+1,2`) are ALWAYS separate tiles.
  - The same tilted cluster is used everywhere: the arcade display, combo cards, generator results and the logo (with all four buttons lit).
- **Motion pill (qcf, hcb, cd):** a rounded dark pill with mini arrows on top and the abbreviation below.
- **Event badge:** a solid colored tile with the abbreviation large (`B!`) and a caption below (`BOUND`).
- **Named move:** a solid violet tile with the move name (`EWGF`). It is never expanded unless the user enables "Expand named moves", in which case the inputs appear inside gray brackets after the label.
- **Separators:**
  - `,` small gray chevron
  - `~` gray wave
  - `:` yellow "JF"
  - `<` the word "delay"
  - `>` green triangle
  - whitespace a small gap
- **Optional inputs** `[ ]` / `( )`: dashed gray brackets around the steps.
- **Warnings:** any command covered by a warning gets a dashed amber outline. Unknown notation gets a dashed red outline around the raw text.
- **TTT2 section headers:** uppercase character name in `label-md`, muted. A Tag Assault boundary shows a green "TAG ASSAULT" pill before the name. Unassigned sections read "UNASSIGNED" in the warning color.

### TTT2 generator result

A bordered surface card containing:

- A meta row: "#1 · Starter: EWGF · 4 hits before TA (est.) · Bound: db+2", with a primary "Use this combo" button on the right.
- The arcade display, split into character sections.
- The raw notation in JetBrains Mono.
- An amber "to verify" list.

The panel ends with a "Show more" secondary button and the guide's source credit in `label-sm`.

## Do's and Don'ts

- Do keep the chrome sparse: one orange accent, dark tonal steps and thin borders.
- Do keep the arcade colors exactly as specified. They carry meaning (which button, which event), and players read them like the in-game command list.
- Do keep sequential inputs visually separate and simultaneous inputs in one cluster. This is the most important rule of the display.
- Do show abbreviations exactly as written, and show warnings without hiding or rewriting the user's notation.
- Do use JetBrains Mono for notation and technical metadata, and Archivo everywhere else (Condensed width for the large headlines and arcade labels).
- Do embed both fonts in exported SVG/PNG files.
- Don't use orange text on orange fills, glows, gradients, glass or decorative shadows.
- Don't use the arcade or event colors for chrome (buttons, links, chips), and don't recolor the arcade display to match the brand accent.
- Don't add a third font family, use a display or "gaming" font for body text or notation, or set notation in a proportional font.
- Don't round corners aggressively; pills only for chips and the TAG indicator.
- Don't draw the button cluster as a straight square grid, rotate it as a whole, or remove the black outline silhouette. The raised right column is part of the identity.
- Don't add dashboards, charts or motion-heavy effects; the product is a focused practice tool.
