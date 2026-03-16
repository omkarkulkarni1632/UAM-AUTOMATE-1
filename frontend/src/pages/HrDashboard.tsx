import { useState } from "react";
import { createEmployee, listRequestsByStage } from "../api/client";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Roles } from "../routing/roles";

export function HrDashboard() {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  async function refresh() {
    const data = await listRequestsByStage("INFRA_APPROVAL");
    setRequests(data.requests);
  }

  return (
    <div className="space-y-3">
      <div className="rounded border bg-white p-5">
        <div className="text-lg font-semibold">HR Dashboard</div>
        <div className="text-sm text-slate-600">
          Create employee (Joiner) and track onboarding workflow.
        </div>
      </div>

      <div className="rounded border bg-white p-5">
        <div className="font-semibold">Create employee</div>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              await createEmployee({
                name: String(fd.get("name")),
                email: String(fd.get("email")),
                departmentId: (String(fd.get("departmentId")) || null) as any,
                role: String(fd.get("role")) as any,
                managerId: (String(fd.get("managerId")) || null) as any,
                tempPassword: String(fd.get("tempPassword")),
              });
              await refresh();
              (e.currentTarget as HTMLFormElement).reset();
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="block text-sm">
            Name
            <input name="name" className="mt-1 w-full rounded border px-2 py-1" />
          </label>
          <label className="block text-sm">
            Email
            <input name="email" className="mt-1 w-full rounded border px-2 py-1" />
          </label>
          <label className="block text-sm">
            Role
            <select name="role" className="mt-1 w-full rounded border px-2 py-1">
              {Object.values(Roles).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Department ID (optional UUID)
            <input name="departmentId" className="mt-1 w-full rounded border px-2 py-1" />
          </label>
          <label className="block text-sm">
            Manager ID (optional UUID)
            <input name="managerId" className="mt-1 w-full rounded border px-2 py-1" />
          </label>
          <label className="block text-sm">
            Temporary password
            <input
              name="tempPassword"
              type="password"
              className="mt-1 w-full rounded border px-2 py-1"
            />
          </label>
          <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            className="rounded border bg-white px-3 py-2 text-sm"
            onClick={refresh}
            style={{ marginLeft: 8 }}
          >
            Refresh
          </button>
        </form>
      </div>

      <div>
        <div className="mb-4 font-semibold">Onboarding requests (currently at INFRA stage)</div>
        <DataTable
          rows={requests}
          rowKey={(r) => r.id}
          columns={[
            { key: "id", header: "Request ID" },
            { key: "userId", header: "User ID" },
            { key: "requestType", header: "Type" },
            {
              key: "currentStage",
              header: "Stage",
              render: (r) => <StatusBadge text={r.currentStage} />,
            },
            {
              key: "status",
              header: "Status",
              render: (r) => <StatusBadge text={r.status} />,
            },
          ]}
        />
      </div>
    </div>
  );
}

