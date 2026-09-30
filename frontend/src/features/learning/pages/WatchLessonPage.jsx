import { Link, Navigate, useLocation, useParams } from "react-router";
import { ErrorState, LoadingState } from "@/components/ui";
import NotFoundPage from "@/features/marketing/pages/NotFoundPage";
import { LessonPlayer } from "../components/LessonPlayer";
import { useLesson, useReportProgress } from "../hooks";

export default function WatchLessonPage() {
  const { slug, lessonId } = useParams();
  const location = useLocation();
  const lesson = useLesson(slug, lessonId);
  const reportProgress = useReportProgress();

  if (lesson.isPending) return <LoadingState />;
  if (lesson.isError) {
    const { status } = lesson.error;
    if (status === 401) {
      const params = new URLSearchParams({ as: "student", redirect: location.pathname });
      return <Navigate to={`/login?${params}`} replace />;
    }
    if (status === 403) return <Navigate to={`/courses/${slug}?locked=1`} replace />;
    if (status === 404) return <NotFoundPage />;
    return <ErrorState error={lesson.error} onRetry={() => lesson.refetch()} />;
  }

  const { course, lesson: current, lessons } = lesson.data;

  return (
    <main className="grid flex-1 bg-burgundy-deep text-ivory md:grid-cols-[1fr_280px]">
      <div className="p-6">
        <div className="mb-4 text-xs text-gold-pale/55">
          <Link to={`/courses/${course.slug}`} className="hover:text-gold-light">
            {course.title}
          </Link>{" "}
          / <span className="text-gold-light">{current.title}</span>
        </div>

        <LessonPlayer
          key={current.id}
          title={current.title}
          playbackId={current.playbackId}
          playbackToken={current.playbackToken}
          startTime={current.startPositionSeconds}
          onProgress={
            current.trackProgress
              ? (positionSeconds) => reportProgress.mutate({ lessonId: current.id, positionSeconds })
              : undefined
          }
        />

        <h1 className="mt-4 font-display text-xl">{current.title}</h1>
      </div>

      <aside className="border-l border-gold/20 bg-burgundy-dark p-6">
        <h2 className="mb-4 text-xs tracking-widest text-gold uppercase">Lessons</h2>
        <ol className="space-y-1 text-sm">
          {lessons.map((item) => {
            const label = (
              <>
                {item.position}. {item.title}
                {item.completed && <span className="ml-1 text-gold" aria-label="completed">✓</span>}
              </>
            );
            if (!item.watchable) {
              return (
                <li key={item.id} className="px-3 py-2 text-gold-pale/40">
                  {label}
                </li>
              );
            }
            const active = item.id === current.id;
            return (
              <li key={item.id}>
                <Link
                  to={`/courses/${course.slug}/watch/${item.id}`}
                  aria-current={active ? "page" : undefined}
                  className={`block border-l-2 px-3 py-2 ${
                    active ? "border-gold-light text-gold-light" : "border-transparent hover:text-gold-light"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ol>
      </aside>
    </main>
  );
}
