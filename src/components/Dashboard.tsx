"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import StudentTab from "@/components/StudentTab";
import TeacherTab from "@/components/TeacherTab";
import ParentTab from "@/components/ParentTab";
import AdminTab from "@/components/AdminTab";
import KioskTab from "@/components/KioskTab";
import LanguageSwitcher from "./LanguageSwitcher";
import { Locale } from "@/i18n-config";

import { UserRole } from "@/data/users";

type TabDef = {
  id: string;
  label: string;
  icon: string;
  roles: UserRole[];
};

const allTabs: TabDef[] = [
  { id: "student", label: "Ученик", icon: "🎓", roles: ["student"] },
  { id: "teacher", label: "Учитель", icon: "📚", roles: ["teacher"] },
  { id: "parent", label: "Родитель", icon: "👨‍👩‍👧", roles: [] },
  { id: "admin", label: "Админ", icon: "⚙️", roles: ["admin"] },
  { id: "kiosk", label: "Киоск", icon: "📺", roles: ["student", "teacher", "admin"] },
];

type TabId = string;

const roleLabelsKeys: Record<string, string> = {
  student: "student",
  teacher: "teacher",
  admin: "admin",
};

export default function Dashboard({ dictionary, lang }: { dictionary: any; lang: Locale }) {
  const { user, logout } = useAuth();

  const visibleTabs = allTabs.filter((tab) =>
    user ? tab.roles.includes(user.role) : false
  );

  const [activeTab, setActiveTab] = useState<TabId>(
    visibleTabs.length > 0 ? visibleTabs[0].id : "kiosk"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-lg shadow-brand/25">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
                  Aqbobek Lyceum
                </h1>
                <p className="text-xs text-gray-400 -mt-0.5">{dictionary.dashboard.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher currentLang={lang} />
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                {dictionary.dashboard.systemOnline}
              </div>
              {user && (
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-700 leading-tight">{user.name}</p>
                    <p className="text-xs text-brand-light">{dictionary.dashboard.tabs[roleLabelsKeys[user.role]]}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-danger hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    <span className="hidden sm:inline">{dictionary.dashboard.logout}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-1 p-1.5 bg-gray-100/80 rounded-2xl backdrop-blur-sm">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300
                ${
                  activeTab === tab.id
                    ? "bg-white text-brand shadow-lg shadow-brand/10 scale-[1.02]"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{dictionary.dashboard.tabs[tab.id as keyof typeof dictionary.dashboard.tabs] || tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up" key={activeTab}>
        {activeTab === "student" && <StudentTab />}
        {activeTab === "teacher" && <TeacherTab />}
        {activeTab === "parent" && <ParentTab />}
        {activeTab === "admin" && <AdminTab />}
        {activeTab === "kiosk" && <KioskTab />}
      </main>
    </div>
  );
}
