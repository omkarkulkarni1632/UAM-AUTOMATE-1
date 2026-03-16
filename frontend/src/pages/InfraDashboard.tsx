import { useState } from "react";
import { infraApprove, listRequestsByStage } from "../api/client";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";

export function InfraDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [permissionIds, setPermissionIds] = useState<string>("");

  async function refresh() {
    const data = await listRequestsByStage("INFRA_APPROVAL");
    setRequests(data.requests);
  }

  return (
    <div className="space-y-3">
      <div className="rounded border bg-white p-5">
        <div className="text-lg font-semibold">Infra Dashboard</div>
        <div className="text-sm text-slate-600">
          Approve onboarding requests and assign base infrastructure access (Email/VPN/SSO).
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
        <div className="font-semibold">Base permission IDs (comma-separated UUIDs)</div>
        <input
          className="mt-1 w-full rounded border px-2 py-1"
          value={permissionIds}
          onChange={(e) => setPermissionIds(e.target.value)}
          placeholder="e.g. 2f... , 9a... "
        />
        <div className="text-xs text-slate-600" style={{ marginTop: 6 }}>
          For now this uses raw Permission UUIDs; later we’ll swap to a friendly picker.
        </div>
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
                  await infraApprove({ requestId: r.id, basePermissionIds: ids });
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

