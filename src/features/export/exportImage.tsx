import { renderToStaticMarkup } from 'react-dom/server';
import chakra400 from '@fontsource/chakra-petch/files/chakra-petch-latin-400-normal.woff2?inline';
import chakra600 from '@fontsource/chakra-petch/files/chakra-petch-latin-600-normal.woff2?inline';
import chakra700 from '@fontsource/chakra-petch/files/chakra-petch-latin-700-normal.woff2?inline';
import { ComboSvg } from '../../components/arcade/ComboSvg';
import { getGame } from '../../notation/games';
import { layoutCombo } from '../../render/layout';
import { measureText, type MeasureFn } from '../../render/measure';
import type { Side } from '../../render/side';
import type { Combo } from '../../types/combo';
import type { ParsedCombo } from '../combo/parseCombo';

/** The weights the arcade SVG uses, as data URLs, so exports render the same without the font installed. */
const FONT_STYLE = `<style>${([
  [400, chakra400],
  [600, chakra600],
  [700, chakra700],
] as const)
  .map(([weight, url]) => `@font-face{font-family:"Chakra Petch";font-weight:${weight};src:url(${url}) format("woff2")}`)
  .join('')}</style>`;

export interface ExportOptions {
  size: number;
  expandNamed: boolean;
  /** Player side: 2P mirrors forward/back arrows. */
  side?: Side;
  /** Draw motion inputs (qcf, cd, ff, …) inside a frame. */
  motionFrame?: boolean;
  /** Maximum image width before wrapping. */
  width?: number;
  measure?: MeasureFn;
}

export function exportHeading(
  combo: Pick<Combo, 'name' | 'game' | 'character' | 'partner' | 'damage'>,
  side: Side = 'left',
): { title: string; subtitle: string } {
  const who = [combo.character, combo.partner].filter(Boolean).join(' + ');
  const parts = [
    getGame(combo.game).name,
    who,
    combo.damage !== undefined ? `${combo.damage} dmg` : '',
    side === 'right' ? '2P side' : '',
  ].filter(Boolean);
  return { title: combo.name, subtitle: parts.join(' · ') };
}

/** Self-contained SVG document for a combo (same renderer as the screen). */
export function comboSvgMarkup(parsed: ParsedCombo, heading: { title: string; subtitle?: string }, options: ExportOptions): string {
  const measure = options.measure ?? measureText;
  const layout = layoutCombo(parsed.result, {
    width: options.width ?? 1200,
    size: options.size,
    expandNamed: options.expandNamed,
    sectionHeaders: parsed.headers,
    motionFrame: options.motionFrame,
    measure,
  });
  // Widen the image when the heading is longer than the commands, so it is never clipped.
  const s = layout.size;
  const headingW = Math.max(measure(heading.title, s * 0.42, 700), heading.subtitle ? measure(heading.subtitle, s * 0.28, 600) : 0) + s * 0.4;
  const sized = { ...layout, width: Math.ceil(Math.max(layout.width, headingW)) };
  const svg = renderToStaticMarkup(<ComboSvg layout={sized} heading={heading} background title={parsed.result.original} side={options.side} />);
  // C0 control characters are invalid in XML 1.0 and would break SVG/PNG export.
  // eslint-disable-next-line no-control-regex
  const clean = svg.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  return `<?xml version="1.0" encoding="UTF-8"?>\n${clean.replace(/^<svg[^>]*>/, (open) => open + FONT_STYLE)}`;
}

export function safeFilename(name: string): string {
  const base = name.normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
  return base.slice(0, 60) || 'combo';
}

export { downloadBlob } from './download';

/** Rasterize an SVG document to PNG in the browser. */
export function svgToPng(svg: string, scale = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(img.width * scale);
      canvas.height = Math.ceil(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas is not available in this browser.'));
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed.'))), 'image/png');
    };
    img.onerror = () => reject(new Error('Could not render the SVG image.'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}
