"use client";

import { useState, useRef, useEffect } from "react";

const logSteps = [
  { text: "📥 Импорт данных: 847 учеников, 52 учителя, 38 кабинетов загружено", status: "done" },
  { text: "🔍 Анализ ограничений: проверка совместимости предметов и кабинетов", status: "done" },
  { text: "📊 Оптимизация: genetic algorithm iteration 1/50...", status: "running" },
  { text: "📊 Оптимизация: genetic algorithm iteration 15/50...", status: "pending" },
  { text: "📊 Оптимизация: genetic algorithm iteration 35/50...", status: "pending" },
  { text: "📊 Оптимизация: genetic algorithm iteration 50/50...", status: "pending" },
  { text: "✅ Расписание сгенерировано! Fitness score: 98.7%", status: "pending" },
  { text: "📋 Конфликты: 0 критических, 2 незначительных", status: "pending" },
  { text: "📤 Экспорт: расписание опубликовано для всех классов", status: "pending" },
];

const stats = [
  { label: "Учеников", value: "847", icon: "👨‍🎓", delta: "+12" },
  { label: "Учителей", value: "52", icon: "👩‍🏫", delta: "+3" },
  { label: "Кабинетов", value: "38", icon: "🏫", delta: "0" },
  { label: "Предметов", value: "24", icon: "📚", delta: "+1" },
];

const quickActions = [
  { label: "Экспорт расписания", icon: "📄", color: "from-blue-500 to-cyan-500" },
  { label: "Отправить уведомления", icon: "🔔", color: "from-amber-500 to-orange-500" },
  { label: "Генерация отчётов", icon: "📊", color: "from-emerald-500 to-green-500" },
  { label: "Резервное копирование", icon: "💾", color: "from-purple-500 to-violet-500" },
];

export default function AdminTab() {
  const [generating, setGenerating] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    setGenerating(true);
    setVisibleLogs(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setVisibleLogs(step);
      if (step >= logSteps.length) {
        clearInterval(interval);
        setGenerating(false);
      }
    }, 800);
  };

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [visibleLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Панель администратора</h2>
        <p className="text-gray-500 text-sm mt-1">Управление школьной системой</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              {s.delta !== "0" && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">{s.delta}</span>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smart Schedule Generation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span>🧠</span> Умная генерация расписания
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            ИИ оптимизирует расписание с учётом всех ограничений: кабинеты, учителя, нагрузка учеников.
          </p>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className={`w-full py-5 rounded-2xl text-lg font-bold transition-all duration-300 ${
              generating
                ? "bg-gray-100 text-gray-400 cursor-wait"
                : "bg-gradient-to-r from-brand to-brand-light text-white shadow-xl shadow-brand/25 hover:shadow-2xl hover:shadow-brand/35 hover:scale-[1.01] active:scale-[0.99]"
            }`}
          >
            {generating ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Генерация...
              </span>
            ) : (
              "🚀 Запустить умную генерацию расписания"
            )}
          </button>

          {/* Progress */}
          {visibleLogs > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Прогресс</span>
                <span className="text-xs font-semibold text-brand">{Math.round((visibleLogs / logSteps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-brand to-brand-light h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(visibleLogs / logSteps.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Logs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📋</span> Логи процесса
          </h3>
          <div ref={logRef} className="bg-gray-900 rounded-xl p-4 h-72 overflow-y-auto font-mono text-sm space-y-1">
            {visibleLogs === 0 && (
              <div className="text-gray-500 text-center py-8">Ожидание запуска...</div>
            )}
            {logSteps.slice(0, visibleLogs).map((step, i) => (
              <div key={i} className={`flex items-start gap-2 animate-slide-up ${
                step.text.startsWith("✅") ? "text-emerald-400" :
                step.text.startsWith("📋") ? "text-amber-400" :
                step.text.startsWith("📤") ? "text-blue-400" :
                "text-gray-300"
              }`}>
                <span className="flex-shrink-0 mt-0.5">
                  {step.text.startsWith("✅") || step.text.startsWith("📤") ? "✓" :
                   step.text.startsWith("📋") ? "!" : "›"}
                </span>
                <span>{step.text}</span>
              </div>
            ))}
            {generating && (
              <div className="flex items-center gap-2 text-brand-light">
                <span className="animate-pulse">▌</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>⚡</span> Быстрые действия
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className={`p-5 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300`}
            >
              <span className="text-3xl block mb-2">{action.icon}</span>
              <span className="text-sm font-semibold">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🖥️</span> Статус системы
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: "База данных", status: "Онлайн", ok: true, latency: "12ms" },
            { name: "AI Engine", status: "Онлайн", ok: true, latency: "45ms" },
            { name: "Email Service", status: "Онлайн", ok: true, latency: "120ms" },
          ].map((svc) => (
            <div key={svc.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${svc.ok ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                <span className="text-sm font-medium text-gray-900">{svc.name}</span>
              </div>
              <span className="text-xs text-gray-400">{svc.latency}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
