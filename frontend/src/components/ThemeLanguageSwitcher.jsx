import React, { useState } from "react";
import { Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "../hooks";
import { useLanguage } from "../hooks";

export default function ThemeLanguageSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const isDark = theme === "dark";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        title={isDark ? t("common.lightMode") : t("common.darkMode")}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          border: isDark ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(124,58,237,0.2)",
          background: isDark ? "rgba(245,158,11,0.08)" : "#f9fafb",
          color: isDark ? "#f59e0b" : "#7C3AED",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDark ? "rgba(245,158,11,0.15)" : "#f5f3ff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isDark ? "rgba(245,158,11,0.08)" : "#f9fafb";
        }}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Language Switcher */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            border: isDark ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(124,58,237,0.2)",
            background: isDark ? "rgba(245,158,11,0.08)" : "#f9fafb",
            color: isDark ? "#f59e0b" : "#7C3AED",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            fontSize: "12px",
            fontWeight: "700",
            fontFamily: "Inter, sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? "rgba(245,158,11,0.15)" : "#f5f3ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark ? "rgba(245,158,11,0.08)" : "#f9fafb";
          }}
          title={t("common.language")}
        >
          {language.toUpperCase()}
        </button>

        {showLanguageMenu && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              background: isDark ? "#1e293b" : "white",
              borderRadius: "12px",
              boxShadow: isDark
                ? "0 8px 32px rgba(0,0,0,0.4)"
                : "0 8px 32px rgba(0,0,0,0.12)",
              border: isDark ? "1px solid rgba(245,158,11,0.2)" : "1px solid #f3f4f6",
              padding: "8px",
              minWidth: "140px",
              zIndex: 100,
            }}
          >
            {["en", "bn"].map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  changeLanguage(lang);
                  setShowLanguageMenu(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 12px",
                  borderRadius: "9px",
                  border: "none",
                  background: language === lang
                    ? isDark
                      ? "rgba(245,158,11,0.12)"
                      : "#f5f3ff"
                    : "transparent",
                  color: language === lang
                    ? isDark
                      ? "#f59e0b"
                      : "#7C3AED"
                    : isDark
                    ? "#cbd5e1"
                    : "#6b7280",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: language === lang ? "700" : "500",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.2s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  if (language !== lang) {
                    e.currentTarget.style.background = isDark
                      ? "rgba(255,255,255,0.04)"
                      : "#f9fafb";
                    e.currentTarget.style.color = isDark ? "#e2e8f0" : "#111827";
                  }
                }}
                onMouseLeave={(e) => {
                  if (language !== lang) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = isDark ? "#cbd5e1" : "#6b7280";
                  }
                }}
              >
                <Globe size={14} />
                {lang === "en" ? t("common.english") : t("common.bangla")}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
