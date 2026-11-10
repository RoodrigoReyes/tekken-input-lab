/**
 * Semantic validation: checks mechanics against the selected game.
 * Produces warnings/info only — the AST is never altered or reinterpreted.
 */
import { getGame } from '../notation/games';
import { availabilityOf, MECHANICS, type MechanicId } from '../notation/mechanics';
import type { ComboNode, Diagnostic, GameId, ItemNode, Span, Step } from '../types/notation';

/** All step nodes in reading order, including those inside `[ ]`. */
export function flattenNodes(ast: ComboNode): ItemNode[] {
  const out: ItemNode[] = [];
  const walk = (steps: readonly Step[]): void => {
    for (const { node } of steps) {
      out.push(node);
      if (node.type === 'optional') walk(node.steps);
    }
  };
  for (const section of ast.sections) {
    for (const stage of section.stages) walk(stage.steps);
  }
  return out;
}

function isHeatBurst(node: ItemNode | undefined): boolean {
  if (!node) return false;
  if (node.type === 'mechanic') return node.mechanic === 'heatBurst';
  return (
    node.type === 'input' &&
    !node.direction &&
    !node.motion &&
    !node.tag &&
    node.prefixes.length === 0 &&
    node.buttons.length === 2 &&
    node.buttons[0] === 2 &&
    node.buttons[1] === 3
  );
}

function checkAvailability(mechanic: MechanicId, game: GameId, span: Span, raw: string): Diagnostic | null {
  const a = availabilityOf(mechanic, game);
  if (a.status === 'yes') return null;
  const prefix = `${raw} (${MECHANICS[mechanic].label}): `;
  if (a.status === 'no') {
    return { code: 'mechanic-unavailable', severity: 'warning', message: prefix + a.message, span, mechanic };
  }
  return { code: 'mechanic-conditional', severity: a.severity, message: prefix + a.message, span, mechanic };
}

export function validateCombo(ast: ComboNode, game: GameId): Diagnostic[] {
  const config = getGame(game);
  const diagnostics: Diagnostic[] = [];
  const push = (d: Diagnostic | null): void => {
    if (d) diagnostics.push(d);
  };

  for (const section of ast.sections) {
    if (section.boundary === 'tagAssault') {
      push(checkAvailability('tagAssault', game, { start: section.span.start, end: section.span.start }, ';'));
    }
  }

  const nodes = flattenNodes(ast);
  let extenderCount = 0;
  let floorBroken = false;

  nodes.forEach((node, index) => {
    for (const prefix of node.prefixes) {
      if (prefix.kind === 'heat') push(checkAvailability('heat', game, prefix.span, prefix.raw));
    }

    if (node.type === 'stance' && node.kind === 'heat') {
      push(checkAvailability('heat', game, node.span, node.raw));
    }

    if (node.type === 'input' && node.tag) {
      push(checkAvailability('tagButton', game, node.span, node.raw));
    }

    if (node.type === 'mechanic') {
      push(checkAvailability(node.mechanic as MechanicId, game, node.span, node.raw));
    }

    if (node.type !== 'event') return;
    const mechanic = node.mechanic as MechanicId;

    if (mechanic === config.extender) {
      extenderCount++;
      if (extenderCount > 1) {
        diagnostics.push({
          code: 'extender-repeated',
          severity: 'warning',
          message: `${MECHANICS[mechanic].label} can only be used once per combo in ${config.name}.`,
          span: node.span,
          mechanic,
        });
      }
    }

    if (mechanic === 'floorBreak') floorBroken = true;

    if (game === 't8' && mechanic === 'bound' && isHeatBurst(nodes[index - 1])) return;

    if (game === 't8' && mechanic === 'wallBound' && floorBroken) {
      diagnostics.push({
        code: 'wall-bound-after-floor-break',
        severity: 'warning',
        message: 'Wall Bound is unavailable after a Floor Break in Tekken 8.',
        span: node.span,
        mechanic,
      });
      return;
    }

    push(checkAvailability(mechanic, game, node.span, node.raw));
  });

  return diagnostics;
}
