import { parseNotation, resolveSectionCharacters, type SectionAssignment } from '../../parser';
import type { SectionHeaderInfo } from '../../render/layout';
import type { Combo } from '../../types/combo';
import type { ParseResult } from '../../types/notation';

export type ComboParseInput = Pick<Combo, 'game' | 'dialect' | 'notation' | 'character' | 'partner' | 'sectionCharacters'>;

export interface ParsedCombo {
  result: ParseResult;
  assignments: SectionAssignment[];
  /** Section headers for the renderer (undefined = no headers). */
  headers: SectionHeaderInfo[] | undefined;
}

/** Parse a combo's notation with its game/dialect/characters and resolve section characters. */
export function parseCombo(combo: ComboParseInput): ParsedCombo {
  const partner = combo.game === 'ttt2' ? combo.partner?.trim() || undefined : undefined;
  const characters = [combo.character.trim(), partner].filter((c): c is string => Boolean(c));
  const result = parseNotation(combo.notation, { game: combo.game, dialect: combo.dialect, characters });
  const assignments = resolveSectionCharacters(result.ast, {
    game: combo.game,
    primary: combo.character.trim(),
    partner,
    manual: combo.sectionCharacters,
  });
  const showHeaders = combo.game === 'ttt2' || result.ast.sections.length > 1;
  return {
    result,
    assignments,
    headers: showHeaders ? assignments.map((a) => ({ title: a.character })) : undefined,
  };
}
