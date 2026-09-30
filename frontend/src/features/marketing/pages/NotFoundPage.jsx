import { Button } from "@/components/ui";

export default function NotFoundPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-burgundy-deep px-6 py-16 text-center text-ivory">
      <div className="max-w-md">
        <span className="eyebrow text-gold">404</span>
        <h1 className="mt-3 mb-3 font-display text-3xl md:text-4xl">This page took a wrong turn</h1>
        <p className="mb-8 text-gold-pale/80">
          The page you&apos;re looking for doesn&apos;t exist, or may have moved.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button to="/">Back to Home</Button>
          <Button to="/courses" variant="outlineLight">
            Browse Courses
          </Button>
        </div>
      </div>
    </main>
  );
}
