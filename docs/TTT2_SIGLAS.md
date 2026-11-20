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
- **Guía:** `ISW` (Jaycee/Michelle, Armor King, King), `GS` (Armor King), `VAN` (Raven), `HHS` (Ganryu), `PAN`/`PAD` (Dr. B). Buscados en las listas de movimientos de TTT2 de ludo.guide (nov. 2026) sin coincidencia.

Si conoces alguno, basta con cambiar la etiqueta en `src/notation/characters/dictionary.ts`.

### Resueltas con las listas de movimientos de TTT2 (ludo.guide, nov. 2026)

| Sigla | Significado | Personaje | Comando | Confianza |
|---|---|---|---|---|
| `DU` | Dark Upper | Armor King | `f,n,d,df+2` (juggle) | Confirmada |
| `GS` | Giant Swing | King | `f,hcf+1` | Confirmada (para Armor King no aparece; su `f,hcf+1` se llama Armlock Swing) |
| `CDc` | Crouch Dash cancel | Dragunov | `f+3~d/f~u` (la propia guía lo escribe así) | Confirmada |
| `MUS` | Musasabi Flip | Kunimitsu | `f,f+3`; `MUS 2` = Ankle Slashout (juggle) | Confirmada |
| `groundgrab` | Agarre al rival en el suelo | Armor King | `d/b+1+3` o `d/b+2+4` | Confirmada |
| `groundgrab` | Agarre al rival en el suelo | King | `d/b+2+4` en cualquier posición; boca arriba con los pies hacia King también `D/B+2+4` (Figure-4 Leglock) y `D/F+2+4` (Crotch Dive) | Confirmada |
| `groundgrab` | Airlift (hace juggle) | Marduk | `d/b+1+3` en cualquier posición; `d/b+2+4` según la posición | Confirmada |
| `wallgrab` | Angry Ape | Marduk | `1+3`, `2+4` o `f,f+1+2` | Confirmada |
| `wallgrab` | Agarre en la pared | King | Sin comando confiable (la página lista Shining Torpedo con entradas dudosas) | Sin comando |

Verificado además con Tekken Wiki (Fandom), listas de TTT2 de Armor King (versión en español) y Kazuya, copia guardada en nov. 2026:

- **Agarres al suelo de Armor King:** coinciden. Con el rival boca arriba, `d/b+1+3` (o `d/b+2+4`) da Seesaw Whip o Standing Heel Hold si estás del lado de los pies, Enzui Knee o Wake-Up Lariat si estás del lado de la cabeza, y Turn Over o Back Mount si estás de costado. `d/b+2+4` con el rival tumbado también puede ser Stand Up, que lo levanta sin daño.
- **Agarres aéreos de Armor King:** Muscle Driver `f,b,d/b,d,d/f,f+1` y Running Cross Driver `f,f,f+2+4`.
- **`DU`:** el comando `f,N,d,d/f+2` coincide. La wiki lo llama "Palm Upper"; la versión cargada con Ki es "Charge Dark Upper".
- **Sin datos en la wiki:** no tiene Giant Swing, `ISW`, `GS` ni agarres de pared para Armor King, y no marca qué movimientos hacen Bound. Por eso no confirma que el `d/b+2` (Lion Slayer) de Kazuya haga Bound. La única evidencia son las dos rutas de la guía que escriben `db+2 B!`.

Probables, **no** cargadas en el diccionario porque la fuente no lo confirma del todo:

| Sigla | Posible significado | Personaje | Comando | Por qué no es seguro |
|---|---|---|---|---|
| `AGF` | Animal Godfist | Alex, Roger Jr. | `f,n,d,df+1` | Coinciden las iniciales; ninguna fuente lo usa como ender |
| `BOOT` | Booter | True Ogre | `f+3+4` | La página es la de Ogre, no la de True Ogre |
| `MAD+1` | Mad Pain Stance → 1 (Mosquito Thumbing) | Dr. B | MPS se entra con `b+1,2` al conectar | Lectura del "+1" inferida |
| `Air Throw` | Agarre aéreo | Jinpachi | No encontrado | Ninguna fuente de TTT2 lo lista |

### Agarres aéreos (rival en el aire, como cierre de combo)

Según las listas de TTT2 de ludo.guide (nov. 2026); Armor King también coincide con Tekken Wiki. En la guía aparecen como `Air Throw` (Jinpachi), `f,F+1+2(any airgrab)` (Marduk) y `f+4,1,2,4*(with airgrab)` (filler de Kunimitsu para que el compañero agarre en el aire).

