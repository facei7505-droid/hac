export function getMMRGradient(mmr: number): string {
  if (mmr >= 2000) return "from-yellow-400 to-amber-500";
  if (mmr >= 1500) return "from-purple-400 to-violet-500";
  if (mmr >= 1000) return "from-blue-400 to-cyan-500";
  return "from-gray-400 to-gray-500";
}

export function getMMRTextColor(mmr: number): string {
  if (mmr >= 2000) return "text-amber-500";
  if (mmr >= 1500) return "text-purple-500";
  if (mmr >= 1000) return "text-blue-500";
  return "text-gray-500";
}

export function getMMRTextColorKiosk(mmr: number): string {
  if (mmr >= 2000) return "text-amber-400";
  if (mmr >= 1500) return "text-purple-400";
  if (mmr >= 1000) return "text-blue-400";
  return "text-gray-400";
}

export function getGradeColor(grade: number): string {
  if (grade === 5) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (grade === 4) return "bg-blue-100 text-blue-700 border-blue-200";
  if (grade === 3) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-red-100 text-red-700 border-red-200";
}

export function getGradeBadgeColor(grade: number): string {
  if (grade >= 4) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (grade >= 3) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

export function getRiskBadge(risk: string): string {
  if (risk === "high") return "bg-red-100 text-red-700 border-red-200";
  if (risk === "medium") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

export function getCup(idx: number): string {
  if (idx === 0) return "🏆";
  if (idx === 1) return "🥈";
  if (idx === 2) return "🥉";
  return "";
}

export function getSkillLabel(level: number): string {
  if (level >= 8) return "⭐ Мастер";
  if (level >= 5) return "🔥 Продвинутый";
  return "📖 Изучается";
}
