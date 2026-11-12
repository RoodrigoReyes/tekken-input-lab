/** The team fields of the generator settings that change when the teammate starts the combo instead. */
export interface TeamFields {
  point: string;
  mate: string;
  pointForm: string;
  partnerForm: string;
  starter: string;
}

/**
 * The teammate becomes the point character (and vice versa), each keeping their form.
 * The starter resets because starters belong to the point character's routes; every other
 * option (context, starter types, who does the filler/ender, …) is kept as is.
 */
export function swapTeam<T extends TeamFields>(settings: T): T {
  return {
    ...settings,
    point: settings.mate,
    mate: settings.point,
    pointForm: settings.partnerForm,
    partnerForm: settings.pointForm,
    starter: '',
  };
}
