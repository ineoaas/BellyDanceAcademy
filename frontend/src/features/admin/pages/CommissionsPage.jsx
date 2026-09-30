import { Alert, AsyncContent, Button, ErrorAlert, PageHeader, Panel, TextField } from "@/components/ui";
import { fieldError, formValues } from "@/lib/forms";
import { adminApi } from "../api";
import { useAdminAction, useCommission } from "../hooks";

export default function CommissionsPage() {
  const commission = useCommission();
  const save = useAdminAction(adminApi.setCommission);

  function handleSubmit(event) {
    event.preventDefault();
    save.mutate(Number(formValues(event.currentTarget).ratePercent));
  }

  return (
    <>
      <PageHeader eyebrow="Commissions" title="Platform Commission Rate" />
      <div className="max-w-md">
        {save.isSuccess && (
          <Alert tone="success" className="mb-6">
            Commission rate updated.
          </Alert>
        )}
        <ErrorAlert error={save.error} className="mb-6" />
        <Panel>
          <AsyncContent query={commission}>
            {({ ratePercent }) => (
              <>
                <p className="mb-4 text-sm text-ink/70">
                  Current rate: <strong className="text-burgundy">{ratePercent}%</strong>. This only applies
                  to purchases made from now on — past sales keep the rate they were charged at.
                </p>
                <form key={ratePercent} onSubmit={handleSubmit} className="flex items-end gap-3">
                  <TextField
                    label="New Rate (%)"
                    name="ratePercent"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    required
                    defaultValue={ratePercent}
                    className="w-28"
                    error={fieldError(save.error, "ratePercent")}
                  />
                  <Button type="submit" disabled={save.isPending}>
                    Save
                  </Button>
                </form>
              </>
            )}
          </AsyncContent>
        </Panel>
      </div>
    </>
  );
}
