# TTT2: cómo se arman y conectan los combos de equipo

Análisis de la guía **"TTT2 BNB Combos"** (Google Doc compartido por el usuario) y propuesta para que TekkenInputLab permita crear combos para cualquier pareja de personajes.

## 1. Qué contiene la guía

- **57 secciones de personaje**, con **494 starters** y unas **1,466 piezas** de notación (rutas, fillers y enders).
- Cada personaje sigue la misma estructura:

| Sección | Qué es | Uso en un combo de equipo |
|---|---|---|
| Solo Combos (por *Starter*) | Ruta completa de un personaje: starter > fillers > `B!` > ender | Se toma la parte **hasta `B!`** como apertura |
| Counter Hit Combos | Rutas que empiezan con `CH …` | Igual, con starter de counter hit |
| Low Parry Combos | Rutas que empiezan con `LP >` | Igual, después de un low parry |
| Solo Wall Combos | Rutas en la pared (`… W! > …`) | Contexto **pared** |
| **TA!** | Fillers de Tag Assault en campo abierto (lista separada por `\|`) | Pieza que va **después del Tag Assault** |
| **Ender** | Finales en campo abierto | Pieza que **cierra** el combo |
| **Wall TA!** / **Wall Ender** | Lo mismo, pero contra la pared | Contexto **pared** |

- **Kits compartidos** entre clones: Alex & Roger Jr., Eddy & Christie, Jun & Unknown, Kuma & Panda, Lee/Violet y Xiaoyu & Miharu.
- **Formas**: Kazuya y Devil Kazuya tienen listas de TA y de Ender distintas. Además, cada ruta indica si vale para una forma o para las dos ("Kazuya only", "Kazuya / Devil").
- **Notas con condiciones** (son las reglas de conexión reales):
  - **Hits antes del TA:** "bf+2,3~f 1+2 con hasta 3 hits pre-TA, 1,2,4 con hasta 5, b+3~f 4 después de 6".
  - **Hits del Bound:** "b+3,4,3 sirve después de bounds de 2 hits", "fillers dependen del hit count del bound".
  - **Tamaño del oponente:** "medium/large bodies", "Ogre/big-body option".
  - **Pared y ángulo:** "puede fallar en ángulos raros de pared".
  - **Partner:** "Delayed f+4,1,2,4 lleva a un air throw del partner", "para el follow-up de Angel hazlo rápido o el partner se va".
  - **Timing:** "delay el primer 2", "espera a que salga del stance".

La idea central de la guía, en sus propias palabras: *aprende la teoría inicial de tu personaje y mézclala con los TA fillers y enders disponibles*. El juego tiene más de 1,700 parejas posibles, así que la guía no intenta listar combos por pareja.

## 1.1 Los TA! son la pieza central

- **Son el grupo más grande de piezas:** 324 TA! en campo abierto y 168 Wall TA!, en total **492 fillers**. Los enders son 366 (203 Ender y 163 Wall Ender).
- **La guía nunca escribe `TA!` dentro de un combo.** Solo aparece como encabezado de sección. Es decir, la guía no trae ningún combo de equipo completo: todos se arman uniendo una ruta que termina en `B!` con un filler de la lista TA! y un ender. El TA! es el punto donde se unen las piezas de los dos personajes.
- **Líneas "Additional TA!" / "Additional Wall TA!":** son 12 fillers extra con condición, en el formato `Additional TA!: <notación>. <condición>`. Por ejemplo:
  - "Ogre/big-body option"
  - "Only for very early bound"
  - "Conditional on partner bound, angle and hit count"
  - "Timing-sensitive option for an Angel follow-up"

  En mi primera medición las conté como prosa por error. El importador debe leerlas como fillers con sus condiciones.
- **Condiciones propias de los TA fillers**, que son reglas de conexión:
  - Hits antes del TA ("hasta 3 / hasta 5 / después de 6").
  - Hits del Bound ("después de bounds de 2 hits").
  - **Qué Bound usó el partner** ("Conditional on partner bound").
  - Tamaño del oponente y ángulo de pared.
