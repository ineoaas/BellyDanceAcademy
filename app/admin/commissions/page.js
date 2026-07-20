import { requireUser } from "@/lib/auth";
import { getCommissionRatePercent } from "@/lib/settings";
import { updateCommissionRateAction } from "@/lib/actions/admin";
import AdminSidebar from "@/components/AdminSidebar";

const ERRORS = {
  invalid: "Enter a whole number between 0 and 100.",
};

export default async function AdminCommissionsPage({ searchParams }) {
  const admin = await requireUser("admin");
  const search = await searchParams;
  const currentRate = getCommissionRatePercent();
  const errorMessage = ERRORS[search?.error];

  return (
    <main className="grid md:grid-cols-[220px_1fr] flex-1">
      <AdminSidebar admin={admin} active="commissions" />

      <div className="p-8 bg-cream">
        <div className="mb-7">
          <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium">Commissions</span>
          <h1 className="font-display text-2xl mt-1">Platform Commission Rate</h1>
        </div>

        {errorMessage && (
          <p className="bg-burgundy/10 text-burgundy text-sm px-4 py-3 mb-6 max-w-md">{errorMessage}</p>
        )}
        {search?.saved === "1" && (
          <p className="bg-emerald-800/10 text-emerald-800 text-sm px-4 py-3 mb-6 max-w-md">Commission rate updated.</p>
        )}

        <div className="bg-ivory border border-gold/30 p-6 max-w-md">
          <p className="text-sm text-ink/70 mb-4">
            Current rate: <strong className="text-burgundy">{currentRate}%</strong>. This only applies to
            purchases made from now on — past sales keep the rate they were charged at.
          </p>
          <form action={updateCommissionRateAction} className="flex items-end gap-3">
            <label className="text-xs uppercase tracking-widest text-ink/60">
              New Rate (%)
              <input
                type="number"
                name="percent"
                min="0"
                max="100"
                defaultValue={currentRate}
                required
                className="block w-24 border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
              />
            </label>
            <button
              type="submit"
              className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-5 py-2.5"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
