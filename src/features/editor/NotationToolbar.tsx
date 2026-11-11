import type { RefObject } from 'react';
import type { GameId } from '../../types/notation';

interface Token {
  text: string;
  title: string;
  tone: 'relation' | 'event' | 'button';
}

const RELATIONS: readonly Token[] = [
  { text: ' > ', title: 'Next combo stage', tone: 'relation' },
  { text: '+', title: 'Pressed together', tone: 'relation' },
  { text: ',', title: 'Next input', tone: 'relation' },
  { text: '~', title: 'Immediately', tone: 'relation' },
  { text: ':', title: 'Just frame', tone: 'relation' },
];

/** Combo events offered per game (the validator still checks whatever is typed). */
const EVENTS: Record<GameId, readonly string[]> = {
  t6: ['B!', 'W!'],
  ttt2: ['B!', 'TA!', 'W!'],
  t7: ['S!', 'W!', 'WB!'],
  t8: ['T!', 'W!', 'WB!', 'H.'],
};

const BUTTONS = ['1', '2', '3', '4', '1+2', '3+4'];

const TONE: Record<Token['tone'], string> = {
  relation: 'border-line bg-muted text-fg',
  event: 'border-line bg-line-strong text-fg',
  button: 'border-line bg-neutral text-fg',
};

export interface NotationToolbarProps {
  game: GameId;
  target: RefObject<HTMLTextAreaElement | null>;
  /** Receives the full new notation and the caret position after the inserted token. */
  onInsert: (notation: string, caret: number) => void;
}

/** Quick-insert tokens at the caret of the notation textarea. */
export function NotationToolbar({ game, target, onInsert }: NotationToolbarProps) {
  const tokens: readonly Token[] = [
    ...RELATIONS,
    ...EVENTS[game].map((text): Token => ({ text: text.endsWith('!') ? ` ${text}` : text, title: `Insert ${text}`, tone: 'event' })),
    ...BUTTONS.map((text): Token => ({ text, title: `Button ${text}`, tone: 'button' })),
  ];
  const insert = (token: string) => {
    const el = target.current;
    const value = el?.value ?? '';
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    onInsert(value.slice(0, start) + token + value.slice(end), start + token.length);
  };
  return (
    <div role="toolbar" aria-label="Insert notation" className="flex flex-wrap items-center gap-1.5 rounded-[4px] border border-line-strong bg-neutral p-2">
      <span className="label-sm mr-1 text-[11px] text-fg-muted uppercase">Tokens</span>
      {tokens.map((t) => (
        <button
          key={t.text}
          type="button"
          title={t.title}
          aria-label={t.tone === 'button' ? undefined : `${t.text.trim()} (${t.title})`}
          onClick={() => insert(t.text)}
          className={`h-7 min-w-7 rounded-[4px] border px-2 font-mono text-[13px] font-medium hover:border-primary ${TONE[t.tone]}`}
        >
          {t.text.trim()}
        </button>
      ))}
    </div>
  );
}
