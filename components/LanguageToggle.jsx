"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Languages } from "lucide-react";

export default function LanguageToggle({ className = "", compact = false }) {
  const { language, setLanguage, mounted } = useLanguage();

  if (!mounted) {
    return (
      <div
        className={`h-9 w-20 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 ${className}`}
      />
    );
  }

  const isBn = language === "bn";

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setLanguage(isBn ? "en" : "bn")}
        title={isBn ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
        aria-label="Language switch"
        className={`group relative flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm transition-all hover:border-brand-500/50 hover:text-brand-600 dark:hover:text-brand-400 active:scale-95 ${className}`}
      >
        <Languages className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
        <span>{isBn ? "বাং" : "EN"}</span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 p-0.5 shadow-sm ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        title="Switch to English"
        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
          !isBn
            ? "bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-brand-400"
            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        }`}
      >
        <span>EN</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage("bn")}
        title="বাংলায় পরিবর্তন করুন"
        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all font-bengali ${
          isBn
            ? "bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-brand-400"
            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        }`}
      >
        <span>বাংলা</span>
      </button>
    </div>
  );
}
