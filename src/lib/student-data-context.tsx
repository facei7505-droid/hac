"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { teacherStudents as baseStudents } from "@/data/students";
import type { StudentRow } from "@/types";

export type TrendType = "up" | "down" | "stable";
export type RiskType = "low" | "medium" | "high";

export interface GradeOverride {
  [studentId: string]: {
    [subject: string]: {
      [columnId: string]: number | "Н" | null;
    };
  };
}

export interface GradeTimestamps {
  [studentId: string]: {
    [subject: string]: {
      [columnId: string]: string;
    };
  };
}

export interface ComputedStudent extends StudentRow {
  id: string;
  baseGpa: number;
  baseMmr: number;
  overrideCount: number;
}

interface StudentDataContextType {
  overrides: GradeOverride;
  timestamps: GradeTimestamps;
  setOverride: (studentId: string, subject: string, columnId: string, value: number | "Н" | null) => void;
  addMmrBonus: (studentId: string, amount: number) => void;
  getMmrBonus: (studentId: string) => number;
  getComputedStudents: () => ComputedStudent[];
  getStudentMetrics: (studentId: string, baseGpa: number, baseMmr: number) => {
    gpa: number; mmr: number; trend: TrendType; risk: RiskType;
    hasCriticalGrade: boolean; criticalSubject: string | null; criticalGrade: number | null;
  };
  version: number;
}

const StudentDataContext = createContext<StudentDataContextType | null>(null);

const STORAGE_KEY = "aqbobek_student_overrides";
const MMR_STORAGE_KEY = "aqbobek_mmr_bonuses";
const TIMESTAMPS_STORAGE_KEY = "aqbobek_grade_timestamps";

const STUDENT_MAP: Record<string, { baseData: StudentRow; id: string }> = {
  "Айдар Нурланов":   { id: "s1",  baseData: baseStudents[0] },
  "Амина Касымова":   { id: "s2",  baseData: baseStudents[1] },
  "Данияр Ахметов":   { id: "s3",  baseData: baseStudents[2] },
  "Жанель Сагынбаева":{ id: "s4",  baseData: baseStudents[3] },
  "Нурлан Оразов":    { id: "s5",  baseData: baseStudents[4] },
  "Сабина Ермекова":  { id: "s6",  baseData: baseStudents[5] },
  "Тимур Кенжебаев":  { id: "s7",  baseData: baseStudents[6] },
  "Алия Бекова":      { id: "s8",  baseData: baseStudents[7] },
};

function getMmrTier(mmr: number): string {
  if (mmr >= 2000) return "Legendary";
  if (mmr >= 1500) return "Gold";
  if (mmr >= 1000) return "Silver";
  return "Bronze";
}

