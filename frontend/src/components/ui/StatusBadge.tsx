export function StatusBadge({ text }: { text: string }) {
  const bg =
    text === "COMPLETED"
      ? "#dcfce7"
      : text === "REJECTED"
        ? "#fee2e2"
        : "#e2e8f0";
  const fg =
    text === "COMPLETED"
      ? "#166534"
      : text === "REJECTED"
        ? "#991b1b"
        : "#0f172a";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        background: bg,
        color: fg,
        fontSize: 12,
        border: "1px solid rgba(15, 23, 42, 0.08)",
      }}
    >
      {text}
    </span>
  );
}

