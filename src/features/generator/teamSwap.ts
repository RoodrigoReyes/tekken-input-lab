/** The team fields of the generator settings that change when the teammate starts the combo instead. */
export interface TeamFields {
  point: string;
  mate: string;
  pointForm: string;
  partnerForm: string;
  /** Chosen route, TA filler and ender ('' = automatic pick). */
  routeId: string;
  fillerId: string;
  enderId: string;
}

/**
 * The teammate becomes the point character (and vice versa), each keeping their form.
 * The chosen pieces reset because they belong to the old roles (routes are the point
 * character's); every other option (context, who does the filler/ender, …) is kept as is.
 */
export function swapTeam<T extends TeamFields>(settings: T): T {
  return {
    ...settings,
    point: settings.mate,
    mate: settings.point,
    pointForm: settings.partnerForm,
    partnerForm: settings.pointForm,
    routeId: '',
    fillerId: '',
    enderId: '',
  };
}