- **Cobertura actual del parser solo en estas listas:**
  - TA!: **87%** (283/324).
  - Wall TA!: **90%** (151/168).
  - Lo que falla es casi todo `ss+2,4` / `SS+2` (movimiento seguido de `+`) y stances (IZU, BOK, SAV, SE, CJM, MAD).
- **Cómo se escribe el TA! en la notación generada:** como evento `TA!` al final de la ruta (dialecto estándar) o como `;` (dialecto kagewebsite). El parser ya acepta las dos formas y ya resuelve el cambio de personaje en la siguiente sección.

## 2. Modelo de conexión

```
[Personaje A] Ruta hasta B!  ──►  TA!  ──►  [TA filler]  ──►  [Ender]
                (Solo/CH/LP/Wall)          (lista TA!/Wall TA!)  (lista Ender/Wall Ender)
```

Reglas que la app puede aplicar:

| # | Regla | Cómo se verifica |
|---|---|---|
| R1 | La apertura antes del TA debe terminar en `B!` | Se deriva de la ruta: último evento = `bound` |
| R2 | Solo un `B!` por combo | Ya lo valida el parser (`extender-repeated`) |
| R3 | Campo abierto vs pared: con `W!` en la ruta o contexto pared se usan **Wall TA!/Wall Ender** | Flag de contexto + evento `W!` |
| R4 | Condiciones de hits pre-TA y hits del bound | Conteo de hits estimado de la ruta + condiciones min/máx en el filler |
| R4b | Qué Bound se usó: el movimiento con `B!` de la ruta y quién lo hizo | Se guarda el movimiento que causó el `B!` y se compara con la condición del filler |
| R5 | Tamaño del oponente y ángulo de pared | Condición opcional del filler (filtro, no bloqueo) |
| R6 | Kits compartidos y formas (Kazuya/Devil) | El personaje se resuelve a su kit |
| R7 | Condiciones que la guía marca como no confirmadas | Se muestran como nota o advertencia, nunca se ocultan |

**Ejemplo (Kazuya + Nina):** 2 rutas de Kazuya que terminan en `B!`, por 9 TA fillers de Nina, por 2 enders de Kazuya, dan unos **36 candidatos solo en campo abierto**. Por eso la UI debe guiar paso a paso (Ruta → TA filler → Ender, ya filtrados) y no listar todas las combinaciones.

**Notación generada:** es un texto normal con etiquetas de personaje. **El parser actual ya lo entiende** (lo probé): reconoce 3 secciones etiquetadas Kazuya → Nina → Kazuya y no da advertencias aparte del hueco `ss+1` (ver §3).

```
Kazuya:
EWGF > b+2,4 > db+2 B! TA!
Nina:
ss+1~f~2
Kazuya:
cd+4,1
```

> **Pendiente de confirmar:** la guía no dice explícitamente qué personaje ejecuta el TA filler y cuál el ender. Las notas ("hazlo rápido o el partner se va", "air throw del partner") indican que uno hace el filler mientras el otro sigue en pantalla para cerrar. El modelo guardará quién ejecuta cada segmento, así que soporta cualquier orden, pero hay que fijar el orden por defecto.

## 3. Cobertura actual del parser frente a la guía

Pasé las 1,466 piezas por el parser actual con el juego TTT2:

- **72% (1,050) sin advertencias** hoy.
- De las 400 con advertencias: **34** son texto en prosa que se coló en la extracción (no es notación), **284 se arreglan** con los cambios de abajo y **82** son ambigüedades reales de la guía. Por ejemplo `12`/`22` sin operador, o `UF,4`, que la propia guía marca como "sin confirmar".
- **Cobertura esperada después de los cambios: ~93%.**

