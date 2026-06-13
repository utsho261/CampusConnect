import React, { createContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import translations from "../locales/translations";

export const LanguageContext = createContext();

const STORAGE_KEY = "language";
const FALLBACK_LANGUAGE = "en";

const getInitialLanguage = () => {
  if (typeof window === "undefined") return FALLBACK_LANGUAGE;
  const savedLanguage = localStorage.getItem(STORAGE_KEY);
  return savedLanguage === "bn" || savedLanguage === "en" ? savedLanguage : FALLBACK_LANGUAGE;
};

const getNestedValue = (source, key) => {
  return key.split(".").reduce((value, part) => {
    if (value && Object.prototype.hasOwnProperty.call(value, part)) {
      return value[part];
    }
    return undefined;
  }, source);
};

const interpolate = (text, variables = {}) => {
  if (typeof text !== "string") return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    return Object.prototype.hasOwnProperty.call(variables, name) ? variables[name] : "";
  });
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getInitialLanguage);

  // HTML lang attribute আগে আপডেট করা হচ্ছে
  useLayoutEffect(() => {
    document.documentElement.lang = language === "bn" ? "bn" : "en";
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo(() => {
    const changeLanguage = (nextLanguage) => {
      if (nextLanguage === "bn" || nextLanguage === "en") {
        setLanguage(nextLanguage);
      }
    };

    const t = (key, variables = {}) => {
      const activeValue = getNestedValue(translations[language], key);
      const fallbackValue = getNestedValue(translations[FALLBACK_LANGUAGE], key);
      const value = activeValue ?? fallbackValue ?? key;
      return interpolate(value, variables);
    };

    return {
      language,
      isBangla: language === "bn",
      changeLanguage,
      toggleLanguage: () => setLanguage((prev) => (prev === "en" ? "bn" : "en")),
      t,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
