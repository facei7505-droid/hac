"use client";

import { useState, useCallback } from "react";
import { student as child, weeklyData, subjects } from "@/data/students";
import { weeklySummaryKeys, aiTipsKeys } from "@/data/parent";
import Sparkline from "@/components/ui/Sparkline";
import { useI18n } from "./I18nProvider";
import { useNotifications } from "@/lib/notifications-context";

export default function ParentTab() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info">("success");
  const [showQuickPay, setShowQuickPay] = useState(false);
  const [lunchBalance, setLunchBalance] = useState(450);
  const [tutorRequested, setTutorRequested] = useState(false);
  const [messageText, setMessageText] = useState("");
  const { t } = useI18n();
  const { addMessage } = useNotifications();

  const showToast = useCallback((msg: string, type: "success" | "info" = "success") => {
    setToastType(type);
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  }, []);

  const handleSendMessage = useCallback(() => {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    addMessage(trimmed, child.name);
    setMessageText("");
    showToast(t("parent.messageSent"), "success");
  }, [messageText, addMessage, showToast, t]);

  const handleTopUp = useCallback(() => {
    setLunchBalance(5450);
    setShowQuickPay(false);
    showToast(t("parent.balanceUpdated"), "success");
  }, [showToast, t]);

  const handleTutorRequest = useCallback(() => {
    if (tutorRequested) return;
    setTutorRequested(true);
    showToast("✅ Смарт-сессия назначена! ИИ-Тьютор ждёт ученика в виртуальной комнате сегодня в 18:00", "success");
  }, [tutorRequested, showToast]);

  const weakSubject = subjects.find((s) => s.grade <= 4);

  const weekDays = [t("day.mon"), t("day.tue"), t("day.wed"), t("day.thu"), t("day.fri")];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] animate-slide-up max-w-sm">
          <div className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white ${
            toastType === "success"
              ? "bg-emerald-600 shadow-emerald-600/30"
              : "bg-blue-600 shadow-blue-600/30"
          }`}>
            <span className="text-lg mt-0.5">{toastType === "success" ? "✅" : "ℹ️"}</span>
            <span className="text-sm font-semibold leading-relaxed">{toast}</span>
            <button onClick={() => setToast(null)} className="ml-1 text-white/70 hover:text-white cursor-pointer flex-shrink-0 mt-0.5">✕</button>
          </div>
        </div>
      )}

      {/* Quick Pay Modal */}
      {showQuickPay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowQuickPay(false)}>
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-lg">
                <span className="text-3xl">💳</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t("parent.quickPay")}</h3>
              <p className="text-sm text-gray-400 mb-6">
                {t("parent.smartLunchDesc").split(".")[0]}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleTopUp}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  {t("parent.topUp")}
                </button>
                <button
                  onClick={() => setShowQuickPay(false)}
                  className="w-full py-3 rounded-2xl bg-gray-100 text-gray-500 font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                >
                  {t("parent.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("parent.weeklySummary")}</h2>
          <p className="text-gray-500 text-sm mt-1">{t("parent.childOverview")}</p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
          <span className="text-3xl">{child.avatar}</span>
          <div>
            <div className="font-semibold text-gray-900">{child.name}</div>
            <div className="text-xs text-gray-400">{t("parent.class")} {child.grade} · GPA {child.gpa}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">📈</span>
              {t("parent.weeklyChart")}
            </h3>
            <Sparkline data={weeklyData} color="#1e40af" />
            <div className="flex justify-between mt-2">
              {weekDays.map((d) => (
                <span key={d} className="text-xs text-gray-400">{d}</span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600">↑ 9%</div>
                <div className="text-xs text-emerald-600/70">{t("parent.weeklyGrowth")}</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-brand">4.6</div>
                <div className="text-xs text-brand/70">{t("parent.avgScore")}</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">97%</div>
                <div className="text-xs text-purple-600/70">{t("parent.attendance")}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">📅</span>
              {t("parent.dayByDay")}
            </h3>
            <div className="space-y-2">
              {weeklySummaryKeys.map((day, i) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(selectedDay === i ? null : i)}
                  className="w-full text-left"
                >
                  <div className={`p-4 rounded-xl transition-all ${
                    selectedDay === i ? "bg-brand/5 border border-brand/20" : "bg-gray-50/50 hover:bg-gray-100/80 border border-transparent"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-900">{t(day.day)}</span>
                      <span className="text-xs text-gray-400">{day.events.length} {t("parent.grades")}</span>
                    </div>
                    {selectedDay === i && (
                      <div className="mt-3 space-y-2 animate-slide-up">
                        {day.events.map((e, j) => (
                          <div key={j} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                            {e}
                          </div>
                        ))}
                        <div className="mt-2 text-xs text-brand bg-brand/5 rounded-lg p-2">
                          💡 {day.note}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2 relative z-10">
              <span>🤖</span> {t("parent.aiTips")}
            </h3>
            <p className="text-purple-200 text-sm mb-4 relative z-10">{t("parent.personalRec")}</p>
            <div className="space-y-3 relative z-10">
              {aiTipsKeys.map((tipItem, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <span className="text-xl flex-shrink-0">{tipItem.icon}</span>
                  <p className="text-sm text-purple-100 leading-relaxed">{t(tipItem.tip)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">⚡</span>
              {t("parent.quickStats")}
            </h3>
            <div className="space-y-3">
              {[
                { label: t("parent.homework"), value: "24/25", pct: 96, color: "bg-emerald-500" },
                { label: t("parent.projects"), value: "3/3", pct: 100, color: "bg-brand" },
                { label: t("parent.tests"), value: "8/9", pct: 89, color: "bg-amber-500" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{s.label}</span>
                    <span className="font-semibold text-gray-900">{s.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${s.color} h-2 rounded-full transition-all duration-700`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">⚡</span>
          {t("parent.smartActions")}
        </h3>
        <p className="text-gray-400 text-sm mb-5 ml-10">{t("parent.smartActionsDesc")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Write to Child */}
          <div className="group relative overflow-hidden rounded-2xl p-6 text-left bg-gradient-to-br from-amber-50 to-violet-50 border border-violet-100/50 shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-200/20 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/25 mb-4">
                <span className="text-2xl">💌</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-1.5">{t("parent.sendMessage")}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{t("parent.sendMessageDesc")}</p>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={t("parent.messagePlaceholder")}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-white/70 border border-violet-100 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent resize-none transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="mt-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/35 active:scale-[0.98]"
              >
                {t("parent.send")}
              </button>
            </div>
          </div>

          {/* Card 2: Smart Lunch */}
          <button
            onClick={() => setShowQuickPay(true)}
            className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer bg-white/60 backdrop-blur-xl border border-gray-200/60 hover:border-gray-300 shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-lg mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-1.5">{t("parent.smartLunch")}</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{t("parent.smartLunchDesc")}</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {lunchBalance.toLocaleString()} тг
              </div>
            </div>
          </button>

          {/* Card 3: AI Tutor */}
          {weakSubject && (
            <button
              onClick={handleTutorRequest}
              disabled={tutorRequested}
              className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer border shadow-sm ${
                tutorRequested
                  ? "bg-emerald-50 border-emerald-200 scale-[1]"
                  : "bg-gradient-to-br from-yellow-50 to-red-50 border-yellow-100/50 hover:border-yellow-200 hover:scale-[1.03] hover:shadow-xl"
              }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200/20 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-4 ${
                  tutorRequested
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/25"
                    : "bg-gradient-to-br from-yellow-400 to-red-400 shadow-yellow-500/25"
                }`}>
                  <span className="text-2xl">{tutorRequested ? "✅" : "🤖"}</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-1.5">
                  {tutorRequested ? "Смарт-сессия назначена" : t("parent.aiTutor")}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {tutorRequested ? "ИИ-Тьютор ждёт ученика в виртуальной комнате сегодня в 18:00" : t("parent.aiTutorDesc")}
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
