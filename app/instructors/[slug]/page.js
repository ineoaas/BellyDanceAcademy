import { notFound } from "next/navigation";
import { findProfileBySlug } from "@/lib/instructorProfiles";
import { listLiveCourses, formatCourseForDisplay } from "@/lib/courses";
import CourseCard from "@/components/CourseCard";

export default async function InstructorProfilePage({ params }) {
  const { slug } = await params;
  const profile = findProfileBySlug(slug);
  if (!profile) return notFound();

  const courses = listLiveCourses({ instructorId: profile.user_id }).map(formatCourseForDisplay);

  return (
    <main className="flex-1">
      <section className="bg-burgundy-deep text-ivory">
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-14 flex gap-8 items-center flex-wrap">
          <div className="medallion w-28 h-28 bg-cream border border-gold font-display text-3xl text-burgundy shrink-0">
            {profile.name[0]}
          </div>
          <div>
            <h1 className="font-display text-3xl">{profile.name}</h1>
            {profile.city && <p className="text-gold-pale/70 mt-1">{profile.city}</p>}
            {profile.credentials && (
              <p className="text-xs uppercase tracking-widest text-gold mt-2">{profile.credentials}</p>
            )}
          </div>
        </div>
      </section>

      {profile.bio && (
        <section className="py-10">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-ink/75">{profile.bio}</p>
          </div>
        </section>
      )}

      <section className="pb-14">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-xl mb-6">Courses by {profile.name}</h2>
          {courses.length === 0 ? (
            <p className="text-sm text-ink/55">No live courses yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
