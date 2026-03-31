"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useI18n } from "./I18nProvider";
import { useStudentData } from "@/lib/student-data-context";
import confetti from "canvas-confetti";
import { generateTask, type QuestQuestion } from "@/lib/quest-bank";

interface SkillNodeDef {
  id: string;
  label: string;
  icon: string;
  baseLevel: number;
  maxLevel: number;
  x: number;
  y: number;
  parents: string[];
  reward: number;
  aiTip: string;
  aiTipKk: string;
  aiTipEn: string;
}

interface NodeProgress {
  level: number;
  xp: number;
  mastered: boolean;
}

type ProgressMap = Record<string, NodeProgress>;

const XP_PER_QUEST = 200;
const XP_PENALTY = 100;
const LEVEL_PENALTY = 2;
const XP_PER_LEVEL = 120;

const SKILL_NODES: SkillNodeDef[] = [
  { id: "basic_math", label: "skill.algebra", icon: "∑", baseLevel: 8, maxLevel: 10, x: 400, y: 60, parents: [], reward: 30, aiTip: "Решай больше уравнений для закрепления.", aiTipKk: "Бекіту үшін көбірек теңдеулер шеш.", aiTipEn: "Solve more equations to consolidate." },
  { id: "geometry", label: "skill.geometry", icon: "△", baseLevel: 6, maxLevel: 10, x: 220, y: 180, parents: ["basic_math"], reward: 40, aiTip: "Изучи теорему Пифагора на практике.", aiTipKk: "Пифагор теоремасын тәжірибеде үйрен.", aiTipEn: "Learn the Pythagorean theorem in practice." },
  { id: "probability", label: "skill.probability", icon: "🎲", baseLevel: 4, maxLevel: 10, x: 580, y: 180, parents: ["basic_math"], reward: 40, aiTip: "Разберись с комбинаторикой — это ключ к вероятностям.", aiTipKk: "Комбинаториканы түсін — бұл ықтималдықтардың кілті.", aiTipEn: "Understand combinatorics — it's the key to probabilities." },
  { id: "trigonometry", label: "skill.calculus", icon: "📐", baseLevel: 3, maxLevel: 10, x: 130, y: 310, parents: ["geometry"], reward: 50, aiTip: "Чтобы открыть следующий навык, реши 3 задачи на синусы.", aiTipKk: "Келесі дағдыны ашу үшін синустарға 3 есеп шеш.", aiTipEn: "Solve 3 sine problems to unlock the next skill." },
  { id: "programming", label: "skill.programming", icon: "💻", baseLevel: 7, maxLevel: 10, x: 400, y: 310, parents: ["probability"], reward: 50, aiTip: "Напиши свой первый алгоритм сортировки.", aiTipKk: "Өзіңнің алғашқы сұрыптау алгоритміңді жаз.", aiTipEn: "Write your first sorting algorithm." },
  { id: "scientific", label: "skill.scientificMethod", icon: "🔬", baseLevel: 5, maxLevel: 10, x: 670, y: 310, parents: ["probability"], reward: 50, aiTip: "Проведи мини-эксперимент и оформи отчёт.", aiTipKk: "Мини-тәжірибе жасап, есеп жаз.", aiTipEn: "Conduct a mini-experiment and write a report." },
  { id: "critical", label: "skill.criticalThinking", icon: "🧠", baseLevel: 3, maxLevel: 10, x: 310, y: 440, parents: ["trigonometry", "programming"], reward: 60, aiTip: "Анализируй каждую задачу с разных сторон.", aiTipKk: "Әр есепті әр түрлі жағынан талда.", aiTipEn: "Analyze each problem from different angles." },
  { id: "calculus_node", label: "skill.calculus", icon: "∫", baseLevel: 0, maxLevel: 10, x: 130, y: 440, parents: ["trigonometry"], reward: 70, aiTip: "Сначала освой тригонометрию до 7 уровня.", aiTipKk: "Алдымен тригонометрияны 7-деңгейге дейін меңгер.", aiTipEn: "First master trigonometry to level 7." },
  { id: "leadership", label: "skill.leadership", icon: "👑", baseLevel: 2, maxLevel: 10, x: 580, y: 440, parents: ["programming", "scientific"], reward: 70, aiTip: "Организуй командный проект для развития лидерства.", aiTipKk: "Көшбасшылықты дамыту үшін командалық жоба ұйымдастыр.", aiTipEn: "Organize a team project to develop leadership." },
  { id: "mastery", label: "skill.mastery", icon: "⭐", baseLevel: 0, maxLevel: 10, x: 400, y: 560, parents: ["calculus_node", "critical", "leadership"], reward: 100, aiTip: "Освой все базовые навыки, чтобы разблокировать мастерство.", aiTipKk: "Шеберлікті ашу үшін барлық негізгі дағдыларды меңгер.", aiTipEn: "Master all basic skills to unlock mastery." },
];

