export function RiskIndicator({ score }: { score: number }) {
  const bucket = score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
  const bg = bucket === "HIGH" ? "#fee2e2" : bucket === "MEDIUM" ? "#fef3c7" : "#dcfce7";
  const fg = bucket === "HIGH" ? "#991b1b" : bucket === "MEDIUM" ? "#92400e" : "#166534";

  return (
    <span
      title={`Risk score: ${score}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 8px",
        borderRadius: 999,
        background: bg,
        color: fg,
        fontSize: 12,
        border: "1px solid rgba(15, 23, 42, 0.08)",
      }}
    >
      {bucket} ({score})
    </span>
  );
}

