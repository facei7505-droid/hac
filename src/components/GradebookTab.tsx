"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "./I18nProvider";
import { useStudentData } from "@/lib/student-data-context";
import type { GradebookStudent, GradebookColumn, GradeValue } from "@/types";

interface GradebookData {
  students: GradebookStudent[];
  columns: GradebookColumn[];
  grades: Record<string, Record<string, Record<string, Record<string, GradeValue>>>>;
}

const CLASSES = ["10-A", "9-А", "9-Б"];
const SUBJECTS = [
  { key: "math", label: "subject.math" },
  { key: "physics", label: "subject.physics" },
  { key: "algebra", label: "skill.algebra" },
];

const GRADE_OPTIONS: (number | "Н")[] = [5, 4, 3, 2, 1, "Н"];

function getGradeColor(val: GradeValue): string {
  if (val === null || val === undefined) return "";
  if (val === "Н") return "bg-amber-50 text-amber-600 border-amber-200";
  if (val === 5) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (val === 4) return "bg-blue-50 text-blue-700 border-blue-200";
  if (val === 3) return "bg-amber-50 text-amber-700 border-amber-200";
  if (val === 2) return "bg-red-50 text-red-600 border-red-200";
  if (val === 1) return "bg-red-100 text-red-700 border-red-300";
  return "";
}

function getColumnHeaderStyle(type: string): string {
  if (type === "sor") return "bg-violet-50/80 text-violet-700 border-violet-200";
  if (type === "soch") return "bg-rose-50/80 text-rose-700 border-rose-200";
  return "";
}

function isLowGrade(val: GradeValue, colType: string): boolean {
  if (val === null || val === undefined) return false;
  if (colType === "sor" || colType === "soch") {
    if (val === "Н") return true;
    if (typeof val === "number" && val <= 3) return true;
  }
  return false;
}

function calcAverage(grades: Record<string, GradeValue>, columns: GradebookColumn[]): number | null {
  const numericGrades = columns
    .map((c) => grades[c.id])
    .filter((v): v is number => typeof v === "number");
  if (numericGrades.length === 0) return null;
  return Math.round((numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length) * 10) / 10;
}

function calcFinal(grades: Record<string, GradeValue>, columns: GradebookColumn[]): number | null {
  const lessonGrades = columns
    .filter((c) => c.type === "lesson")
    .map((c) => grades[c.id])
    .filter((v): v is number => typeof v === "number");

  const sorGrades = columns
    .filter((c) => c.type === "sor")
    .map((c) => grades[c.id])
    .filter((v): v is number => typeof v === "number");

  const sochCol = columns.find((c) => c.type === "soch");
  const sochGrade = sochCol ? grades[sochCol.id] : null;

  const allNumeric: number[] = [...lessonGrades, ...sorGrades];
  if (typeof sochGrade === "number") allNumeric.push(sochGrade);
  if (allNumeric.length === 0) return null;

  const avg = allNumeric.reduce((a, b) => a + b, 0) / allNumeric.length;
  return Math.round(avg);
}

