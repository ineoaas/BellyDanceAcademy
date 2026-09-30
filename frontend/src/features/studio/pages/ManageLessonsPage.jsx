import { Link, useParams } from "react-router";
import {
  ActionButton,
  AsyncContent,
  Cell,
  CheckboxField,
  ErrorAlert,
  PageHeader,
  Panel,
  Row,
  StatusBadge,
  Table,
  TextField,
} from "@/components/ui";
import { formatDuration } from "@/lib/format";
import { fieldError, formValues } from "@/lib/forms";
import { LessonUploader } from "../components/LessonUploader";
import { useAddLesson, useMoveLesson, useStudioCourse, useStudioLessons } from "../hooks";

export default function ManageLessonsPage() {
  const { courseId } = useParams();
  const course = useStudioCourse(courseId);

  return (
    <>
      <Link
        to="/instructor"
        className="text-xs tracking-widest text-burgundy/70 uppercase hover:text-burgundy"
      >
        ← Back to Dashboard
      </Link>
      <AsyncContent query={course}>
        {(data) => (
          <div className="mt-3">
            <PageHeader
              eyebrow="Manage Lessons"
              title={data.title}
              description={
                data.status === "PENDING" ? "Awaiting admin review — add lessons while you wait." : undefined
              }
              actions={
                <>
                  <StatusBadge status={data.status} />
                  <ActionButton to={`/instructor/courses/${data.id}/edit`}>Edit Course Details</ActionButton>
                </>
              }
            />
            <LessonsPanel courseId={courseId} />
            <AddLessonPanel courseId={courseId} />
          </div>
        )}
      </AsyncContent>
    </>
  );
}

function LessonsPanel({ courseId }) {
  const lessons = useStudioLessons(courseId);
  const move = useMoveLesson(courseId);

  return (
    <Panel title="Lessons" className="mb-6">
      <ErrorAlert error={move.error} className="mb-3" />
      <AsyncContent query={lessons}>
        {(list) =>
          list.length === 0 ? (
            <p className="text-sm text-ink/55">No lessons yet — add the first one below.</p>
          ) : (
            <Table columns={["#", "Title", "Duration", "Preview", "Video", ""]}>
              {list.map((lesson, index) => (
                <Row key={lesson.id}>
                  <Cell>{lesson.position}</Cell>
                  <Cell className="font-medium">{lesson.title}</Cell>
                  <Cell>{formatDuration(lesson.durationSeconds) || "—"}</Cell>
                  <Cell>{lesson.preview ? "Yes" : "—"}</Cell>
                  <Cell>
                    <LessonUploader courseId={courseId} lesson={lesson} />
                  </Cell>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      aria-label={`Move ${lesson.title} up`}
                      disabled={index === 0 || move.isPending}
                      onClick={() => move.mutate({ lessonId: lesson.id, direction: "UP" })}
                      className="px-2 text-xs disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${lesson.title} down`}
                      disabled={index === list.length - 1 || move.isPending}
                      onClick={() => move.mutate({ lessonId: lesson.id, direction: "DOWN" })}
                      className="px-2 text-xs disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </td>
                </Row>
              ))}
            </Table>
          )
        }
      </AsyncContent>
    </Panel>
  );
}

function AddLessonPanel({ courseId }) {
  const add = useAddLesson(courseId);

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const { title, preview } = formValues(form);
    add.mutate({ title, preview }, { onSuccess: () => form.reset() });
  }

  return (
    <Panel title="Add Lesson">
      <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-3">
        <ErrorAlert error={add.error} />
        <TextField
          label="Lesson title"
          name="title"
          required
          maxLength={150}
          error={fieldError(add.error, "title")}
        />
        <CheckboxField name="preview" label="Playable as a free preview" />
        <ActionButton type="submit" variant="solid" className="self-start px-5 py-3" disabled={add.isPending}>
          Add Lesson
        </ActionButton>
      </form>
    </Panel>
  );
}