| Personaje | Comando | Nombre |
|---|---|---|
| King | `1+3` / `2+4` / `d+1+3` o `d+2+4` | Inverted Leg Lace / Leg Whipdown / Catching Ankle Breaker |
| Armor King | `f,hcf+1` (= `f,b,d/b,d,d/f,f+1`) / `f,f,f+2+4` | Muscle Driver / Running Cross Driver (ludo: Running Cross Bomb) |
| Marduk | `1+3` / `2+4` / `f,f+1+2` | Whip Slam / Whiparound Toss / Scoop Suplex (el `f,F+1+2` de la guía) |
| Jinpachi | `1+3` o `2+4` / `u/f+3+4 1,1,2:2` | Raging Tempest / Air Transmigration |
| Jaycee | corriendo `2+4` | Burning Hammer |
| Michelle | corriendo `2+4` | Crucifix Bomb |
| Lars | corriendo `2+4`, o `DE 2+3` | Rejection |
| Baek | `d/f+3+4` | Hawk's Talons |
| Ogre | `hcb+2` | Epsilon (agarra al conectar o en el aire) |

Además, Armor King tiene agarres aéreos de pareja que se cierran con la entrada de tag (`5`), uno por compañero: King `qcb+1+2,5`, Jaycee `1+3,5`, Kuma/Panda `2+4,5`, Marduk `f,n,d,d/f+1+4,5`. Sin página en ludo.guide: Christie, Tiger, Bryan, Steve, Feng, Miharu, True Ogre.

### Cambios a la guía incluida (`src/data/ttt2/ttt2-bnb-combos.md`)

La copia que trae la app ya no es idéntica al documento original:

- **Kazuya:** se agregó `B!` al `db+2` de `EWGF > 3,1,4 > db+2 > CD+4,1` y de `CH df+2 > 1,2,4,3 > db+2 > CD+4,1`. Otras dos rutas de la guía ya marcaban `db+2 B!`.
- **EWGF de Kazuya:** agregado como `Additional Ender` de Kazuya (suelo abierto), remate relanzador a pedido; no está en la guía original, sin probar.
- **Agarres aéreos:** se agregaron como `Additional Air Ender` con su condición. Armor King: `f,hcf+1` y `fff+2+4`. King: `1+3`, `2+4` y `d+1+3`. El generador solo los ofrece cuando el ender lo hace el personaje que inició el combo, y los marca "a verificar".

## 5. Enders sugeridos del movelist (heurística)

Fuente de datos: movelists de TTT2 de Tekken Wiki (Fandom), bajados por la API de MediaWiki a `src/data/ttt2/movelists-src/*.wikitext` y parseados a `src/data/ttt2/movelists.json` con `scripts/ttt2/parseMovelists.mjs` (`node scripts/ttt2/parseMovelists.mjs` regenera).

- El generador puede sugerir enders extra para el personaje que **inicia** el combo (`enderBy = point`, solo suelo abierto), tras activar el interruptor "Suggest enders from the starter's move list" en Advanced (apagado por defecto).
- Heurística (`src/ttt2/candidateEnders.ts`): candidato = move cuyo último golpe es mid o low, **o** un move con el que el personaje ya remata una ruta de la guía (captura lanzadores high como `cd3`). Excluye los enders ya confirmados y los comandos que requieren estado especial (rival en el suelo, stance, transformación). Todo marcado "a verificar"; tope 12.
- Los movelists **no** marcan Bound/Juggle, así que es un sugeridor con falsos positivos, no verdad absoluta.
- Resolver de nombres (`src/ttt2/movelistData.ts`): cruza el nombre corto del roster con la clave larga del wiki (p. ej. Marduk → "Craig Marduk", Bob → "Robert Richards", Ancient Ogre → "Ogre"). Cubre todo el roster salvo **Mokujin** (sin movelist en Fandom).

## 4. Pendiente (no implementado)

| Caso | Dónde | Ocurrencias |
|---|---|---|
| `<` al inicio después de `;` (`; < DEN 1`) o al final (`MTS <,`) | web | 7 |
| `,,` (coma doble, error de tipeo) | web | 7 |
| `any` (cualquier botón) | web | 3 |
| `+` junto a un opcional: `(1)+4`, `df+(1),3` | guía | 5 |
| Agarres escritos en prosa que el parser no lee como movimiento: `Air Throw`, `wall grab`, `(any airgrab)`. Su significado ya está resuelto en §3 | guía | 4 |
| `FCdf+2` (FC pegado a la dirección) | guía | 1 |
