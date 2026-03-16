import { useState } from "react";
import { departmentApprove, listRequestsByStage } from "../api/client";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";

export function DepartmentDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [permissionIds, setPermissionIds] = useState<string>("");

  async function refresh() {
    const data = await listRequestsByStage("DEPARTMENT_APPROVAL");
    setRequests(data.requests);
  }

  return (
    <div className="space-y-3">
      <div className="rounded border bg-white p-5">
        <div className="text-lg font-semibold">Department Dashboard</div>
        <div className="text-sm text-slate-600">
          Assign department-specific tools (Git/Dev env/Analytics) and forward to CISO.
        </div>
        <button
          className="rounded border bg-white px-3 py-2 text-sm"
          onClick={refresh}
          style={{ marginTop: 12 }}
        >
          Refresh
        </button>
      </div>

      <div className="rounded border bg-white p-5">
        <div className="font-semibold">Department permission IDs (comma-separated UUIDs)</div>
        <input
          className="mt-1 w-full rounded border px-2 py-1"
          value={permissionIds}
          onChange={(e) => setPermissionIds(e.target.value)}
          placeholder="e.g. 2f... , 9a... "
        />
      </div>

      <DataTable
        rows={requests}
        rowKey={(r) => r.id}
        columns={[
          { key: "id", header: "Request ID" },
          { key: "userId", header: "User ID" },
          { key: "requestType", header: "Type" },
          { key: "currentStage", header: "Stage", render: (r) => <StatusBadge text={r.currentStage} /> },
          { key: "status", header: "Status", render: (r) => <StatusBadge text={r.status} /> },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <button
                className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
                onClick={async () => {
                  const ids = permissionIds
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  await departmentApprove({ requestId: r.id, departmentPermissionIds: ids });
                  await refresh();
                }}
              >
                Approve & Forward
              </button>
            ),
          },
        ]}
      />
    </div>
  );
}

