import type { WeeklyDay, AiTip } from "@/types";

export const weeklySummaryKeys: { day: string; events: string[]; note: string }[] = [
  { day: "day.monday", events: ["Математика — 5 (контрольная)", "Физика — 5 (лабораторная)"], note: "Отличный старт недели" },
  { day: "day.tuesday", events: ["Химия — 4 (тест)", "Английский — 5 (презентация)"], note: "Небольшой спад в химии" },
  { day: "day.wednesday", events: ["История — 5 (доклад)", "Литература — 4 (эссе)"], note: "Активное участие на уроках" },
  { day: "day.thursday", events: ["Информатика — 5 (проект)", "Биология — 4 (лабораторная)"], note: "Проект по программированию — отлично" },
  { day: "day.friday", events: ["Математика — 5", "Физика — 5"], note: "Завершение недели на высоте" },
];

export const aiTipsKeys: AiTip[] = [
  { icon: "📚", tip: "parent.tip1" },
  { icon: "🧪", tip: "parent.tip2" },
  { icon: "🧠", tip: "parent.tip3" },
  { icon: "😴", tip: "parent.tip4" },
];
