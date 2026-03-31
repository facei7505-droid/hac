"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/components/I18nProvider";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, FileText, X, Copy, Check } from "lucide-react";

interface RiskStudent {
  name: string;
  subject: string;
  previousGrade: number;
  currentGrade: number;
  aiReason: string;
}

const RISK_STUDENTS: RiskStudent[] = [
  {
    name: "Амина Касымова",
    subject: "Физика",
    previousGrade: 4,
    currentGrade: 2,
    aiReason: "Пропущено 3 темы по кинематике. Не сдана СОР №4.",
  },
  {
    name: "Жанель Сагынбаева",
    subject: "Математика",
    previousGrade: 3,
    currentGrade: 2,
    aiReason: "Неуверенное владение темой производных. Пропуски 4 уроков подряд.",
  },
  {
    name: "Алия Бекова",
    subject: "Химия",
    previousGrade: 3,
    currentGrade: 1,
    aiReason: "Критический пробел в теме окислительно-восстановительных реакций.",
  },
];

const AI_REPORT = `📊 Сводный отчёт по классу 10-А
Дата: ${new Date().toLocaleDateString("ru-RU")}
━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 ОТЛИЧНИКИ (4 и выше):
• Айдар Нурланов — MMR 1842, GPA 4.6. Стабильный лидер. Рекомендован для участия в городской олимпиаде по математике.
• Нурлан Оразов — MMR 1720, GPA 4.4. Отличная динамика по физике. Предложить углублённый курс.
• Тимур Кенжебаев — MMR 1650, GPA 4.3. Устойчивый прогресс. Рекомендовать STEM-проект.

🟡 ВНИМАНИЕ (снижение):
• Сабина Ермекова — MMR 1100, GPA 3.5. Снижение по физике с 5 до 3 за месяц. Причина: переход на новую тему «Электричество». Рекомендация: индивидуальная консультация.

🔴 ЗОНА РИСКА (критическое падение):
• Амина Касымова — MMR 1234, GPA 3.2. Физика упала с 4 до 2. Пропущено 3 темы по кинематике. Назначить внеурочное занятие.
• Жанель Сагынбаева — MMR 980, GPA 2.8. Математика: неуверенное владение производными. Необходима работа с репетитором.
• Алия Бекова — MMR 890, GPA 2.5. Критический уровень по химии (оценка 1). Срочно: индивидуальный план.

━━━━━━━━━━━━━━━━━━━━━━━━━
💡 РЕКОМЕНДАЦИИ ИИ:
1. Провести родительское собрание для учеников зоны риска
2. Организовать peer-tutoring между отличниками и отстающими
3. Внедрить еженедельные мини-тесты для контроля усвоения тем

Сгенерировано ИИ-системой Aqbobek Lyceum`;

export default function TeacherDashboard() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    if (isGenerating) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowReport(true);
    }, 2000);
  }, [isGenerating]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(AI_REPORT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/${lang}`)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Панель учителя</h1>
          <p className="text-sm text-gray-400">Класс 10-А · Аналитика и управление</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Учеников", value: "8", icon: "👨‍🎓", color: "from-blue-500 to-cyan-500" },
          { label: "Средний GPA", value: "3.9", icon: "📊", color: "from-emerald-500 to-green-500" },
          { label: "В зоне риска", value: "3", icon: "⚠️", color: "from-red-500 to-orange-500" },
          { label: "Улучшились", value: "4", icon: "📈", color: "from-purple-500 to-violet-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-xl shadow-lg`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* EWS - Risk Zone */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertTriangle size={16} className="text-red-500" />
          </span>
          Зона риска (Внимание)
          <span className="text-xs font-normal text-red-400 bg-red-50 px-2 py-0.5 rounded-full ml-2">
            Аномальное падение успеваемости
          </span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">Ученик</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">Предмет</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">Тренд</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">ИИ-Анализ причины</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RISK_STUDENTS.map((student, i) => (
                <tr key={i} className="hover:bg-red-50/30 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="font-medium text-sm text-gray-900">{student.name}</div>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-sm text-gray-600">{student.subject}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">▼</span>
                      <span className="text-sm font-bold text-red-500">{student.previousGrade} → {student.currentGrade}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{student.aiReason}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Report Button */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FileText size={16} className="text-indigo-600" />
          </span>
          Автоматизация
        </h3>
        <p className="text-sm text-gray-400 mb-5">
          Сгенерируйте полный аналитический отчёт по классу с помощью ИИ
        </p>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full py-4 rounded-xl text-base font-bold transition-all duration-300 cursor-pointer active:scale-95 flex items-center justify-center gap-3 ${
            isGenerating
              ? "bg-indigo-100 text-indigo-400 cursor-wait"
              : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30"
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
              Генерация...
            </>
          ) : (
            <>🤖 Сгенерировать ИИ-отчет по классу</>
          )}
        </button>
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowReport(false)}>
          <div
            className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl mx-4 animate-scale-in max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                ИИ-Отчёт по классу 10-А
              </h2>
              <button onClick={() => setShowReport(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed bg-gray-50 rounded-xl p-5 border border-gray-100">
                {AI_REPORT}
              </pre>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowReport(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-colors cursor-pointer"
              >
                Закрыть
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {copied ? <><Check size={16} /> Скопировано!</> : <><Copy size={16} /> Скопировать в буфер</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
