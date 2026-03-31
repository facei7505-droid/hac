"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { adminStats, quickActions, systemServices } from "@/data/admin";
import { users } from "@/data/users";
import Spinner from "@/components/ui/Spinner";
import { useI18n } from "./I18nProvider";
import { useProfile } from "@/lib/profile-context";
import { useNotifications, type AnnouncementTarget } from "@/lib/notifications-context";
import { useRouter } from "next/navigation";
import {
  generateSchedule,
  type ScheduleSlot,
  type LogEntry,
} from "@/lib/schedule-engine";
import {
  CheckCircle,
  X,
  Shield,
  Trophy,
  Settings,
  Users,
  Search,
  ExternalLink,
  GraduationCap,
  BookOpen,
  UserCog,
  FileText,
  Megaphone,
  Send,
  AlertTriangle,
  Clock,
  RefreshCw,
  Smartphone,
  Bell,
  Monitor,
} from "lucide-react";

type AdminTabId = "dashboard" | "approvals" | "accounts";

function LogLine({ entry }: { entry: LogEntry }) {
  const colorMap = {
    sys: "text-cyan-400",
    log: "text-gray-300",
    calc: "text-blue-400",
    warn: "text-amber-400",
    success: "text-emerald-400",
    error: "text-red-400",
  };
  const iconMap = {
    sys: "⚙",
    log: "›",
    calc: "⟳",
    warn: "!",
    success: "✓",
    error: "✕",
  };
  return (
    <div className={`flex items-start gap-2 animate-slide-up ${colorMap[entry.type]}`}>
      <span className="flex-shrink-0 mt-0.5 w-4 text-center font-bold">{iconMap[entry.type]}</span>
      <span className="break-all">{entry.text}</span>
    </div>
  );
}

