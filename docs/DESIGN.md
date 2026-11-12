---
name: Frame Zero
colors:
  surface: '#121315'
  surface-dim: '#121315'
  surface-bright: '#38393b'
  surface-container-lowest: '#0d0e10'
  surface-container-low: '#1b1c1e'
  surface-container: '#1f2022'
  surface-container-high: '#292a2c'
  surface-container-highest: '#343537'
  on-surface: '#e3e2e5'
  on-surface-variant: '#e4beb3'
  inverse-surface: '#e3e2e5'
  inverse-on-surface: '#303033'
  outline: '#ab897f'
  outline-variant: '#5b4039'
  surface-tint: '#ffb59f'
  primary: '#ffb59f'
  on-primary: '#5f1600'
  primary-container: '#ff571f'
  on-primary-container: '#531200'
  inverse-primary: '#af3000'
  secondary: '#c8c6c2'
  on-secondary: '#30312d'
  secondary-container: '#474743'
  on-secondary-container: '#b6b5b0'
  tertiary: '#bfc7d5'
  on-tertiary: '#29313c'
  tertiary-container: '#89919e'
  on-tertiary-container: '#222a35'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb59f'
  on-primary-fixed: '#3a0a00'
  on-primary-fixed-variant: '#862300'
  secondary-fixed: '#e4e2dd'
  secondary-fixed-dim: '#c8c6c2'
  on-secondary-fixed: '#1b1c19'
  on-secondary-fixed-variant: '#474743'
  tertiary-fixed: '#dbe3f1'
  tertiary-fixed-dim: '#bfc7d5'
  on-tertiary-fixed: '#141c26'
  on-tertiary-fixed-variant: '#3f4753'
  background: '#121315'
  on-background: '#e3e2e5'
  surface-variant: '#343537'
typography:
  headline-display:
    fontFamily: Chakra Petch
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.4px
  headline-lg:
    fontFamily: Chakra Petch
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.3px
  headline-lg-mobile:
    fontFamily: Chakra Petch
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 30px
    letterSpacing: -0.2px
  headline-md:
    fontFamily: Chakra Petch
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 29px
    letterSpacing: 0px
  headline-sm:
    fontFamily: Chakra Petch
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0px
  headline-xs:
    fontFamily: Chakra Petch
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0px
  body-lg:
    fontFamily: Chakra Petch
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0px
  body-md:
    fontFamily: Chakra Petch
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0px
  body-sm:
    fontFamily: Chakra Petch
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0px
  label-lg:
    fontFamily: Chakra Petch
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-md:
    fontFamily: Chakra Petch
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Rajdhani
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.12em
  notation:
    fontFamily: Rajdhani
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: 0px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 16px
  gutter-mobile: 8px
  margin: 16px
  margin-mobile: 8px
  space-2xs: 4px
  space-xs: 8px
  space-sm: 16px
  space-md: 24px
  space-lg: 58px
  space-xl: 94px
  space-2xl: 108px
---

## Brand & Style

The design system embodies technical minimalism, high-density telemetry, and competitive tournament engineering. Designed for fighting game theorycrafters, lab monsters, and tournament competitors, the interface mimics the utilitarian precision of competitive fighting stick hardware, tournament control pods, and real-time motion capture analysis tools.

The visual style is strictly brutalist-functionalist: high contrast, zero skeuomorphic lighting, zero blur-driven glassmorphism, and zero drop shadows. Aesthetic discipline is maintained through razor-sharp 1px structural hairline borders, condensed display typography, and a decisive split between chrome infrastructure and data telemetry.

The user interface delivers instant legibility under fast-scanning conditions. The chrome stays quiet and monochromatic, illuminated only by a volatile electric orange accent, giving complete optical priority to the complex multicolor grammar of the arcade input stream.

## Colors

The system operates under an absolute dual-layer architecture: **Chrome Space** and **Arcade Space**. The system is permanently dark-mode exclusive.

### Chrome Architecture
- `neutral` (`#08090b`) serves as the base canvas and sticky navigation foundation.
- `surface` (`#0e1013`) isolates primary structural cards, modals, and container shells.
- `muted-surface` (`#21262d`) hosts interactive form inputs, secondary action grounds, and deep structural levels.
- `primary` (`#ff571f`) is reserved for decisive interactive actions: focused border strokes, active toggle pills, and primary execute triggers. It must never be used for passive decorative tinting.