| Cambio | Ocurrencias | Detalle |
|---|---|---|
| `LP` (Low Parry) como starter | 64 | Nuevo estado o mecánica genérica |
| Movimiento seguido de `+` | 62 | `SS+2`, `SSR+1+2`, `ss+1`, `iSW+4` |
| Diccionario de stances TTT2 | ~300 | Tabla de abajo |
| Atajos direccionales | ~30 | `bf` (b,f), `fb`, `fn`, `fF` (f,F) |
| Palabras de movimiento | ~10 | `microdash`, `wavedash` |
| Alias de nombres | — | "Steve Fox"→Steve, "Dr. B"→Dr. Bosconovitch, "Wang Jinrei"→Wang, forma "Devil Kazuya" |

**Stances y movimientos con nombre que faltan, por personaje (según la guía):**
RDS (Xiaoyu, Miharu) · IZU (Jun, Unknown) · FLA (Baek) · ISW (Jaycee, Michelle) · CES (Jaycee, Michelle) · CDS (Jin) · SAV (Miguel) · DUCK (Steve) · MAD (Dr. B) · **SE/DE (Lars)** · FLY (Alisa, Jinpachi, True Ogre) · CDc (Dragunov) · SET (Kunimitsu) · MTS (Bruce) · BOK (Leo) · DSS (Marshall Law) · ROC, AGF (Alex, Roger Jr.) · CJM (Anna) · GS (Armor King, King) · CRN (Lei) · VTSc (Marduk) · EWHF, tgf (Heihachi) · DEWGF (Kazuya/Devil).

**Correcciones a mi diccionario actual:**
- En TTT2, Lars se escribe **DE/SE** (esta guía) o **DEN/SEN** (la guía también, y ttt2combo.kagewebsite.com). Las dos formas son válidas; ver `docs/TTT2_SIGLAS.md`.
- **RDS** sí existe en TTT2 (Xiaoyu y Miharu).
- **EWHF** existe en TTT2 (Heihachi).

**Paréntesis:** la guía los usa con dos significados:
- **Input opcional:** `(1,2),2`, `uf+4,(3,)4`, `df+(1),3`.
- **Anotación:** `(2 hits)`, `(either starter)`, `f+1+2(IZU)`.

Hoy el parser trata todo paréntesis como nota, así que `(1,2),2` no da advertencia pero se interpreta mal. Propongo una regla determinista: si el contenido es notación válida completa, es **opcional**; si no, es **nota**. Se mostraría un aviso informativo.

## 4. Propuesta de implementación

1. **Parser y diccionario TTT2:** los cambios de §3, con tests que usan líneas reales de la guía como fixtures. El objetivo es ≥93% de la guía sin advertencias.
2. **Biblioteca de piezas:**
   - Nueva tabla `pieces` en Dexie (migración a v2). Cada pieza guarda personaje o kit, forma, rol (ruta/TA/ender), contexto (abierto/pared), categoría (normal/CH/LP), notación original, condiciones y notas.
   - Se deriva automáticamente si termina en `B!`, el conteo de hits estimado y si usa la pared.
   - Incluye un **importador** para el formato de esta guía: `# Personaje`, `## Sección`, `Starter:`, líneas numeradas, listas con `|` y `Note:`.
3. **Team Builder (en el editor TTT2):**
   - Se eligen A y B, el orden y el contexto (abierto/pared).
   - Selectores paso a paso, Ruta → TA filler → Ender, filtrados con R1–R7 y con preview en vivo.
   - "Usar" escribe la notación con etiquetas en el campo de notación, que sigue siendo editable y la única fuente de verdad.
   - El combo guarda referencias a las piezas usadas.
4. **Explorar pareja:** para A+B, muestra cuántas rutas, fillers y enders compatibles hay y deja guardar como combo cualquier combinación.
5. **Tests y E2E:** armar Kazuya+Nina, cambiar a pared, guardar y recargar.

## 5. Decisiones del usuario

1. **Orden del Tag Assault:** quién hace el TA filler y quién el ender (personaje que entra o el que estaba en punta).
2. **Contenido de la guía:**
   - **Opción A:** incluirla como datos semilla dentro de la app. Requiere permiso del autor o autora; la guía cita Tekken Zaibatsu, YouTube y aportes de amigos.
   - **Opción B:** solo dar el importador, para que cada usuario cargue su propio documento.
