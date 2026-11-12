import { useToast } from '../../components/ui/Toast';
import { errorMessage, useRepository } from '../../hooks/useCombos';
import type { Combo } from '../../types/combo';

/** Flips a combo's favorite flag, then reloads the list (errors are reported in a toast). */
export function useToggleFavorite(reload: () => Promise<void>): (combo: Combo) => Promise<void> {
  const repo = useRepository();
  const toast = useToast();
  return async (combo: Combo) => {
    try {
      await repo.setFavorite(combo.id, !combo.favorite);
      await reload();
    } catch (e) {
      toast(`Could not update favorite: ${errorMessage(e)}`, 'error');
    }
  };
}
