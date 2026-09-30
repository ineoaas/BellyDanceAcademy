import {
  ActionButton,
  ActionsCell,
  AsyncContent,
  Button,
  Cell,
  ErrorAlert,
  PageHeader,
  Panel,
  Row,
  StatusBadge,
  Table,
  TextAreaField,
} from "@/components/ui";
import { announcementKeys } from "@/features/announcements/hooks";
import { fieldError, formValues } from "@/lib/forms";
import { adminApi } from "../api";
import { useAdminAction, useAllAnnouncements } from "../hooks";

const REFRESH = { alsoInvalidate: [announcementKeys.all, announcementKeys.active] };

export default function AnnouncementsPage() {
  const announcements = useAllAnnouncements();
  const publish = useAdminAction(adminApi.publishAnnouncement, REFRESH);
  const toggle = useAdminAction(({ id, active }) => adminApi.setAnnouncementActive(id, active), REFRESH);

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    publish.mutate(formValues(form).message, { onSuccess: () => form.reset() });
  }

  return (
    <>
      <PageHeader eyebrow="Announcements" title="Site-Wide Announcements" />
      <Panel title="Publish a New Announcement" className="mb-6 max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <ErrorAlert error={publish.error} />
          <TextAreaField
            label="Message"
            name="message"
            rows={3}
            required
            maxLength={500}
            placeholder="e.g. We'll be doing scheduled maintenance Sunday at 2am UTC."
            error={fieldError(publish.error, "message")}
          />
          <Button type="submit" className="self-start" disabled={publish.isPending}>
            Publish
          </Button>
        </form>
      </Panel>

      <Panel title="All Announcements">
        <ErrorAlert error={toggle.error} className="mb-3" />
        <AsyncContent query={announcements}>
          {(list) =>
            list.length === 0 ? (
              <p className="text-sm text-ink/55">Nothing published yet.</p>
            ) : (
              <Table columns={["Message", "Status", ""]}>
                {list.map((announcement) => (
                  <Row key={announcement.id}>
                    <Cell className="max-w-md">{announcement.message}</Cell>
                    <Cell>
                      <StatusBadge
                        status={announcement.active ? "ACTIVE" : "INACTIVE"}
                        label={announcement.active ? "active" : "inactive"}
                      />
                    </Cell>
                    <ActionsCell>
                      <ActionButton
                        disabled={toggle.isPending}
                        onClick={() => toggle.mutate({ id: announcement.id, active: !announcement.active })}
                      >
                        {announcement.active ? "Deactivate" : "Activate"}
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
