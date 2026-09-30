import { Link, useParams } from "react-router";
import { Alert, AsyncContent, PageHeader, Panel } from "@/components/ui";
import { CourseForm } from "../components/CourseForm";
import { useStudioCourse, useUpdateCourse } from "../hooks";

export default function EditCoursePage() {
  const { courseId } = useParams();
  const course = useStudioCourse(courseId);
  const update = useUpdateCourse(courseId);

  return (
    <>
      <Link
        to={`/instructor/courses/${courseId}`}
        className="text-xs tracking-widest text-burgundy/70 uppercase hover:text-burgundy"
      >
        ← Manage Lessons
      </Link>
      <AsyncContent query={course}>
        {(data) => (
          <div className="mt-3">
            <PageHeader eyebrow="Edit Course" title={data.title} />
            {update.isSuccess && (
              <Alert tone="success" className="mb-6 max-w-lg">
                Course updated.
              </Alert>
            )}
            <Panel className="max-w-lg">
              <CourseForm key={data.id} course={data} mutation={update} submitLabel="Save Changes" />
            </Panel>
          </div>
        )}
      </AsyncContent>
    </>
  );
}
