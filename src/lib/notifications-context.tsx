"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";

export interface ParentMessage {
  id: string;
  text: string;
  from: string;
  timestamp: number;
  read: boolean;
}

export type AnnouncementTarget = "all" | "teachers" | "class-10-A" | "class-9-B";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  target: AnnouncementTarget;
  timestamp: number;
}

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann_demo_1",
    title: "Завтра сокращенный день!",
    body: "Уважаемые ученики и учителя! Завтра, 1 апреля, занятия заканчиваются в 13:00. Не забудьте забрать вещи из шкафчиков.",
    target: "all",
    timestamp: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "ann_demo_2",
    title: "Кабинет физики перенесен в 312",
    body: "Со следующей недели все занятия по физике для 10-А проходят в кабинете 312 (2 этаж). Приносите учебники!",
    target: "class-10-A",
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
  },
];

const ANNOUNCEMENTS_STORAGE_KEY = "aqbobek_announcements";

function loadAnnouncements(): Announcement[] {
  if (typeof window === "undefined") return MOCK_ANNOUNCEMENTS;
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_ANNOUNCEMENTS;
}

function saveAnnouncements(data: Announcement[]) {
  try { localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(data)); } catch {}
}

interface NotificationsContextType {
  messages: ParentMessage[];
  addMessage: (text: string, from: string) => void;
  markAsRead: (id: string) => void;
  unreadCount: number;
  announcements: Announcement[];
  addAnnouncement: (title: string, body: string, target: AnnouncementTarget) => void;
  getAnnouncementsFor: (role: string, grade?: string) => Announcement[];
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

const STORAGE_KEY = "aqbobek_parent_messages";

function loadMessages(): ParentMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(data: ParentMessage[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ParentMessage[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    setMessages(loadMessages());
    setAnnouncements(loadAnnouncements());
    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setMessages(loadMessages());
      }
      if (e.key === ANNOUNCEMENTS_STORAGE_KEY) {
        setAnnouncements(loadAnnouncements());
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addMessage = useCallback((text: string, from: string) => {
    setMessages((prev) => {
      const msg: ParentMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        text,
        from,
        timestamp: Date.now(),
        read: false,
      };
      const next = [msg, ...prev];
      saveMessages(next);
      return next;
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setMessages((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, read: true } : m));
      saveMessages(next);
      return next;
    });
  }, []);

  const addAnnouncement = useCallback((title: string, body: string, target: AnnouncementTarget) => {
    setAnnouncements((prev) => {
      const ann: Announcement = {
        id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title,
        body,
        target,
        timestamp: Date.now(),
      };
      const next = [ann, ...prev];
      saveAnnouncements(next);
      return next;
    });
  }, []);

  const getAnnouncementsFor = useCallback((role: string, grade?: string): Announcement[] => {
    return announcements.filter((ann) => {
      if (ann.target === "all") return true;
      if (ann.target === "teachers" && role === "teacher") return true;
      if (ann.target === "class-10-A" && grade === "10-A") return true;
      if (ann.target === "class-9-B" && grade === "9-Б") return true;
      return false;
    });
  }, [announcements]);

  const unreadCount = useMemo(() => messages.filter((m) => !m.read).length, [messages]);

  const value = useMemo(
    () => ({ messages, addMessage, markAsRead, unreadCount, announcements, addAnnouncement, getAnnouncementsFor }),
    [messages, addMessage, markAsRead, unreadCount, announcements, addAnnouncement, getAnnouncementsFor]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
