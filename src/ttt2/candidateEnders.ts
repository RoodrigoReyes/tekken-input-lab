export interface MovelistMove {
  name: string;
  command: string;
  hits: string[];
}

export interface CandidateEnder {
  command: string;
  name: string;
  reason: 'route-finisher' | 'mid-low-finish';
}

export function enderKey(command: string): string {
  return command.trim()
    .replace(/^CH\s*/i, '')
    .replace(/^i(?=[A-Z])/, '')
    .replace(/^cd(?=\s*[+\d])/i, 'f,n,d,d/f')
    .replace(/^wr(?=\s*[+\d])/i, 'f,f,f')
    .toLowerCase()
    .replace(/[/\s+]/g, '')
    .replace(/^f,f/, 'ff');
}

/**
 * A move usable as a free juggle ender must be a plain input, not one that needs
 * a special state: grounded opponent, an active stance/transformation, an approach, etc.
 * Those read as English prose in the move-list command, so we drop them.
 */
export function isPlainEnderInput(command: string): boolean {
  return !/\b(during|opponent|approach|while|synced|transformation|back to|get ?up|grounded|down|crouching|tag)\b/i.test(command);
}

export function candidateEnders(input: {
  movelist: readonly MovelistMove[];
  confirmedEnders: readonly string[];
  routeFinishers: readonly string[];
}): CandidateEnder[] {
  const excluded = new Set(input.confirmedEnders.map(enderKey));
  const routeKeys = new Set(input.routeFinishers.map(enderKey));
  const emitted = new Set<string>();
  const candidates: Array<{ ender: CandidateEnder; hitCount: number }> = [];
  for (const move of input.movelist) {
    if (!isPlainEnderInput(move.command)) continue;
    const key = enderKey(move.command);
    if (excluded.has(key) || emitted.has(key)) continue;
    const routeFinisher = routeKeys.has(key);
    const lastHit = move.hits.at(-1);
    if (!routeFinisher && lastHit !== 'm' && lastHit !== 'l') continue;
    emitted.add(key);
    candidates.push({
      ender: { command: move.command, name: move.name, reason: routeFinisher ? 'route-finisher' : 'mid-low-finish' },
      hitCount: move.hits.length,
    });
  }
  return candidates.sort((a, b) => {
    const reasonOrder = Number(a.ender.reason !== 'route-finisher') - Number(b.ender.reason !== 'route-finisher');
    return reasonOrder || a.hitCount - b.hitCount || (a.ender.command < b.ender.command ? -1 : a.ender.command > b.ender.command ? 1 : 0);
  }).map(({ ender }) => ender);
}
