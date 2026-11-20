export function navigateStage(current: number, stageCount: number, action: 'prev' | 'next' | 'reset'): number {
  if (action === 'reset') return 0;
  const next = current + (action === 'next' ? 1 : -1);
  return Math.max(0, Math.min(next, stageCount - 1));
}
