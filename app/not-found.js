import Button from "@/components/Button";

export default function NotFound() {
  return (
    <main className="flex-1 bg-burgundy-deep text-ivory flex items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md">
        <span className="text-xs tracking-[0.24em] uppercase text-gold font-medium">404</span>
        <h1 className="font-display text-3xl md:text-4xl mt-3 mb-3">This page took a wrong turn</h1>
        <p className="text-gold-pale/80 mb-8">
          The page you&apos;re looking for doesn&apos;t exist, or may have moved.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button href="/" variant="primary">Back to Home</Button>
          <Button href="/courses" variant="outlineLight">Browse Courses</Button>
        </div>
      </div>
    </main>
  );
}
