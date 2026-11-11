import type { GeneratedCombo } from '../../ttt2/generator';
import type { ComboDraft } from '../../types/combo';

export interface GeneratedHandoff {
  combo: GeneratedCombo;
  team: { point: string; partner: string };
}

/**
 * In-memory hand-off between the new-combo editor and the generator page.
 * - The editor stashes its unsaved draft before opening the generator, so
 *   coming back (Back button or "Use this combo") keeps the user's work.
 * - The generator leaves the chosen combo for the editor to merge in.
 * The editor peeks while initialising its state and clears after mount
 * (StrictMode-safe). A page reload simply opens an empty editor.
 */
let pending: GeneratedHandoff | null = null;
let stashedDraft: ComboDraft | null = null;

export function setPendingGenerated(value: GeneratedHandoff): void {
  pending = value;
}

export function peekPendingGenerated(): GeneratedHandoff | null {
  return pending;
}

export function stashEditorDraft(draft: ComboDraft): void {
  stashedDraft = draft;
}

export function peekEditorDraft(): ComboDraft | null {
  return stashedDraft;
}

export function clearHandoff(): void {
  pending = null;
  stashedDraft = null;
}
