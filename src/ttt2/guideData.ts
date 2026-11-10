/**
 * The bundled "TTT2 BNB Combos" guide. The original text ships with the app
 * (single source of truth) and is converted by the importer on first use; it
 * is loaded lazily so it does not weigh on the main bundle.
 */
import { importGuide } from './guideImporter';
import type { GuideLibrary } from './types';

export const GUIDE_SOURCE = {
  title: 'TTT2 BNB Combos',
  description: 'Solo combos, Tag Assault fillers and enders by character',
  credits: 'Compiled from Tekken Zaibatsu, YouTube and community contributors. Routes have not been independently tested.',
} as const;

let cached: Promise<GuideLibrary> | null = null;

export function loadGuideLibrary(): Promise<GuideLibrary> {
  cached ??= import('../data/ttt2/ttt2-bnb-combos.md?raw')
    .then((m) => importGuide(m.default, GUIDE_SOURCE.title))
    .catch((error: unknown) => {
      cached = null; // allow a retry
      throw error;
    });
  return cached;
}
