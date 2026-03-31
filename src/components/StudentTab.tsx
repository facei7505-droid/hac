"use client";

import { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import { student, subjects, recentGrades, weeklyData, weeklyProgress } from "@/data/students";
import { getMMRGradient, getGradeColor } from "@/lib/utils";
import { useI18n } from "./I18nProvider";
import { useStudentData } from "@/lib/student-data-context";
import {
  calculateStudentRisk,
  calculateGradeProbability,
  getWeakSubject,
  getTopicRecommendations,
  type RiskResult,
  type ProbabilityResult,
  type WeakSubjectResult,
} from "@/lib/ai-tutor";
import { X, Clock } from "lucide-react";

const STUDENT_ID = "s1";

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 60) {
    return `${diffMin} ${pluralizeRu(diffMin, "минуту", "минуты", "минут")} назад`;
  }
  if (diffHour < 24) {
    return `${diffHour} ${pluralizeRu(diffHour, "час", "часа", "часов")} назад`;
  }
  return `${diffDay} ${pluralizeRu(diffDay, "день", "дня", "дней")} назад`;
}

function pluralizeRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

interface GradebookData {
  students: { id: string; name: string; grade: string; avatar: string }[];
  columns: { id: string; type: string; label: string; date?: string }[];
  grades: Record<string, Record<string, Record<string, Record<string, number | "Н" | null>>>>;
}

