import type { Student, StudentRow, Subject, RecentGrade, Skill } from "@/types";

export const student: Student = {
  name: "Айдар Нурланов",
  grade: "10-A",
  avatar: "🧑‍🎓",
  mmr: 1842,
  mmrTier: "Legendary",
  gpa: 4.6,
  attendance: 97,
  streak: 12,
};

export const subjects: Subject[] = [
  { name: "Математика", grade: 5, color: "bg-blue-500" },
  { name: "Физика", grade: 5, color: "bg-purple-500" },
  { name: "Химия", grade: 4, color: "bg-emerald-500" },
  { name: "История", grade: 5, color: "bg-amber-500" },
  { name: "Литература", grade: 4, color: "bg-rose-500" },
  { name: "Английский", grade: 5, color: "bg-cyan-500" },
  { name: "Биология", grade: 4, color: "bg-green-500" },
  { name: "Информатика", grade: 5, color: "bg-indigo-500" },
];

export const recentGrades: RecentGrade[] = [
  { subject: "Математика", grade: 5, date: "28 мар", type: "Контрольная" },
  { subject: "Физика", grade: 5, date: "27 мар", type: "Лабораторная" },
  { subject: "Химия", grade: 4, date: "26 мар", type: "Тест" },
  { subject: "Литература", grade: 5, date: "25 мар", type: "Эссе" },
  { subject: "Английский", grade: 4, date: "24 мар", type: "Speaking" },
];

export const skillTree: Skill[] = [
  { name: "Алгебра", level: 8, maxLevel: 10, unlocked: true, icon: "∑" },
  { name: "Геометрия", level: 6, maxLevel: 10, unlocked: true, icon: "△" },
  { name: "Теория вероятностей", level: 4, maxLevel: 10, unlocked: true, icon: "🎲" },
  { name: "Мат. анализ", level: 0, maxLevel: 10, unlocked: false, icon: "∫" },
  { name: "Программирование", level: 7, maxLevel: 10, unlocked: true, icon: "💻" },
  { name: "Научный метод", level: 5, maxLevel: 10, unlocked: true, icon: "🔬" },
  { name: "Критическое мышление", level: 3, maxLevel: 10, unlocked: true, icon: "🧠" },
  { name: "Leadership", level: 2, maxLevel: 10, unlocked: false, icon: "👑" },
];

export const weeklyData = [4.2, 4.5, 4.3, 4.7, 4.6, 4.8, 4.6];
export const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const teacherStudents: StudentRow[] = [
  { name: "Айдар Нурланов", grade: "10-A", avatar: "🧑‍🎓", mmr: 1842, mmrTier: "Legendary", gpa: 4.6, attendance: 97, streak: 12, trend: "up", risk: "low", subjects: [{ name: "Мат", grade: 5 }, { name: "Физ", grade: 5 }] },
  { name: "Амина Касымова", grade: "10-A", avatar: "👧", mmr: 1234, mmrTier: "Silver", gpa: 3.2, attendance: 78, trend: "down", risk: "high", subjects: [{ name: "Мат", grade: 3 }, { name: "Физ", grade: 2 }] },
  { name: "Данияр Ахметов", grade: "10-A", avatar: "👦", mmr: 1567, mmrTier: "Gold", gpa: 4.1, attendance: 92, trend: "stable", risk: "low", subjects: [{ name: "Мат", grade: 4 }, { name: "Физ", grade: 4 }] },
  { name: "Жанель Сагынбаева", grade: "10-A", avatar: "👧", mmr: 980, mmrTier: "Bronze", gpa: 2.8, attendance: 71, trend: "down", risk: "high", subjects: [{ name: "Мат", grade: 3 }, { name: "Физ", grade: 2 }] },
  { name: "Нурлан Оразов", grade: "10-A", avatar: "👦", mmr: 1720, mmrTier: "Platinum", gpa: 4.4, attendance: 95, trend: "up", risk: "low", subjects: [{ name: "Мат", grade: 5 }, { name: "Физ", grade: 4 }] },
  { name: "Сабина Ермекова", grade: "10-A", avatar: "👧", mmr: 1100, mmrTier: "Silver", gpa: 3.5, attendance: 83, trend: "down", risk: "medium", subjects: [{ name: "Мат", grade: 3 }, { name: "Физ", grade: 4 }] },
  { name: "Тимур Кенжебаев", grade: "10-A", avatar: "👦", mmr: 1650, mmrTier: "Gold", gpa: 4.3, attendance: 94, trend: "up", risk: "low", subjects: [{ name: "Мат", grade: 5 }, { name: "Физ", grade: 4 }] },
  { name: "Алия Бекова", grade: "10-A", avatar: "👧", mmr: 890, mmrTier: "Bronze", gpa: 2.5, attendance: 65, trend: "down", risk: "high", subjects: [{ name: "Мат", grade: 2 }, { name: "Физ", grade: 2 }] },
];

export const topStudentsKiosk = [
  { name: "Айдар Нурланов", grade: "10-A", mmr: 1842, gpa: 4.6, avatar: "🧑‍🎓" },
  { name: "Нурлан Оразов", grade: "9-Б", mmr: 1720, gpa: 4.4, avatar: "👦" },
  { name: "Тимур Кенжебаев", grade: "11-А", mmr: 1650, gpa: 4.3, avatar: "🧒" },
];
