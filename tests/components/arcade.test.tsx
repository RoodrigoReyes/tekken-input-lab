// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ArcadeButtons } from '../../src/components/arcade/ArcadeButtons';
import { DirectionIcon } from '../../src/components/arcade/DirectionIcon';
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
    const fills = [...container.querySelectorAll('[data-button] circle')].map((c) => c.getAttribute('fill'));
    expect(fills).toEqual([BUTTON_COLORS[1].fill, COLORS.buttonInactive, COLORS.buttonInactive, BUTTON_COLORS[4].fill]);
  });

  it('draws the tilted cluster: right column raised, one black silhouette behind all buttons', () => {
    const { container } = render(
      <svg>
        <ArcadeButtons active={[]} size={40} />
      </svg>,
    );
    const center = (n: number) => {
      const c = container.querySelector(`[data-button="${n}"] circle`);
      return { x: Number(c?.getAttribute('cx')), y: Number(c?.getAttribute('cy')), r: Number(c?.getAttribute('r')) };
    };
    const [b1, b2, b3, b4] = [center(1), center(2), center(3), center(4)];
    const d = b2.x - b1.x;
    // Columns stay vertical; only the right column is shifted up by 0.14·D.
    expect(b3.x).toBeCloseTo(b1.x);
    expect(b4.x).toBeCloseTo(b2.x);
    expect(b1.y - b2.y).toBeCloseTo(0.14 * d);
    expect(b3.y - b4.y).toBeCloseTo(0.14 * d);
    expect(b3.y - b1.y).toBeCloseTo(d);
    expect(b1.r).toBeCloseTo(0.41 * d);
    // Silhouette: black shapes drawn before (behind) the colored buttons, wider than each button.
    const silhouette = [...container.querySelectorAll(`g[fill="${COLORS.buttonOutline}"] circle`)];
    expect(silhouette).toHaveLength(4);
    expect(Number(silhouette[0]?.getAttribute('r'))).toBeCloseTo(b1.r * 1.35);
    // Everything fits inside the size box.
    for (const b of [b1, b2, b3, b4]) {
      expect(b.x - b.r * 1.35).toBeGreaterThanOrEqual(-1e-9);
      expect(b.y + b.r * 1.35).toBeLessThanOrEqual(40 + 1e-9);
      expect(b.y - b.r * 1.35).toBeGreaterThanOrEqual(-1e-9);
    }
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

describe('MotionIcon', () => {
  it.each(['qcf', 'qcb', 'hcf', 'hcb', 'cd', 'ff', 'bb', 'fff', 'bf', 'fb', 'fn', 'fcf', 'fcb'])('draws only arrows for %s, no letters', (motion) => {
    const { container } = render(<CommandSequence result={parseNotation(`${motion}+1`, { game: 'ttt2' })} />);
    const icon = container.querySelector(`[aria-label="${motion}"]`);
    expect(icon).not.toBeNull();
    expect(icon?.querySelectorAll('text')).toHaveLength(0);
    expect(icon?.querySelectorAll('[data-direction], [aria-label="neutral"]').length).toBeGreaterThan(0);
  });
});

describe('DirectionIcon neutral', () => {
  it('is a solid white 5-point star with one point straight up and no outline', () => {
    const { container } = render(
      <svg>
        <DirectionIcon direction="n" size={40} />
      </svg>,
    );
    const icon = container.querySelector('[aria-label="neutral"]');
    const shapes = icon?.querySelectorAll('path, polygon, circle, rect') ?? [];
    expect(shapes).toHaveLength(1);
    const star = shapes[0] as Element;
    expect(star.tagName).toBe('polygon');
    expect(star.getAttribute('fill')).toBe('#ffffff');
    expect(star.getAttribute('stroke') ?? 'none').toBe('none');
    const pts = (star.getAttribute('points') ?? '').trim().split(/\s+/).map((p) => p.split(',').map(Number));
    expect(pts).toHaveLength(10);
    const [tipX, tipY] = pts[0] as [number, number];
    expect(tipX).toBeCloseTo(20);
    expect(tipY).toBe(Math.min(...pts.map(([, py]) => py as number)));
    for (const [px, py] of pts) {
      expect(px).toBeGreaterThanOrEqual(0);
      expect(px).toBeLessThanOrEqual(40);
      expect(py).toBeGreaterThanOrEqual(0);
      expect(py).toBeLessThanOrEqual(40);
    }
  });
});

describe('event & mechanic labels', () => {
  const ys = (container: Element, text: string) => {
    const main = [...container.querySelectorAll('text')].find((t) => t.textContent === text);
    const caption = main?.nextElementSibling;
    return { main: Number(main?.getAttribute('y')), caption: Number(caption?.getAttribute('y')), captionText: caption?.textContent };
  };

  it.each([
    ['B!', 'ttt2', 'BOUND'],
    ['W!', 't7', 'WALL SPLAT'],
    ['T!', 't8', 'TORNADO'],
    ['HB', 't8', 'HEAT BURST'],
    ['RA', 't7', 'RAGE ART'],
  ] as const)('%s and its caption are centered in the box (y=20 / y=35.5 at size 40)', (abbr, game, caption) => {
    const { container } = render(<CommandSequence result={parseNotation(`1 ${abbr}`, { game })} size={40} />);
    const y = ys(container, abbr);
    expect(y.captionText).toBe(caption);
    expect(y.main).toBeCloseTo(20);
    expect(y.caption).toBeCloseTo(35.5);
  });

  it('scales with the command size', () => {
    const { container } = render(<CommandSequence result={parseNotation('1 B!', { game: 'ttt2' })} size={64} />);
    const y = ys(container, 'B!');
    expect(y.main).toBeCloseTo(80 * 0.4);
    expect(y.caption).toBeCloseTo(80 * 0.71);
  });
});
