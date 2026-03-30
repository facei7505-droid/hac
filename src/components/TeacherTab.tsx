"use client";

import { useState } from "react";

interface StudentRow {
  name: string;
  mmr: number;
  mmrTier: string;
  gpa: number;
  trend: "up" | "down" | "stable";
  attendance: number;
  risk: "low" | "medium" | "high";
  subjects: { name: string; grade: number }[];
}

const students: StudentRow[] = [
  { name: "Айдар Нурланов", mmr: 1842, mmrTier: "Legendary", gpa: 4.6, trend: "up", attendance: 97, risk: "low", subjects: [{ name: "Мат", grade: 5 }, { name: "Физ", grade: 5 }] },
  { name: "Амина Касымова", mmr: 1234, mmrTier: "Silver", gpa: 3.2, trend: "down", attendance: 78, risk: "high", subjects: [{ name: "Мат", grade: 3 }, { name: "Физ", grade: 2 }] },
  { name: "Данияр Ахметов", mmr: 1567, mmrTier: "Gold", gpa: 4.1, trend: "stable", attendance: 92, risk: "low", subjects: [{ name: "Мат", grade: 4 }, { name: "Физ", grade: 4 }] },
  { name: "Жанель Сагынбаева", mmr: 980, mmrTier: "Bronze", gpa: 2.8, trend: "down", attendance: 71, risk: "high", subjects: [{ name: "Мат", grade: 3 }, { name: "Физ", grade: 2 }] },
  { name: "Нурлан Оразов", mmr: 1720, mmrTier: "Platinum", gpa: 4.4, trend: "up", attendance: 95, risk: "low", subjects: [{ name: "Мат", grade: 5 }, { name: "Физ", grade: 4 }] },
  { name: "Сабина Ермекова", mmr: 1100, mmrTier: "Silver", gpa: 3.5, trend: "down", attendance: 83, risk: "medium", subjects: [{ name: "Мат", grade: 3 }, { name: "Физ", grade: 4 }] },
  { name: "Тимур Кенжебаев", mmr: 1650, mmrTier: "Gold", gpa: 4.3, trend: "up", attendance: 94, risk: "low", subjects: [{ name: "Мат", grade: 5 }, { name: "Физ", grade: 4 }] },
  { name: "Алия Бекова", mmr: 890, mmrTier: "Bronze", gpa: 2.5, trend: "down", attendance: 65, risk: "high", subjects: [{ name: "Мат", grade: 2 }, { name: "Физ", grade: 2 }] },
];

function getMMRColor(mmr: number) {
  if (mmr >= 2000) return "text-amber-500";
  if (mmr >= 1500) return "text-purple-500";
  if (mmr >= 1000) return "text-blue-500";
  return "text-gray-500";
}

function getRiskBadge(risk: string) {
  if (risk === "high") return "bg-red-100 text-red-700 border-red-200";
  if (risk === "medium") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

export default function TeacherTab() {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "risk" | "down">("all");

  const handleGenerate = () => {
    setGenerating(true);
    setReport(null);
    setTimeout(() => {
      setGenerating(false);
      setReport(`## AI-отчёт о классе 10-A

**Критические ученики (требуют немедленного внимания):**
- Амина Касымова — GPA упал с 3.8 до 3.2 за месяц. Рекомендуется: индивидуальная консультация по математике, связь с родителями.
- Жанель Сагынбаева — посещаемость 71%, пропуски систематические. Рекомендуется: выяснить причины, привлечь психолога.
- Алия Бекова — GPA 2.5, критический уровень. Рекомендуется: составить план поддержки, дополнительные занятия.

**Позитивные тренды:**
- Айдар Нурланов — стабильный рост, кандидат на медаль.
- Нурлан Оразов — улучшение по всем предметам.

**Рекомендации по классу:**
- Провести групповую работу для поддержки отстающих.
- Внедрить peer-to-peer tutoring систему.`);
    }, 2500);
  };

  const filtered = students.filter((s) => {
    if (filter === "risk") return s.risk === "high" || s.risk === "medium";
    if (filter === "down") return s.trend === "down";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Early Warning System</h2>
          <p className="text-gray-500 text-sm mt-1">Мониторинг успеваемости учеников в реальном времени</p>
        </div>
        <div className="flex gap-2">
          {(["all", "risk", "down"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? "bg-brand text-white shadow-lg shadow-brand/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? "Все" : f === "risk" ? "⚠️ Риск" : "📉 Падение"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Всего учеников", value: students.length, icon: "👥", color: "from-blue-500 to-cyan-500" },
          { label: "В зоне риска", value: students.filter((s) => s.risk === "high").length, icon: "🚨", color: "from-red-500 to-rose-500" },
          { label: "Падающий тренд", value: students.filter((s) => s.trend === "down").length, icon: "📉", color: "from-amber-500 to-orange-500" },
          { label: "Средний GPA", value: (students.reduce((a, s) => a + s.gpa, 0) / students.length).toFixed(1), icon: "📊", color: "from-emerald-500 to-green-500" },
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ученик</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">MMR</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">GPA</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Посещ.</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Тренд</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Риск</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Последние оценки</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s, i) => (
                <tr
                  key={s.name}
                  className={`transition-colors hover:bg-gray-50/50 ${
                    s.trend === "down" ? "bg-red-50/50" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                        {s.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-bold ${getMMRColor(s.mmr)}`}>
                      {s.mmr}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">{s.mmrTier}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-semibold ${s.gpa >= 4 ? "text-emerald-600" : s.gpa >= 3 ? "text-amber-600" : "text-red-600"}`}>
                      {s.gpa}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm ${s.attendance >= 90 ? "text-emerald-600" : s.attendance >= 75 ? "text-amber-600" : "text-red-600"}`}>
                      {s.attendance}%
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {s.trend === "up" && <span className="text-emerald-500">▲ Рост</span>}
                    {s.trend === "down" && <span className="text-red-500 font-semibold">▼ Падение</span>}
                    {s.trend === "stable" && <span className="text-gray-400">— Стабильно</span>}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getRiskBadge(s.risk)}`}>
                      {s.risk === "high" ? "Высокий" : s.risk === "medium" ? "Средний" : "Низкий"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      {s.subjects.map((sub) => (
                        <span
                          key={sub.name}
                          className={`px-2 py-1 rounded-md text-xs font-bold border ${
                            sub.grade >= 4 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            sub.grade >= 3 ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {sub.name} {sub.grade}
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

      {/* AI Report */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>🤖</span> AI-отчёт
          </h3>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              generating
                ? "bg-gray-100 text-gray-400 cursor-wait"
                : "bg-gradient-to-r from-brand to-brand-light text-white shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 hover:scale-[1.02]"
            }`}
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Генерация...
              </span>
            ) : "Сгенерировать AI-отчёт"}
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
    </div>
  );
}
