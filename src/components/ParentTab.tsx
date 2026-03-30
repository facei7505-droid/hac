"use client";

import { useState } from "react";

const child = {
  name: "Айдар Нурланов",
  grade: "10-A",
  avatar: "🧑‍🎓",
  gpa: 4.6,
};

const weeklyData = [4.2, 4.5, 4.3, 4.7, 4.6, 4.8, 4.6];
const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const weeklySummary = [
  { day: "Понедельник", events: ["Математика — 5 (контрольная)", "Физика — 5 (лабораторная)"], note: "Отличный старт недели" },
  { day: "Вторник", events: ["Химия — 4 (тест)", "Английский — 5 (презентация)"], note: "Небольшой спад в химии" },
  { day: "Среда", events: ["История — 5 (доклад)", "Литература — 4 (эссе)"], note: "Активное участие на уроках" },
  { day: "Четверг", events: ["Информатика — 5 (проект)", "Биология — 4 (лабораторная)"], note: "Проект по программированию — отлично" },
  { day: "Пятница", events: ["Математика — 5", "Физика — 5"], note: "Завершение недели на высоте" },
];

const aiTips = [
  { icon: "📚", tip: "Ребёнок показывает стабильный прогресс. Рекомендуем поддерживать текущий темп занятий." },
  { icon: "🧪", tip: "Химия — единственный предмет с оценкой 4. Дополнительные 30 минут в день могут поднять до 5." },
  { icon: "🧠", tip: "Когнитивные тесты показывают сильные навыки логического мышления. Развивайте это дальше." },
  { icon: "😴", tip: "Режим сна важен: рекомендуем ложиться до 22:30 для оптимальной концентрации." },
];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 48;
  const w = 100;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16">
      <defs>
        <linearGradient id={`sparkGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points.join(" ")} ${w},${h}`}
        fill={`url(#sparkGrad-${color})`}
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return <circle key={i} cx={x} cy={y} r="3" fill={color} className="drop-shadow-sm" />;
      })}
    </svg>
  );
}

export default function ParentTab() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Недельная выжимка</h2>
          <p className="text-gray-500 text-sm mt-1">Обзор успеваемости вашего ребёнка</p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
          <span className="text-3xl">{child.avatar}</span>
          <div>
            <div className="font-semibold text-gray-900">{child.name}</div>
            <div className="text-xs text-gray-400">Класс {child.grade} · GPA {child.gpa}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sparkline Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">📈</span>
              График успеваемости за неделю
            </h3>
            <Sparkline data={weeklyData} color="#1e40af" />
            <div className="flex justify-between mt-2">
              {days.map((d, i) => (
                <span key={d} className="text-xs text-gray-400">{d}</span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600">↑ 9%</div>
                <div className="text-xs text-emerald-600/70">Рост за неделю</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-brand">4.6</div>
                <div className="text-xs text-brand/70">Средний балл</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">97%</div>
                <div className="text-xs text-purple-600/70">Посещаемость</div>
              </div>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">📅</span>
              Разбор по дням
            </h3>
            <div className="space-y-2">
              {weeklySummary.map((day, i) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(selectedDay === i ? null : i)}
                  className="w-full text-left"
                >
                  <div className={`p-4 rounded-xl transition-all ${
                    selectedDay === i ? "bg-brand/5 border border-brand/20" : "bg-gray-50/50 hover:bg-gray-100/80 border border-transparent"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-900">{day.day}</span>
                      <span className="text-xs text-gray-400">{day.events.length} оценки</span>
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

        {/* AI Tips */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2 relative z-10">
              <span>🤖</span> Советы от ИИ
            </h3>
            <p className="text-purple-200 text-sm mb-4 relative z-10">Персональные рекомендации</p>
            <div className="space-y-3 relative z-10">
              {aiTips.map((t, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <span className="text-xl flex-shrink-0">{t.icon}</span>
                  <p className="text-sm text-purple-100 leading-relaxed">{t.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">⚡</span>
              Быстрая статистика
            </h3>
            <div className="space-y-3">
              {[
                { label: "Домашние задания", value: "24/25", pct: 96, color: "bg-emerald-500" },
                { label: "Проекты", value: "3/3", pct: 100, color: "bg-brand" },
                { label: "Тесты", value: "8/9", pct: 89, color: "bg-amber-500" },
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
    </div>
  );
}
