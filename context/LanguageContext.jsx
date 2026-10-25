"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "@/lib/translations";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: () => "",
  mounted: false,
});

export function toBengaliDigits(input) {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(input).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d, 10)]);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedLang = localStorage.getItem("retail_pos_language");
      if (savedLang === "bn" || savedLang === "en") {
        setLanguageState(savedLang);
      } else {
        setLanguageState("en");
      }
    } catch {
      setLanguageState("en");
    }
  }, []);

  const setLanguage = (lang) => {
    if (lang !== "en" && lang !== "bn") return;
    setLanguageState(lang);
    try {
      localStorage.setItem("retail_pos_language", lang);
    } catch {}
  };

  const toggleLanguage = () => {
    const next = language === "en" ? "bn" : "en";
    setLanguage(next);
  };

  /**
   * Translates a dot-notated key path e.g. "pos.completeCheckout" or "common.cancel"
   */
  const t = (path, fallback = "") => {
    if (!path) return fallback;
    const keys = path.split(".");
    let current = translations[language] || translations.en;

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fallback to English
        let enCurrent = translations.en;
        for (const enKey of keys) {
          if (enCurrent && typeof enCurrent === "object" && enKey in enKey) {
            enCurrent = enCurrent[enKey];
          } else {
            return fallback || path;
          }
        }
        return typeof enCurrent === "string" ? enCurrent : fallback || path;
      }
    }

    return typeof current === "string" ? current : fallback || path;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        isBengali: language === "bn",
        setLanguage,
        toggleLanguage,
        t,
        toBengaliDigits,
        mounted,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
