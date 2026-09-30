import { AsyncContent, Cell, PageHeader, Panel, Row, StatusBadge, Table } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { usePayoutLedger } from "../hooks";

export default function PayoutsPage() {
  const payouts = usePayoutLedger();

  return (
    <>
      <PageHeader
        eyebrow="Payouts"
        title="Instructor Payouts"
        description="Payouts move automatically through Stripe Connect the moment an instructor requests one — there's nothing to approve here, just a record of what's gone out."
      />
      <Panel>
        <AsyncContent query={payouts}>
          {(list) =>
            list.length === 0 ? (
              <p className="text-sm text-ink/55">No payouts requested yet.</p>
            ) : (
              <Table columns={["Date", "Instructor", "Amount", "Status"]}>
                {list.map((payout) => (
                  <Row key={payout.id}>
                    <Cell>{formatDate(payout.requestedAt)}</Cell>
                    <Cell>{payout.instructorName}</Cell>
                    <Cell>{formatMoney(payout.amountCents)}</Cell>
                    <Cell>
                      <StatusBadge status={payout.status} />
                    </Cell>
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
