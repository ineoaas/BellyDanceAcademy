import { useRouteError } from "react-router";
import { Button } from "@/components/ui";
import NotFoundPage from "@/features/marketing/pages/NotFoundPage";

/** Catches render errors and failed lazy-route loads so one bad page never blanks the app. */
export function RouteError() {
  const error = useRouteError();
  if (error?.status === 404) return <NotFoundPage />;

  return (
    <main className="flex flex-1 items-center justify-center bg-burgundy-deep px-6 py-16 text-center text-ivory">
      <div className="max-w-md">
        <span className="eyebrow text-gold">Error</span>
        <h1 className="mt-3 mb-3 font-display text-3xl">Something went wrong</h1>
        <p className="mb-8 text-gold-pale/80">Please refresh the page. If it keeps happening, let us know.</p>
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>
    </main>
  );
}
