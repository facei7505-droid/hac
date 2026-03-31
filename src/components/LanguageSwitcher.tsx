"use client";

import { usePathname, useRouter } from "next/navigation";
import { i18n, type Locale } from "@/i18n-config";

export default function LanguageSwitcher({ currentLang, variant = "light" }: { currentLang: Locale; variant?: "light" | "dark" }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLocale: Locale) => {
    if (!pathname) return;
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/") || "/");
  };

  const isDark = variant === "dark";

  return (
    <div className={`flex rounded-lg p-0.5 ${isDark ? "bg-white/10 backdrop-blur-md border border-white/5" : "bg-gray-100 border border-gray-200/60"}`}>
      {i18n.locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLanguageChange(locale)}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all duration-200 cursor-pointer ${
            currentLang === locale
              ? "bg-brand text-white shadow-sm shadow-brand/20"
              : isDark
                ? "text-gray-400 hover:text-white hover:bg-white/5"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/60"
          }`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
