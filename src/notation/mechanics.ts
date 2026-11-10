/**
 * Layer 2 — game mechanics and their availability per game.
 * Mirrors the Mechanics Availability Matrix of the project spec.
 * Using a mechanic where it is not available produces a warning (see parser/validate.ts),
 * never an error and never a silent reinterpretation.
 */
import type { GameId, Severity } from '../types/notation';
import { own } from './core/lexicon';

export type MechanicId =
  | 'bound'
  | 'screw'
  | 'tornado'
  | 'wallSplat'
  | 'wallBreak'
  | 'floorBreak'
  | 'balconyBreak'
  | 'wallBlast'
  | 'floorBlast'
  | 'wallBound'
  | 'tagButton'
  | 'tagAssault'
  | 'heat'
  | 'heatBurst'
  | 'heatSmash'
  | 'heatDash'
  | 'heatEngager'
  | 'rageArt'
  | 'rageDrive';

export type Availability =
  | { status: 'yes' }
  /** Present only in some form/version — always reported as info. */
  | { status: 'conditional'; severity: Severity; message: string }
  | { status: 'no'; message: string };

export interface MechanicDef {
  id: MechanicId;
  label: string;
  /** Short caption shown under the abbreviation in the visualizer. */
  caption: string;
  /** Extenders: at most one per combo. */
  extender?: boolean;
  availability: Record<GameId, Availability>;
}

const YES: Availability = { status: 'yes' };
const no = (message: string): Availability => ({ status: 'no', message });
const info = (message: string): Availability => ({ status: 'conditional', severity: 'info', message });

