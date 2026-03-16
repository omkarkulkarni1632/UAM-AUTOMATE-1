import React from "react";

export function DataTable<T extends Record<string, any>>(props: {
  columns: { key: string; header: string; render?: (row: T) => React.ReactNode }[];
  rows: T[];
  rowKey: (row: T) => string;
}) {
  return (
    <div className="rounded border bg-white p-3">
      <table className="w-full" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {props.columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: "left",
                  fontSize: 12,
                  color: "#475569",
                  padding: "8px 6px",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((r) => (
            <tr key={props.rowKey(r)}>
              {props.columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    padding: "10px 6px",
                    borderBottom: "1px solid #f1f5f9",
                    fontSize: 14,
                  }}
                >
                  {c.render ? c.render(r) : String(r[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
          {props.rows.length === 0 && (
            <tr>
              <td
                colSpan={props.columns.length}
                style={{ padding: 12, color: "#475569", fontSize: 14 }}
              >
                No records.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

