export const getThemeColors = (theme) => {
  const isDark = theme === "dark";

  return {
    // Background colors
    bg_primary: isDark ? "#0f172a" : "#ffffff",
    bg_card: isDark ? "#1e293b" : "#ffffff",
    bg_input: isDark ? "rgba(30,41,59,0.6)" : "rgba(240,245,250,0.8)",
    bg_input_focus: isDark ? "rgba(30,41,59,0.95)" : "rgba(240,245,250,0.95)",
    bg_secondary: isDark ? "#1f2937" : "#f3f4f6",
    bg_tertiary: isDark ? "rgba(30,41,59,0.5)" : "rgba(240,245,250,0.5)",
    bg_hover: isDark ? "#374151" : "#f1f5f9",

    // Text colors
    text_primary: isDark ? "#f1f5f9" : "#0f172a",
    text_secondary: isDark ? "#cbd5e1" : "#1f2937",
    text_tertiary: isDark ? "#94a3b8" : "#6b7280",
    text_muted: isDark ? "#64748b" : "#a1a5b4",

    // Border colors
    border_primary: isDark ? "rgba(245,158,11,0.1)" : "rgba(124,58,237,0.2)",
    border_secondary: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
    border_light: isDark ? "#4b5563" : "#d1d5db",

    // Accent colors (Primary theme colors)
    accent_primary: isDark ? "#f59e0b" : "#7C3AED",
    accent_secondary: isDark ? "#d97706" : "#4F46E5",
    accent_light: isDark ? "#fbbf24" : "#8b5cf6",

    // Status colors
    status_success: "#10b981",
    status_error: "#ef4444",
    status_warning: isDark ? "#f59e0b" : "#f59e0b",
    status_info: "#3b82f6",
  };
};

export const getDarkModeStyles = (theme) => {
  const isDark = theme === "dark";

  return {
    // Background colors
    pageBackground: isDark ? "#0b1120" : "#f8f7ff",
    bgSecondary: isDark ? "#1f2937" : "#ffffff",
    bgHover: isDark ? "#374151" : "#f3f4f6",
    cardBackground: isDark ? "#1f2937" : "#ffffff",

    // Text colors
    primaryText: isDark ? "#f3f4f6" : "#111827",
    textPrimary: isDark ? "#f1f5f9" : "#0f172a",
    secondaryText: isDark ? "#9ca3af" : "#4b5563",

    // Border & Accents
    borderSecondary: isDark ? "#374151" : "#e5e7eb",
    borderLight: isDark ? "#4b5563" : "#d1d5db",
    borderColor: isDark ? "#374151" : "#e5e7eb",
    accentPrimary: isDark ? "#f59e0b" : "#7C3AED", // Amber for dark, Purple for light
  };
};
