# TTT2: siglas, símbolos y cómo se hacen

Revisión cruzada de dos fuentes contra el parser de la app:

- **ttt2combo.kagewebsite.com**: página *Help & Legend* y los **2,604 combos** publicados (todas las parejas). Cada combo trae íconos con nombre (por ejemplo, el ícono `kde` se llama "Setsunagake") y la notación en texto.
- **Guía "TTT2 BNB Combos"** (el Google Doc compartido; es la misma que ya viene en `src/data/ttt2/ttt2-bnb-combos.md`).

## Resultado

| Fuente | Sin advertencias antes | Sin advertencias ahora |
|---|---|---|
| Combos de kagewebsite (dialecto `kage-ttt2`) | 2,410 / 2,604 (92.5%) | **2,579 / 2,604 (99.0%)** |
| Piezas de la guía | 1,379 / 1,508 (91.4%) | **1,442 / 1,508 (95.6%)** |

Lo que todavía avisa es, en su mayoría, prosa del autor de la guía ("or", "wall grab", "Not listed in October master") o ambigüedades reales (`12` sin `+`). Es correcto que avise.

## 1. Símbolos de la web (Help & Legend)

| Símbolo en la web | Significado | En la app |
|---|---|---|
| `,` | Separa dos movimientos | Igual (`,` o `>`) |
| espacio | Inputs seguidos dentro de un movimiento: `d/f 1 4` es df+1 y luego 4 | Se lee como secuencia, con aviso informativo |
| `*` | Mantener presionado | Igual |
| `<` | Retrasar el input (delay) | Igual |
| `:` | Just frame (timing exacto) | Igual |
| `~` | Deslizar el dedo entre botones | Igual |
| `( … )` | Input que puede faltar; la web lo usa también para `( W! )` | Opcional |
| `;` | Cambio automático de personaje en el Tag Assault | `;` = TA solo en el dialecto `kage-ttt2` |
| `F`, `D/F`, `U/F`… (mayúsculas) | Dirección mantenida | Igual |
| `N` | Soltar la palanca (neutral) | Igual |
| `qcf/qcb`, `hcf/hcb` | Cuarto y medio círculo | Igual |
| `fcf/fcb` | Círculo completo | **Nuevo** |
| `5` | TAG | Igual |
| `2+5` | Tag Throw | Se dibuja como 2+TAG |
| `1+2+5` | Direct Tag Assault | Se dibuja como 1+2+TAG |
| `1+2+3+4` | Charge (cargar) | Se dibuja como 4 botones |
| `any` | Cualquier botón menos TAG | Sin soporte (3 combos) |
| `LP` | Low parry: tocar df contra un low; deja al rival en bound | Igual |
| `iWS` | Agacharse y levantarse rápido | Igual |
| `cc` | Crouch cancel: agachado, arriba o dash rápido | Igual |
| `W!` / `WB!` / `F!` / `BB!` | Wall Splat / Wall Break / Floor Break / Balcony Break | Igual |

## 2. Siglas nuevas o corregidas

"Cómo se entra" es lo que aparece justo antes de la sigla en los combos de la web (texto tal cual lo escribe la web, con espacios). Es evidencia de uso, no la lista de movimientos del juego.

### Movimientos con nombre

| Sigla | Significado | Personaje | Notas |
|---|---|---|---|
| `HS` | Hell Sweep (f,n,d,df+4) | Devil Jin, Kazuya, Heihachi, Jin | La guía escribe `CH HS,4 B!`. En TTT2 nunca es Heat Smash |
| `TGF` | Thunder God Fist | Heihachi | Antes la etiqueta decía solo "TGF" |
| `OTGF` | Omen Thunder God Fist | Heihachi | `EWGF > OTGF > EWGF` |
| `WGF` | Wind God Fist | Armor King | La web lo usa en combos de Armor King |
| `Demoman` | Demolition Man | Paul | Ender de la guía |
| `Debugger` | Debugger | Prototype Jack | Ender de la guía |

### Atajos de dirección y movimiento

| Sigla | Significado | Ejemplo |
|---|---|---|
| `bf` | b,f | Jin `bf+2,1`, Heihachi `bf+2` |
| `fb` | f,b | Lars `fb+2,1 B!` |
| `fn` | f,n | Lee `fn,3,4` |
| `microdash`, `wavedash`, `backdash` | Igual que `micro`, `WD`, `BD` | Ahora se aceptan escritos completos |

### Stances

| Sigla | Significado | Personaje | Cómo se entra (según la web) |
|---|---|---|---|
| `KDE` = `SET` | Setsunagake | Kunimitsu | `f 4 F` (f+4 manteniendo F). La guía escribe SET, la web KDE |
| `DUS` | Duston | Kunimitsu | `d 1+2` |
| `GEN` | Genjutsu Stance | Jun, Unknown | `1 b 1+2`, `f f 1+2` |
| `IZU` | Izumo | Jun, Unknown | `f 1+2 ~` |
| `KNK` | Kinkei Dokuritsu | Leo | `BOK 4`. **Corregido**: antes decía "Kenpo stance" |
| `BOK` | Bokuho | Leo | `f 3 D`, `KNK 1 D` |
| `KNP` | Kenpo Step | Feng | |
| `STC` | Shifting Clouds | Feng | |
| `CRA` = `CRN` | Art of Crane | Lei | `u/f 3` |
| `DGN` | Art of Dragon | Lei | desde `SNA 2 f` |
| `SNA` | Art of Snake | Lei | `d 4 U` |
| `PAN` | Art of Panther | Lei | desde `SNA d` |
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
| `DEN` / `SEN` | Dynamic Entry / Silent Entry | Lars | `f 3` / `d/b 2 F`. **Corregido**: TTT2 acepta DEN/SEN además de DE/SE |
| `RDS` | Rain Dance Stance | Xiaoyu, Miharu | Antes la etiqueta decía "RDS stance" |

## 3. Siglas sin significado confirmado

Se aceptan (no dan advertencia) pero se muestran con la propia sigla, porque ninguna fuente dice qué significan:

- **Kunimitsu:** `MUS` (la web tiene ícono pero sin nombre; aparece después de `f f 3`).
- **Lei:** `KNDs`, `PLDs`, `FCDs`, `SLDs`. Por el contexto parecen posiciones en el suelo.
- **Guía:** `ISW` (Jaycee/Michelle), `CDc` (Dragunov), `GS` (Armor King/King), `DU` (Armor King), `VAN` (Raven), `BOOT` (True Ogre), `HHS` (Ganryu), `PAN`/`PAD` (Dr. B), `AGF` (Alex/Roger).

Si conoces alguno, basta con cambiar la etiqueta en `src/notation/characters/dictionary.ts`.

## 4. Pendiente (no implementado)

| Caso | Dónde | Ocurrencias |
|---|---|---|
| `<` al inicio después de `;` (`; < DEN 1`) o al final (`MTS <,`) | web | 7 |
| `,,` (coma doble, error de tipeo) | web | 7 |
| `any` (cualquier botón) | web | 3 |
| `+` junto a un opcional: `(1)+4`, `df+(1),3` | guía | 5 |
| Agarres escritos en prosa: `groundgrab`, `wallgrab`, `Air Throw` | guía | 8 |
| `FCdf+2` (FC pegado a la dirección) | guía | 1 |
