import { ActionButton } from "./Button";

export function LoadingState({ label = "Loading…" }) {
  return (
    <p role="status" className="py-6 text-sm text-ink/50">
      {label}
    </p>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 py-6 text-sm text-burgundy">
      <span>{error?.message ?? "Something went wrong."}</span>
      {onRetry && <ActionButton onClick={onRetry}>Try again</ActionButton>}
    </div>
  );
}

/**
 * Renders a TanStack query's loading and error states, and hands the data
 * to `children` once it's there — so pages only describe the happy path.
 */
export function AsyncContent({ query, loading, children }) {
  if (query.isPending) return loading ?? <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  return children(query.data);
}
