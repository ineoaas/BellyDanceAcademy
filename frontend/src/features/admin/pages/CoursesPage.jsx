import {
  ActionButton,
  ActionsCell,
  AsyncContent,
  Cell,
  ErrorAlert,
  PageHeader,
  Panel,
  Row,
  Table,
} from "@/components/ui";
import { catalogKeys } from "@/features/catalog/hooks";
import { formatDate, formatPrice } from "@/lib/format";
import { adminApi } from "../api";
import { useAdminAction, usePendingCourses } from "../hooks";

export default function CoursesPage() {
  const courses = usePendingCourses();
  const approve = useAdminAction(adminApi.approveCourse, { alsoInvalidate: [catalogKeys.all] });
  const reject = useAdminAction(adminApi.rejectCourse);
  const busy = approve.isPending || reject.isPending;

  return (
    <>
      <PageHeader eyebrow="Courses" title="Pending Course Approvals" />
      <Panel>
        <ErrorAlert error={approve.error ?? reject.error} className="mb-3" />
        <AsyncContent query={courses}>
          {(list) =>
            list.length === 0 ? (
              <p className="text-sm text-ink/55">No courses waiting on review.</p>
            ) : (
              <Table columns={["Course", "Instructor", "Price", "Submitted", ""]}>
                {list.map((course) => (
                  <Row key={course.id}>
                    <Cell className="font-medium">{course.title}</Cell>
                    <Cell>{course.instructorName}</Cell>
                    <Cell>{formatPrice(course.priceCents)}</Cell>
                    <Cell>{formatDate(course.submittedAt)}</Cell>
                    <ActionsCell>
                      <ActionButton variant="solid" disabled={busy} onClick={() => approve.mutate(course.id)}>
                        Approve
                      </ActionButton>
                      <ActionButton disabled={busy} onClick={() => reject.mutate(course.id)}>
                        Reject
                      </ActionButton>
                    </ActionsCell>
                  </Row>
                ))}
              </Table>
            )
          }
        </AsyncContent>
      </Panel>
    </>
  );
}
