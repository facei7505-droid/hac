"use client";

import { usePathname, useRouter } from "next/navigation";
import { i18n, type Locale } from "@/i18n-config";

export default function LanguageSwitcher({ currentLang }: { currentLang: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLocale: Locale) => {
    if (!pathname) return;
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/") || "/");
  };

  return (
    <div className="flex bg-white/10 backdrop-blur-md rounded-xl p-1 shadow-inner border border-white/5">
      {i18n.locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLanguageChange(locale)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            currentLang === locale
              ? "bg-brand text-white shadow-md shadow-brand/20 scale-105"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
