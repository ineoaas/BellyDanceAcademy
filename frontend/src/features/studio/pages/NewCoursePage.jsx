import { useNavigate } from "react-router";
import { PageHeader, Panel } from "@/components/ui";
import { CourseForm } from "../components/CourseForm";
import { useCreateCourse } from "../hooks";

export default function NewCoursePage() {
  const navigate = useNavigate();
  const create = useCreateCourse();

  return (
    <>
      <PageHeader
        eyebrow="New Course"
        title="Create a Course"
        description="New courses go live once an admin reviews them — you can add lessons and video while you wait."
      />
      <Panel className="max-w-lg">
        <CourseForm
          mutation={create}
          submitLabel="Create Course"
          onSaved={(course) => navigate(`/instructor/courses/${course.id}`)}
        />
      </Panel>
    </>
  );
}
