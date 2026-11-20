import { createPreference } from '../../hooks/createPreference';
import type { VerifiedEnder } from '../../ttt2/generator';

export const verifiedEnders = createPreference<VerifiedEnder[]>({
  key: 'ttt2-verified-enders',
  parse: (raw) => {
    try {
      const value: unknown = JSON.parse(raw ?? '[]');
      return Array.isArray(value) ? value.filter((e): e is VerifiedEnder =>
        e && typeof e.character === 'string' && typeof e.form === 'string' && typeof e.notation === 'string') : [];
    } catch {
      return [];
    }
  },
  serialize: JSON.stringify,
});
