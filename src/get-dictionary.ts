import "server-only";
import type { Locale } from "./i18n-config";

// We enumerate all dictionaries here for better webpack support
const dictionaries = {
  ru: () => import("./dictionaries/ru.json").then((module) => module.default),
  kk: () => import("./dictionaries/kk.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]?.() ?? dictionaries.ru();
