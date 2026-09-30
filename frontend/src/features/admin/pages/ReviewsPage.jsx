import { Link } from "react-router";
import { ActionButton, ActionsCell, AsyncContent, Cell, ErrorAlert, PageHeader, Panel, Row, StatusBadge, Table } from "@/components/ui";
import { catalogKeys } from "@/features/catalog/hooks";
import { adminApi } from "../api";
import { useAdminAction, useModeratedReviews } from "../hooks";

export default function ReviewsPage() {
  const reviews = useModeratedReviews();
  const setStatus = useAdminAction(({ id, status }) => adminApi.setReviewStatus(id, status), {
    alsoInvalidate: [catalogKeys.all],
  });

  return (
    <>
      <PageHeader eyebrow="Reviews" title="Moderate Reviews" />
      <Panel>
        <ErrorAlert error={setStatus.error} className="mb-3" />
        <AsyncContent query={reviews}>
          {(list) =>
            list.length === 0 ? (
              <p className="text-sm text-ink/55">No reviews yet.</p>
            ) : (
              <Table columns={["Course", "Student", "Rating", "Comment", "Status", ""]}>
                {list.map((review) => {
                  const visible = review.status === "VISIBLE";
                  return (
                    <Row key={review.id} className="align-top">
                      <Cell className="font-medium">
                        <Link to={`/courses/${review.courseSlug}`}>{review.courseTitle}</Link>
                      </Cell>
                      <Cell>{review.studentName}</Cell>
                      <Cell>
                        <span aria-label={`${review.rating} out of 5`}>{"★".repeat(review.rating)}</span>
                      </Cell>
                      <Cell className="max-w-xs">{review.comment || "—"}</Cell>
                      <Cell>
                        <StatusBadge status={review.status} />
                      </Cell>
                      <ActionsCell>
                        <ActionButton
                          disabled={setStatus.isPending}
                          onClick={() => setStatus.mutate({ id: review.id, status: visible ? "HIDDEN" : "VISIBLE" })}
                        >
                          {visible ? "Hide" : "Unhide"}
                        </ActionButton>
                      </ActionsCell>
                    </Row>
                  );
                })}
              </Table>
            )
          }
        </AsyncContent>
      </Panel>
    </>
  );
}
