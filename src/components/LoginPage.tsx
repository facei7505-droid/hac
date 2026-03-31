"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import LanguageSwitcher from "./LanguageSwitcher";
import { Locale } from "@/i18n-config";

export default function LoginPage({ dictionary, lang }: { dictionary: any; lang: Locale }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = login(email, password);
    if (!result.success) {
      const errorKey = result.error || "login.errorMsg";
      const translated = errorKey.includes(".")
        ? getNestedValue(dictionary, errorKey) || errorKey
        : errorKey;
      setError(translated);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher currentLang={lang} variant="dark" />
      </div>
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-light/15 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/10 rounded-full blur-3xl animate-pulse-glow-login" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className={`relative z-10 w-full max-w-md px-6 animate-login-appear ${isShaking ? "animate-shake" : ""}`}>
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-light shadow-2xl shadow-brand/40 mb-5 animate-float">
            <span className="text-white font-bold text-3xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Aqbobek Lyceum
          </h1>
          <p className="text-blue-300/60 text-sm">
            {dictionary.login.subtitle}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            {dictionary.login.signInTitle}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-blue-200/80 mb-2">
                {dictionary.login.emailLabel}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={dictionary.login.emailPlaceholder}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/30 transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-blue-200/80 mb-2">
                {dictionary.login.passwordLabel}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={dictionary.login.passwordPlaceholder}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/30 transition-all duration-300"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="animate-error-appear bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-brand to-brand-light text-white font-semibold rounded-xl shadow-lg shadow-brand/30 hover:shadow-brand/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-light/50"
            >
              {dictionary.login.signInBtn}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-blue-300/40 text-center mb-3">
              {dictionary.login.demoAccounts}
            </p>
            <div className="space-y-1.5 text-xs text-blue-300/50">
              <div className="flex justify-between">
                <span>user1@aqbobek.kz</span>
                <span className="text-blue-400/60">{dictionary.login.roleStudent}</span>
              </div>
              <div className="flex justify-between">
                <span>teacher1@aqbobek.kz</span>
                <span className="text-blue-400/60">{dictionary.login.roleTeacher}</span>
              </div>
              <div className="flex justify-between">
                <span>admin@aqbobek.kz</span>
                <span className="text-blue-400/60">{dictionary.login.roleAdmin}</span>
              </div>
              <p className="text-center text-blue-300/30 mt-1">{dictionary.login.passwordHint}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null) return undefined;
    current = current[key];
  }
  return typeof current === "string" ? current : undefined;
}
