import type { GeneratedCombo } from '../../ttt2/generator';
import { GUIDE_SOURCE } from '../../ttt2/guideData';
import type { Combo, ComboDraft } from '../../types/combo';

export const NEW_DRAFT: ComboDraft = {
  game: 't8',
  character: '',
  name: '',
  notation: '',
  dialect: 'standard',
  sectionCharacters: [],
  tags: [],
  difficulty: 'beginner',
  notes: '',
  favorite: false,
};

export function toDraft(combo: Combo): ComboDraft {
  const { id: _id, createdAt: _c, updatedAt: _u, ...draft } = combo;
  void _id;
  void _c;
  void _u;
  return draft;
}

/** Draft fields filled from a generated combo (notation verbatim; verification list in notes). */
export function draftFromGenerated(draft: ComboDraft, combo: GeneratedCombo, team: { point: string; partner: string }): ComboDraft {
  const verify = combo.flags.map((f) => `- ${f.piece}: ${f.text}`);
  const notes = [
    `Generated from the "${GUIDE_SOURCE.title}" guide. Not tested yet: try it in practice mode.`,
    ...(verify.length ? ['To verify:', ...verify] : []),
  ].join('\n');
  const name = `${team.point} + ${team.partner}: ${combo.route.starter ?? 'route'}${combo.filler ? ' → TA!' : ' (solo)'}`;
  return {
    ...draft,
    game: 'ttt2',
    dialect: 'standard',
    character: team.point,
    partner: team.partner,
    notation: combo.notation,
    sectionCharacters: [],
    name: draft.name.trim() ? draft.name : name.slice(0, 120),
    tags: draft.tags.includes('generated') ? draft.tags : [...draft.tags, 'generated'],
    notes: draft.notes.trim() ? `${draft.notes}\n\n${notes}` : notes,
  };
}