export default function StudentTab() {
  const { t, lang } = useI18n();
  const { overrides, timestamps, getStudentMetrics, version } = useStudentData();
  const [gradebook, setGradebook] = useState<GradebookData | null>(null);
  const [showGradeHistory, setShowGradeHistory] = useState(false);

  useEffect(() => {
    fetch("/api/gradebook")
      .then((r) => (r.ok ? r.json() : null))
      .then(setGradebook)
      .catch(() => {});
  }, []);

  const metrics = useMemo(
    () => getStudentMetrics(STUDENT_ID, student.gpa, student.mmr),
    [getStudentMetrics, version]
  );

  const dynamicGpa = metrics.gpa;
  const dynamicMmr = metrics.mmr;
  const hasCritical = metrics.hasCriticalGrade;
  const criticalSubject = metrics.criticalSubject;
  const criticalGrade = metrics.criticalGrade;

  const weekDays = [t("day.mon"), t("day.tue"), t("day.wed"), t("day.thu"), t("day.fri"), t("day.sat"), t("day.sun")];

  const allRecentGrades = useMemo(() => {
    const studentOverrides = overrides[STUDENT_ID] || {};
    const studentTimestamps = timestamps[STUDENT_ID] || {};
    const overrideGrades: { subject: string; grade: number; date: string; type: string }[] = [];
    for (const [subject, grades] of Object.entries(studentOverrides)) {
      const subjectTimestamps = studentTimestamps[subject] || {};
      for (const [colId, val] of Object.entries(grades)) {
        if (typeof val === "number") {
          const ts = subjectTimestamps[colId];
          overrideGrades.push({
            subject,
            grade: val,
            date: ts ? ts : new Date().toISOString(),
            type: "override",
          });
        }
      }
    }
    return overrideGrades.length > 0 ? [...overrideGrades, ...recentGrades].slice(0, 5) : recentGrades;
  }, [overrides, timestamps, version]);

  const risk: RiskResult = calculateStudentRisk(allRecentGrades.map((g) => g.grade));
  const weak: WeakSubjectResult | null = getWeakSubject(subjects);

  let probability: ProbabilityResult = { grade5: 94, grade4: 5, grade3: 1 };
  let aiAdviceText = t("student.adviceText");
  let aiAlertMode = false;

  if (gradebook) {
    const studentInGradebook = gradebook.students.find((s) => s.name === student.name);
    if (studentInGradebook) {
      const classId = studentInGradebook.grade;
      const allSubjects = Object.keys(gradebook.grades[classId] || {});
      for (const subj of allSubjects) {
        const subjGrades = gradebook.grades[classId]?.[subj]?.[studentInGradebook.id];
        if (subjGrades) {
          const sorCols = gradebook.columns.filter((c) => c.type === "sor");
          const sochCol = gradebook.columns.find((c) => c.type === "soch");
          const sorGrades = sorCols.map((c) => subjGrades[c.id]).filter((v): v is number => typeof v === "number");
          const sochGrade = sochCol ? subjGrades[sochCol.id] : null;
          if (sorGrades.length > 0) {
            probability = calculateGradeProbability(sorGrades, typeof sochGrade === "number" ? sochGrade : null);
            break;
          }
        }
      }
    }
  }

  if (hasCritical && criticalGrade !== null && criticalGrade <= 2) {
    aiAlertMode = true;
    const subjectKey = criticalSubject || "chemistry";
    const subjectLabel = t(`subject.${subjectKey}`);
    aiAdviceText = t("student.aiDangerAlert")
      .replace("{subject}", subjectLabel)
      .replace("{grade}", String(criticalGrade));
  } else if (weak) {
    const topics = getTopicRecommendations(weak.subjectKey, lang);
    if (topics.length > 0) {
      aiAdviceText =
        t("student.aiWeakPrefix")
          .replace("{subject}", t(`subject.${weak.subjectKey}`))
          .replace("{grade}", String(weak.grade)) +
        " " +
        t("student.aiRecommendPrefix") +
        " " +
        topics.slice(0, 3).join(", ") +
        ".";
    }
  }

  const riskStatusConfig = {
    safe: { label: t("student.riskSafe"), color: "bg-emerald-100 text-emerald-700" },
    warning: { label: t("student.riskWarning"), color: "bg-amber-100 text-amber-700" },
    risk: { label: t("student.riskDanger"), color: "bg-red-100 text-red-700" },
  };

  const mmrTier =
    dynamicMmr >= 2000 ? "Legendary" : dynamicMmr >= 1500 ? "Gold" : dynamicMmr >= 1000 ? "Silver" : "Bronze";

  return (
    <div className="p-6 space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand via-brand-light to-blue-400 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCwwIEwgMCwwIDAsNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        </div>
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-5xl animate-float">
              {student.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getMMRGradient(dynamicMmr)} text-white shadow-lg`}
                >
                  MMR {dynamicMmr} · {mmrTier}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${riskStatusConfig[risk.status].color}`}
                >
                  {riskStatusConfig[risk.status].label}
                </span>
              </div>
              <p className="text-gray-500 mt-1">
                {t("student.class")} {student.grade} · {t("student.streak")}: {student.streak} {t("student.streakDays")} 🔥
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${dynamicGpa < student.gpa ? "text-red-500" : "text-brand"}`}>
                  {dynamicGpa}
                </div>
                <div className="text-xs text-gray-400 mt-1">{t("student.gpa")}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">{student.attendance}%</div>
                <div className="text-xs text-gray-400 mt-1">{t("student.attendance")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Subjects Grid */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">📊</span>
              {t("student.subjects")}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {subjects.map((subject) => {
                const subjOverrides = overrides[STUDENT_ID]?.[subject.name];
                const overrideValues = subjOverrides
                  ? Object.values(subjOverrides).filter((v): v is number => typeof v === "number")
                  : [];
                const displayGrade =
                  overrideValues.length > 0
                    ? Math.round(overrideValues.reduce((a, b) => a + b, 0) / overrideValues.length)
                    : subject.grade;
                return (
                  <div
                    key={subject.name}
                    className={`rounded-xl border p-3 transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer ${getGradeColor(displayGrade)}`}
                  >
                    <div className="text-2xl mb-1">{displayGrade}</div>
                    <div className="text-xs font-medium truncate">{t(`subject.${subject.name}`)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Grades */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">📋</span>
              {t("student.recentGrades")}
            </h3>
            <div className="space-y-2">
              {allRecentGrades.map((g, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                    g.type === "override" ? "bg-red-50/80 border border-red-100" : "bg-gray-50/50 hover:bg-gray-100/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border ${getGradeColor(g.grade)}`}
                    >
                      {g.grade}
                    </span>
                    <div>
                      <div className="font-medium text-sm text-gray-900">{t(`subject.${g.subject}`)}</div>
                      <div className="text-xs text-gray-400">
                        {g.type === "override" ? t("student.justNow") : t(`grade.${g.type}`)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{timeAgo(g.date)}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowGradeHistory(true)}
              className="w-full mt-3 py-2.5 text-sm text-brand hover:text-brand-light font-medium flex items-center justify-center gap-1.5 rounded-xl hover:bg-brand/5 transition-colors cursor-pointer"
            >
              <Clock size={14} />
              Посмотреть всю историю
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* AI Analytics - Dynamic */}
          <div
            className={`rounded-2xl p-6 text-white shadow-xl relative overflow-hidden ${
              aiAlertMode
                ? "bg-gradient-to-br from-red-600 to-red-800 shadow-red-600/20"
                : "bg-gradient-to-br from-brand to-brand-dark shadow-brand/20"
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2 relative z-10">
              <span>{aiAlertMode ? "🚨" : "🤖"}</span> {t("student.aiAnalytics")}
            </h3>
            <p className="text-white/70 text-sm mb-6 relative z-10">
              {aiAlertMode ? t("student.aiAlertTitle") : t("student.personalForecast")}
            </p>

            <div className="relative z-10 space-y-4">
              {/* Grade 5 probability */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">{t("student.grade5Probability")}</span>
                  <span className={`text-2xl font-bold ${aiAlertMode ? "text-yellow-300" : ""}`}>{probability.grade5}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      aiAlertMode
                        ? "bg-gradient-to-r from-yellow-400 to-amber-300"
                        : "bg-gradient-to-r from-emerald-400 to-green-300"
                    }`}
                    style={{ width: `${probability.grade5}%` }}
                  />
                </div>
              </div>

              {/* Grade 4 probability */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">{t("student.grade4Probability")}</span>
                  <span className="text-2xl font-bold">{probability.grade4}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-cyan-300 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${probability.grade4}%` }}
                  />
                </div>
              </div>

              {/* ENT probability */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">{t("student.entProbability")}</span>
                  <span className={`text-2xl font-bold ${aiAlertMode ? "text-yellow-300" : ""}`}>
                    {aiAlertMode ? "81%" : "94%"}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      aiAlertMode
                        ? "bg-gradient-to-r from-yellow-400 to-amber-300"
                        : "bg-gradient-to-r from-yellow-400 to-amber-300"
                    }`}
                    style={{ width: aiAlertMode ? "81%" : "94%" }}
                  />
                </div>
              </div>

              {/* MMR Change indicator */}
              {dynamicMmr !== student.mmr && (
                <div className="flex items-center gap-2 pt-1">
                  <span className={`text-sm font-bold ${dynamicMmr < student.mmr ? "text-red-300" : "text-emerald-300"}`}>
                    {dynamicMmr < student.mmr ? "▼" : "▲"} MMR: {student.mmr} → {dynamicMmr}
                  </span>
                </div>
              )}

              {/* Trend indicator */}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${risk.trend >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                  {risk.trend >= 0 ? "▲" : "▼"} {risk.trend >= 0 ? "+" : ""}
                  {risk.trend.toFixed(1)}
                </span>
                <span className="text-xs text-white/60">{t("student.trendLabel")}</span>
              </div>

              {/* AI Advice */}
              <div
                className={`mt-2 p-3 rounded-xl border backdrop-blur-sm ${
                  aiAlertMode ? "bg-white/15 border-red-400/30" : "bg-white/10 border-white/10"
                }`}
              >
                <p className="text-sm leading-relaxed">
                  {aiAlertMode ? (
                    <>
                      <strong className="text-yellow-300">{t("student.aiDangerIcon")}</strong> {aiAdviceText}
                    </>
                  ) : (
                    <>
                      💡 <strong>{t("student.advice")}:</strong> {aiAdviceText}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">📈</span>
              {t("student.weeklyProgress")}
            </h3>
            <div className="h-40 flex items-end justify-between gap-2">
              {weeklyProgress.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full flex flex-col items-center">
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
                      <div className="bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap">
                        {item.value}%
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                    <div
                      className="w-full bg-blue-500 rounded-t-md transition-all group-hover:bg-blue-400 group-hover:shadow-lg"
                      style={{ height: `${item.value}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium group-hover:text-gray-700 transition-colors">
                    {weekDays[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Bonus */}
          <WeeklyBonus />
        </div>
      </div>

      {/* Grade History Modal */}
      {showGradeHistory && (
        <GradeHistoryModal
          onClose={() => setShowGradeHistory(false)}
          t={t}
          gradebook={gradebook}
          overrides={overrides}
          timestamps={timestamps}
        />
      )}
    </div>
  );
}

const CLAIM_KEY = "weekly_mmr_claimed";

function WeeklyBonus() {
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLAIM_KEY);
      if (raw) {
        const claimedAt = new Date(raw).getTime();
        if (Date.now() - claimedAt < 7 * 24 * 60 * 60 * 1000) {
          setClaimed(true);
        }
      }
    } catch {}
  }, []);

  const handleClaim = () => {
    if (claimed || claiming) return;
    setClaiming(true);

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.55 },
      colors: ["#6366f1", "#8b5cf6", "#a78bfa", "#c084fc", "#e879f9"],
    });

    try {
      localStorage.setItem(CLAIM_KEY, new Date().toISOString());
    } catch {}

    setTimeout(() => {
      setClaimed(true);
      setClaiming(false);
    }, 800);
  };

  return (
    <div className="rounded-2xl p-6 text-white shadow-xl relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500">
      <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-4 -translate-x-4" />

      <div className="relative z-10">
        <div className="text-3xl mb-3">🎉</div>
        <h3 className="text-lg font-bold mb-1">Еженедельный бонус</h3>
        <p className="text-white/80 text-sm mb-5">
          {claimed
            ? "Ты получил награду за эту неделю. Отличная работа!"
            : "Забери свои +50 MMR за хорошую учебу на этой неделе!"}
        </p>

        {claimed ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <span className="text-lg">✅</span>
            <span className="text-sm font-semibold">Награда получена. Приходи на следующей неделе!</span>
          </div>
        ) : (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer active:scale-95 ${
              claiming
                ? "bg-white/30 text-white/70 cursor-wait"
                : "bg-white text-amber-600 hover:bg-amber-50 shadow-lg hover:shadow-xl"
            }`}
          >
            {claiming ? "Начисляем..." : "🎁 Получить награду"}
          </button>
        )}
      </div>
    </div>
  );
}

const MONTHS_RU = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

function GradeHistoryModal({
  onClose,
  t,
  gradebook,
  overrides,
  timestamps,
}: {
  onClose: () => void;
  t: (key: string) => string;
  gradebook: GradebookData | null;
  overrides: Record<string, Record<string, Record<string, number | "Н" | null>>>;
  timestamps: Record<string, Record<string, Record<string, string>>>;
}) {
  const studentOverrides = overrides[STUDENT_ID] || {};
  const studentTimestamps = timestamps[STUDENT_ID] || {};

  const allGrades: { subject: string; grade: number | "Н"; date: string; type: string; sortDate: number }[] = [];

  // Add override grades with timestamps
  for (const [subject, grades] of Object.entries(studentOverrides)) {
    const subjectTs = studentTimestamps[subject] || {};
    for (const [colId, val] of Object.entries(grades)) {
      if (val !== null) {
        const ts = subjectTs[colId];
        const dateObj = ts ? new Date(ts) : new Date();
        allGrades.push({
          subject,
          grade: val,
          date: ts ? `${dateObj.getDate()} ${MONTHS_RU[dateObj.getMonth()]}, ${dateObj.getHours().toString().padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}` : "Только что",
          type: "override",
          sortDate: dateObj.getTime(),
        });
      }
    }
  }

  // Add static grades from data
  for (const g of recentGrades) {
    const gDate = new Date(g.date);
    allGrades.push({
      subject: g.subject,
      grade: g.grade,
      date: `${gDate.getDate()} ${MONTHS_RU[gDate.getMonth()]}, ${gDate.getHours().toString().padStart(2, "0")}:${gDate.getMinutes().toString().padStart(2, "0")}`,
      type: g.type,
      sortDate: gDate.getTime(),
    });
  }

  // Add grades from gradebook if available
  if (gradebook) {
    const studentInGradebook = gradebook.students.find((s) => s.name === student.name);
    if (studentInGradebook) {
      const classId = studentInGradebook.grade;
      const allSubjects = Object.keys(gradebook.grades[classId] || {});
      for (const subj of allSubjects) {
        const subjGrades = gradebook.grades[classId]?.[subj]?.[studentInGradebook.id];
        if (subjGrades) {
          for (const col of gradebook.columns) {
            const val = subjGrades[col.id];
            if (typeof val === "number") {
              const colDate = col.date ? new Date(col.date) : null;
              allGrades.push({
                subject: subj,
                grade: val,
                date: colDate ? `${colDate.getDate()} ${MONTHS_RU[colDate.getMonth()]}` : col.label,
                type: col.type === "sor" ? "СОР" : col.type === "soch" ? "СОЧ" : "Урок",
                sortDate: colDate ? colDate.getTime() : 0,
              });
            }
          }
        }
      }
    }
  }

  // Sort by date descending (most recent first)
  allGrades.sort((a, b) => b.sortDate - a.sortDate);

  // Deduplicate by subject+type+date
  const seen = new Set();
  const uniqueGrades = allGrades.filter((g) => {
    const key = `${g.subject}_${g.type}_${g.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg mx-4 animate-scale-in max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock size={18} className="text-brand" />
            История оценок
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          {uniqueGrades.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-500 text-sm">Нет оценок</p>
            </div>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {uniqueGrades.map((g, i) => (
                  <div key={i} className="relative flex items-start gap-3">
                    <div className="absolute left-[-16px] top-1 w-3 h-3 rounded-full bg-brand border-2 border-white shadow-sm" />
                    <div className="flex-1 bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${getGradeColor(typeof g.grade === "number" ? g.grade : 3)}`}
                          >
                            {g.grade}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{t(`subject.${g.subject}`)}</div>
                            <div className="text-[10px] text-gray-400">
                              {g.type === "override" ? "Новая оценка" : g.type}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{g.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
