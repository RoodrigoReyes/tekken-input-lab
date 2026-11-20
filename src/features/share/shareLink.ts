import { comboDraftSchema, describeIssues } from '../../storage/schema';
import type { ComboDraft } from '../../types/combo';

function shareFields(draft: ComboDraft) {
  const { game, character, partner, name, notation, dialect, sectionCharacters, tags, difficulty, damage, hits, position, videoUrl } = draft;
  return { game, character, partner, name, notation, dialect, sectionCharacters, tags, difficulty, damage, hits, position, videoUrl };
}

export function encodeShareLink(draft: ComboDraft): string {
  const bytes = new TextEncoder().encode(JSON.stringify(shareFields(draft)));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `#/shared?d=${btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
}

export function decodeShareLink(param: string): { ok: true; draft: ComboDraft } | { ok: false; error: string } {
  try {
    if (!param || !/^[A-Za-z0-9_-]+$/.test(param) || param.length % 4 === 1) throw new Error();
    const binary = atob(param.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - param.length % 4) % 4));
    const json = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
    const value: unknown = JSON.parse(json);
    const parsed = comboDraftSchema.safeParse(value);
    if (!parsed.success) return { ok: false, error: describeIssues(parsed.error) };
    return { ok: true, draft: { ...shareFields(parsed.data), notes: '', favorite: false } };
  } catch {
    return { ok: false, error: 'The link contains invalid combo data.' };
  }
}
