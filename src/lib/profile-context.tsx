"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import type { UserProfile, Achievement } from "@/types/profile";

interface ProfileContextType {
  profiles: Record<string, UserProfile>;
  getProfile: (id: string) => UserProfile | null;
  updateProfile: (id: string, updates: Partial<UserProfile>) => void;
  addAchievement: (profileId: string, achievement: Omit<Achievement, "id" | "date" | "status">) => void;
  approveAchievement: (profileId: string, achievementId: string) => void;
  rejectAchievement: (profileId: string, achievementId: string) => void;
  getPendingAchievements: () => { profileId: string; profile: UserProfile; achievement: Achievement }[];
  searchProfiles: (query: string) => UserProfile[];
  currentUserId: string | null;
  setCurrentUserId: (id: string | null) => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

const PROFILE_STORAGE_KEY = "aqbobek_profiles";
const CURRENT_USER_KEY = "aqbobek_current_profile_id";

function loadProfiles(): Record<string, UserProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProfiles(data: Record<string, UserProfile>) {
  try { localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetch("/api/gradebook")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.profiles) {
          const stored = loadProfiles();
          const merged: Record<string, UserProfile> = { ...data.profiles };
          for (const [id, profile] of Object.entries(stored)) {
            if (merged[id]) {
              merged[id] = { ...merged[id], ...profile };
            }
          }
          setProfiles(merged);
          saveProfiles(merged);
        }
      })
      .catch(() => {
        setProfiles(loadProfiles());
      });

    const storedCurrent = localStorage.getItem(CURRENT_USER_KEY);
    if (storedCurrent) setCurrentUserIdState(storedCurrent);
    setInitialized(true);
  }, []);

  const getProfile = useCallback(
    (id: string) => profiles[id] || null,
    [profiles]
  );

  const updateProfile = useCallback(
    (id: string, updates: Partial<UserProfile>) => {
      setProfiles((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev, [id]: { ...prev[id], ...updates } };
        saveProfiles(next);
        return next;
      });
    },
    []
  );

  const addAchievement = useCallback(
    (profileId: string, achievement: Omit<Achievement, "id" | "date" | "status">) => {
      setProfiles((prev) => {
        const profile = prev[profileId];
        if (!profile) return prev;
        const newAchievement: Achievement = {
          ...achievement,
          id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          date: new Date().toISOString().slice(0, 10),
          status: "pending",
          studentId: profileId,
        };
        const next = {
          ...prev,
          [profileId]: {
            ...profile,
            achievements: [...profile.achievements, newAchievement],
          },
        };
        saveProfiles(next);
        return next;
      });
    },
    []
  );

  const approveAchievement = useCallback(
    (profileId: string, achievementId: string) => {
      setProfiles((prev) => {
        const profile = prev[profileId];
        if (!profile) return prev;
        const next = {
          ...prev,
          [profileId]: {
            ...profile,
            mmr: (profile.mmr || 0) + 50,
            achievements: profile.achievements.map((a) =>
              a.id === achievementId ? { ...a, status: "approved" as const } : a
            ),
          },
        };
        saveProfiles(next);
        return next;
      });
    },
    []
  );

  const rejectAchievement = useCallback(
    (profileId: string, achievementId: string) => {
      setProfiles((prev) => {
        const profile = prev[profileId];
        if (!profile) return prev;
        const next = {
          ...prev,
          [profileId]: {
            ...profile,
            achievements: profile.achievements.filter((a) => a.id !== achievementId),
          },
        };
        saveProfiles(next);
        return next;
      });
    },
    []
  );

  const getPendingAchievements = useCallback(() => {
    const result: { profileId: string; profile: UserProfile; achievement: Achievement }[] = [];
    for (const [id, profile] of Object.entries(profiles)) {
      for (const a of profile.achievements) {
        if (a.status === "pending") {
          result.push({ profileId: id, profile, achievement: a });
        }
      }
    }
    return result;
  }, [profiles]);

  const searchProfiles = useCallback(
    (query: string) => {
      if (!query.trim()) return [];
      const q = query.toLowerCase().trim();
      return Object.values(profiles).filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q) ||
          p.interests.some((i) => i.toLowerCase().includes(q)) ||
          (p.grade && p.grade.toLowerCase().includes(q))
      );
    },
    [profiles]
  );

  const setCurrentUserId = useCallback((id: string | null) => {
    setCurrentUserIdState(id);
    if (id) {
      localStorage.setItem(CURRENT_USER_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, []);

  useEffect(() => {
    if (!initialized) return;
    function handleStorage(e: StorageEvent) {
      if (e.key === PROFILE_STORAGE_KEY) {
        setProfiles(loadProfiles());
      }
      if (e.key === CURRENT_USER_KEY) {
        const val = localStorage.getItem(CURRENT_USER_KEY);
        setCurrentUserIdState(val);
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [initialized]);

  const value = useMemo(
    () => ({
      profiles,
      getProfile,
      updateProfile,
      addAchievement,
      approveAchievement,
      rejectAchievement,
      getPendingAchievements,
      searchProfiles,
      currentUserId,
      setCurrentUserId,
    }),
    [profiles, getProfile, updateProfile, addAchievement, approveAchievement, rejectAchievement, getPendingAchievements, searchProfiles, currentUserId, setCurrentUserId]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
