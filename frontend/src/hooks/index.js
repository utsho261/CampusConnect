import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext.jsx";
import { LanguageContext } from "../contexts/LanguageContext.jsx";

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

export { useBreakpoint } from "./useBreakpoint.js";

export const useBoth = () => {
  const themeContext = useContext(ThemeContext);
  const languageContext = useContext(LanguageContext);

  if (!themeContext || !languageContext) {
    console.error("useBoth must be used within both ThemeProvider and LanguageProvider");
  }

  return {
    ...themeContext,
    ...languageContext,
  };
};