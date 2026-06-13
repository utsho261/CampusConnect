import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, UserCog, ShieldCheck } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useTheme } from "../hooks";
import { useLanguage } from "../hooks";
import ThemeLanguageSwitcher from "../components/ThemeLanguageSwitcher";
import { getThemeColors } from "../utils/themeColors";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = getThemeColors(theme);

  const [form, setForm] = useState({ username: "", password: "" });
  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      toast.error(t("messages.fillAllFields"));
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("admin-login/", {
        username: form.username,
        password: form.password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("role", res.data.role);

      toast.success(t("messages.loginSuccess"));
      setTimeout(() => navigate("/admin/dashboard"), 800);

    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(t("messages.loginFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  const inputStyle = (name) => ({
    width: "100%",
    paddingLeft: "52px",
    paddingRight: name === "password" ? "52px" : "16px",
    paddingTop: "16px",
    paddingBottom: "16px",
    backgroundColor: focused[name] ? colors.bg_input_focus : colors.bg_input,
    borderRadius: "14px",
    border: focused[name] ? `2px solid ${colors.accent_primary}` : `2px solid ${colors.border_primary}`,
    color: colors.text_primary,
    fontSize: "15px",
    fontFamily: "Inter, sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.3s",
    boxShadow: focused[name] ? `0 0 0 4px rgba(245,158,11,0.15)` : "none",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.08)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-25px,30px) scale(1.1)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,20px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .admin-btn:hover { transform: translateY(-2px) scale(1.02) !important; box-shadow: 0 12px 32px rgba(245,158,11,0.5) !important; }
        .admin-btn:active { transform: scale(0.98) !important; }
        .admin-link:hover { color: #fbbf24 !important; text-decoration: underline; }
        .admin-card { animation: fadeUp 0.6s cubic-bezier(0.34,1.3,0.64,1) both; }
        input::placeholder { color: ${colors.text_muted} !important; }
        * { transition: background-color 0.3s, color 0.3s, border-color 0.3s; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme === "dark"
          ? "linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #0f172a 60%, #1a1a2e 80%, #0f172a 100%)"
          : "linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 30%, #ffffff 60%, #fdf4ff 80%, #ede9fe 100%)",
        fontFamily: "Inter, sans-serif",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Floating orbs */}
        <div style={{
          position: "fixed",
          top: "-120px",
          left: "-120px",
          width: "500px",
          height: "500px",
          background: theme === "dark"
            ? "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(147,197,253,0.55) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float1 10s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "fixed",
          bottom: "-140px",
          right: "-80px",
          width: "600px",
          height: "600px",
          background: theme === "dark"
            ? "radial-gradient(circle, rgba(234,179,8,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(192,132,252,0.45) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float2 12s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "fixed",
          top: "30%",
          right: "10%",
          width: "350px",
          height: "350px",
          background: theme === "dark"
            ? "radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float3 8s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* Grid pattern overlay */}
        <div style={{
          position: "fixed",
          inset: 0,
          opacity: 0.03,
          backgroundImage: theme === "dark"
            ? "linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)"
            : "linear-gradient(rgba(124,58,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }} />

        {/* Theme/Language Switcher - Top Right */}
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 100,
        }}>
          <ThemeLanguageSwitcher />
        </div>

        <div className="admin-card" style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: theme === "dark" ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: "28px",
          boxShadow: theme === "dark"
            ? "0 32px 80px rgba(0,0,0,0.5), 0 2px 0 rgba(245,158,11,0.15) inset"
            : "0 32px 80px rgba(109,40,217,0.18), 0 2px 0 rgba(255,255,255,0.8) inset",
          border: theme === "dark"
            ? "1.5px solid rgba(245,158,11,0.2)"
            : "1.5px solid rgba(167,139,250,0.35)",
          padding: "52px 44px",
          position: "relative",
          zIndex: 10,
        }}>

          {/* Shield Icon */}
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <div style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                background: theme === "dark"
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "linear-gradient(135deg, #7C3AED, #4F46E5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 6px 20px rgba(${theme === "dark" ? "245,158,11" : "124,58,237"},0.4)`,
              }}>
                <ShieldCheck size={28} color="white" />
              </div>
              <div>
                <span style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  letterSpacing: "-0.5px",
                  background: theme === "dark"
                    ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                    : "linear-gradient(90deg, #7C3AED, #4F46E5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  CampusConnect
                </span>
                <div style={{
                  fontSize: "10px",
                  fontWeight: "600",
                  color: colors.text_muted,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}>
                  {t("auth.adminLogin.adminPanel")}
                </div>
              </div>
            </div>
          </div>

          {/* Separator line */}
          <div style={{
            height: "2px",
            background: theme === "dark"
              ? "linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent)"
              : "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)",
            margin: "16px 0 24px",
            borderRadius: "2px",
          }} />

          <h1 style={{
            fontSize: "34px",
            fontWeight: "900",
            textAlign: "center",
            margin: "0 0 8px",
            background: theme === "dark"
              ? "linear-gradient(135deg, #f1f5f9 0%, #fbbf24 100%)"
              : "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-1px",
            lineHeight: 1.15,
          }}>
            {t("auth.adminLogin.title")}
          </h1>
          <p style={{
            color: colors.text_tertiary,
            fontSize: "15px",
            fontWeight: "500",
            textAlign: "center",
            margin: "0 0 36px",
          }}>
            {t("auth.adminLogin.subtitle")}
          </p>

          {/* Username */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "700",
              color: theme === "dark" ? "#f59e0b" : "#4c1d95",
              marginBottom: "8px",
              letterSpacing: "0.3px",
            }}>
              {t("auth.adminLogin.username")}
            </label>
            <div style={{ position: "relative" }}>
              <UserCog style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "20px",
                height: "20px",
                color: theme === "dark" ? "#f59e0b" : "#7C3AED",
                pointerEvents: "none",
              }} />
              <input
                type="text"
                placeholder={t("auth.adminLogin.usernamePlaceholder")}
                value={form.username}
                onChange={handleChange("username")}
                onKeyDown={handleKeyDown}
                style={inputStyle("username")}
                onFocus={() => setFocused(f => ({ ...f, username: true }))}
                onBlur={() => setFocused(f => ({ ...f, username: false }))}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "700",
              color: theme === "dark" ? "#f59e0b" : "#4c1d95",
              marginBottom: "8px",
              letterSpacing: "0.3px",
            }}>
              {t("auth.adminLogin.password")}
            </label>
            <div style={{ position: "relative" }}>
              <Lock style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "20px",
                height: "20px",
                color: theme === "dark" ? "#f59e0b" : "#7C3AED",
                pointerEvents: "none",
              }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.adminLogin.passwordPlaceholder")}
                value={form.password}
                onChange={handleChange("password")}
                onKeyDown={handleKeyDown}
                style={inputStyle("password")}
                onFocus={() => setFocused(f => ({ ...f, password: true }))}
                onBlur={() => setFocused(f => ({ ...f, password: false }))}
              />
              <button onClick={() => setShowPassword(!showPassword)} style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: theme === "dark" ? "#f59e0b" : "#7C3AED",
                display: "flex",
                padding: 0,
              }}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button type="button" onClick={handleLogin} disabled={loading} className="admin-btn" style={{
            width: "100%",
            padding: "17px",
            background: theme === "dark"
              ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              : "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
            color: theme === "dark" ? "#0f172a" : "white",
            border: "none",
            borderRadius: "14px",
            fontWeight: "800",
            fontSize: "16px",
            cursor: loading ? "wait" : "pointer",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "0.3px",
            transition: "all 0.3s",
            boxShadow: `0 6px 24px rgba(${theme === "dark" ? "245,158,11" : "124,58,237"},0.35)`,
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? t("admin.permissions.saving") : t("auth.adminLogin.loginBtn")}
          </button>

          <p style={{
            textAlign: "center",
            fontSize: "14px",
            color: colors.text_tertiary,
            marginTop: "24px",
          }}>
            {t("auth.adminLogin.login")}{" "}
            <button className="admin-link" onClick={() => navigate("/login")} style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: theme === "dark" ? "#f59e0b" : "#7C3AED",
              fontWeight: "700",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
              padding: 0,
              transition: "color 0.2s",
            }}>
              {t("auth.adminLogin.login")}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
