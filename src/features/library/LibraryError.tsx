/** The library could not be read: the cause from storage, then what the user can do about it. */
export function LibraryError({ message }: { message: string }) {
  return (
    <div role="alert" className="flex flex-col gap-1 rounded-lg border border-danger bg-danger-surface p-3 text-sm text-fg">
      <p className="font-semibold">{message}</p>
      <p>Your combos are kept in this browser's storage. Reload the page. If it keeps failing, check that this browser allows site data (private windows can block it).</p>
    </div>
  );
}