function getAiPrediction(
  grades: Record<string, GradeValue>,
  columns: GradebookColumn[],
  t: (key: string) => string
): string {
  const final = calcFinal(grades, columns);
  if (final === null) return t("gradebook.aiNoData");

  const lessonCols = columns.filter((c) => c.type === "lesson");
  const recent = lessonCols.slice(-4).map((c) => grades[c.id]).filter((v): v is number => typeof v === "number");
  const earlier = lessonCols.slice(0, -4).map((c) => grades[c.id]).filter((v): v is number => typeof v === "number");

  const recentAvg = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
  const earlierAvg = earlier.length > 0 ? earlier.reduce((a, b) => a + b, 0) / earlier.length : 0;

  const sorGrades = columns.filter((c) => c.type === "sor").map((c) => grades[c.id]).filter((v): v is number => typeof v === "number");
  const hasLowSor = sorGrades.some((g) => g <= 3);

  if (recentAvg > earlierAvg + 0.3 && !hasLowSor) return t("gradebook.aiPositive");
  if (recentAvg < earlierAvg - 0.3 || hasLowSor) return t("gradebook.aiWarning");
  return t("gradebook.aiStable");
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

interface PopoverState {
  studentId: string;
  columnId: string;
  rect: DOMRect;
  currentVal: GradeValue;
}

function GradePopover({
  state,
  onSelect,
  onClose,
  t,
}: {
  state: PopoverState;
  onSelect: (value: GradeValue) => void;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; openDown: boolean }>({ top: 0, left: 0, openDown: false });

  useEffect(() => {
    const rect = state.rect;
    const popoverHeight = 180;
    const popoverWidth = 160;
    const spaceAbove = rect.top;
    const openDown = spaceAbove < popoverHeight + 16;

    let top: number;
    if (openDown) {
      top = rect.bottom + 8;
    } else {
      top = rect.top - popoverHeight - 8;
    }

    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - popoverWidth - 8));

    setPos({ top, left, openDown });
  }, [state.rect]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={popoverRef}
      className="fixed z-[9999] animate-scale-in"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200/80 shadow-2xl shadow-gray-400/20 p-2.5 w-40">
        <div className="grid grid-cols-3 gap-1.5">
          {GRADE_OPTIONS.map((opt) => (
            <button
              key={String(opt)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(opt);
              }}
              className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer ${getGradeColor(opt)} ${
                state.currentVal === opt ? "ring-2 ring-brand ring-offset-1" : "hover:shadow-md"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(null);
          }}
          className="w-full mt-2 py-1.5 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-colors cursor-pointer"
        >
          {t("gradebook.clear")}
        </button>
      </div>
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-l border-t border-gray-200/80 rotate-45 ${
          pos.openDown ? "-top-1.5" : "-bottom-1.5 rotate-[225deg]"
        }`}
      />
    </div>,
    document.body
  );
}

export default function GradebookTab() {
  const { t } = useI18n();
  const { setOverride } = useStudentData();

  const [data, setData] = useState<GradebookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0].key);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [hoveredFinal, setHoveredFinal] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    setLoading(true);
    fetch("/api/gradebook")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load gradebook:", err);
        setLoading(false);
      });
  }, []);

  const saveGrade = useCallback(
    async (studentId: string, columnId: string, value: GradeValue) => {
      if (!data) return;

      const prevData = deepClone(data);
      const newData = deepClone(data);

      if (!newData.grades[selectedClass]) newData.grades[selectedClass] = {};
      if (!newData.grades[selectedClass][selectedSubject]) newData.grades[selectedClass][selectedSubject] = {};
      if (!newData.grades[selectedClass][selectedSubject][studentId]) {
        newData.grades[selectedClass][selectedSubject][studentId] = {};
      }
      newData.grades[selectedClass][selectedSubject][studentId][columnId] = value;
      setData(newData);
      setOverride(studentId, selectedSubject, columnId, value);
      setSaveStatus("saving");

      try {
        const res = await fetch("/api/gradebook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: selectedClass,
            subject: selectedSubject,
            studentId,
            columnId,
            value,
          }),
        });

        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const result = await res.json();
        if (result.error) throw new Error(result.error);

        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1500);
      } catch (err) {
        console.error("Failed to save grade:", err);
        setData(prevData);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    },
    [data, selectedClass, selectedSubject, setOverride]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">{t("gradebook.loading")}</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <span className="text-4xl">⚠️</span>
        <span className="text-sm text-gray-500">{t("gradebook.loadError")}</span>
      </div>
    );
  }

  const subjectStudents = data.students.filter((s) => s.grade === selectedClass);
  const columns = data.columns;
  const classGrades = data.grades[selectedClass]?.[selectedSubject] ?? {};

  const availableSubjects = SUBJECTS.filter((s) => {
    if (selectedClass === "10-A") return s.key === "math" || s.key === "physics";
    return s.key === "algebra" || s.key === "physics";
  });

  if (selectedSubject && !availableSubjects.find((s) => s.key === selectedSubject)) {
    setSelectedSubject(availableSubjects[0]?.key ?? "math");
  }

  const cellKey = (studentId: string, colId: string) => `${studentId}_${colId}`;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white text-lg shadow-lg shadow-brand/20">
              📒
            </span>
            {t("gradebook.title")}
          </h2>
          <p className="text-gray-400 text-sm mt-1">{t("gradebook.subtitle")}</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center">
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => {
                const newClass = e.target.value;
                setSelectedClass(newClass);
                const newSubs = SUBJECTS.filter((s) => {
                  if (newClass === "10-A") return s.key === "math" || s.key === "physics";
                  return s.key === "algebra" || s.key === "physics";
                });
                if (!newSubs.find((s) => s.key === selectedSubject)) {
                  setSelectedSubject(newSubs[0]?.key ?? "math");
                }
              }}
              className="appearance-none bg-white/70 backdrop-blur-sm border border-gray-200/80 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all cursor-pointer"
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {t("gradebook.class")} {c}
                </option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="appearance-none bg-white/70 backdrop-blur-sm border border-gray-200/80 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all cursor-pointer"
            >
              {availableSubjects.map((s) => (
                <option key={s.key} value={s.key}>
                  {t(s.label)}
                </option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          {saveStatus === "saving" && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <div className="w-3 h-3 border border-gray-300 border-t-brand rounded-full animate-spin" />
              {t("gradebook.saving")}
            </div>
          )}
          {saveStatus === "saved" && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 animate-fade-in">
              ✓ {t("gradebook.saved")}
            </div>
          )}
          {saveStatus === "error" && (
            <div className="flex items-center gap-1.5 text-xs text-red-500 animate-fade-in">
              ✕ {t("gradebook.saveError")}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
          <span>{t("gradebook.lessonGrade")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-violet-50 border border-violet-200" />
          <span>СОР</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-rose-50 border border-rose-200" />
          <span>СОЧ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-50 border border-red-200" />
          <span>{t("gradebook.lowGrade")}</span>
        </div>
      </div>

      {/* Gradebook Table */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-white/90 backdrop-blur-sm min-w-[200px] w-[200px] px-5 py-3.5 text-left border-b border-gray-200/60">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("gradebook.student")}</span>
                </th>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    className={`min-w-[68px] px-2 py-3.5 text-center border-b border-gray-200/60 ${getColumnHeaderStyle(col.type)}`}
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wider">
                      {col.type === "sor" ? (
                        <span className="text-violet-600">{col.label}</span>
                      ) : col.type === "soch" ? (
                        <span className="text-rose-600">{col.label}</span>
                      ) : (
                        <span className="text-gray-500">{col.label}</span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="min-w-[90px] px-3 py-3.5 text-center border-b border-gray-200/60 bg-gray-50/50">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("gradebook.average")}</span>
                </th>
                <th className="min-w-[80px] px-3 py-3.5 text-center border-b border-gray-200/60 bg-brand/5">
                  <span className="text-xs font-semibold text-brand uppercase tracking-wider">{t("gradebook.final")}</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100/80">
              {subjectStudents.map((student) => {
                const grades = classGrades[student.id] ?? {};
                const avg = calcAverage(grades, columns);
                const final = calcFinal(grades, columns);
                const aiPred = getAiPrediction(grades, columns, t);

                return (
                  <tr key={student.id} className="group hover:bg-brand/[0.02] transition-colors duration-150">
                    <td className="sticky left-0 z-10 bg-white/90 backdrop-blur-sm group-hover:bg-brand/[0.02] px-5 py-3 border-b border-gray-100/60 transition-colors duration-150">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{student.avatar}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </div>
                      </div>
                    </td>

                    {columns.map((col) => {
                      const val = grades[col.id] ?? null;
                      const low = isLowGrade(val, col.type);
                      const isOpen = popover?.studentId === student.id && popover?.columnId === col.id;

                      return (
                        <td key={col.id} className="px-1 py-2 text-center border-b border-gray-100/60">
                          <div className="flex justify-center">
                            <button
                              ref={(el) => { buttonRefs.current[cellKey(student.id, col.id)] = el; }}
                              onClick={(e) => {
                                if (isOpen) {
                                  setPopover(null);
                                  return;
                                }
                                const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                setPopover({
                                  studentId: student.id,
                                  columnId: col.id,
                                  rect,
                                  currentVal: val,
                                });
                              }}
                              className={`w-9 h-9 rounded-xl text-sm font-semibold border transition-all duration-150 hover:scale-105 active:scale-95 hover:shadow-md cursor-pointer ${
                                isOpen ? "ring-2 ring-brand ring-offset-1" : ""
                              } ${
                                val !== null
                                  ? `${getGradeColor(val)} ${low ? "ring-1 ring-red-200 animate-pulse-subtle" : ""}`
                                  : "border-dashed border-gray-200 text-gray-300 hover:border-gray-300 hover:text-gray-400 hover:bg-gray-50"
                              }`}
                            >
                              {val ?? "·"}
                            </button>
                          </div>
                        </td>
                      );
                    })}

                    <td className="px-3 py-3 text-center border-b border-gray-100/60 bg-gray-50/30">
                      <span
                        className={`text-sm font-bold ${
                          avg !== null ? (avg >= 4 ? "text-emerald-600" : avg >= 3 ? "text-amber-600" : "text-red-600") : "text-gray-300"
                        }`}
                      >
                        {avg !== null ? avg.toFixed(1) : "—"}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-center border-b border-gray-100/60 bg-brand/[0.03]">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`text-base font-bold ${
                            final !== null ? (final >= 4 ? "text-brand" : final >= 3 ? "text-amber-600" : "text-red-600") : "text-gray-300"
                          }`}
                        >
                          {final ?? "—"}
                        </span>
                        {final !== null && (
                          <div
                            className="relative"
                            onMouseEnter={() => setHoveredFinal(student.id)}
                            onMouseLeave={() => setHoveredFinal(null)}
                          >
                            <span className="text-sm cursor-help hover:scale-125 transition-transform inline-block">
                              🤖
                            </span>
                            {hoveredFinal === student.id && (
                              <div className="absolute right-0 top-full mt-2 z-40 w-56">
                                <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200/80 shadow-2xl shadow-gray-300/30 p-4 animate-fade-in">
                                  <div className="flex items-start gap-2">
                                    <span className="text-base flex-shrink-0 mt-0.5">🤖</span>
                                    <div>
                                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        {t("gradebook.aiForecast")}
                                      </div>
                                      <p className="text-sm text-gray-700 leading-relaxed">{aiPred}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="w-3 h-3 bg-white/95 border-l border-t border-gray-200/80 rotate-45 -mt-1.5 mr-4 ml-auto" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {subjectStudents.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 3} className="text-center py-12 text-gray-400 text-sm">
                    {t("gradebook.noStudents")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Portal-based Grade Popover */}
      {popover && (
        <GradePopover
          state={popover}
          onSelect={(value) => {
            saveGrade(popover.studentId, popover.columnId, value);
            setPopover(null);
          }}
          onClose={() => setPopover(null)}
          t={t}
        />
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(() => {
          const finals = subjectStudents
            .map((s) => calcFinal(classGrades[s.id] ?? {}, columns))
            .filter((v): v is number => v !== null);
          const classAvg = finals.length > 0 ? finals.reduce((a, b) => a + b, 0) / finals.length : 0;
          const excellent = finals.filter((g) => g === 5).length;
          const failing = finals.filter((g) => g <= 2).length;

          return [
            { label: t("gradebook.totalStudents"), value: subjectStudents.length, icon: "👥", color: "from-blue-500 to-cyan-500" },
            { label: t("gradebook.classAverage"), value: classAvg.toFixed(1), icon: "📊", color: "from-emerald-500 to-green-500" },
            { label: t("gradebook.excellent"), value: excellent, icon: "⭐", color: "from-amber-500 to-yellow-500" },
            { label: t("gradebook.failing"), value: failing, icon: "🚨", color: "from-red-500 to-rose-500" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{stat.icon}</span>
                <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
              </div>
              <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
