"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { Locale } from "@/i18n-config";

interface I18nContextType {
  dictionary: any;
  lang: Locale;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function flattenDict(obj: Record<string, any>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenDict(value, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

export function I18nProvider({ children, dictionary, lang }: { children: ReactNode; dictionary: any; lang: Locale }) {
  const flatMap = useMemo(() => flattenDict(dictionary), [dictionary]);

  const t = (key: string): string => {
    return flatMap[key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ dictionary, lang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
