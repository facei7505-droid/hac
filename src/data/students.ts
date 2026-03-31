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
  { name: "math", grade: 5, color: "bg-blue-500" },
  { name: "physics", grade: 5, color: "bg-purple-500" },
  { name: "chemistry", grade: 4, color: "bg-emerald-500" },
  { name: "history", grade: 5, color: "bg-amber-500" },
  { name: "literature", grade: 4, color: "bg-rose-500" },
  { name: "english", grade: 5, color: "bg-cyan-500" },
  { name: "biology", grade: 4, color: "bg-green-500" },
  { name: "cs", grade: 5, color: "bg-indigo-500" },
];

export const recentGrades: RecentGrade[] = [
  { subject: "math", grade: 5, date: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: "test" },
  { subject: "physics", grade: 5, date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), type: "lab" },
  { subject: "chemistry", grade: 4, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), type: "quiz" },
  { subject: "literature", grade: 5, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), type: "essay" },
  { subject: "english", grade: 4, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), type: "speaking" },
];

export const skillTree: Skill[] = [
  { name: "algebra", level: 8, maxLevel: 10, unlocked: true, icon: "∑" },
  { name: "geometry", level: 6, maxLevel: 10, unlocked: true, icon: "△" },
  { name: "probability", level: 4, maxLevel: 10, unlocked: true, icon: "🎲" },
  { name: "calculus", level: 0, maxLevel: 10, unlocked: false, icon: "∫" },
  { name: "programming", level: 7, maxLevel: 10, unlocked: true, icon: "💻" },
  { name: "scientificMethod", level: 5, maxLevel: 10, unlocked: true, icon: "🔬" },
  { name: "criticalThinking", level: 3, maxLevel: 10, unlocked: true, icon: "🧠" },
  { name: "leadership", level: 2, maxLevel: 10, unlocked: false, icon: "👑" },
];

export const weeklyData = [4.2, 4.5, 4.3, 4.7, 4.6, 4.8, 4.6];

export const weeklyProgress = [
  { day: "Пн", value: 70 },
  { day: "Вт", value: 90 },
  { day: "Ср", value: 40 },
  { day: "Чт", value: 100 },
  { day: "Пт", value: 85 },
  { day: "Сб", value: 20 },
  { day: "Вс", value: 0 },
];

export const teacherStudents: StudentRow[] = [
  { name: "Айдар Нурланов", grade: "10-A", avatar: "🧑‍🎓", mmr: 1842, mmrTier: "Legendary", gpa: 4.6, attendance: 97, streak: 12, trend: "up", risk: "low", subjects: [{ name: "math", grade: 5 }, { name: "physics", grade: 5 }] },
  { name: "Амина Касымова", grade: "10-A", avatar: "👧", mmr: 1234, mmrTier: "Silver", gpa: 3.2, attendance: 78, trend: "down", risk: "high", subjects: [{ name: "math", grade: 3 }, { name: "physics", grade: 2 }] },
  { name: "Данияр Ахметов", grade: "10-A", avatar: "👦", mmr: 1567, mmrTier: "Gold", gpa: 4.1, attendance: 92, trend: "stable", risk: "low", subjects: [{ name: "math", grade: 4 }, { name: "physics", grade: 4 }] },
  { name: "Жанель Сагынбаева", grade: "10-A", avatar: "👧", mmr: 980, mmrTier: "Bronze", gpa: 2.8, attendance: 71, trend: "down", risk: "high", subjects: [{ name: "math", grade: 3 }, { name: "physics", grade: 2 }] },
  { name: "Нурлан Оразов", grade: "10-A", avatar: "👦", mmr: 1720, mmrTier: "Platinum", gpa: 4.4, attendance: 95, trend: "up", risk: "low", subjects: [{ name: "math", grade: 5 }, { name: "physics", grade: 4 }] },
  { name: "Сабина Ермекова", grade: "10-A", avatar: "👧", mmr: 1100, mmrTier: "Silver", gpa: 3.5, attendance: 83, trend: "down", risk: "medium", subjects: [{ name: "math", grade: 3 }, { name: "physics", grade: 4 }] },
  { name: "Тимур Кенжебаев", grade: "10-A", avatar: "👦", mmr: 1650, mmrTier: "Gold", gpa: 4.3, attendance: 94, trend: "up", risk: "low", subjects: [{ name: "math", grade: 5 }, { name: "physics", grade: 4 }] },
  { name: "Алия Бекова", grade: "10-A", avatar: "👧", mmr: 890, mmrTier: "Bronze", gpa: 2.5, attendance: 65, trend: "down", risk: "high", subjects: [{ name: "math", grade: 2 }, { name: "physics", grade: 2 }] },
];

export const topStudentsKiosk = [
  { name: "Айдар Нурланов", grade: "10-A", mmr: 1842, gpa: 4.6, avatar: "🧑‍🎓" },
  { name: "Нурлан Оразов", grade: "9-Б", mmr: 1720, gpa: 4.4, avatar: "👦" },
  { name: "Тимур Кенжебаев", grade: "11-А", mmr: 1650, gpa: 4.3, avatar: "🧒" },
];
