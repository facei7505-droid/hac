"use client";

import { useAuth } from "@/lib/auth";
import Dashboard from "@/components/Dashboard";
import LoginPage from "@/components/LoginPage";
import Spinner from "@/components/ui/Spinner";
import { Locale } from "@/i18n-config";
import { I18nProvider } from "./I18nProvider";

export default function App({ dictionary, lang }: { dictionary: any; lang: Locale }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <Spinner className="w-8 h-8 text-white" />
      </div>
    );
  }

  return (
    <I18nProvider dictionary={dictionary} lang={lang}>
      {user ? <Dashboard dictionary={dictionary} lang={lang} /> : <LoginPage dictionary={dictionary} lang={lang} />}
    </I18nProvider>
  );
}
