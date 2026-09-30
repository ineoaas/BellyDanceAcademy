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
import { formatDate } from "@/lib/format";
import { adminApi } from "../api";
import { useAdminAction, useApplications } from "../hooks";

export default function ApplicationsPage() {
  const applications = useApplications();
  const approve = useAdminAction(adminApi.approveApplication);
  const reject = useAdminAction(adminApi.rejectApplication);
  const busy = approve.isPending || reject.isPending;

  return (
    <>
      <PageHeader eyebrow="Applications" title="Pending Instructor Applications" />
      <Panel>
        <ErrorAlert error={approve.error ?? reject.error} className="mb-3" />
        <AsyncContent query={applications}>
          {(list) =>
            list.length === 0 ? (
              <p className="text-sm text-ink/55">No applications waiting on review.</p>
            ) : (
              <Table columns={["Name", "Email", "Applied", ""]}>
                {list.map((application) => (
                  <Row key={application.id}>
                    <Cell className="font-medium">{application.name}</Cell>
                    <Cell>{application.email}</Cell>
                    <Cell>{formatDate(application.appliedAt)}</Cell>
                    <ActionsCell>
                      <ActionButton
                        variant="solid"
                        disabled={busy}
                        onClick={() => approve.mutate(application.id)}
                      >
                        Approve
                      </ActionButton>
                      <ActionButton disabled={busy} onClick={() => reject.mutate(application.id)}>
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
