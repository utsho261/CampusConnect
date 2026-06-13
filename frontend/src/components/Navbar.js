import React from "react";
import { useBoth } from "../hooks";

const Navbar = () => {
  const { theme, toggleTheme, language, toggleLanguage, t } = useBoth();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: "var(--bg-secondary)",
        color: "var(--text-primary)",
        borderBottom: "1px solid var(--border-secondary)",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        CampusConnect
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          style={{
            padding: "0.5rem 1rem",
            cursor: "pointer",
            backgroundColor: "var(--bg-hover)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-light)",
            borderRadius: "6px",
          }}
        >
          {language === "en" ? "বাংলা" : "English"}
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          style={{
            padding: "0.5rem 1rem",
            cursor: "pointer",
            backgroundColor: "var(--accent-primary)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
          }}
        >
          {theme === "light" ? t("theme.dark") : t("theme.light")}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;