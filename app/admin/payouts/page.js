import { requireUser } from "@/lib/auth";
import { listAllPayouts } from "@/lib/payouts";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminPayoutsPage() {
  const admin = await requireUser("admin");
  const payouts = listAllPayouts();

  return (
    <main className="grid md:grid-cols-[220px_1fr] flex-1">
      <AdminSidebar admin={admin} active="payouts" />

      <div className="p-8 bg-cream">
        <div className="mb-7">
          <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium">Payouts</span>
          <h1 className="font-display text-2xl mt-1">Instructor Payouts</h1>
          <p className="text-sm text-ink/55 mt-1 max-w-lg">
            Payouts move automatically through Stripe Connect the moment an instructor requests
            one — there's nothing to approve here, just a record of what's gone out.
          </p>
        </div>

        <div className="bg-ivory border border-gold/30 p-6">
          {payouts.length === 0 ? (
            <p className="text-sm text-ink/55">No payouts requested yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-widest text-ink/55 border-b border-gold/30">
                  <th className="py-2">Date</th>
                  <th className="py-2">Instructor</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-dotted border-gold/30 last:border-none">
                    <td className="py-3">{formatDate(payout.requested_at)}</td>
                    <td className="py-3">{payout.instructor_name}</td>
                    <td className="py-3">${(payout.amount_cents / 100).toFixed(2)}</td>
                    <td className="py-3">
                      <span className="inline-block px-2.5 py-1 text-[0.6rem] uppercase font-semibold bg-emerald-800/10 text-emerald-800">
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}

function formatDate(sqliteDatetime) {
  const date = new Date(sqliteDatetime.replace(" ", "T") + "Z");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
