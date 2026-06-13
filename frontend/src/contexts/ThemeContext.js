import React, { createContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { getDarkModeStyles } from "../utils/themeColors";

export const ThemeContext = createContext();

const STORAGE_KEY = "theme";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyThemeToDocument = (theme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const styles = getDarkModeStyles(theme);

  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;

  Object.entries(styles).forEach(([key, value]) => {
    const cssKey = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/_/g, "-")}`;
    root.style.setProperty(cssKey, value);
  });
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  // useLayoutEffect DOM পেইন্ট হওয়ার আগেই রান করে, ফলে রিলোডের সময় কোনো ফ্লিকারিং (সাদা স্ক্রিন) হবে না
  useLayoutEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(() => {
    const changeTheme = (nextTheme) => {
      if (nextTheme === "light" || nextTheme === "dark") {
        setTheme(nextTheme);
      }
    };

    return {
      theme,
      isDark: theme === "dark",
      setTheme: changeTheme,
      toggleTheme: () => setTheme((prev) => (prev === "light" ? "dark" : "light")),
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