export default function AdminTab() {
  const { t, lang } = useI18n();
  const logRef = useRef<HTMLDivElement>(null);
  const { profiles, approveAchievement, rejectAchievement } = useProfile();
  const { addAnnouncement, announcements } = useNotifications();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AdminTabId>("dashboard");
  const [generating, setGenerating] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScheduleSlot[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info">("success");

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "teacher">("all");

  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annTarget, setAnnTarget] = useState<AnnouncementTarget>("all");

  const [simPhase, setSimPhase] = useState<"idle" | "loading" | "done">("idle");
  const [simLogIdx, setSimLogIdx] = useState(0);
  const [pushToasts, setPushToasts] = useState<string[]>([]);

  const pendingAchievements = useMemo(() => {
    const results: {
      profileId: string;
      profileName: string;
      profileGrade: string;
      profileRole: string;
      achievement: { id: string; title: string; category: string; icon: string; date: string; status: string; fileUrl?: string };
    }[] = [];
    for (const [pid, p] of Object.entries(profiles)) {
      for (const a of p.achievements) {
        if (a.status === "pending") {
          results.push({
            profileId: pid,
            profileName: p.name,
            profileGrade: p.grade || "—",
            profileRole: p.role,
            achievement: a,
          });
        }
      }
    }
    return results;
  }, [profiles]);

  const allAccounts = useMemo(() => {
    return users.map((u) => {
      const profile = profiles[u.profileId] || null;
      const safeAvatar =
        profile?.avatar && typeof profile.avatar === "string" && profile.avatar.length <= 150
          ? profile.avatar
          : "";
      return {
        ...u,
        isOnline: Math.random() > 0.5,
        profile: profile ? { ...profile, avatar: safeAvatar } : null,
      };
    });
  }, [profiles]);

  const filteredAccounts = useMemo(() => {
    return allAccounts.filter((acc) => {
      if (roleFilter !== "all" && acc.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return acc.name.toLowerCase().includes(q) || acc.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allAccounts, roleFilter, searchQuery]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const showToast = useCallback((msg: string, type: "success" | "info" = "success") => {
    setToastType(type);
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setLogs([]);
    setProgress(0);
    setResult(null);

    const { schedule, logs: generatedLogs } = generateSchedule();
    const totalSteps = generatedLogs.length;
    let currentStep = 0;

    for (const entry of generatedLogs) {
      await new Promise((resolve) => setTimeout(resolve, entry.delay));
      setLogs((prev) => [...prev, entry]);
      currentStep++;
      setProgress(Math.round((currentStep / totalSteps) * 100));
    }

    setResult(schedule);
    setGenerating(false);
    showToast(t("admin.toastSuccess"), "success");
  }, [showToast, t]);

  const handleApprove = useCallback((profileId: string, achId: string) => {
    approveAchievement(profileId, achId);
    showToast("Достижение одобрено! +50 MMR", "success");
  }, [approveAchievement, showToast]);

  const handleReject = useCallback((profileId: string, achId: string) => {
    rejectAchievement(profileId, achId);
    showToast("Достижение отклонено", "info");
  }, [rejectAchievement, showToast]);

  const handlePublishAnnouncement = useCallback(() => {
    if (!annTitle.trim() || !annBody.trim()) return;
    addAnnouncement(annTitle.trim(), annBody.trim(), annTarget);
    setAnnTitle("");
    setAnnBody("");
    setAnnTarget("all");
    showToast("Объявление опубликовано!", "success");
  }, [annTitle, annBody, annTarget, addAnnouncement, showToast]);

  const simLogs = useMemo(() => [
    "Инициализация AI-солвера...",
    "AI-Алгоритм пересчитывает графы зависимостей...",
    "Поиск свободных окон у учителей...",
    "Анализ конфликтов расписания...",
    "Оптимизация: генетический алгоритм, итерация 1/12...",
    "Оптимизация: генетический алгоритм, итерация 7/12...",
    "Оптимизация: генетический алгоритм, итерация 12/12...",
    "Решение конфликтов: найдена замена (Козлова Е.В., Химия)",
    "Валидация расписания... OK",
    "Расписание перестроено успешно!",
  ], []);

  const handleForceMajeure = useCallback(async () => {
    setSimPhase("loading");
    setSimLogIdx(0);
    setPushToasts([]);

    for (let i = 0; i < simLogs.length; i++) {
      await new Promise((r) => setTimeout(r, 200));
      setSimLogIdx(i + 1);
    }

    await new Promise((r) => setTimeout(r, 400));
    setSimPhase("done");

    const toastMessages = [
      "📱 Push отправлен: 10-А класс (Изменение в расписании)",
      "📱 Push отправлен: Козлова Е.В. (Назначена замена)",
      "🖥️ Kiosk Panels обновлены",
    ];

    for (let i = 0; i < toastMessages.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      setPushToasts((prev) => [...prev, toastMessages[i]]);
    }

    showToast("Расписание перестроено — все уведомления отправлены", "success");
  }, [simLogs, showToast]);

  const handleResetSim = useCallback(() => {
    setSimPhase("idle");
    setSimLogIdx(0);
    setPushToasts([]);
  }, []);

  const tabDefs: { id: AdminTabId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "dashboard", label: "Панель управления", icon: <Settings size={16} /> },
    { id: "approvals", label: "Заявки на достижения", icon: <Trophy size={16} />, badge: pendingAchievements.length },
    { id: "accounts", label: "Все аккаунты", icon: <Users size={16} /> },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] animate-slide-up">
          <div className={`flex items-center gap-3 text-white px-5 py-3.5 rounded-2xl shadow-2xl ${
            toastType === "success"
              ? "bg-emerald-600 shadow-emerald-600/30"
              : "bg-blue-600 shadow-blue-600/30"
          }`}>
            <span className="text-lg">{toastType === "success" ? "✅" : "ℹ️"}</span>
            <span className="text-sm font-semibold">{toast}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white cursor-pointer">✕</button>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t("admin.title")}</h2>
        <p className="text-gray-500 text-sm mt-1">{t("admin.subtitle")}</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabDefs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* === DASHBOARD TAB === */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {adminStats.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  {s.delta !== "0" && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">{s.delta}</span>
                  )}
                </div>
                <div className="text-3xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-400 mt-1">{t(s.label)}</div>
              </div>
            ))}
          </div>

          {/* Schedule Generator + Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span>🧠</span> {t("admin.smartSchedule")}
              </h3>
              <p className="text-sm text-gray-500 mb-6">{t("admin.scheduleDesc")}</p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className={`w-full py-5 rounded-2xl text-lg font-bold transition-all duration-300 cursor-pointer ${
                  generating
                    ? "bg-gray-100 text-gray-400 cursor-wait"
                    : "bg-gradient-to-r from-brand to-brand-light text-white shadow-xl shadow-brand/25 hover:shadow-2xl hover:shadow-brand/35 hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-3">
                    <Spinner className="w-6 h-6" />
                    {t("admin.generating")}
                  </span>
                ) : t("admin.startGeneration")}
              </button>
              {logs.length > 0 && (
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">{t("admin.progress")}</span>
                    <span className="text-xs font-bold text-brand">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-brand to-brand-light h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              {result && (
                <div className="mt-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">{t("admin.generatedSchedule")}</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.slice(0, 5).map((slot, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="font-mono text-gray-500 w-20 flex-shrink-0">{slot.timeLabel}</span>
                        <span className="font-semibold text-gray-800 w-10">{slot.className}</span>
                        <span className="text-brand flex-1">{slot.subject}</span>
                        <span className="text-gray-400">{slot.teacherName}</span>
                        <span className="text-gray-400">каб. {slot.roomName}</span>
                      </div>
                    ))}
                    {result.length > 5 && (
                      <div className="text-xs text-gray-400 text-center py-1">+{result.length - 5} {t("admin.moreLessons")}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span> {t("admin.processLogs")}
              </h3>
              <div ref={logRef} className="bg-gray-950 rounded-xl p-4 h-[420px] overflow-y-auto font-mono text-[13px] space-y-1.5">
                {logs.length === 0 && !generating && (
                  <div className="text-gray-600 text-center py-12">
                    <div className="text-3xl mb-3">⚡</div>
                    {t("admin.waiting")}
                  </div>
                )}
                {logs.map((entry, i) => <LogLine key={i} entry={entry} />)}
                {generating && (
                  <div className="flex items-center gap-2 text-brand-light">
                    <span className="animate-pulse">▌</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Schedule Status — Force Majeure Simulation */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>📅</span> Live Schedule Status
                <span className="text-xs font-normal text-gray-400 ml-2">
                  {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
                </span>
              </h3>
              {simPhase === "done" && (
                <button
                  onClick={handleResetSim}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
                >
                  <RefreshCw size={13} />
                  Сбросить
                </button>
              )}
            </div>

            {/* Timetable Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {/* 10-А */}
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-brand to-brand-light px-4 py-2.5">
                  <span className="text-sm font-bold text-white">10-А класс</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {/* 09:00 — Математика */}
                  <div className="flex items-center gap-3 px-4 py-3 transition-all duration-500">
                    <div className="flex items-center gap-2 w-20 flex-shrink-0">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-sm font-mono font-semibold text-gray-600">09:00</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">Математика</div>
                      <div className="text-xs text-gray-400">Аманова А.К.</div>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                      ✓ ОК
                    </span>
                  </div>

                  {/* 10:00 — Физика → becomes cancelled/replaced */}
                  <div
                    className={`flex items-center gap-3 px-4 py-3 transition-all duration-700 ${
                      simPhase === "done"
                        ? "bg-red-50/60"
                        : simPhase === "loading"
                        ? "bg-amber-50/60 animate-pulse"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 w-20 flex-shrink-0">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-sm font-mono font-semibold text-gray-600">10:00</span>
                    </div>

                    {simPhase !== "done" ? (
                      <div className="flex-1 min-w-0 transition-all duration-500">
                        <div className={`text-sm font-semibold ${simPhase === "loading" ? "text-amber-600" : "text-gray-900"}`}>
                          {simPhase === "loading" ? "Пересчёт..." : "Физика"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {simPhase === "loading" ? "AI-солвер работает" : "Сидоров П.М."}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0 animate-fade-in space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs line-through text-red-400">Физика (Сидоров)</span>
                          <span className="shrink-0 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-semibold">
                            ✕ Отменено
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-emerald-700">Химия</span>
                          <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                            ✓ Замена
                          </span>
                        </div>
                        <div className="text-xs text-emerald-600">Козлова Е.В.</div>
                      </div>
                    )}

                    {simPhase === "idle" && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                        ✓ ОК
                      </span>
                    )}
                    {simPhase === "loading" && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[10px] font-semibold animate-pulse">
                        ⟳ Проверка
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 9-Б */}
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2.5">
                  <span className="text-sm font-bold text-white">9-Б класс</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {/* 09:00 — История */}
                  <div className="flex items-center gap-3 px-4 py-3 transition-all duration-500">
                    <div className="flex items-center gap-2 w-20 flex-shrink-0">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-sm font-mono font-semibold text-gray-600">09:00</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">История</div>
                      <div className="text-xs text-gray-400">Ахметов Н.Р.</div>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                      ✓ ОК
                    </span>
                  </div>

                  {/* 10:00 — Информатика */}
                  <div className="flex items-center gap-3 px-4 py-3 transition-all duration-500">
                    <div className="flex items-center gap-2 w-20 flex-shrink-0">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-sm font-mono font-semibold text-gray-600">10:00</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">Информатика</div>
                      <div className="text-xs text-gray-400">Ким Д.В.</div>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                      ✓ ОК
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation Controls */}
            {simPhase === "idle" && (
              <button
                onClick={handleForceMajeure}
                className="w-full py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 animate-fade-in"
              >
                <AlertTriangle size={20} />
                🚨 Симуляция: Учитель Сидоров заболел
              </button>
            )}

            {simPhase === "loading" && (
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center animate-pulse">
                    <RefreshCw size={16} className="text-amber-700 animate-spin" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-800">AI-Алгоритм работает...</div>
                    <div className="text-xs text-amber-600">Перестройка расписания в реальном времени</div>
                  </div>
                </div>
                <div className="bg-amber-950 rounded-xl p-3.5 font-mono text-xs space-y-1.5 max-h-40 overflow-y-auto">
                  {simLogs.slice(0, simLogIdx).map((log, i) => (
                    <div key={i} className="flex items-start gap-2 animate-slide-up text-amber-200">
                      <span className="text-amber-500 font-bold flex-shrink-0">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-amber-400">
                    <span className="animate-pulse">▌</span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-amber-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(simLogIdx / simLogs.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {simPhase === "done" && (
              <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 animate-scale-in">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center">
                    <CheckCircle size={18} className="text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-800">Расписание перестроено</div>
                    <div className="text-xs text-emerald-600">
                      Конфликт resolved: Сидоров П.М. → Козлова Е.В. (Химия), 10:00, 10-А
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Push notification simulation */}
            {pushToasts.length > 0 && (
              <div className="mt-4 space-y-2">
                {pushToasts.map((msg, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-900/5 backdrop-blur-sm border border-gray-200 animate-slide-up"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {i === 0 && <Smartphone size={15} className="text-blue-500 flex-shrink-0" />}
                    {i === 1 && <Bell size={15} className="text-amber-500 flex-shrink-0" />}
                    {i === 2 && <Monitor size={15} className="text-emerald-500 flex-shrink-0" />}
                    <span className="text-sm text-gray-700 font-medium">{msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚡</span> {t("admin.quickActions")}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <button key={action.label} className={`p-5 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-pointer`}>
                  <span className="text-3xl block mb-2">{action.icon}</span>
                  <span className="text-sm font-semibold">{t(action.label)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🖥️</span> {t("admin.systemStatus")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {systemServices.map((svc) => (
                <div key={svc.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${svc.ok ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                    <span className="text-sm font-medium text-gray-900">{t(svc.name)}</span>
                  </div>
                  <span className="text-xs text-gray-400">{svc.latency}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Create Notification */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Megaphone size={16} className="text-indigo-600" />
              </span>
              Создать объявление
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Заголовок</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Например: Завтра сокращенный день!"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Текст сообщения</label>
                <textarea
                  value={annBody}
                  onChange={(e) => setAnnBody(e.target.value)}
                  placeholder="Подробности объявления..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Таргетинг</label>
                <select
                  value={annTarget}
                  onChange={(e) => setAnnTarget(e.target.value as AnnouncementTarget)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all"
                >
                  <option value="all">Все</option>
                  <option value="teachers">Только Учителя</option>
                  <option value="class-10-A">Только 10-А</option>
                  <option value="class-9-B">Только 9-Б</option>
                </select>
              </div>
              <button
                onClick={handlePublishAnnouncement}
                disabled={!annTitle.trim() || !annBody.trim()}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <Send size={16} />
                Опубликовать (Отправить Push)
              </button>
            </div>

            {announcements.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Последние объявления ({announcements.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {announcements.slice(0, 5).map((ann) => (
                    <div key={ann.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                      <span className="text-lg mt-0.5">📢</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">{ann.title}</span>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            ann.target === "all" ? "bg-emerald-50 text-emerald-600" :
                            ann.target === "teachers" ? "bg-purple-50 text-purple-600" :
                            "bg-blue-50 text-blue-600"
                          }`}>
                            {ann.target === "all" ? "Все" :
                             ann.target === "teachers" ? "Учителя" :
                             ann.target === "class-10-A" ? "10-А" : "9-Б"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{ann.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === ACHIEVEMENT REQUESTS TAB === */}
      {activeTab === "approvals" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Trophy size={16} className="text-amber-600" />
                </span>
                Заявки на достижения
                {pendingAchievements.length > 0 && (
                  <span className="w-6 h-6 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                    {pendingAchievements.length}
                  </span>
                )}
              </h3>
            </div>

            {pendingAchievements.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Нет заявок на проверку</h2>
                <p className="text-gray-400 text-sm">Все достижения проверены</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAchievements.map(({ profileId, profileName, profileGrade, profileRole, achievement }) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-4 p-5 rounded-xl bg-amber-50/50 border border-amber-100 hover:border-amber-200 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900">{achievement.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                          {profileRole === "student" ? <GraduationCap size={12} /> : <BookOpen size={12} />}
                          {profileName}
                        </span>
                        {profileRole === "student" && profileGrade !== "—" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                            Класс {profileGrade}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {achievement.category}
                        </span>
                        <span className="text-[10px] text-gray-400">{achievement.date}</span>
                        {achievement.fileUrl && (
                          <a
                            href={achievement.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-brand hover:text-brand-light font-medium"
                          >
                            <FileText size={10} />
                            Файл
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(profileId, achievement.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors cursor-pointer"
                      >
                        <CheckCircle size={14} />
                        Одобрить (+50 MMR)
                      </button>
                      <button
                        onClick={() => handleReject(profileId, achievement.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors cursor-pointer"
                      >
                        <X size={14} />
                        Отклонить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* === ALL ACCOUNTS TAB === */}
      {activeTab === "accounts" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users size={16} className="text-blue-600" />
                </span>
                Все аккаунты
                <span className="text-sm text-gray-400 font-normal">({filteredAccounts.length})</span>
              </h3>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по имени или email..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:bg-white transition-all"
                />
              </div>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {(["all", "student", "teacher"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      roleFilter === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {r === "all" ? "Все" : r === "student" ? "Ученики" : "Учителя"}
                  </button>
                ))}
              </div>
            </div>

            {/* Accounts Table */}
            <div className="overflow-x-auto">
              <table className="table-fixed w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[35%]">Пользователь</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">Роль</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[25%]">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]">Статус</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAccounts.map((acc) => (
                    <tr key={acc.email} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {acc.profile?.avatar && acc.profile.avatar.length <= 150 ? (
                            <img
                              src={acc.profile.avatar}
                              alt={acc.name}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                              {acc.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 max-w-[120px] truncate overflow-hidden">{acc.name}</div>
                            {acc.role === "student" && acc.profile?.grade && (
                              <div className="text-[10px] text-gray-400 max-w-[120px] truncate overflow-hidden">Класс {acc.profile.grade}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          acc.role === "student" ? "bg-blue-50 text-blue-600" :
                          acc.role === "teacher" ? "bg-purple-50 text-purple-600" :
                          acc.role === "admin" ? "bg-red-50 text-red-600" :
                          "bg-amber-50 text-amber-600"
                        }`}>
                          {acc.role === "student" ? <GraduationCap size={11} /> :
                           acc.role === "teacher" ? <BookOpen size={11} /> :
                           acc.role === "admin" ? <Shield size={11} /> :
                           <UserCog size={11} />}
                          {acc.role === "student" ? "Ученик" : acc.role === "teacher" ? "Учитель" : acc.role === "admin" ? "Админ" : "Родитель"}
                        </span>
                      </td>
                      <td className="px-4 py-3 min-w-0">
                        <div className="text-sm text-gray-500 max-w-[120px] truncate overflow-hidden">{acc.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${acc.isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                          <span className={`text-xs ${acc.isOnline ? "text-emerald-600" : "text-gray-400"}`}>
                            {acc.isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {acc.profileId && (
                          <button
                            onClick={() => router.push(`/${lang}/profile/${acc.profileId}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-brand hover:bg-brand/5 transition-colors cursor-pointer"
                          >
                            <ExternalLink size={12} />
                            Профиль
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAccounts.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                Пользователи не найдены
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
