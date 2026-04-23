import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  const cards = [
    { title: "Staff Management", value: "Ready", description: "Next module to connect" },
    { title: "RBAC", value: "Ready", description: "Role and privilege APIs available" },
    { title: "Branches", value: "Ready", description: "Branch APIs available" },
    { title: "Audit Logs", value: "Ready", description: "Audit endpoints finalized" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          This is your Member 01 frontend foundation. Next we will connect staff management.
        </p>

        <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <div className="text-gray-400 mb-1">Logged in as</div>
            <div className="font-semibold text-gray-900">{user?.email}</div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <div className="text-gray-400 mb-1">Role</div>
            <div className="font-semibold text-gray-900">{user?.roleName}</div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <div className="text-gray-400 mb-1">Branch</div>
            <div className="font-semibold text-gray-900">{user?.branchName || "Global Access"}</div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <div className="text-gray-400 mb-1">Password Changed</div>
            <div className="font-semibold text-gray-900">
              {user?.passwordChanged ? "Yes" : "No"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white border border-gray-100 rounded-[1.5rem] p-5 shadow-sm"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {card.title}
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-3">{card.value}</div>
            <div className="text-sm text-gray-500 mt-2">{card.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}