import { useEffect, useState } from "react";
import { api } from "../api/client";
import { DataTable } from "../components/ui/DataTable";

export function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);

  async function refresh() {
    const res = await api.get("/audit/recent?limit=100");
    setLogs(res.data.logs ?? []);
  }

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  return (
    <div className="space-y-3">
      <div className="rounded border bg-white p-5">
        <div className="text-lg font-semibold">Audit Logs</div>
        <div className="text-sm text-slate-600">Immutable security and workflow events.</div>
        <button
          className="rounded border bg-white px-3 py-2 text-sm"
          onClick={refresh}
          style={{ marginTop: 12 }}
        >
          Refresh
        </button>
      </div>

      <DataTable
        rows={logs}
        rowKey={(r) => r.id}
        columns={[
          { key: "timestamp", header: "Time" },
          { key: "action", header: "Action" },
          { key: "performedBy", header: "Actor" },
          { key: "userId", header: "Subject" },
          {
            key: "details",
            header: "Details",
            render: (r) => (
              <pre style={{ margin: 0, fontSize: 12, whiteSpace: "pre-wrap" }}>
                {JSON.stringify(r.details ?? {}, null, 2)}
              </pre>
            ),
          },
        ]}
      />
    </div>
  );
}

