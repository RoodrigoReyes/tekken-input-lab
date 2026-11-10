import { renderToStaticMarkup } from 'react-dom/server';
import { ComboSvg } from '../../components/arcade/ComboSvg';
import { getGame } from '../../notation/games';
import { layoutCombo } from '../../render/layout';
import { measureText, type MeasureFn } from '../../render/measure';
import type { Combo } from '../../types/combo';
import type { ParsedCombo } from '../combo/parseCombo';

export interface ExportOptions {
  size: number;
  expandNamed: boolean;
  /** Maximum image width before wrapping. */
  width?: number;
  measure?: MeasureFn;
}

export function exportHeading(combo: Pick<Combo, 'name' | 'game' | 'character' | 'partner' | 'damage'>): { title: string; subtitle: string } {
  const who = [combo.character, combo.partner].filter(Boolean).join(' + ');
  const parts = [getGame(combo.game).name, who, combo.damage !== undefined ? `${combo.damage} dmg` : ''].filter(Boolean);
  return { title: combo.name, subtitle: parts.join(' · ') };
}

/** Self-contained SVG document for a combo (same renderer as the screen). */
export function comboSvgMarkup(parsed: ParsedCombo, heading: { title: string; subtitle?: string }, options: ExportOptions): string {
  const layout = layoutCombo(parsed.result, {
    width: options.width ?? 1200,
    size: options.size,
    expandNamed: options.expandNamed,
    sectionHeaders: parsed.headers,
    measure: options.measure ?? measureText,
  });
  const svg = renderToStaticMarkup(<ComboSvg layout={layout} heading={heading} background title={parsed.result.original} />);
  // C0 control characters are invalid in XML 1.0 and would break SVG/PNG export.
  // eslint-disable-next-line no-control-regex
  const clean = svg.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  return `<?xml version="1.0" encoding="UTF-8"?>\n${clean}`;
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
