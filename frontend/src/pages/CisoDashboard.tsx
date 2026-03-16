import { useEffect, useState } from "react";
import { cisoApprove, getSecurityDashboard, listRequestsByStage } from "../api/client";
import { DataTable } from "../components/ui/DataTable";
import { RiskIndicator } from "../components/ui/RiskIndicator";
import { StatusBadge } from "../components/ui/StatusBadge";

export function CisoDashboard() {
  const [security, setSecurity] = useState<any | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [finalPermissionIds, setFinalPermissionIds] = useState<string>("");

  async function refresh() {
    const sec = await getSecurityDashboard();
    const data = await listRequestsByStage("CISO_APPROVAL");
    setSecurity(sec);
    setRequests(data.requests);
  }

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  return (
    <div className="space-y-3">
      <div className="rounded border bg-white p-5">
        <div className="text-lg font-semibold">CISO Dashboard</div>
        <div className="text-sm text-slate-600">
          Review access requests, risk posture, and approve/reject permissions.
        </div>
        <button
          className="rounded border bg-white px-3 py-2 text-sm"
          onClick={refresh}
          style={{ marginTop: 12 }}
        >
          Refresh
        </button>
      </div>

      {security && (
        <div className="rounded border bg-white p-5">
          <div className="font-semibold">Security overview</div>
          <div className="text-sm text-slate-600" style={{ marginTop: 6 }}>
            Users: {security.totals?.users ?? 0} · High-risk users:{" "}
            {security.totals?.highRiskUsers ?? 0}
          </div>
          <div style={{ marginTop: 10 }}>
            <div className="text-sm font-semibold">Top risk users</div>
            <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(security.topRisk ?? []).slice(0, 8).map((r: any) => (
                <div key={r.id} className="rounded border bg-slate-50 p-3">
                  <div className="text-xs text-slate-600">User {r.userId}</div>
                  <div style={{ marginTop: 6 }}>
                    <RiskIndicator score={r.score} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="rounded border bg-white p-5">
        <div className="font-semibold">Final permission IDs (comma-separated UUIDs)</div>
        <input
          className="mt-1 w-full rounded border px-2 py-1"
          value={finalPermissionIds}
          onChange={(e) => setFinalPermissionIds(e.target.value)}
          placeholder="If empty, CISO will keep current set as-is"
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
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
                  onClick={async () => {
                    const ids = finalPermissionIds
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    await cisoApprove({
                      requestId: r.id,
                      finalPermissionIds: ids,
                      decision: "APPROVE",
                    });
                    await refresh();
                  }}
                >
                  Approve
                </button>
                <button
                  className="rounded border bg-white px-3 py-2 text-sm"
                  onClick={async () => {
                    await cisoApprove({
                      requestId: r.id,
                      finalPermissionIds: [],
                      decision: "REJECT",
                    });
                    await refresh();
                  }}
                >
                  Reject
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

