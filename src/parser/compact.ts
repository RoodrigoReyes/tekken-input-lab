/**
 * Compact, unambiguous text form of an AST — used by tests and debugging.
 *   df+1 , 2 ~ TAG            input steps and relations
 *   named(EWGF) event(bound:B!) move(SSL) stance(ZEN) mech(rageDrive:RD)
 *   opt[...] note(...) ?(raw)
 *   " > " stages, " |boundary| " sections, "@Name: " labels
 */
import type { ComboNode, InputNode, ItemNode, Prefix, Step } from '../types/notation';
import { RELATION_SYMBOLS } from './grammar';

function prefixText(prefixes: readonly Prefix[]): string {
  return prefixes.map((p) => (p.abbr.endsWith('.') ? p.abbr : `${p.abbr}.`)).join('');
}

export function inputText(node: InputNode): string {
  const head = node.direction
    ? node.direction.held
      ? node.direction.value.toUpperCase()
      : node.direction.value
    : (node.motion?.value ?? '');
  const buttons = [...node.buttons.map(String), ...(node.tag ? ['TAG'] : [])].join('+');
  return [head, buttons].filter(Boolean).join('+');
}

function core(node: ItemNode): string {
  switch (node.type) {
    case 'input':
      return inputText(node);
    case 'namedMove':
      return `named(${node.name})`;
    case 'movement':
      return `move(${node.abbr})`;
    case 'stance':
      return `stance(${node.abbr})`;
    case 'event':
      return `event(${node.mechanic}:${node.abbr})`;
    case 'mechanic':
      return `mech(${node.mechanic}:${node.abbr})`;
    case 'optional':
      return `opt[${stepsText(node.steps)}]`;
    case 'note':
      return `note(${node.text})`;
    case 'unknown':
      return `?(${node.raw})`;
  }
}

function itemText(node: ItemNode): string {
  return `${prefixText(node.prefixes)}${core(node)}${node.hold ? '*' : ''}${node.repeat ? `x${node.repeat}` : ''}`;
}

function stepsText(steps: readonly Step[]): string {
  return steps
    .map((s, i) => (i === 0 || !s.relation ? '' : ` ${RELATION_SYMBOLS[s.relation.kind]} `) + itemText(s.node))
    .join('');
}

export function toCompact(ast: ComboNode): string {
  return ast.sections
    .map((section, i) => {
      const boundary = i === 0 ? '' : ` |${section.boundary}| `;
      const label = section.label ? `@${section.label}: ` : '';
      return boundary + label + section.stages.map((st) => stepsText(st.steps)).join(' > ');
    })
    .join('');
}
