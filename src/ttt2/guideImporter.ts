/**
 * Importer for the "TTT2 BNB Combos" guide format (Markdown-like text):
 *
 *   # Character
 *   ## Solo Combos | Counter Hit Combos | Low Parry Combos | Solo Wall Combos
 *   Starter: <starter>
 *   1. <route>                      (optional prefix: "Wall Combo:", "Kazuya only:", "Tech:")
 *   ## TA! | Ender | Wall TA! | Wall Ender
 *   <piece> | <piece> | …           ("|" separates ALTERNATIVES, one piece each)
 *   Additional TA!: <notation>. <condition>
 *   Note: <text>                    (attached to the previous route or list)
 *   ## Tag Assaults & Enders: <Form> (following lists belong to that form)
 *
 * Unrecognized lines are reported in `skipped`; nothing is guessed.
 */
import { getGame } from '../notation/games';
import type { CharacterKit, ComboPiece, GuideLibrary, PieceContext, PieceRole, RouteKind } from './types';

/** Guide spellings → roster names. */
export const GUIDE_NAME_ALIASES: Readonly<Record<string, string>> = {
  'Steve Fox': 'Steve',
  'Dr. B': 'Dr. Bosconovitch',
  'Wang Jinrei': 'Wang',
  'Kazuya / Devil': 'Kazuya',
  'Kazuya / Devil Kazuya': 'Kazuya',
};

interface SectionInfo {
  role: PieceRole;
  context: PieceContext;
  routeKind?: RouteKind;
}

function sectionInfo(title: string): SectionInfo | null {
  const t = title.replace(/\s*\(LP\)\s*$/, '').trim();
  switch (t) {
    case 'Solo Combos':
      return { role: 'route', context: 'open', routeKind: 'normal' };
    case 'Counter Hit Combos':
      return { role: 'route', context: 'open', routeKind: 'counterHit' };
    case 'Low Parry Combos':
      return { role: 'route', context: 'open', routeKind: 'lowParry' };
    case 'Solo Wall Combos':
    case 'Wall Combos':
      return { role: 'route', context: 'wall', routeKind: 'wall' };
    case 'TA!':
      return { role: 'taFiller', context: 'open' };
    case 'Ender':
      return { role: 'ender', context: 'open' };
    case 'Wall TA!':
      return { role: 'taFiller', context: 'wall' };
    case 'Wall Ender':
    case 'Solo Wall Ender':
      return { role: 'ender', context: 'wall' };
    default:
      return null;
  }
}

const ADDITIONAL: Readonly<Record<string, SectionInfo>> = {
  'Additional TA!': { role: 'taFiller', context: 'open' },
  'Additional Ender': { role: 'ender', context: 'open' },
  'Additional Wall TA!': { role: 'taFiller', context: 'wall' },
  'Additional Wall Ender': { role: 'ender', context: 'wall' },
};