const STORAGE_KEY = "aqbobek_skill_progress";

function loadProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveProgress(data: ProgressMap) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function initState(nodes: SkillNodeDef[]): ProgressMap {
  const existing = loadProgress();
  const result: ProgressMap = {};
  for (const n of nodes) {
    if (existing[n.id]) {
      result[n.id] = existing[n.id];
    } else {
      result[n.id] = { level: n.baseLevel, xp: 0, mastered: n.baseLevel >= n.maxLevel };
    }
  }
  return result;
}

function getNodeState(node: SkillNodeDef, progress: ProgressMap, allNodes: SkillNodeDef[]): "mastered" | "active" | "locked" {
  const p = progress[node.id];
  if (p?.mastered) return "mastered";
  if (node.parents.length === 0) return p ? "active" : "locked";
  const allParentsMastered = node.parents.every((pid) => progress[pid]?.mastered);
  if (allParentsMastered) return "active";
  return "locked";
}

function getNodeColors(state: string) {
  if (state === "mastered") return { fill: "#fbbf24", stroke: "#f59e0b", glow: "rgba(251,191,36,0.6)" };
  if (state === "active") return { fill: "#3b82f6", stroke: "#2563eb", glow: "rgba(59,130,246,0.4)" };
  return { fill: "#4b5563", stroke: "#374151", glow: "none" };
}

function fireConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;
  const colors = ["#fbbf24", "#3b82f6", "#10b981", "#f472b6"];
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export default function SkillMapTab() {
  const { t, lang } = useI18n();
  const { addMmrBonus } = useStudentData();
  const [selected, setSelected] = useState<SkillNodeDef | null>(null);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [mounted, setMounted] = useState(false);
  const [showQuest, setShowQuest] = useState(false);
  const [currentQuest, setCurrentQuest] = useState<QuestQuestion | null>(null);
  const [questAnswer, setQuestAnswer] = useState<number | null>(null);
  const [questLoading, setQuestLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [mmrToast, setMmrToast] = useState<number | null>(null);
  const [levelUpNode, setLevelUpNode] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const studentClass = "10-A";

  useEffect(() => {
    setProgress(initState(SKILL_NODES));
    setMounted(true);
  }, []);

  const updateProgress = useCallback((nodeId: string, xpChange: number, levelPenalty: number = 0) => {
    setProgress((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const node = SKILL_NODES.find((n) => n.id === nodeId);
      if (!node || !next[nodeId]) return prev;

      const np = next[nodeId];

      if (xpChange < 0) {
        np.xp += xpChange;
        while (np.xp < 0 && np.level > 0) {
          np.level--;
          np.xp += XP_PER_LEVEL;
        }
        if (np.xp < 0) np.xp = 0;
        if (np.level < 0) np.level = 0;

        np.level = Math.max(0, np.level - levelPenalty);
        np.mastered = false;
      } else {
        np.xp += xpChange;
        while (np.level < node.maxLevel && np.xp >= XP_PER_LEVEL) {
          np.xp -= XP_PER_LEVEL;
          np.level++;
        }
        if (np.level >= node.maxLevel) {
          np.level = node.maxLevel;
          np.xp = 0;
          np.mastered = true;
        }
      }

      next[nodeId] = np;
      saveProgress(next);
      return next;
    });
  }, []);

  const handleQuestSubmit = useCallback(() => {
    if (questAnswer === null || !selected || !currentQuest) return;
    setQuestLoading(true);

    setTimeout(() => {
      setQuestLoading(false);
      const isCorrect = questAnswer === currentQuest.correctIndex;

      if (isCorrect) {
        setShowQuest(false);
        setQuestAnswer(null);

        const wasMastered = progress[selected.id]?.mastered;
        const nodeRef = SKILL_NODES.find((n) => n.id === selected.id);
        updateProgress(selected.id, XP_PER_QUEST);

        setProgress((prev) => {
          const node = SKILL_NODES.find((n) => n.id === selected.id);
          if (!node) return prev;
          const np = prev[selected.id];
          const newLevel = np.level + (np.xp + XP_PER_QUEST >= XP_PER_LEVEL ? 1 : 0);
          const willMaster = newLevel >= node.maxLevel;

          if (willMaster && !wasMastered) {
            const reward = nodeRef?.reward || 0;
            setTimeout(() => {
              fireConfetti();
              setLevelUpNode(selected.id);
              setTimeout(() => setLevelUpNode(null), 3000);

              if (reward > 0) {
                addMmrBonus("s1", reward);
                setMmrToast(reward);
                setTimeout(() => setMmrToast(null), 4500);
              }
            }, 300);
          }
          return prev;
        });

        setToastType("success");
        setToast(t("skillmap.questCorrect"));
        setTimeout(() => setToast(null), 3500);
      } else {
        setShaking(true);
        setTimeout(() => setShaking(false), 600);

        updateProgress(selected.id, -XP_PENALTY, LEVEL_PENALTY);

        setToastType("error");
        setToast(t("skillmap.questWrong"));
        setTimeout(() => setToast(null), 4000);

        setQuestAnswer(null);
      }
    }, 1500);
  }, [questAnswer, selected, currentQuest, progress, updateProgress, t]);

  const openQuest = useCallback((node: SkillNodeDef) => {
    const quest = generateTask(node.id, studentClass);
    setCurrentQuest(quest);
    setQuestAnswer(null);
    setShowQuest(true);
  }, [studentClass]);

  const getLocalizedOptions = useCallback((): string[] => {
    if (!currentQuest) return [];
    if (lang === "kk") return currentQuest.optionsKk;
    if (lang === "en") return currentQuest.optionsEn;
    return currentQuest.options;
  }, [currentQuest, lang]);

  const getLocalizedQuestion = useCallback((): string => {
    if (!currentQuest) return "";
    if (lang === "kk") return currentQuest.questionKk;
    if (lang === "en") return currentQuest.questionEn;
    return currentQuest.question;
  }, [currentQuest, lang]);

  const svgW = 800;
  const svgH = 640;

  if (!mounted) return null;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Header */}
      <div className="relative z-10 px-8 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-lg shadow-brand/30">
            <span className="text-xl">🌳</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t("skillmap.title")}</h1>
            <p className="text-blue-300/50 text-sm">{t("skillmap.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="relative z-10 flex justify-center px-4 pb-8">
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto max-w-4xl">
          {/* Edges */}
          {SKILL_NODES.map((node) =>
            node.parents.map((pid) => {
              const parent = SKILL_NODES.find((n) => n.id === pid);
              if (!parent) return null;
              const ps = getNodeState(parent, progress, SKILL_NODES);
              const cs = getNodeState(node, progress, SKILL_NODES);
              const active = ps !== "locked" && cs !== "locked";
              return (
                <line key={`${pid}-${node.id}`} x1={parent.x} y1={parent.y} x2={node.x} y2={node.y}
                  stroke={active ? "rgba(59,130,246,0.4)" : "rgba(107,114,128,0.2)"}
                  strokeWidth={active ? 2.5 : 1.5} strokeDasharray={active ? "none" : "6 4"}
                  className="transition-all duration-500" />
              );
            })
          )}

          <defs>
            <filter id="glow-mastered"><feGaussianBlur stdDeviation="8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="glow-active"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>

          {/* Nodes */}
          {SKILL_NODES.map((node) => {
            const state = getNodeState(node, progress, SKILL_NODES);
            const colors = getNodeColors(state);
            const isSelected = selected?.id === node.id;
            const np = progress[node.id];
            const r = 32;
            const isLevelUp = levelUpNode === node.id;

            return (
              <g key={node.id} onClick={() => setSelected(isSelected ? null : node)} className="cursor-pointer">
                {state === "mastered" && (
                  <circle cx={node.x} cy={node.y} r={r + 8} fill="none" stroke={colors.glow} strokeWidth="2" opacity="0.6" filter="url(#glow-mastered)" className="animate-pulse" />
                )}
                {state === "active" && (
                  <circle cx={node.x} cy={node.y} r={r + 5} fill="none" stroke={colors.glow} strokeWidth="1.5" opacity="0.4" />
                )}
                {isLevelUp && (
                  <circle cx={node.x} cy={node.y} r={r + 20} fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.8" className="animate-ping" />
                )}

                <circle cx={node.x} cy={node.y} r={r} fill={colors.fill} stroke={isSelected ? "#fff" : colors.stroke}
                  strokeWidth={isSelected ? 3 : 2} opacity={state === "locked" ? 0.4 : 1}
                  filter={state === "mastered" ? "url(#glow-mastered)" : state === "active" ? "url(#glow-active)" : undefined}
                  className="transition-all duration-300" />

                <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="central" fontSize="20" className="select-none pointer-events-none" style={{ opacity: state === "locked" ? 0.5 : 1 }}>
                  {state === "locked" ? "🔒" : node.icon}
                </text>

                <text x={node.x} y={node.y + r + 16} textAnchor="middle" fill={state === "locked" ? "#6b7280" : "#e2e8f0"} fontSize="11" fontWeight="600" className="select-none pointer-events-none">
                  {t(node.label)}
                </text>

                {state !== "locked" && np && (
                  <text x={node.x} y={node.y + r + 28} textAnchor="middle" fill={state === "mastered" ? "#fbbf24" : "#60a5fa"} fontSize="10" fontWeight="500" className="select-none pointer-events-none">
                    Lv.{np.level}/{node.maxLevel}
                  </text>
                )}

                {state === "active" && np && (
                  <>
                    <rect x={node.x - 20} y={node.y + r + 32} width={40} height={4} rx={2} fill="rgba(255,255,255,0.15)" />
                    <rect x={node.x - 20} y={node.y + r + 32} width={40 * ((np.level * XP_PER_LEVEL + np.xp) / (node.maxLevel * XP_PER_LEVEL))} height={4} rx={2} fill="#3b82f6" className="transition-all duration-700" />
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed z-[100] animate-slide-up ${mmrToast ? "top-5 right-5" : "top-5 right-5"}`}>
          <div className={`flex items-center gap-3 text-white px-5 py-3.5 rounded-2xl shadow-2xl ${
            toastType === "success"
              ? "bg-emerald-600 shadow-emerald-600/30"
              : "bg-red-600 shadow-red-600/30"
          }`}>
            <span className="text-lg">{toastType === "success" ? "✅" : "❌"}</span>
            <span className="text-sm font-semibold">{toast}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white cursor-pointer">✕</button>
          </div>
        </div>
      )}

      {/* MMR Toast */}
      {mmrToast !== null && (
        <div className={`fixed z-[100] animate-slide-up ${toast ? "top-20" : "top-5"} right-5`}>
          <div className="flex items-center gap-3 text-white px-6 py-4 rounded-2xl shadow-2xl bg-gradient-to-r from-amber-500 to-yellow-500 shadow-amber-500/30">
            <span className="text-xl">🏆</span>
            <div>
              <div className="text-sm font-bold">{t("skillmap.mmrTitle")}</div>
              <div className="text-xs text-amber-100">{t("skillmap.mmrReward").replace("+40", `+${mmrToast}`)}</div>
            </div>
            <button onClick={() => setMmrToast(null)} className="ml-2 text-white/70 hover:text-white cursor-pointer">✕</button>
          </div>
        </div>
      )}

      {/* Drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => { setSelected(null); setShowQuest(false); }} />
          <div className="fixed top-0 right-0 h-full w-96 max-w-[90vw] z-50 animate-slide-in-right">
            <div className="h-full bg-white/10 backdrop-blur-2xl border-l border-white/10 shadow-2xl overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                      getNodeState(selected, progress, SKILL_NODES) === "mastered" ? "bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-500/30"
                        : getNodeState(selected, progress, SKILL_NODES) === "active" ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"
                        : "bg-gray-600/50"}`}>
                      {getNodeState(selected, progress, SKILL_NODES) === "locked" ? "🔒" : selected.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{t(selected.label)}</h2>
                      <p className="text-xs text-blue-300/60">
                        {getNodeState(selected, progress, SKILL_NODES) === "mastered" ? t("skillmap.mastered")
                          : getNodeState(selected, progress, SKILL_NODES) === "active" ? t("skillmap.inProgress")
                          : t("skillmap.locked")}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => { setSelected(null); setShowQuest(false); }} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer">✕</button>
                </div>

                {/* XP Progress */}
                {progress[selected.id] && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-200/60">{t("skillmap.level")}</span>
                      <span className="text-white font-semibold">{progress[selected.id].level} / {selected.maxLevel}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div className={`h-3 rounded-full transition-all duration-700 ${
                        progress[selected.id].mastered ? "bg-gradient-to-r from-amber-400 to-yellow-300" : "bg-gradient-to-r from-blue-500 to-blue-400"}`}
                        style={{ width: `${((progress[selected.id].level * XP_PER_LEVEL + progress[selected.id].xp) / (selected.maxLevel * XP_PER_LEVEL)) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-blue-200/40">
                      <span>XP: {progress[selected.id].level * XP_PER_LEVEL + progress[selected.id].xp}</span>
                      <span>{selected.maxLevel * XP_PER_LEVEL}</span>
                    </div>
                    {!progress[selected.id].mastered && progress[selected.id].xp > 0 && (
                      <div className="text-[10px] text-blue-300/50 text-center">{progress[selected.id].xp}/{XP_PER_LEVEL} {t("skillmap.xpToNext")}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Reward */}
                <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <div className="text-sm font-semibold text-amber-300">{t("skillmap.reward")}</div>
                      <div className="text-xs text-amber-200/60">+{selected.reward} MMR</div>
                    </div>
                    {progress[selected.id]?.mastered && <span className="ml-auto text-emerald-400 text-xs font-semibold">✓ {t("skillmap.claimed")}</span>}
                  </div>
                </div>

                {/* Status */}
                <div className={`rounded-2xl p-4 border ${
                  getNodeState(selected, progress, SKILL_NODES) === "mastered" ? "bg-emerald-500/10 border-emerald-500/20"
                    : getNodeState(selected, progress, SKILL_NODES) === "active" ? "bg-blue-500/10 border-blue-500/20"
                    : "bg-gray-500/10 border-gray-500/20"}`}>
                  <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">{t("skillmap.status")}</div>
                  <div className={`text-sm font-medium ${
                    getNodeState(selected, progress, SKILL_NODES) === "mastered" ? "text-emerald-300"
                      : getNodeState(selected, progress, SKILL_NODES) === "active" ? "text-blue-300" : "text-gray-400"}`}>
                    {getNodeState(selected, progress, SKILL_NODES) === "mastered" ? t("skillmap.statusMastered")
                      : getNodeState(selected, progress, SKILL_NODES) === "active" ? t("skillmap.statusActive")
                      : t("skillmap.statusLocked")}
                  </div>
                </div>

                {/* AI Tip */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">🤖</span>
                    <div>
                      <div className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider mb-2">{t("skillmap.aiTip")}</div>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {lang === "kk" ? selected.aiTipKk : lang === "en" ? selected.aiTipEn : selected.aiTip}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quest Button */}
                {getNodeState(selected, progress, SKILL_NODES) === "active" && !progress[selected.id]?.mastered && !showQuest && (
                  <button
                    onClick={() => openQuest(selected)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand to-brand-light text-white font-bold text-sm shadow-xl shadow-brand/25 hover:shadow-2xl hover:shadow-brand/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer animate-pulse-subtle"
                  >
                    ⚡ {t("skillmap.startQuest")} (+{XP_PER_QUEST} XP)
                  </button>
                )}

                {/* Quest Panel */}
                {showQuest && currentQuest && getNodeState(selected, progress, SKILL_NODES) === "active" && (
                  <div className={`bg-white/5 backdrop-blur-sm border rounded-2xl p-5 space-y-4 animate-slide-up ${
                    shaking ? "border-red-500/50 animate-shake" : "border-white/10"
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      <h3 className="text-sm font-bold text-white">{t("skillmap.questTitle")}</h3>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{getLocalizedQuestion()}</p>
                    <div className="space-y-2">
                      {getLocalizedOptions().map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => setQuestAnswer(i)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
                            questAnswer === i
                              ? "bg-brand/30 border-2 border-brand text-white"
                              : "bg-white/5 border-2 border-transparent text-white/70 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span className="font-mono text-xs text-white/40 mr-2">{String.fromCharCode(65 + i)}.</span>
                          {opt}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowQuest(false); setQuestAnswer(null); }}
                        className="flex-1 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                      >
                        {t("skillmap.cancel")}
                      </button>
                      <button
                        onClick={handleQuestSubmit}
                        disabled={questAnswer === null || questLoading}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                          questAnswer === null
                            ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                            : questLoading
                            ? "bg-brand/50 text-white/70 cursor-wait"
                            : "bg-gradient-to-r from-brand to-brand-light text-white shadow-lg shadow-brand/20 hover:shadow-xl"
                        }`}
                      >
                        {questLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            {t("skillmap.checking")}
                          </span>
                        ) : t("skillmap.submit")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Prerequisites */}
                {selected.parents.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">{t("skillmap.prerequisites")}</div>
                    <div className="space-y-2">
                      {selected.parents.map((pid) => {
                        const parent = SKILL_NODES.find((n) => n.id === pid);
                        if (!parent) return null;
                        const ps = getNodeState(parent, progress, SKILL_NODES);
                        return (
                          <div key={pid} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-lg">{parent.icon}</span>
                            <div className="flex-1">
                              <div className="text-sm text-white/80">{t(parent.label)}</div>
                              <div className="text-xs text-white/40">Lv.{progress[parent.id]?.level ?? parent.baseLevel}/{parent.maxLevel}</div>
                            </div>
                            {ps === "mastered" && <span className="text-emerald-400 text-xs">✓</span>}
                            {ps === "active" && <span className="text-blue-400 text-xs">◐</span>}
                            {ps === "locked" && <span className="text-gray-500 text-xs">🔒</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
