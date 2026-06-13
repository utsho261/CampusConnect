import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, IdCard } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useTheme } from "../hooks";
import { useLanguage } from "../hooks";
import ThemeLanguageSwitcher from "../components/ThemeLanguageSwitcher";
import { getThemeColors } from "../utils/themeColors";

export default function Login() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = getThemeColors(theme);

  const [form, setForm] = useState({ studentId: "", password: "" });
  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState({});

  const handleLogin = async () => {
    if (!form.studentId || !form.password) {
      toast.error(t("messages.fillAllFields"));
      return;
    }
    try {
      const res = await api.post("login/", {
        student_id: form.studentId,
        password: form.password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("student_id", res.data.student_id);
      localStorage.setItem("role", res.data.role || "student");

      toast.success(t("messages.loginSuccess"));
      setTimeout(() => navigate("/dashboard"), 1000);

    } catch (error) {
      console.log(error.response?.data);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(t("messages.loginFailed"));
      }
    }
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
    boxShadow: focused[name] ? `0 0 0 4px rgba(${theme === "dark" ? "245,158,11" : "124,58,237"},0.12)` : "none",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.08)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-25px,30px) scale(1.1)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,20px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .login-btn:hover { transform: translateY(-2px) scale(1.02) !important; box-shadow: 0 12px 32px rgba(${theme === "dark" ? "245,158,11" : "124,58,237"},0.5) !important; }
        .login-btn:active { transform: scale(0.98) !important; }
        .cc-link:hover { ${theme === "dark" ? "color: #fbbf24 !important;" : "color: #6d28d9 !important;"} text-decoration: underline; }
        .card-wrap { animation: fadeUp 0.6s cubic-bezier(0.34,1.3,0.64,1) both; }
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
          top: "-80px",
          left: "-80px",
          width: "420px",
          height: "420px",
          background: theme === "dark"
            ? "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(147,197,253,0.55) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float1 8s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "fixed",
          bottom: "-100px",
          right: "-60px",
          width: "500px",
          height: "500px",
          background: theme === "dark"
            ? "radial-gradient(circle, rgba(217,119,6,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(192,132,252,0.45) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float2 10s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "fixed",
          top: "40%",
          right: "5%",
          width: "300px",
          height: "300px",
          background: theme === "dark"
            ? "radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float3 7s ease-in-out infinite",
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

        <div className="card-wrap" style={{
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

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: theme === "dark"
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "linear-gradient(135deg, #7C3AED, #4F46E5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 16px rgba(${theme === "dark" ? "245,158,11" : "124,58,237"},0.4)`,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L2 8l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
                  <path d="M2 16l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
                  <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
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
            </div>
          </div>

          {/* Bouncing dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
            {["#ef4444", theme === "dark" ? "#f59e0b" : "#7C3AED", theme === "dark" ? "#d97706" : "#4F46E5", "#06b6d4"].map((c, i) => (
              <div key={i} style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                backgroundColor: c,
                animation: "bounce 1.2s infinite",
                animationDelay: `${i * 150}ms`,
              }} />
            ))}
          </div>

          <h1 style={{
            fontSize: "38px",
            fontWeight: "900",
            textAlign: "center",
            margin: "0 0 8px",
            background: theme === "dark"
              ? "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
              : "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-1px",
            lineHeight: 1.15,
          }}>
            {t("auth.login.title")}
          </h1>
          <p style={{
            color: colors.text_tertiary,
            fontSize: "15px",
            fontWeight: "500",
            textAlign: "center",
            margin: "0 0 36px",
          }}>
            {t("auth.login.subtitle")}
          </p>

          {/* Student ID */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "700",
              color: theme === "dark" ? "#f59e0b" : "#4c1d95",
              marginBottom: "8px",
              letterSpacing: "0.3px",
            }}>
              {t("auth.login.studentId")}
            </label>
            <div style={{ position: "relative" }}>
              <IdCard style={{
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
                placeholder={t("auth.login.studentIdPlaceholder")}
                value={form.studentId}
                onChange={handleChange("studentId")}
                style={inputStyle("studentId")}
                onFocus={() => setFocused(f => ({ ...f, studentId: true }))}
                onBlur={() => setFocused(f => ({ ...f, studentId: false }))}
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
              {t("auth.login.password")}
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
                placeholder={t("auth.login.passwordPlaceholder")}
                value={form.password}
                onChange={handleChange("password")}
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
          <button type="button" onClick={handleLogin} className="login-btn" style={{
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
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "0.3px",
            transition: "all 0.3s",
            boxShadow: `0 6px 24px rgba(${theme === "dark" ? "245,158,11" : "124,58,237"},0.35)`,
          }}>
            {t("auth.login.loginBtn")}
          </button>

          <p style={{
            textAlign: "center",
            fontSize: "14px",
            color: colors.text_tertiary,
            marginTop: "24px",
          }}>
            {t("auth.login.noAccount")}{" "}
            <button className="cc-link" onClick={() => navigate("/register")} style={{
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
              {t("auth.login.register")}
            </button>
          </p>

          <div style={{
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: `1px solid ${colors.border_primary}`,
            textAlign: "center",
          }}>
            <button className="cc-link" onClick={() => navigate("/admin/login")} style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: theme === "dark" ? "#f59e0b" : "#9ca3af",
              fontWeight: "600",
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
              padding: 0,
              transition: "color 0.2s",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}>
              🛡️ {t("auth.login.adminLogin")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}