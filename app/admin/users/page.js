import { requireUser } from "@/lib/auth";
import { listAllUsers } from "@/lib/users";
import { suspendUserAction, activateUserAction, deleteUserAction } from "@/lib/actions/admin";
import AdminSidebar from "@/components/AdminSidebar";

const ERRORS = {
  self: "You can't suspend or delete your own account.",
  "has-dependents": "That account owns courses, purchases, or reviews — suspend it instead of deleting.",
};

export default async function AdminUsersPage({ searchParams }) {
  const admin = await requireUser("admin");
  const search = await searchParams;
  const users = listAllUsers();
  const errorMessage = ERRORS[search?.error];

  return (
    <main className="grid md:grid-cols-[220px_1fr] flex-1">
      <AdminSidebar admin={admin} active="users" />

      <div className="p-8 bg-cream">
        <div className="mb-7">
          <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium">Users</span>
          <h1 className="font-display text-2xl mt-1">Manage Users</h1>
        </div>

        {errorMessage && (
          <p className="bg-burgundy/10 text-burgundy text-sm px-4 py-3 mb-6 max-w-lg">{errorMessage}</p>
        )}
        {search?.deleted === "1" && (
          <p className="bg-emerald-800/10 text-emerald-800 text-sm px-4 py-3 mb-6 max-w-lg">Account deleted.</p>
        )}

        <div className="bg-ivory border border-gold/30 p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[0.65rem] uppercase tracking-widest text-ink/55 border-b border-gold/30">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-dotted border-gold/30 last:border-none">
                  <td className="py-3 font-medium">{user.name}</td>
                  <td className="py-3">{user.email}</td>
                  <td className="py-3 capitalize">{user.role}</td>
                  <td className="py-3">
                    <span
                      className={
                        "inline-block px-2.5 py-1 text-[0.6rem] uppercase font-semibold " +
                        (user.status === "active"
                          ? "bg-emerald-800/10 text-emerald-800"
                          : user.status === "suspended"
                            ? "bg-burgundy/10 text-burgundy"
                            : "bg-gold/20 text-[#7A5D1D]")
                      }
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    {user.id === admin.id ? (
                      <span className="text-xs text-ink/40">You</span>
                    ) : (
                      <>
                        {user.status === "active" && (
                          <form action={suspendUserAction} className="inline">
                            <input type="hidden" name="userId" value={user.id} />
                            <button type="submit" className="text-xs uppercase tracking-widest border border-gold px-3 py-2 mr-2">
                              Suspend
                            </button>
                          </form>
                        )}
                        {user.status === "suspended" && (
                          <form action={activateUserAction} className="inline">
                            <input type="hidden" name="userId" value={user.id} />
                            <button type="submit" className="text-xs uppercase tracking-widest border border-gold px-3 py-2 mr-2">
                              Reactivate
                            </button>
                          </form>
                        )}
                        <form action={deleteUserAction} className="inline">
                          <input type="hidden" name="userId" value={user.id} />
                          <button type="submit" className="text-xs uppercase tracking-widest border border-burgundy text-burgundy px-3 py-2">
                            Delete
                          </button>
                        </form>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