3. **Paréntesis:** aprobar la regla opcional-vs-nota de §3.

## 6. Generador de combos (implementado en `src/ttt2/`, rama `feat/ttt2-combo-generator`)

### Estructuras armadas desde la guía

| Estructura | Qué guarda |
|---|---|
| `ComboPiece` | Una pieza: personaje, forma, rol (`route` / `taFiller` / `ender`), contexto (`open` / `wall`), tipo de ruta (`normal` / `counterHit` / `lowParry` / `wall`), starter, notación **literal**, condición (si es "Additional"), notas, variante ("Tech") |
| `CharacterKit` | Las piezas de un personaje, su nombre en la guía y los clones con los que comparte kit |
| `GuideLibrary` | Todos los kits más las líneas que no se pudieron clasificar (se reportan, no se adivinan) |
| `RouteAnalysis` | Lo que se deriva de cada ruta: la apertura hasta `B!` (texto literal), qué movimiento causó el Bound, hits estimados antes del TA y si usa la pared |

**Importador (`guideImporter.ts`).** Lee el formato de la guía:
- `#` personaje, `##` sección, `Starter:`, rutas numeradas (y sin numerar), listas con `|`, `Note:`, `Additional …:`, formas (`Tag Assaults & Enders: Devil Kazuya`) y kits compartidos.
- Con la guía completa: **57 personajes, 1,508 piezas, 628 rutas (423 con `B!`), 327 TA!, 178 Wall TA!, 210 Ender, 165 Wall Ender y 23 Additional**. Solo 1 línea queda sin clasificar, y es informativa.

### Cómo genera

```
para la pareja (A en punta, B partner) y las opciones elegidas:
  rutas    = rutas de A que llegan a B!          (filtradas por starter, CH/LP, forma)
  fillers  = lista TA! (o Wall TA!) de quien hace el filler
  enders   = lista Ender (o Wall Ender) de quien cierra
  combo    = A: <ruta hasta B!> > TA!  →  <filler>  →  <ender>
```

**Reglas que descartan una pieza** (se revisan una vez por pieza):

| Regla | Qué exige |
|---|---|
| R1 | La ruta llega a `B!` |
| R2 | El contexto de la pieza coincide (abierto o pared) |
| R3 | La forma coincide (Kazuya / Devil Kazuya) |
| R4 | El filler y el ender no meten un segundo `B!`, y ninguna pieza usa mecánicas que TTT2 no tiene |
| R5 | *(opcional)* Solo piezas sin advertencias de notación |
| R6 | *(opcional)* Piezas "Additional" solo si se piden |

**Reglas que no descartan pero avisan** ("verificar"):
- Condiciones de la guía.
- Notas, asignadas solo a la pieza que mencionan.
- Advertencias de notación.
- En pared, las rutas de campo abierto se marcan como "verifica que llegue a la pared".

**Orden:** primero los combos con menos cosas por verificar; luego los starters normales, después CH, LP y pared.

**Rendimiento:** unos 2 ms por pareja. De las 3,192 parejas posibles (contando el orden), 2,912 generan combos. La mediana es de 100 por pareja y el máximo de 660.

**Honestidad:** todo combo generado es una *sugerencia* armada con piezas de la guía y sus reglas. La guía misma dice que sus rutas no están probadas de forma independiente. Por eso el combo guardado debería marcarse "Probado ✓" solo después de probarlo en el modo práctica.

### Pendiente

1. **UI "Generador" en el editor TTT2:**
   - Selección de personajes y contexto.
   - Filtros: starter, CH/LP, forma, Additional, solo limpios.
   - Lista ordenada con preview arcade, mostrando lo que hay que verificar.
   - "Usar este combo" llena el editor.
2. **Arreglo de paréntesis en el parser:** hoy `uf+4,(3,)4` sale primero en el ranking justamente porque se lee mal sin aviso.
3. Decidir el orden por defecto después del TA (quién hace el filler y quién el ender). El generador ya permite las dos opciones (`fillerBy` / `enderBy`).
4. Decidir si la guía se incluye como datos semilla o solo se importa.
