import type { AdminStat, QuickAction, LogStep } from "@/types";

export const adminStats: AdminStat[] = [
  { label: "admin.students", value: "847", icon: "👨‍🎓", delta: "+12" },
  { label: "admin.teachers", value: "52", icon: "👩‍🏫", delta: "+3" },
  { label: "admin.classrooms", value: "38", icon: "🏫", delta: "0" },
  { label: "admin.subjects", value: "24", icon: "📚", delta: "+1" },
];

export const quickActions: QuickAction[] = [
  { label: "admin.exportSchedule", icon: "📄", color: "from-blue-500 to-cyan-500" },
  { label: "admin.sendNotifications", icon: "🔔", color: "from-amber-500 to-orange-500" },
  { label: "admin.generateReports", icon: "📊", color: "from-emerald-500 to-green-500" },
  { label: "admin.backup", icon: "💾", color: "from-purple-500 to-violet-500" },
];

export const logSteps: LogStep[] = [
  { text: "admin.logImport", status: "done" },
  { text: "admin.logAnalyze", status: "done" },
  { text: "admin.logOptimize1", status: "running" },
  { text: "admin.logOptimize2", status: "pending" },
  { text: "admin.logOptimize3", status: "pending" },
  { text: "admin.logOptimize4", status: "pending" },
  { text: "admin.logDone", status: "pending" },
  { text: "admin.logConflicts", status: "pending" },
  { text: "admin.logExport", status: "pending" },
];

export const systemServices = [
  { name: "admin.database", status: "online", ok: true, latency: "12ms" },
  { name: "admin.aiEngine", status: "online", ok: true, latency: "45ms" },
  { name: "admin.emailService", status: "online", ok: true, latency: "120ms" },
];
