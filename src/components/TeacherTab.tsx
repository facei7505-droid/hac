"use client";

import { useState, useMemo } from "react";
import { getMMRTextColor, getGradeBadgeColor, getRiskBadge } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import { useI18n } from "./I18nProvider";
import { useStudentData } from "@/lib/student-data-context";
import { useNotifications } from "@/lib/notifications-context";
import { Megaphone } from "lucide-react";

export default function TeacherTab() {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "risk" | "down">("all");
  const { t } = useI18n();
  const { getComputedStudents, version } = useStudentData();
  const { getAnnouncementsFor, announcements } = useNotifications();
  const visibleAnnouncements = useMemo(
    () => getAnnouncementsFor("teacher"),
    [announcements, getAnnouncementsFor]
  );

  const students = useMemo(() => getComputedStudents(), [getComputedStudents, version]);

  const handleGenerate = () => {
    setGenerating(true);
    setReport(null);
    setTimeout(() => {
      setGenerating(false);
      const critical = students.filter((s) => s.risk === "high");
      const positive = students.filter((s) => s.trend === "up");
      setReport(`## ${t("teacher.reportTitle")}

**${t("teacher.criticalStudents")}**
${critical.map((s) => `- ${s.name} — GPA ${s.gpa}`).join("\n") || "- Нет критических учеников"}

**${t("teacher.positiveTrends")}**
${positive.map((s) => `- ${s.name} — стабильный рост`).join("\n") || "- Нет позитивных трендов"}

**${t("teacher.classRecommendations")}**
- ${t("teacher.reportRec1")}
- ${t("teacher.reportRec2")}`);
    }, 2500);
  };

  const filtered = students.filter((s) => {
    if (filter === "risk") return s.risk === "high" || s.risk === "medium";
    if (filter === "down") return s.trend === "down";
    return true;
  });

  const totalStudents = students.length;
  const atRiskCount = students.filter((s) => s.risk === "high").length;
  const decliningCount = students.filter((s) => s.trend === "down").length;
  const avgGpa = totalStudents > 0
    ? (students.reduce((a, s) => a + s.gpa, 0) / totalStudents).toFixed(1)
    : "0.0";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("teacher.earlyWarning")}</h2>
          <p className="text-gray-500 text-sm mt-1">{t("teacher.monitoring")}</p>
        </div>
        <div className="flex gap-2">
          {(["all", "risk", "down"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                filter === f
                  ? "bg-brand text-white shadow-lg shadow-brand/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? t("teacher.all") : f === "risk" ? t("teacher.risk") : t("teacher.decline")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t("teacher.totalStudents"), value: totalStudents, icon: "👥", color: "from-blue-500 to-cyan-500" },
          { label: t("teacher.atRisk"), value: atRiskCount, icon: "🚨", color: "from-red-500 to-rose-500" },
          { label: t("teacher.decliningTrend"), value: decliningCount, icon: "📉", color: "from-amber-500 to-orange-500" },
          { label: t("teacher.avgGPA"), value: avgGpa, icon: "📊", color: "from-emerald-500 to-green-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{stat.icon}</span>
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("teacher.student")}</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("teacher.mmr")}</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("teacher.gpa")}</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("teacher.attendance")}</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("teacher.trend")}</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("teacher.riskCol")}</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("teacher.recentGrades")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className={`transition-colors duration-200 hover:bg-gray-50/50 ${
                    s.trend === "down" ? "bg-red-50/40" : ""
                  } ${s.risk === "high" ? "bg-red-50/30" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-900">{s.name}</span>
                        {s.overrideCount > 0 && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-brand/10 text-brand">
                            {s.overrideCount} {t("teacher.newGrades")}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-bold ${getMMRTextColor(s.mmr)}`}>
                      {s.mmr}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">{s.mmrTier}</span>
                    {s.mmr !== s.baseMmr && (
                      <span className={`ml-1 text-[10px] font-semibold ${s.mmr < s.baseMmr ? "text-red-500" : "text-emerald-500"}`}>
                        {s.mmr < s.baseMmr ? "▼" : "▲"}{Math.abs(s.mmr - s.baseMmr)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-semibold ${s.gpa >= 4 ? "text-emerald-600" : s.gpa >= 3 ? "text-amber-600" : "text-red-600"}`}>
                      {s.gpa}
                    </span>
                    {s.gpa !== s.baseGpa && (
                      <span className={`ml-1 text-[10px] font-semibold ${s.gpa < s.baseGpa ? "text-red-500" : "text-emerald-500"}`}>
                        ({s.baseGpa}→{s.gpa})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm ${s.attendance >= 90 ? "text-emerald-600" : s.attendance >= 75 ? "text-amber-600" : "text-red-600"}`}>
                      {s.attendance}%
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {s.trend === "up" && <span className="text-emerald-500 font-medium">{t("teacher.growing")}</span>}
                    {s.trend === "down" && <span className="text-red-500 font-semibold animate-pulse">{t("teacher.falling")}</span>}
                    {s.trend === "stable" && <span className="text-gray-400">{t("teacher.stable")}</span>}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getRiskBadge(s.risk)}`}>
                      {s.risk === "high" ? t("teacher.riskHigh") : s.risk === "medium" ? t("teacher.riskMedium") : t("teacher.riskLow")}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      {s.subjects.map((sub) => (
                        <span
                          key={sub.name}
                          className={`px-2 py-1 rounded-md text-xs font-bold border ${getGradeBadgeColor(sub.grade)}`}
                        >
                          {t(`subject.${sub.name}`)} {sub.grade}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>🤖</span> {t("teacher.aiReport")}
          </h3>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              generating
                ? "bg-gray-100 text-gray-400 cursor-wait"
                : "bg-gradient-to-r from-brand to-brand-light text-white shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 hover:scale-[1.02]"
            }`}
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <Spinner />
                {t("teacher.generating")}
              </span>
            ) : t("teacher.generateReport")}
          </button>
        </div>
        {report && (
          <div className="prose prose-sm max-w-none bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 animate-slide-up">
            {report.split("\n").map((line, i) => {
              if (line.startsWith("##")) return <h2 key={i} className="text-lg font-bold text-brand mt-0">{line.replace("##", "").trim()}</h2>;
              if (line.startsWith("**")) return <p key={i} className="font-semibold text-gray-800 mb-1" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*/g, "") }} />;
              if (line.startsWith("-")) return <p key={i} className="ml-4 text-gray-600 mb-1">• {line.slice(1).trim()}</p>;
              if (line.trim()) return <p key={i} className="text-gray-600">{line}</p>;
              return null;
            })}
          </div>
        )}
      </div>

      {/* School Announcements */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Megaphone size={16} className="text-indigo-600" />
          </span>
          Школьная лента
        </h3>
        {visibleAnnouncements.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Нет объявлений</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visibleAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/80 hover:border-indigo-200 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📢</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{ann.title}</span>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        ann.target === "all" ? "bg-emerald-50 text-emerald-600" :
                        ann.target === "teachers" ? "bg-purple-50 text-purple-600" :
                        "bg-blue-50 text-blue-600"
                      }`}>
                        {ann.target === "all" ? "Для всех" :
                         ann.target === "teachers" ? "Учителя" :
                         ann.target === "class-10-A" ? "Для 10-А" : "Для 9-Б"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{ann.body}</p>
                    <span className="text-[10px] text-gray-400 mt-1.5 block">Только что</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