function loadOverrides(): GradeOverride {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveOverrides(data: GradeOverride) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function loadMmrBonuses(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MMR_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveMmrBonuses(data: Record<string, number>) {
  try { localStorage.setItem(MMR_STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function loadTimestamps(): GradeTimestamps {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TIMESTAMPS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveTimestamps(data: GradeTimestamps) {
  try { localStorage.setItem(TIMESTAMPS_STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function computeStudentMetrics(
  studentId: string,
  overrides: GradeOverride,
  baseGpa: number,
  baseMmr: number,
  baseTrend: TrendType
): {
  gpa: number; mmr: number; trend: TrendType; risk: RiskType;
  hasCriticalGrade: boolean; criticalSubject: string | null; criticalGrade: number | null;
  overrideCount: number;
  subjectOverrides: { name: string; grade: number }[];
} {
  const studentOverrides = overrides[studentId] || {};
  const allOverrideGrades: number[] = [];
  let mmrDelta = 0;
  let hasCriticalGrade = false;
  let criticalSubject: string | null = null;
  let criticalGrade: number | null = null;
  const subjectOverrides: { name: string; grade: number }[] = [];

  for (const [subject, grades] of Object.entries(studentOverrides)) {
    const subjectNumericGrades: number[] = [];
    for (const [, val] of Object.entries(grades)) {
      if (typeof val === "number") {
        allOverrideGrades.push(val);
        subjectNumericGrades.push(val);
        if (val === 5) mmrDelta += 10;
        else if (val === 4) mmrDelta += 3;
        else if (val === 3) mmrDelta -= 5;
        else if (val === 2) {
          mmrDelta -= 15;
          if (!hasCriticalGrade) {
            hasCriticalGrade = true;
            criticalSubject = subject;
            criticalGrade = 2;
          }
        } else if (val === 1) {
          mmrDelta -= 25;
          if (!hasCriticalGrade) {
            hasCriticalGrade = true;
            criticalSubject = subject;
            criticalGrade = 1;
          }
        }
      }
    }
    if (subjectNumericGrades.length > 0) {
      const avg = Math.round((subjectNumericGrades.reduce((a, b) => a + b, 0) / subjectNumericGrades.length) * 10) / 10;
      subjectOverrides.push({ name: subject, grade: Math.round(avg) });
    }
  }

  let gpa: number;
  if (allOverrideGrades.length > 0) {
    gpa = Math.round((allOverrideGrades.reduce((a, b) => a + b, 0) / allOverrideGrades.length) * 10) / 10;
  } else {
    gpa = baseGpa;
  }

  const mmr = baseMmr + mmrDelta;

  let trend: TrendType = baseTrend;
  if (allOverrideGrades.length > 0) {
    const overrideAvg = allOverrideGrades.reduce((a, b) => a + b, 0) / allOverrideGrades.length;
    if (overrideAvg < baseGpa - 0.3) trend = "down";
    else if (overrideAvg > baseGpa + 0.3) trend = "up";
    else trend = "stable";
  }

  let risk: RiskType = "low";
  if (gpa < 2.5 || hasCriticalGrade) risk = "high";
  else if (gpa < 3.5 || trend === "down") risk = "medium";

  return {
    gpa, mmr, trend, risk,
    hasCriticalGrade, criticalSubject, criticalGrade,
    overrideCount: allOverrideGrades.length,
    subjectOverrides,
  };
}

export function StudentDataProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<GradeOverride>({});
  const [timestamps, setTimestamps] = useState<GradeTimestamps>({});
  const [mmrBonuses, setMmrBonuses] = useState<Record<string, number>>({});
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setOverrides(loadOverrides());
    setMmrBonuses(loadMmrBonuses());
    setTimestamps(loadTimestamps());

    function reloadAll() {
      setOverrides(loadOverrides());
      setMmrBonuses(loadMmrBonuses());
      setTimestamps(loadTimestamps());
      setVersion((v) => v + 1);
    }

    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY || e.key === MMR_STORAGE_KEY || e.key === TIMESTAMPS_STORAGE_KEY) {
        reloadAll();
      }
    }
    function handleCustom() {
      reloadAll();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("userDataUpdated", handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("userDataUpdated", handleCustom);
    };
  }, []);

  const setOverride = useCallback(
    (studentId: string, subject: string, columnId: string, value: number | "Н" | null) => {
      setOverrides((prev) => {
        const next = JSON.parse(JSON.stringify(prev)) as GradeOverride;
        if (!next[studentId]) next[studentId] = {};
        if (!next[studentId][subject]) next[studentId][subject] = {};
        if (value === null) {
          delete next[studentId][subject][columnId];
        } else {
          next[studentId][subject][columnId] = value;
        }
        saveOverrides(next);
        setVersion((v) => v + 1);
        window.dispatchEvent(new Event("userDataUpdated"));
        return next;
      });
      if (value !== null) {
        setTimestamps((prev) => {
          const next = JSON.parse(JSON.stringify(prev)) as GradeTimestamps;
          if (!next[studentId]) next[studentId] = {};
          if (!next[studentId][subject]) next[studentId][subject] = {};
          next[studentId][subject][columnId] = new Date().toISOString();
          saveTimestamps(next);
          return next;
        });
      }
    },
    []
  );

  const addMmrBonus = useCallback(
    (studentId: string, amount: number) => {
      setMmrBonuses((prev) => {
        const next = { ...prev, [studentId]: (prev[studentId] || 0) + amount };
        saveMmrBonuses(next);
        setVersion((v) => v + 1);
        window.dispatchEvent(new Event("userDataUpdated"));
        return next;
      });
    },
    []
  );

  const getMmrBonus = useCallback(
    (studentId: string) => mmrBonuses[studentId] || 0,
    [mmrBonuses]
  );

  const getStudentMetrics = useCallback(
    (studentId: string, baseGpa: number, baseMmr: number) => {
      const result = computeStudentMetrics(studentId, overrides, baseGpa, baseMmr, "stable");
      const bonus = mmrBonuses[studentId] || 0;
      return {
        gpa: result.gpa,
        mmr: result.mmr + bonus,
        trend: result.trend,
        risk: result.risk,
        hasCriticalGrade: result.hasCriticalGrade,
        criticalSubject: result.criticalSubject,
        criticalGrade: result.criticalGrade,
      };
    },
    [overrides, mmrBonuses]
  );

  const getComputedStudents = useCallback((): ComputedStudent[] => {
    return baseStudents.map((base) => {
      const entry = STUDENT_MAP[base.name];
      if (!entry) {
        return {
          ...base,
          id: "unknown",
          baseGpa: base.gpa,
          baseMmr: base.mmr,
          overrideCount: 0,
        };
      }

      const metrics = computeStudentMetrics(entry.id, overrides, base.gpa, base.mmr, base.trend);
      const bonus = mmrBonuses[entry.id] || 0;

      const mergedSubjects = [...base.subjects];
      for (const ovr of metrics.subjectOverrides) {
        const idx = mergedSubjects.findIndex((s) => s.name === ovr.name);
        if (idx >= 0) {
          mergedSubjects[idx] = { ...mergedSubjects[idx], grade: ovr.grade };
        } else {
          mergedSubjects.push({ name: ovr.name, grade: ovr.grade });
        }
      }

      return {
        ...base,
        id: entry.id,
        gpa: metrics.gpa,
        mmr: metrics.mmr + bonus,
        mmrTier: getMmrTier(metrics.mmr),
        trend: metrics.trend,
        risk: metrics.risk,
        subjects: mergedSubjects,
        baseGpa: base.gpa,
        baseMmr: base.mmr,
        overrideCount: metrics.overrideCount,
      };
    });
  }, [overrides, mmrBonuses, version]);

  const contextValue = useMemo(
    () => ({ overrides, timestamps, setOverride, addMmrBonus, getMmrBonus, getComputedStudents, getStudentMetrics, version }),
    [overrides, timestamps, setOverride, addMmrBonus, getMmrBonus, getComputedStudents, getStudentMetrics, version]
  );

  return (
    <StudentDataContext.Provider value={contextValue}>
      {children}
    </StudentDataContext.Provider>
  );
}

export function useStudentData() {
  const context = useContext(StudentDataContext);
  if (!context) {
    throw new Error("useStudentData must be used within a StudentDataProvider");
  }
  return context;
}
