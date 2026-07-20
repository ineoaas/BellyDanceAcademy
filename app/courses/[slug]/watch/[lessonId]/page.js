import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { findCourseBySlug, getLessonsForCourse } from "@/lib/courses";
import { hasPurchased } from "@/lib/purchases";
import { getLessonProgressForStudent } from "@/lib/progress";
import { getCurrentUser } from "@/lib/auth";
import mux from "@/lib/mux";
import LessonPlayer from "@/components/LessonPlayer";

export default async function WatchLessonPage({ params }) {
  const { slug, lessonId } = await params;

  const course = findCourseBySlug(slug);
  if (!course) return notFound();

  const lessons = getLessonsForCourse(course.id);
  const lesson = lessons.find((l) => l.id === Number(lessonId));
  if (!lesson) return notFound();

  const user = await getCurrentUser();
  const isOwner = user?.id === course.instructor_id;
  const isEnrolled = user?.role === "student" && hasPurchased(user.id, course.id);

  const canWatchThisLesson = lesson.is_preview || isOwner || isEnrolled;
  if (!canWatchThisLesson) {
    if (!user) redirect(`/login?as=student&redirect=/courses/${slug}/watch/${lessonId}`);
    redirect(`/courses/${slug}?error=locked`);
  }

  let playbackToken;
  if (lesson.mux_playback_id && !lesson.is_preview) {
    playbackToken = await mux.signPlaybackToken(lesson.mux_playback_id);
  }

  let startTime = 0;
  if (isEnrolled) {
    const progress = getLessonProgressForStudent(user.id, lesson.id);
    startTime = progress?.seconds_watched ?? 0;
  }

  return (
    <main className="flex-1 grid md:grid-cols-[1fr_280px] bg-burgundy-deep text-ivory">
      <div className="p-6">
        <div className="text-xs text-gold-pale/55 mb-4">
          <Link href={`/courses/${course.slug}`} className="hover:text-gold-light">
            {course.title}
          </Link>{" "}
          / <span className="text-gold-light">{lesson.title}</span>
        </div>

        <LessonPlayer
          lesson={lesson}
          courseId={course.id}
          playbackToken={playbackToken}
          startTime={startTime}
          trackProgress={isEnrolled}
        />

        <h1 className="font-display text-xl mt-4">{lesson.title}</h1>
      </div>

      <aside className="bg-burgundy-dark p-6 border-l border-gold/20">
        <h3 className="text-xs uppercase tracking-widest text-gold mb-4">Lessons</h3>
        <ol className="space-y-1 text-sm">
          {lessons.map((l) => {
            const watchable = l.is_preview || isOwner || isEnrolled;
            const isActive = l.id === lesson.id;
            if (!watchable) {
              return (
                <li key={l.id} className="px-3 py-2 text-gold-pale/40">
                  {l.position}. {l.title}
                </li>
              );
            }
            return (
              <li key={l.id}>
                <Link
                  href={`/courses/${course.slug}/watch/${l.id}`}
                  className={`block px-3 py-2 border-l-2 ${
                    isActive ? "border-gold-light text-gold-light" : "border-transparent hover:text-gold-light"
                  }`}
                >
                  {l.position}. {l.title}
                </Link>
              </li>
            );
          })}
        </ol>
      </aside>
    </main>
  );
}
