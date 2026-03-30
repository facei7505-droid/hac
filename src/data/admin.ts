import type { AdminStat, QuickAction, LogStep } from "@/types";

export const adminStats: AdminStat[] = [
  { label: "Учеников", value: "847", icon: "👨‍🎓", delta: "+12" },
  { label: "Учителей", value: "52", icon: "👩‍🏫", delta: "+3" },
  { label: "Кабинетов", value: "38", icon: "🏫", delta: "0" },
  { label: "Предметов", value: "24", icon: "📚", delta: "+1" },
];

export const quickActions: QuickAction[] = [
  { label: "Экспорт расписания", icon: "📄", color: "from-blue-500 to-cyan-500" },
  { label: "Отправить уведомления", icon: "🔔", color: "from-amber-500 to-orange-500" },
  { label: "Генерация отчётов", icon: "📊", color: "from-emerald-500 to-green-500" },
  { label: "Резервное копирование", icon: "💾", color: "from-purple-500 to-violet-500" },
];

export const logSteps: LogStep[] = [
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

export const systemServices = [
  { name: "База данных", status: "Онлайн", ok: true, latency: "12ms" },
  { name: "AI Engine", status: "Онлайн", ok: true, latency: "45ms" },
  { name: "Email Service", status: "Онлайн", ok: true, latency: "120ms" },
];
