"use client";

import { useState } from "react";

const student = {
  name: "Айдар Нурланов",
  grade: "10-A",
  avatar: "🧑‍🎓",
  mmr: 1842,
  mmrTier: "Legendary",
  gpa: 4.6,
  attendance: 97,
  streak: 12,
};

const subjects = [
  { name: "Математика", grade: 5, color: "bg-blue-500" },
  { name: "Физика", grade: 5, color: "bg-purple-500" },
  { name: "Химия", grade: 4, color: "bg-emerald-500" },
  { name: "История", grade: 5, color: "bg-amber-500" },
  { name: "Литература", grade: 4, color: "bg-rose-500" },
  { name: "Английский", grade: 5, color: "bg-cyan-500" },
  { name: "Биология", grade: 4, color: "bg-green-500" },
  { name: "Информатика", grade: 5, color: "bg-indigo-500" },
];

const recentGrades = [
  { subject: "Математика", grade: 5, date: "28 мар", type: "Контрольная" },
  { subject: "Физика", grade: 5, date: "27 мар", type: "Лабораторная" },
  { subject: "Химия", grade: 4, date: "26 мар", type: "Тест" },
  { subject: "Литература", grade: 5, date: "25 мар", type: "Эссе" },
  { subject: "Английский", grade: 4, date: "24 мар", type: "Speaking" },
];

const skillTree = [
  { name: "Алгебра", level: 8, maxLevel: 10, unlocked: true, icon: "∑" },
  { name: "Геометрия", level: 6, maxLevel: 10, unlocked: true, icon: "△" },
  { name: "Теория вероятностей", level: 4, maxLevel: 10, unlocked: true, icon: "🎲" },
  { name: "Мат. анализ", level: 0, maxLevel: 10, unlocked: false, icon: "∫" },
  { name: "Программирование", level: 7, maxLevel: 10, unlocked: true, icon: "💻" },
  { name: "Научный метод", level: 5, maxLevel: 10, unlocked: true, icon: "🔬" },
  { name: "Критическое мышление", level: 3, maxLevel: 10, unlocked: true, icon: "🧠" },
  { name: "Leadership", level: 2, maxLevel: 10, unlocked: false, icon: "👑" },
];

function getMMRColor(mmr: number) {
  if (mmr >= 2000) return "from-yellow-400 to-amber-500";
  if (mmr >= 1500) return "from-purple-400 to-violet-500";
  if (mmr >= 1000) return "from-blue-400 to-cyan-500";
  return "from-gray-400 to-gray-500";
}

function getGradeColor(grade: number) {
  if (grade === 5) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (grade === 4) return "bg-blue-100 text-blue-700 border-blue-200";
  if (grade === 3) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-red-100 text-red-700 border-red-200";
}

export default function StudentTab() {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  return (
    <div className="space-y-6">
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
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getMMRColor(student.mmr)} text-white shadow-lg`}>
                  MMR {student.mmr} · {student.mmrTier}
                </span>
              </div>
              <p className="text-gray-500 mt-1">Класс {student.grade} · Серия посещений: {student.streak} дней 🔥</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand">{student.gpa}</div>
                <div className="text-xs text-gray-400 mt-1">GPA</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">{student.attendance}%</div>
                <div className="text-xs text-gray-400 mt-1">Посещ.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grades Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject Grades */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">📊</span>
              Успеваемость по предметам
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {subjects.map((subject) => (
                <div
                  key={subject.name}
                  className={`rounded-xl border p-3 transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer ${getGradeColor(subject.grade)}`}
                >
                  <div className="text-2xl mb-1">{subject.grade}</div>
                  <div className="text-xs font-medium truncate">{subject.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Grades */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">📋</span>
              Последние оценки
            </h3>
            <div className="space-y-2">
              {recentGrades.map((g, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border ${getGradeColor(g.grade)}`}>
                      {g.grade}
                    </span>
                    <div>
                      <div className="font-medium text-sm text-gray-900">{g.subject}</div>
                      <div className="text-xs text-gray-400">{g.type}</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{g.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Analytics */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-brand to-brand-dark rounded-2xl p-6 text-white shadow-xl shadow-brand/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2 relative z-10">
              <span>🤖</span> AI-аналитика
            </h3>
            <p className="text-blue-200 text-sm mb-6 relative z-10">Персональный прогноз</p>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-200">Вероятность сдачи ЕНТ</span>
                <span className="text-2xl font-bold">94%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                <div className="bg-gradient-to-r from-emerald-400 to-green-300 h-3 rounded-full transition-all duration-1000" style={{ width: "94%" }} />
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-200">Вероятность медали</span>
                <span className="text-2xl font-bold">87%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                <div className="bg-gradient-to-r from-yellow-400 to-amber-300 h-3 rounded-full transition-all duration-1000" style={{ width: "87%" }} />
              </div>

              <div className="mt-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <p className="text-sm text-blue-100 leading-relaxed">
                  💡 <strong>Совет:</strong> Удели больше внимания химии — это единственный предмет с трендом ниже 5.
                  Твой потенциал рейтинга — 2000+ MMR.
                </p>
              </div>
            </div>
          </div>

          {/* Weekly Performance Sparkline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">📈</span>
              Прогресс за неделю
            </h3>
            <div className="flex items-end gap-1 h-16">
              {[4.2, 4.5, 4.3, 4.7, 4.6, 4.8, 4.6].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-brand to-brand-light transition-all duration-300 hover:from-brand-light hover:to-blue-300"
                    style={{ height: `${((v - 3) / 2) * 100}%` }}
                  />
                  <span className="text-[10px] text-gray-400">{["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Tree */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">🌳</span>
          Skill Tree — Дерево навыков
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {skillTree.map((skill) => (
            <button
              key={skill.name}
              onClick={() => setExpandedSkill(expandedSkill === skill.name ? null : skill.name)}
              className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                skill.unlocked
                  ? "border-brand/20 bg-brand-50/50 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10"
                  : "border-gray-200 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-2xl ${skill.unlocked ? "" : "grayscale"}`}>{skill.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate">{skill.name}</div>
                  <div className="text-xs text-gray-400">Lvl {skill.level}/{skill.maxLevel}</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    skill.unlocked
                      ? "bg-gradient-to-r from-brand to-brand-light"
                      : "bg-gray-300"
                  }`}
                  style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                />
              </div>
              {!skill.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl">
                  <span className="text-2xl">🔒</span>
                </div>
              )}
              {expandedSkill === skill.name && skill.unlocked && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 animate-slide-up">
                  {skill.level >= 8 ? "⭐ Мастер" : skill.level >= 5 ? "🔥 Продвинутый" : "📖 Изучается"}
                  {" · "}XP: {skill.level * 120}/{skill.maxLevel * 120}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
