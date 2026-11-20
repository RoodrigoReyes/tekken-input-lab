import type { ComboNode, ItemNode, Token } from '../types/notation';
import { TIGHT_TOKENS } from './grammar';

const SPACED = new Set(['stage', 'semicolon']);
const SIDESTEPS = new Set(['SS', 'SSL', 'SSR', 'SWL', 'SWR']);
const buttonsText = (node: Extract<ItemNode, { type: 'input' }>) => [...node.buttons.map(String), ...(node.tag ? ['5'] : [])].join('+');

export function normalizeTokens(tokens: readonly Token[], ast?: ComboNode): string {
  const replacements = new Map<number, { end: number; text: string }>();
  function visit(node: ItemNode): void {
    if (node.type === 'optional') { node.steps.forEach((step) => visit(step.node)); return; }
    let core: string | undefined;
    if (node.type === 'input') {
      const direction = node.direction && (node.direction.held ? node.direction.value.toUpperCase() : node.direction.value);
      const buttons = [...node.buttons.map(String), ...(node.tag ? ['5'] : [])].join('+');
      const lead = direction || node.motion?.value || '';
      core = lead + (lead && buttons ? '+' : '') + buttons;
    } else if (node.type === 'namedMove') core = node.expandsTo ?? node.name;
    else if (node.type === 'stance' || node.type === 'movement' || node.type === 'event' || node.type === 'mechanic') core = node.abbr;
    if (core === undefined) return;
    const prefixes = node.prefixes.map((p) => p.kind === 'heat' ? `${p.abbr.replace(/\.$/, '')}.` : `${p.abbr} `).join('');
    if (!replacements.has(node.span.start)) replacements.set(node.span.start, { end: node.span.end, text: prefixes + core + (node.hold ? '*' : '') + (node.repeat ? `x${node.repeat}` : '') });
  }
  ast?.sections.forEach((section) => section.stages.forEach((stage) => stage.steps.forEach((step, i) => {
    // A sidestep followed by a bare button is one move: SS3, SS 3, SSR,2 → SS+3, SSR+2.
    const next = stage.steps[i + 1]?.node;
    if (step.node.type === 'movement' && SIDESTEPS.has(step.node.abbr) && !step.node.prefixes.length && next?.type === 'input' && !next.direction && !next.motion && !next.prefixes.length && next.buttons.length) {
      const rest = buttonsText(next) + (next.hold ? '*' : '') + (next.repeat ? `x${next.repeat}` : '');
      replacements.set(step.node.span.start, { end: next.span.end, text: `${step.node.abbr}+${rest}` });
      return;
    }
    visit(step.node);
  })));
  let out = '';
  let skipUntil = -1;
  tokens.forEach((t, i) => {
    if (t.span.start < skipUntil) return;
    const replacement = replacements.get(t.span.start);
    if (replacement) { out += replacement.text; skipUntil = replacement.end; return; }
    if (t.type === 'ws') {
      const prev = tokens[i - 1];
      const next = tokens[i + 1];
      const tightPrev = TIGHT_TOKENS.has(prev?.type ?? 'ws') && prev?.type !== 'hold';
      if (t.newline && prev && next) { out = out.trimEnd() + '\n'; return; }
      if (!prev || !next || tightPrev || TIGHT_TOKENS.has(next.type)) return;
      out += t.newline ? '\n' : ' ';
      return;
    }
    out += SPACED.has(t.type) ? ` ${t.canonical} ` : t.canonical;
  });
  return out.replace(/ {2,}/g, ' ').trim();
}
