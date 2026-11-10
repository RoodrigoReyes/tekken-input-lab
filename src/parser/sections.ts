/**
 * Which character performs each section of a combo.
 *
 * Precedence: manual assignment > `Name:` label in the notation > first section
 * is the primary character > the previous section ended with an explicit TAG
 * (`5` or `TA!`) or the boundary is a Tag Assault → the other team member >
 * unassigned. A plain `;` (section dialect) never implies a switch by itself.
 */
import { getGame } from '../notation/games';
import type { ComboNode, GameId, SectionNode } from '../types/notation';

export type SectionSource = 'manual' | 'label' | 'primary' | 'tag' | 'tagAssault' | 'unassigned';

export interface SectionAssignment {
  index: number;
  character: string | null;
  source: SectionSource;
}

export interface SectionContext {
  game: GameId;
  primary: string;
  partner?: string;
  /** Manual assignments by section index; null/undefined = automatic. */
  manual?: ReadonlyArray<string | null | undefined>;
}

function endsWithTag(section: SectionNode): boolean {
  const lastStage = section.stages[section.stages.length - 1];
  const last = lastStage?.steps[lastStage.steps.length - 1]?.node;
  if (!last) return false;
  if (last.type === 'event') return last.mechanic === 'tagAssault';
  return last.type === 'input' && last.tag && last.buttons.length === 0 && !last.direction && !last.motion;
}

function otherOf(character: string | null, primary: string, partner: string | undefined): string | null {
  if (!character || !partner) return null;
  if (character === primary) return partner;
  if (character === partner) return primary;
  return null;
}

export function resolveSectionCharacters(ast: ComboNode, ctx: SectionContext): SectionAssignment[] {
  const tag = getGame(ctx.game).tag;
  const result: SectionAssignment[] = [];

  ast.sections.forEach((section, index) => {
    const manual = ctx.manual?.[index];
    const previous = result[index - 1];
    const prevSection = ast.sections[index - 1];
    let assignment: SectionAssignment;

    if (manual) {
      assignment = { index, character: manual, source: 'manual' };
    } else if (section.label) {
      assignment = { index, character: section.label, source: 'label' };
    } else if (index === 0 || !tag) {
      assignment = { index, character: ctx.primary || null, source: ctx.primary ? 'primary' : 'unassigned' };
    } else if (section.boundary === 'tagAssault') {
      const other = otherOf(previous?.character ?? null, ctx.primary, ctx.partner);
      assignment = { index, character: other, source: other ? 'tagAssault' : 'unassigned' };
    } else if (prevSection && endsWithTag(prevSection)) {
      const other = otherOf(previous?.character ?? null, ctx.primary, ctx.partner);
      assignment = { index, character: other, source: other ? 'tag' : 'unassigned' };
    } else {
      assignment = { index, character: null, source: 'unassigned' };
    }
    result.push(assignment);
  });

  return result;
}
