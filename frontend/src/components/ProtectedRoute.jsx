import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBoth } from '../hooks';

const ProtectedRoute = ({ children, checkVerification = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { theme } = useBoth();
  const isDark = theme === "dark";

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: isDark ? "#0F172A" : "#F8FAFC" }}>
        <div style={{ fontSize: "1.2rem", color: isDark ? "#E2E8F0" : "#475569", fontWeight: "600" }}>Loading CampusConnect...</div>
      </div>
    );
  }

  const [dismissed, setDismissed] = React.useState(false);
  const navigate = useNavigate();

  // Check if logged in
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const needsVerification = checkVerification && user && !user.verified && location.pathname !== '/verification' && location.pathname !== '/profile';

  return (
    <>
      {needsVerification && !dismissed && (
        <div style={{
          background: "linear-gradient(135deg, #EF4444, #B91C1C)",
          color: "white",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 9999,
          position: "sticky",
          top: 0,
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", fontWeight: "600" }}>
            <ShieldAlert size={20} />
            Your profile is not verified. Some features might be restricted.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button 
              onClick={() => navigate("/profile", { state: { tab: "verification" } })}
              style={{
                background: "white",
                color: "#EF4444",
                border: "none",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              Verify Now <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => setDismissed(true)}
              style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px" }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;