/** True when `note` names `notation` as a whole token (not as part of a longer string). */
function mentions(note: string, notation: string): boolean {
  const escaped = notation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[\\s,;:(])${escaped}(?=$|[\\s,;:.)])`).test(note);
}

export function rosterName(guideName: string): string {
  const alias = GUIDE_NAME_ALIASES[guideName];
  if (alias) return alias;
  const roster = getGame('ttt2').roster;
  return roster.find((r) => r.localeCompare(guideName, undefined, { sensitivity: 'base' }) === 0) ?? guideName;
}

/** "u+3, LFS f+4,3. Open-stage filler." → notation + condition (split at the first ". " before a capital). */
export function splitAdditional(body: string): { notation: string; condition?: string } {
  const m = /^(.*?)\.\s+([A-Z].*)$/.exec(body.trim());
  if (!m) return { notation: body.trim().replace(/\.$/, '') };
  return { notation: (m[1] ?? '').trim(), condition: (m[2] ?? '').trim() };
}

/** "Kazuya only: EWGF ×2 > …" → forms + notation; "Wall Combo: …" → notation; "Tech: …" → variant. */
function splitRoutePrefix(body: string, character: string): { notation: string; forms?: string[]; variant?: string } {
  const m = /^([A-Z][\w .\/&-]*?):\s+(.*)$/.exec(body);
  if (!m) return { notation: body };
  const [, prefix = '', rest = ''] = m;
  if (prefix === 'Wall Combo') return splitRoutePrefix(rest, character);
  const forms = prefix
    .replace(/\bonly\b/, '')
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);
  const isFormList = forms.every((f) => f === character || f === 'Devil' || f.startsWith(character) || f.startsWith('Devil'));
  if (isFormList) return { notation: rest, forms: forms.map((f) => (f === 'Devil' ? `Devil ${character}` : f)) };
  return { notation: rest, variant: prefix };
}

class Importer {
  private readonly kits: CharacterKit[] = [];
  private readonly skipped: GuideLibrary['skipped'] = [];
  private kit: CharacterKit | null = null;
  private section: SectionInfo | null = null;
  private form: string | undefined;
  private starter: string | undefined;
  /** Pieces that a following "Note:" applies to. */
  private lastPieces: ComboPiece[] = [];
  /** All pieces of the current TA!/Ender section (list notes apply section-wide). */
  private sectionPieces: ComboPiece[] = [];
  private counters = new Map<string, number>();

  constructor(private readonly lines: string[]) {}

  run(title: string): GuideLibrary {
    this.lines.forEach((raw, index) => this.line(raw.replace(/\\/g, '').trim(), index + 1));
    return { title, kits: this.kits, skipped: this.skipped };
  }

  private skip(line: number, text: string, reason: string): void {
    this.skipped.push({ line, text, reason });
  }

  private add(piece: Omit<ComboPiece, 'id' | 'character' | 'notes'>): ComboPiece {
    const kit = this.kit as CharacterKit;
    const key = `${kit.character}/${piece.form ?? ''}/${piece.role}/${piece.context}`;
    const n = (this.counters.get(key) ?? 0) + 1;
    this.counters.set(key, n);
    const full: ComboPiece = { ...piece, id: `${key}/${n}`, character: kit.character, notes: [] };
    kit.pieces.push(full);
    if (piece.role !== 'route') this.sectionPieces.push(full);
    return full;
  }

  private line(text: string, n: number): void {
    if (!text || text.startsWith('[Back')) return;

    if (text.startsWith('# ')) {
      const guideName = text.slice(2).trim();
      this.kit = { character: rosterName(guideName), guideName, sharedWith: [], pieces: [] };
      this.kits.push(this.kit);
      this.section = null;
      this.form = undefined;
      this.starter = undefined;
      return;
    }
    if (!this.kit) return; // preamble before the first character

    if (text.startsWith('## ')) {
      const title = text.slice(3).trim();
      const formMatch = /^Tag Assaults & Enders:\s*(.+)$/.exec(title);
      if (formMatch) {
        const name = (formMatch[1] ?? '').trim();
        this.form = name === this.kit.character ? undefined : name;
        this.section = null;
        return;
      }
      this.section = sectionInfo(title);
      this.starter = undefined;
      this.lastPieces = [];
      this.sectionPieces = [];
      if (!this.section) this.skip(n, text, 'unknown section');
      return;
    }

    if (text.startsWith('Shared Tag Assault and ender options:')) {
      const names = text.replace(/^[^:]+:\s*/, '').split('.')[0] ?? '';
      this.kit.sharedWith = names
        .split(/\s*(?:&|\/|,)\s*/)
        .map((s) => rosterName(s.trim()))
        .filter((s) => s && s !== this.kit?.character);
      return;
    }

    const shares = /^Shares (.+?)['’]s combo routes/.exec(text);
    if (shares) {
      this.kit.sharedWith = [rosterName((shares[1] ?? '').trim())];
      return;
    }

    if (text.startsWith('Note:')) {
      const note = text.slice(5).trim();
      // Route notes apply to the route above; list notes apply to the whole
      // TA!/Ender section, or only to the pieces they name.
      const scope = this.section?.role === 'route' ? this.lastPieces : this.sectionPieces;
      if (scope.length === 0) return this.skip(n, text, 'note without a piece');
      const named = scope.length > 1 ? scope.filter((p) => mentions(note, p.notation)) : [];
      for (const p of named.length ? named : scope) p.notes.push(note);
      return;
    }

    const additional = /^(Additional (?:Wall )?(?:TA!|Ender)):\s*(.+)$/.exec(text);
    if (additional) {
      const info = ADDITIONAL[additional[1] ?? ''];
      if (!info) return this.skip(n, text, 'unknown additional section');
      const { notation, condition } = splitAdditional(additional[2] ?? '');
      this.lastPieces = [this.add({ ...info, notation, additional: true, ...(condition ? { condition } : {}), ...(this.form ? { form: this.form } : {}) })];
      return;
    }

    const starter = /^(?:Counter Hit |Alternative )?[Ss]tarters?:\s*(.+?)\.?$/.exec(text);
    if (starter) {
      this.starter = (starter[1] ?? '').trim();
      return;
    }

    const section = this.section;
    if (!section) return this.skip(n, text, 'text outside a known section');

    if (section.role === 'route') {
      // Sub-headers such as "df+2 alternative:" or "Shared follow-up (either starter):".
      if (text.endsWith(':')) {
        this.starter = text.slice(0, -1).replace(/\s+alternative$/, '').trim();
        return;
      }
      const numbered = /^\d+\.\s+(.*)$/.exec(text);
      // Some sections list routes without numbering; accept lines that read as a route.
      const body = numbered?.[1] ?? (/(>|\bB!|\bW!)/.test(text) ? text.replace(/^[-•]\s*/, '') : null);
      if (body === null) return this.skip(n, text, 'route line not recognized');
      const { notation, forms, variant } = splitRoutePrefix(body, this.kit.character);
      this.lastPieces = [
        this.add({
          role: 'route',
          context: section.context,
          routeKind: section.routeKind,
          notation,
          additional: false,
          ...(this.starter ? { starter: this.starter } : {}),
          ...(forms ? { forms } : {}),
          ...(variant ? { variant } : {}),
        }),
      ];
      return;
    }

    // TA!/Ender lists: "|" separates alternatives — one piece each.
    this.lastPieces = text
      .split(/\s+\|\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((notation) =>
        this.add({ role: section.role, context: section.context, notation, additional: false, ...(this.form ? { form: this.form } : {}) }),
      );
  }
}

export function importGuide(text: string, title = 'Imported guide'): GuideLibrary {
  return new Importer(text.split(/\r?\n/)).run(title);
}
