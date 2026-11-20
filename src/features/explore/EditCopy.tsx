import { Button, LinkButton } from '../../components/ui/Button';
import { paths } from '../../hooks/useHashRoute';
import type { ComboDraft } from '../../types/combo';
import { clearHandoff, stashEditorDraft } from '../generator/handoff';

/** Opens the editor on an unsaved copy: the community combo itself is never changed. */
export function EditCopy({ draft, disabled = false }: { draft: ComboDraft; disabled?: boolean }) {
  if (disabled) return <Button disabled>Edit a copy</Button>;
  return <LinkButton href={paths.new()} onClick={() => { clearHandoff(); stashEditorDraft(draft); }}>Edit a copy</LinkButton>;
}