export const MECHANICS: Readonly<Record<MechanicId, MechanicDef>> = {
  bound: {
    id: 'bound',
    label: 'Bound',
    caption: 'BOUND',
    extender: true,
    availability: {
      t6: YES,
      ttt2: YES,
      // T7/T8 special rules live in validate.ts (juggle context / Heat Burst).
      t7: {
        status: 'conditional',
        severity: 'warning',
        message:
          'Bound is not a juggle extender in Tekken 7 (Screw replaced it). It only occurs after low parries or certain strings on standing opponents.',
      },
      t8: {
        status: 'conditional',
        severity: 'warning',
        message: 'In Tekken 8, Bound only occurs after a Heat Burst on an airborne opponent.',
      },
    },
  },
  screw: {
    id: 'screw',
    label: 'Screw / Tailspin',
    caption: 'SCREW',
    extender: true,
    availability: {
      t6: no('Screw does not exist in Tekken 6 (Bound is the juggle extender).'),
      ttt2: no('Screw does not exist in Tekken Tag Tournament 2 (Bound is the juggle extender).'),
      t7: YES,
      t8: no('Screw does not exist in Tekken 8 (Tornado replaced it).'),
    },
  },
  tornado: {
    id: 'tornado',
    label: 'Tornado',
    caption: 'TORNADO',
    extender: true,
    availability: {
      t6: no('Tornado does not exist in Tekken 6 (Bound is the juggle extender).'),
      ttt2: no('Tornado does not exist in Tekken Tag Tournament 2 (Bound is the juggle extender).'),
      t7: no('Tornado does not exist in Tekken 7 (Screw is the juggle extender).'),
      t8: YES,
    },
  },
  wallSplat: {
    id: 'wallSplat',
    label: 'Wall Splat',
    caption: 'WALL SPLAT',
    availability: { t6: YES, ttt2: YES, t7: YES, t8: YES },
  },
  wallBreak: {
    id: 'wallBreak',
    label: 'Wall Break',
    caption: 'WALL BREAK',
    availability: { t6: YES, ttt2: YES, t7: YES, t8: YES },
  },
  floorBreak: {
    id: 'floorBreak',
    label: 'Floor Break',
    caption: 'FLOOR BREAK',
    availability: { t6: YES, ttt2: YES, t7: YES, t8: YES },
  },
  balconyBreak: {
    id: 'balconyBreak',
    label: 'Balcony Break',
    caption: 'BALCONY BREAK',
    availability: {
      t6: no('Balcony Break does not exist in Tekken 6 (introduced in Tekken Tag Tournament 2).'),
      ttt2: YES,
      t7: YES,
      t8: YES,
    },
  },
  wallBlast: {
    id: 'wallBlast',
    label: 'Wall Blast',
    caption: 'WALL BLAST',
    availability: {
      t6: no('Wall Blast is a Tekken 8 stage gimmick.'),
      ttt2: no('Wall Blast is a Tekken 8 stage gimmick.'),
      t7: no('Wall Blast is a Tekken 8 stage gimmick.'),
      t8: YES,
    },
  },
  floorBlast: {
    id: 'floorBlast',
    label: 'Floor Blast',
    caption: 'FLOOR BLAST',
    availability: {
      t6: no('Floor Blast is a Tekken 8 stage gimmick.'),
      ttt2: no('Floor Blast is a Tekken 8 stage gimmick.'),
      t7: no('Floor Blast is a Tekken 8 stage gimmick.'),
      t8: YES,
    },
  },
  wallBound: {
    id: 'wallBound',
    label: 'Wall Bound',
    caption: 'WALL BOUND',
    availability: {
      t6: info('In Tekken 6, Wall Bound is only a character-specific property (e.g. NANCY-MI847J), not a general mechanic.'),
      ttt2: no('Wall Bound is not a general mechanic in Tekken Tag Tournament 2.'),
      t7: info('Wall Bound was added in Tekken 7 Season 2; it is not available in launch versions.'),
      t8: YES,
    },
  },
  tagButton: {
    id: 'tagButton',
    label: 'TAG',
    caption: 'TAG',
    availability: {
      t6: no('The TAG button (5) only exists in Tekken Tag Tournament 2.'),
      ttt2: YES,
      t7: no('The TAG button (5) only exists in Tekken Tag Tournament 2.'),
      t8: no('The TAG button (5) only exists in Tekken Tag Tournament 2.'),
    },
  },
  tagAssault: {
    id: 'tagAssault',
    label: 'Tag Assault',
    caption: 'TAG ASSAULT',
    availability: {
      t6: no('Tag Assault only exists in Tekken Tag Tournament 2.'),
      ttt2: YES,
      t7: no('Tag Assault only exists in Tekken Tag Tournament 2.'),
      t8: no('Tag Assault only exists in Tekken Tag Tournament 2.'),
    },
  },
  heat: {
    id: 'heat',
    label: 'Heat',
    caption: 'HEAT',
    availability: {
      t6: no('The Heat system only exists in Tekken 8.'),
      ttt2: no('The Heat system only exists in Tekken 8.'),
      t7: no('The Heat system only exists in Tekken 8.'),
      t8: YES,
    },
  },
  heatBurst: {
    id: 'heatBurst',
    label: 'Heat Burst',
    caption: 'HEAT BURST',
    availability: {
      t6: no('Heat Burst only exists in Tekken 8.'),
      ttt2: no('Heat Burst only exists in Tekken 8.'),
      t7: no('Heat Burst only exists in Tekken 8.'),
      t8: YES,
    },
  },
  heatSmash: {
    id: 'heatSmash',
    label: 'Heat Smash',
    caption: 'HEAT SMASH',
    availability: {
      t6: no('Heat Smash only exists in Tekken 8.'),
      ttt2: no('Heat Smash only exists in Tekken 8.'),
      t7: no('Heat Smash only exists in Tekken 8.'),
      t8: YES,
    },
  },
  heatDash: {
    id: 'heatDash',
    label: 'Heat Dash',
    caption: 'HEAT DASH',
    availability: {
      t6: no('Heat Dash only exists in Tekken 8.'),
      ttt2: no('Heat Dash only exists in Tekken 8.'),
      t7: no('Heat Dash only exists in Tekken 8.'),
      t8: YES,
    },
  },
  heatEngager: {
    id: 'heatEngager',
    label: 'Heat Engager',
    caption: 'HEAT ENGAGER',
    availability: {
      t6: no('Heat Engagers only exist in Tekken 8.'),
      ttt2: no('Heat Engagers only exist in Tekken 8.'),
      t7: no('Heat Engagers only exist in Tekken 8.'),
      t8: YES,
    },
  },
  rageArt: {
    id: 'rageArt',
    label: 'Rage Art',
    caption: 'RAGE ART',
    availability: {
      t6: no('Rage Art does not exist in Tekken 6 (Rage is only a passive damage boost).'),
      ttt2: no('Rage Art does not exist in Tekken Tag Tournament 2 (Netsu replaces Rage).'),
      t7: YES,
      t8: YES,
    },
  },
  rageDrive: {
    id: 'rageDrive',
    label: 'Rage Drive',
    caption: 'RAGE DRIVE',
    availability: {
      t6: no('Rage Drive does not exist in Tekken 6.'),
      ttt2: no('Rage Drive does not exist in Tekken Tag Tournament 2.'),
      t7: info('Rage Drive was added in Tekken 7: Fated Retribution.'),
      t8: no('Rage Drive does not exist in Tekken 8 (Heat Smash replaced it).'),
    },
  },
};

/** Mechanic keywords written as plain words (not `X!` events). Case-insensitive. */
export const MECHANIC_WORDS: Readonly<Record<string, { mechanic: MechanicId; abbr: string }>> = {
  ra: { mechanic: 'rageArt', abbr: 'RA' },
  rd: { mechanic: 'rageDrive', abbr: 'RD' },
  hb: { mechanic: 'heatBurst', abbr: 'HB' },
  hs: { mechanic: 'heatSmash', abbr: 'HS' },
  hd: { mechanic: 'heatDash', abbr: 'HD' },
  he: { mechanic: 'heatEngager', abbr: 'HE' },
};

export function lookupMechanicWord(word: string): { mechanic: MechanicId; abbr: string } | null {
  return own(MECHANIC_WORDS, word.toLowerCase()) ?? null;
}

export function availabilityOf(mechanic: MechanicId, game: GameId): Availability {
  return MECHANICS[mechanic].availability[game];
}
