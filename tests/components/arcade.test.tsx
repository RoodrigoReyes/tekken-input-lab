// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ArcadeButtons } from '../../src/components/arcade/ArcadeButtons';
import { CommandSequence } from '../../src/components/arcade/CommandSequence';
import { parseNotation } from '../../src/parser';
import { BUTTON_COLORS, COLORS } from '../../src/render/theme';

afterEach(cleanup);

function activeButtons(container: Element): string[][] {
  return [...container.querySelectorAll('[aria-label^="Buttons"], [aria-label="No buttons"]')].map((cluster) =>
    [...cluster.querySelectorAll('[data-active="true"]')].map((b) => b.getAttribute('data-button') ?? ''),
  );
}

describe('ArcadeButtons', () => {
  it('paints each pressed button in its own color and the rest dark', () => {
    const { container } = render(
      <svg>
        <ArcadeButtons active={[1, 4]} size={40} />
      </svg>,
    );
    const fills = [...container.querySelectorAll('circle')].map((c) => c.getAttribute('fill'));
    expect(fills).toEqual([BUTTON_COLORS[1].fill, COLORS.buttonInactive, COLORS.buttonInactive, BUTTON_COLORS[4].fill]);
  });

  it('has no numbers by default (like the in-game display), optional on request', () => {
    const plain = render(
      <svg>
        <ArcadeButtons active={[2]} size={40} />
      </svg>,
    );
    expect(plain.container.querySelectorAll('text')).toHaveLength(0);
    const numbered = render(
      <svg>
        <ArcadeButtons active={[2]} size={40} showNumbers />
      </svg>,
    );
    expect(numbered.container.querySelectorAll('text')).toHaveLength(4);
  });
});

describe('CommandSequence', () => {
  it('df+1,2~5 renders two separate clusters and a TAG indicator', () => {
    const result = parseNotation('df+1,2~5', { game: 'ttt2' });
    const { container } = render(<CommandSequence result={result} />);
    expect(activeButtons(container)).toEqual([['1'], ['2']]);
    expect(container.querySelectorAll('[aria-label="TAG"]')).toHaveLength(1);
    expect(container.querySelector('[data-direction="df"]')).not.toBeNull();
  });

  it('1+2 renders one cluster with both buttons pressed', () => {
    const { container } = render(<CommandSequence result={parseNotation('1+2', { game: 't8' })} />);
    expect(activeButtons(container)).toEqual([['1', '2']]);
  });

  it('keeps named moves and events as labels', () => {
    const result = parseNotation('EWGF, 1,2 T!', { game: 't8', characters: ['Kazuya'] });
    const { container } = render(<CommandSequence result={result} />);
    const texts = [...container.querySelectorAll('text')].map((t) => t.textContent);
    expect(texts).toEqual(expect.arrayContaining(['EWGF', 'T!', 'TORNADO']));
  });
});
