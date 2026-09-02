import { ShieldAlert } from "lucide-react";

export default function PostDisclaimer({ tone = "blue" }) {
  const palette = tone === "red"
    ? { bg: "#fef2f2", border: "#fecaca", color: "#991b1b", icon: "#dc2626" }
    : { bg: "#eff6ff", border: "#bfdbfe", color: "#1e3a8a", icon: "#2563eb" };

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        padding: "12px 14px",
        borderRadius: 12,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        color: palette.color,
        fontSize: 13,
        lineHeight: 1.45,
        fontWeight: 700,
      }}
    >
      <ShieldAlert size={18} color={palette.icon} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>Please post only true and verified information. Fake posts may mislead students and can affect your account.</span>
    </div>
  );
}
