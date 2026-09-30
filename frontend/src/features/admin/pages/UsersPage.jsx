import { ActionButton, ActionsCell, Alert, AsyncContent, Cell, ErrorAlert, PageHeader, Panel, Row, StatusBadge, Table } from "@/components/ui";
import { useCurrentUser } from "@/features/auth/hooks";
import { ROLE_LABELS } from "@/lib/labels";
import { adminApi } from "../api";
import { useAdminAction, useUsers } from "../hooks";

export default function UsersPage() {
  const me = useCurrentUser();
  const users = useUsers();
  const suspend = useAdminAction(adminApi.suspendUser);
  const reactivate = useAdminAction(adminApi.reactivateUser);
  const remove = useAdminAction(adminApi.deleteUser);
  const busy = suspend.isPending || reactivate.isPending || remove.isPending;

  function confirmDelete(user) {
    if (window.confirm(`Permanently delete ${user.name}'s account? This can't be undone.`)) {
      remove.mutate(user.id);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Users" title="Manage Users" />
      <div className="mb-6 max-w-lg">
        {remove.isSuccess && <Alert tone="success">Account deleted.</Alert>}
        <ErrorAlert error={suspend.error ?? reactivate.error ?? remove.error} />
      </div>
      <Panel>
        <AsyncContent query={users}>
          {(list) => (
            <Table columns={["Name", "Email", "Role", "Status", ""]}>
              {list.map((user) => (
                <Row key={user.id}>
                  <Cell className="font-medium">{user.name}</Cell>
                  <Cell>{user.email}</Cell>
                  <Cell>{ROLE_LABELS[user.role]}</Cell>
                  <Cell>
                    <StatusBadge status={user.status} />
                  </Cell>
                  <ActionsCell>
                    {user.id === me.id ? (
                      <span className="text-xs text-ink/40">You</span>
                    ) : (
                      <>
                        {user.status === "ACTIVE" && (
                          <ActionButton disabled={busy} onClick={() => suspend.mutate(user.id)}>
                            Suspend
                          </ActionButton>
                        )}
                        {user.status === "SUSPENDED" && (
                          <ActionButton disabled={busy} onClick={() => reactivate.mutate(user.id)}>
                            Reactivate
                          </ActionButton>
                        )}
                        <ActionButton variant="danger" disabled={busy} onClick={() => confirmDelete(user)}>
                          Delete
                        </ActionButton>
                      </>
                    )}
                  </ActionsCell>
                </Row>
              ))}
            </Table>
          )}
        </AsyncContent>
      </Panel>
    </>
  );
}
