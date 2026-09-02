import { CheckCircle2, Sparkles, Trophy } from "lucide-react";

export default function RewardPopup({ open, points, title = "Reward unlocked", message, onClose }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: "rgba(15,23,42,0.48)",
        backdropFilter: "blur(10px)",
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes rewardPop {
          0% { opacity: 0; transform: translateY(24px) scale(.92); }
          60% { opacity: 1; transform: translateY(-4px) scale(1.03); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rewardShine {
          0% { transform: translateX(-120%) rotate(12deg); }
          100% { transform: translateX(160%) rotate(12deg); }
        }
        @keyframes rewardFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(390px, 100%)",
          position: "relative",
          overflow: "hidden",
          borderRadius: 22,
          padding: 26,
          color: "#fff",
          background: "linear-gradient(135deg, #0f172a 0%, #2563eb 48%, #7c3aed 100%)",
          boxShadow: "0 34px 90px rgba(37,99,235,.36)",
          animation: "rewardPop .48s cubic-bezier(.2,.9,.2,1)",
          border: "1px solid rgba(255,255,255,.18)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 0.18, background: "radial-gradient(circle at 20% 15%, #fff 0, transparent 28%), radial-gradient(circle at 80% 10%, #fde68a 0, transparent 24%)" }} />
        <div style={{ position: "absolute", top: -60, bottom: -60, width: 72, background: "rgba(255,255,255,.22)", filter: "blur(2px)", animation: "rewardShine 1.5s ease .1s" }} />
        <div style={{ position: "relative", display: "grid", gap: 14, textAlign: "center" }}>
          <div style={{ width: 76, height: 76, margin: "0 auto", borderRadius: 20, display: "grid", placeItems: "center", background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.22)", animation: "rewardFloat 1.8s ease-in-out infinite" }}>
            <Trophy size={42} color="#FDE68A" />
          </div>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,.14)", fontSize: 12, fontWeight: 800, marginBottom: 10 }}>
              <Sparkles size={14} /> Campus reward
            </div>
            <h2 style={{ margin: 0, fontSize: 28, lineHeight: 1.1, letterSpacing: 0 }}>{title}</h2>
            <p style={{ margin: "8px auto 0", color: "rgba(255,255,255,.82)", lineHeight: 1.5, maxWidth: 300 }}>{message || "Your contribution has been added to your campus impact."}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px 18px", borderRadius: 16, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.16)", fontSize: 20, fontWeight: 900 }}>
            <CheckCircle2 size={24} color="#86efac" /> +{points} points
          </div>
          <button
            onClick={onClose}
            style={{
              minHeight: 42,
              border: 0,
              borderRadius: 12,
              cursor: "pointer",
              color: "#0f172a",
              background: "#fff",
              fontWeight: 900,
            }}
          >
            Nice
          </button>
        </div>
      </div>
    </div>
  );
}
