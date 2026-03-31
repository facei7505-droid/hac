"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/profile-context";
import StudentTab from "@/components/StudentTab";
import TeacherTab from "@/components/TeacherTab";
import ParentTab from "@/components/ParentTab";
import AdminTab from "@/components/AdminTab";
import KioskTab from "@/components/KioskTab";
import GradebookTab from "@/components/GradebookTab";
import SkillMapTab from "@/components/SkillMapTab";
import SupportTab from "@/components/SupportTab";
import LanguageSwitcher from "./LanguageSwitcher";
import GlobalSearch from "./GlobalSearch";
import { Locale } from "@/i18n-config";
import { useI18n } from "./I18nProvider";
import { UserRole } from "@/data/users";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  ClipboardList,
  Users,
  Settings,
  Monitor,
  LogOut,
  Zap,
  Network,
  Heart,
  User,
  Headphones,
  Bell,
  MessageCircle,
} from "lucide-react";

type TabDef = {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
};

const allTabs: TabDef[] = [
  { id: "student", label: "student", icon: <GraduationCap size={18} />, roles: ["student"] },
  { id: "skillmap", label: "skillmap", icon: <Network size={18} />, roles: ["student"] },
  { id: "teacher", label: "teacher", icon: <BookOpen size={18} />, roles: ["teacher"] },
  { id: "gradebook", label: "gradebook", icon: <ClipboardList size={18} />, roles: ["teacher"] },
  { id: "parent", label: "parentMyChild", icon: <Heart size={18} />, roles: ["parent"] },
  { id: "admin", label: "admin", icon: <Settings size={18} />, roles: ["admin"] },
  { id: "support", label: "support", icon: <Headphones size={18} />, roles: ["student", "teacher", "parent", "admin"] },
  { id: "kiosk", label: "kiosk", icon: <Monitor size={18} />, roles: ["student", "teacher", "admin"] },
];

const roleLabelsKeys: Record<string, string> = {
  student: "student",
  teacher: "teacher",
  admin: "admin",
  parent: "parentMyChild",
};

export default function Dashboard({ dictionary, lang }: { dictionary: any; lang: Locale }) {
  const { user, logout } = useAuth();
  const { currentUserId, setCurrentUserId } = useProfile();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (user?.profileId) {
      setCurrentUserId(user.profileId);
    }
  }, [user?.profileId, setCurrentUserId]);

  const visibleTabs = allTabs.filter((tab) =>
    user ? tab.roles.includes(user.role) : false
  );

  const [activeTab, setActiveTab] = useState<string>(
    visibleTabs.length > 0 ? visibleTabs[0].id : "kiosk"
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-200/80 flex flex-col">
        {/* Sidebar Logo */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-100">
          <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2L38 12V26C38 35 30 42 20 44C10 42 2 35 2 26V12L20 2Z" stroke="#3B82F6" strokeWidth="2.5" fill="none"/>
            <path d="M20 8L32 15V25C32 31 27 37 20 39C13 37 8 31 8 25V15L20 8Z" stroke="#60A5FA" strokeWidth="1.5" fill="none"/>
            <text x="20" y="27" textAnchor="middle" fill="#3B82F6" fontSize="14" fontWeight="bold" fontFamily="serif">A</text>
          </svg>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">Aqbobek</h1>
            <p className="text-[10px] text-gray-400 leading-tight">Lyceum</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          <div className="px-2 py-2">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              {t("gradebook.navigation") || "Навигация"}
            </span>
          </div>
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                  ${isActive
                    ? "bg-brand text-white shadow-md shadow-brand/20"
                    : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                  }
                `}
              >
                <span className={isActive ? "text-white" : "text-gray-400"}>
                  {tab.icon}
                </span>
                <span>{t(`dashboard.tabs.${tab.id}`)}</span>
              </button>
            );
          })}
        </nav>

        {/* My Profile link */}
        {user?.profileId && (
          <div className="px-3 pb-1 space-y-1">
            <button
              onClick={() => router.push(`/${lang}/profile/${user.profileId}`)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 transition-all duration-200 cursor-pointer border border-gray-200/60"
            >
              <User size={18} className="text-gray-400" />
              <span>Мой профиль</span>
            </button>
            <button
              onClick={() => router.push(`/${lang}/notifications`)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 transition-all duration-200 cursor-pointer border border-gray-200/60"
            >
              <Bell size={18} className="text-gray-400" />
              <span>Лента</span>
            </button>
            <button
              onClick={() => router.push(`/${lang}/messenger`)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 transition-all duration-200 cursor-pointer border border-gray-200/60"
            >
              <MessageCircle size={18} className="text-gray-400" />
              <span>Мессенджер</span>
            </button>
            {user?.role === "teacher" && (
              <button
                onClick={() => router.push(`/${lang}/teacher`)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 transition-all duration-200 cursor-pointer border border-gray-200/60"
              >
                <ClipboardList size={18} className="text-gray-400" />
                <span>Дашборд учителя</span>
              </button>
            )}
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-100">
          <LanguageSwitcher currentLang={lang} />
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 flex-shrink-0 bg-white border-b border-gray-200/80 flex items-center justify-between px-6">
          {/* Left: section title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Zap size={14} />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t(`dashboard.tabs.${activeTab}`)}
              </span>
            </div>
            <GlobalSearch lang={lang} />
          </div>

          {/* Right: user info + logout */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-xs">{dictionary.dashboard.systemOnline}</span>
              </div>
              <div className="w-px h-6 bg-gray-200" />
                <div className="flex items-center gap-2.5">
                <div className="text-right hidden sm:block">
                  <button
                    onClick={() => user?.profileId ? router.push(`/${lang}/profile/${user.profileId}`) : undefined}
                    className="text-left hover:text-brand transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-medium text-gray-700 leading-tight hover:text-brand">{user.name}</p>
                    <p className="text-[10px] text-brand-light leading-tight">
                      {t(`dashboard.tabs.${roleLabelsKeys[user.role]}`)}
                    </p>
                  </button>
                </div>
                <button
                  onClick={() => user?.profileId ? router.push(`/${lang}/profile/${user.profileId}`) : undefined}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand/10 to-brand-light/10 flex items-center justify-center text-brand font-bold text-xs hover:ring-2 hover:ring-brand/30 transition-all cursor-pointer"
                  title="Мой профиль"
                >
                  {user.name.charAt(0)}
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                  title={dictionary.dashboard.logout}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto" key={activeTab}>
          <div className={`${activeTab === "gradebook" || activeTab === "kiosk" || activeTab === "skillmap" || activeTab === "support" ? "p-0" : "p-6"}`}>
            {activeTab === "student" && <StudentTab />}
            {activeTab === "skillmap" && <SkillMapTab />}
            {activeTab === "teacher" && <TeacherTab />}
            {activeTab === "gradebook" && <GradebookTab />}
            {activeTab === "parent" && <ParentTab />}
            {activeTab === "admin" && <AdminTab />}
            {activeTab === "support" && <SupportTab />}
            {activeTab === "kiosk" && <KioskTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
