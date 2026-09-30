import { useParams } from "react-router";
import { ErrorState, LoadingState, Medallion } from "@/components/ui";
import { CourseGrid } from "@/features/catalog/components/CourseCard";
import NotFoundPage from "@/features/marketing/pages/NotFoundPage";
import { useInstructorPage } from "../hooks";

export default function InstructorProfilePage() {
  const { slug } = useParams();
  const instructor = useInstructorPage(slug);

  if (instructor.isPending) return <LoadingState />;
  if (instructor.isError) {
    return instructor.error.status === 404 ? (
      <NotFoundPage />
    ) : (
      <ErrorState error={instructor.error} onRetry={instructor.refetch} />
    );
  }

  const { name, city, credentials, bio, courses } = instructor.data;

  return (
    <main className="flex-1">
      <section className="bg-burgundy-deep text-ivory">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-8 px-6 py-14">
          <Medallion text={name} size="xl" className="border border-gold bg-cream text-burgundy" />
          <div>
            <h1 className="font-display text-3xl">{name}</h1>
            {city && <p className="mt-1 text-gold-pale/70">{city}</p>}
            {credentials && <p className="mt-2 text-xs tracking-widest text-gold uppercase">{credentials}</p>}
          </div>
        </div>
      </section>

      {bio && (
        <section className="py-10">
          <div className="mx-auto max-w-3xl px-6">
            <p className="whitespace-pre-line text-ink/75">{bio}</p>
          </div>
        </section>
      )}

      <section className="py-10">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-6 font-display text-xl">Courses by {name}</h2>
          <CourseGrid courses={courses} empty="No live courses yet." />
        </div>
      </section>
    </main>
  );
}