### Arcade Space Architecture
The arcade layer is a fixed-chroma visualization language representing execution telemetry. These functional tokens never adapt to UI themes:
- Four-button cluster: Button 1 (`#de7fb7`), Button 2 (`#29b1a9`), Button 3 (`#7996ca`), and Button 4 (`#f14b46`). Unpressed nodes use flat `#3d4a4c`.
- Movement telemetry: Direction arrows use `#f4f2ef` with an `#15191d` boundary, shifting their perimeter to `#ffd166` under held states.
- Mechanics & Hazards: Combat events (Bound, Screw, Tornado, Wall Splats) utilize distinct, pre-allocated engine hues paired with pure white `#ffffff` micro-labels.

## Typography

The typographic hierarchy uses **Chakra Petch** for high-impact display architecture, section demarcation, and UI control labels, paired with **Rajdhani** for raw input syntax, engine diagnostics, frame statistics, and game metadata badges.

### Typographic Implementation Rules
- Structural uppercase: All section headers, button texts, metadata badges, and form labels are styled in uppercase with intentional tracking (`0.04em` to `0.12em`).
- Telemetry & Notation: Textareas, raw sequence inputs, frame data, and credit hashes are rendered in Rajdhani to ensure strict columnar character alignment.
- Arcade Glyph Scaling: Typographic elements inside rendered arcade tiles scale relative to the base cluster diameter (`D`):
  - Primary Event Tags (`B!`, `W!`): Font size is computed as `0.4em`, weight `800`, line height `1`.
  - Subtext Badges (`WALL SPLAT`): Font size is computed as `0.2em`, weight `700`, tracking `0.04em`, line height `1`.
- Vector Export Parity: Any vector graphics or canvas exports containing notation labels must embed the complete font payloads inside an SVG `<style>` tag to guarantee rendering fidelity across operating systems without local font dependencies.

## Layout & Spacing

The layout adopts a raw, full-width edge-to-edge system. Layout containers do not use arbitrary max-width constraints (`max-width: none`), letting telemetry tables and sequence strips expand across the viewport.

### Grid Rhythm & Adapters
- **Mobile (< 768px)**: Gutters and outer canvas margins collapse to `8px`. Form layouts shift to a single-column stack. Sequence strips enable horizontal touch-panning with masked edge overflows.
- **Desktop (≥ 768px)**: Canvas margins and gutters expand to `16px`. Card arrays operate on 2-column or 4-column balanced CSS grids. Form fields align into structured modular side-by-side matrices.

### Micro-Spacing Scale
- `space-2xs` (`4px`): Structural inset for arcade clusters and compact metadata badges.
- `space-xs` (`8px`): Inset for status toasts, compact button vertical padding, and tight token flows.
- `space-sm` (`16px`): Standard internal container padding for cards, primary interactive elements, and input groups.
- `space-md` (`24px`): Separation between major logical sections within a single form or card.
- `space-lg` (`58px`): Macro empty-state buffers and intermediate layout regions.
- `space-xl` (`94px`) and `space-2xl` (`108px`): Page-level vertical section bounds.

## Elevation & Depth

Visual hierarchy uses a zero-shadow, planar tonal layering system. Drop shadows, glows, blurs, and skeuomorphic gradients are not permitted.

### Depth Hierarchy
1. **Canvas Layer (`#08090b`)**: The deepest structural baseline. Houses application background surfaces and fixed top navigation rails.
2. **Structural Enclosures (`#0e1013`)**: Level-1 cards, sequence viewports, inspection drawers, and modals. Separated from the canvas via a hairline perimeter of `1px solid #333a45`.
3. **Interactive & Recessed Grounds (`#21262d`)**: Form inputs, textareas, and secondary actions. This layer provides a tactile inset look while remaining flat.
4. **Command Tile Canvas (`#161a23`)**: Specialized dark-blue tone that sets arcade visual tokens apart from standard UI surfaces. Bound by a `1px solid #2a303d` border.

### Overlays & Focus States
- **Backdrop Overlays**: Modals use a flat `rgba(0, 0, 0, 0.70)` veil with zero backdrop-filter blur.
- **Interaction Borders**: Interactive focus replaces shadows with a crisp `1px solid #ff571f` stroke. No box-shadow halos, spread rings, or glow effects are applied.

## Shapes

The design system uses a structured, moderately rounded shape language:

