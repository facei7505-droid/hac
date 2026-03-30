"use client";

import { useState } from "react";
import StudentTab from "@/components/StudentTab";
import TeacherTab from "@/components/TeacherTab";
import ParentTab from "@/components/ParentTab";
import AdminTab from "@/components/AdminTab";
import KioskTab from "@/components/KioskTab";

const tabs = [
  { id: "student", label: "Ученик", icon: "🎓" },
  { id: "teacher", label: "Учитель", icon: "📚" },
  { id: "parent", label: "Родитель", icon: "👨‍👩‍👧" },
  { id: "admin", label: "Админ", icon: "⚙️" },
  { id: "kiosk", label: "Киоск", icon: "📺" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("student");

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
                <p className="text-xs text-gray-400 -mt-0.5">School Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              System Online
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-1 p-1.5 bg-gray-100/80 rounded-2xl backdrop-blur-sm">
          {tabs.map((tab) => (
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
              <span className="hidden sm:inline">{tab.label}</span>
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
