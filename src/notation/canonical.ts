import { parseNotation, type ParseOptions } from '../parser';

export function canonicalNotation(text: string, options: ParseOptions): string {
  return parseNotation(text, options).normalized;
}
