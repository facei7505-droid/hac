export interface Student {
  name: string;
  grade: string;
  avatar: string;
  mmr: number;
  mmrTier: string;
  gpa: number;
  attendance: number;
  streak?: number;
}

export interface StudentRow extends Student {
  trend: "up" | "down" | "stable";
  risk: "low" | "medium" | "high";
  subjects: { name: string; grade: number }[];
}

export interface Subject {
  name: string;
  grade: number;
  color: string;
}

export interface RecentGrade {
  subject: string;
  grade: number;
  date: string;
  type: string;
}

export interface Skill {
  name: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  icon: string;
}

export interface Substitution {
  time: string;
  class: string;
  subject: string;
  teacher: string;
  room: string;
  change: string;
}

export interface ScheduleEntry {
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

export interface WeeklyDay {
  day: string;
  events: string[];
  note: string;
}

export interface AiTip {
  icon: string;
  tip: string;
}

export interface AdminStat {
  label: string;
  value: string;
  icon: string;
  delta: string;
}

export interface QuickAction {
  label: string;
  icon: string;
  color: string;
}

export interface LogStep {
  text: string;
  status: "done" | "running" | "pending";
}

export interface GradebookStudent {
  id: string;
  name: string;
  grade: string;
  avatar: string;
}

export interface GradebookColumn {
  id: string;
  type: "lesson" | "sor" | "soch";
  date?: string;
  label: string;
}

export type GradeValue = number | "Н" | null;
export type StudentGrades = Record<string, GradeValue>;
export type SubjectGrades = Record<string, StudentGrades>;
export type ClassGrades = Record<string, SubjectGrades>;