- **Sharp (`0px`)**: Link buttons and edge-docked utility panels.
- **Compact (`4px`)**: Game identification tags and dense metadata chips (`label-sm`).
- **Base (`8px`)**: Buttons, cards, form inputs, notation fields, toasts, and outer command containers.
- **Enclosure (`12px`)**: Modals, arcade input tiles, and standalone combat event badges.
- **Full Pill (`9999px`)**: Filter chips, tag indicators, and mechanical states (`TAG`, `HEAT`).

All component edges use strict, flat vector strokes with no pseudo-3D edge highlights or bevels.

## Components

### 1. Arcade Button Cluster (Mathematical Formula)
The core component of the notation engine is the 2×2 button cluster, which uses precise geometric coordinates:
- **Base Metric ($D$)**: Scales dynamically from `20px` to `72px`.
- **Button Radius**: Calculated as $R = 0.41 \times D$.
- **Button Offset (Japanese Arc Tilt)**: Columns remain vertical. The right column (Buttons 2 and 4) is raised vertically by $-0.14 \times D$, creating an ergonomic $\approx 8^\circ$ row climb from left to right.
- **Merged Silhouette**: A solid background outline (`#000000`) with thickness $0.35 \times R$ fuses behind all four buttons into a single continuous silhouette with no interior voids.
- **Color Fills**:
  - Button 1 (Top Left, LP): `#de7fb7`
  - Button 2 (Top Right, RP): `#29b1a9`
  - Button 3 (Bottom Left, LK): `#7996ca`
  - Button 4 (Bottom Right, RK): `#f14b46`
  - Inactive / Unpressed: Flat `#3d4a4c`
- **Simultaneous vs. Sequential Execution**: Simultaneous inputs (`1+2`, `3+4`) illuminate multiple nodes within a single cluster. Sequential inputs (`df+1, 2`) render as distinct, individual tiles separated by syntactic spacing glyphs.

### 2. Directional Arrows & Mechanics
- **Direction Arrows**: Chunky `#f4f2ef` block shapes bound by an `#15191d` stroke. When marked as a held input, the outline turns to `#ffd166`.
- **Step / Stage Separators**: Stage shifts (`>`) render as solid `#16d61f` right-pointing triangles.
- **Syntax Glyphs**: Chevron commas (`,`), waves (`~`), and delay markers (`<`) render in `#9aa3b5`. Just Frame inputs (`:`) render as bold yellow `JF` indicators.
- **Event Badges**: Rendered with an 8px radius, white text, and designated mechanic backgrounds: Bound (`#f97316`), Screw (`#06b6d4`), Tornado (`#14b8a6`), Wall Splat (`#eab308`), Wall Break (`#a855f7`), Tag Assault (`#16a34a`), and Rage (`#dc2626`).
- **Syntax Diagnostic Tiles**: Unparsed strings display a dashed red border (`#ef4444`). Ambiguous sequences show a dashed amber border (`#f5a524`).

### 3. Buttons & Action Triggers
- **Primary Button**: Height `40px`, padding `10px 16px`, background `#ff571f`, color `#08090b`, radius `8px`, font `label-md`. Hover shifts background to `#ff5f2a`.
- **Secondary Button**: Height `40px`, padding `10px 16px`, background `#21262d`, border `1px solid #333a45`, color `#e9e7e2`. Hover shifts background to `#21262e`.
- **Destructive Button**: Background `#3a1410`, border `1px solid #ff5a1f`, color `#ff5a1f`.
- **Small Button**: Height `30px`, padding `6px 10px`, font `label-md`.

### 4. Input Fields & Syntax Textareas
- **Text Input**: Height `40px`, padding `10px 12px`, background `#21262d`, border `1px solid #333a45`, color `#e9e7e2`, radius `8px`. Focus states replace border with `#ff571f`.
- **Notation Textarea**: Padding `12px`, background `#21262d`, border `1px solid #333a45`, font `Rajdhani` (`14px`), line height `22px`. Focus shifts border to `#ff571f`.

### 5. Cards & Data Panels
- **Structure**: Surface `#0e1013`, border `1px solid #333a45`, radius `8px`, padding `16px`.
- **Header**: Uppercase `headline-xs` accompanied by a `label-sm` metadata badge.
- **Grid Reflow**: Single column on mobile viewports, reflowing to a multi-column grid on desktop layouts without container maximums.

### 6. Chips & Filter Badges
- **Inactive Chip**: Height `28px`, padding `6px 10px`, background `#21262e`, border `1px solid #333a45`, radius `9999px`, font `label-md`, color `#8b93a0`.
- **Active Chip**: Background `#ff571f`, border `1px solid #ff571f`, color `#08090b`, font `label-md`.