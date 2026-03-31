"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/components/I18nProvider";
import { useRouter } from "next/navigation";
import { ArrowLeft, Megaphone, Send } from "lucide-react";

type AnnouncementTarget = "all" | "teachers" | "class-10-A" | "class-9-B";

interface Announcement {
  id: string;
  title: string;
  body: string;
  target: AnnouncementTarget;
  timestamp: number;
}

const ANNOUNCEMENTS_KEY = "aqbobek_announcements";

function loadAnnouncements(): Announcement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveAnnouncements(data: Announcement[]) {
  try { localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(data)); } catch {}
}

const TARGET_LABELS: Record<AnnouncementTarget, string> = {
  all: "Все",
  teachers: "Учителя",
  "class-10-A": "10-А",
  "class-9-B": "9-Б",
};

const TARGET_COLORS: Record<AnnouncementTarget, string> = {
  all: "bg-emerald-50 text-emerald-600",
  teachers: "bg-purple-50 text-purple-600",
  "class-10-A": "bg-blue-50 text-blue-600",
  "class-9-B": "bg-blue-50 text-blue-600",
};

export default function AnnouncementsAdmin() {
  const { t, lang } = useI18n();
  const router = useRouter();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<AnnouncementTarget>("all");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setAnnouncements(loadAnnouncements());
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handlePublish = useCallback(() => {
    if (!title.trim() || !body.trim()) return;

    const newAnn: Announcement = {
      id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      body: body.trim(),
      target,
      timestamp: Date.now(),
    };

    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    saveAnnouncements(updated);

    setTitle("");
    setBody("");
    setTarget("all");
    showToast("✅ Push-уведомление успешно отправлено выбранной аудитории!");
  }, [title, body, target, announcements, showToast]);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] animate-slide-up">
          <div className="flex items-center gap-3 text-white px-5 py-3.5 rounded-2xl shadow-2xl bg-emerald-600 shadow-emerald-600/30">
            <span className="text-sm font-semibold">{toast}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white cursor-pointer">✕</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/${lang}`)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление объявлениями</h1>
          <p className="text-sm text-gray-400">Создание и просмотр push-уведомлений</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Megaphone size={16} className="text-indigo-600" />
            </span>
            Создать объявление
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Заголовок</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Завтра сокращенный день!"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Текст сообщения</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Подробности объявления..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Таргетинг</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as AnnouncementTarget)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all"
              >
                <option value="all">Все</option>
                <option value="teachers">Только Учителя</option>
                <option value="class-10-A">Только 10-А</option>
                <option value="class-9-B">Только 9-Б</option>
              </select>
            </div>
            <button
              onClick={handlePublish}
              disabled={!title.trim() || !body.trim()}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <Send size={16} />
              Опубликовать (Отправить Push)
            </button>
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">📢</span>
            Последние объявления
            {announcements.length > 0 && (
              <span className="text-sm text-gray-400 font-normal">({announcements.length})</span>
            )}
          </h3>
          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm text-gray-400">Пока нет объявлений</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/80 hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">📢</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{ann.title}</span>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${TARGET_COLORS[ann.target]}`}>
                          {TARGET_LABELS[ann.target]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{ann.body}</p>
                      <span className="text-[10px] text-gray-400 mt-1.5 block">
                        {new Date(ann.timestamp).toLocaleString("ru-RU", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
