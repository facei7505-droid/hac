"use client";

import { useState, useMemo } from "react";
import { useI18n } from "./I18nProvider";
import { useNotifications } from "@/lib/notifications-context";
import { Megaphone, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const STUDENT_CLASS = "10-A";

export default function NotificationsFeed() {
  const { t, lang } = useI18n();
  const { messages, markAsRead, unreadCount, getAnnouncementsFor, announcements } = useNotifications();
  const router = useRouter();
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const visibleAnnouncements = useMemo(
    () => getAnnouncementsFor("student", STUDENT_CLASS),
    [announcements, getAnnouncementsFor]
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/${lang}`)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("student.feedTitle") || "Лента"}</h1>
          <p className="text-sm text-gray-400">{t("student.feedSubtitle") || "Уведомления и школьные новости"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications from Parent */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center relative">
              💌
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </span>
            {t("student.notifications")}
          </h3>
          {messages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">{t("student.noNotifications")}</p>
          ) : (
            <div className="space-y-2">
              {(showAllNotifications ? messages : messages.slice(0, 5)).map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border transition-all ${
                    msg.read
                      ? "bg-gray-50/50 border-gray-100"
                      : "bg-pink-50/50 border-pink-100"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">{msg.read ? "💬" : "❤️"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-400">{t("student.fromParent")}</span>
                        {!msg.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${msg.read ? "text-gray-500" : "text-gray-800 font-medium"}`}>
                        {msg.text}
                      </p>
                      {!msg.read && (
                        <button
                          onClick={() => markAsRead(msg.id)}
                          className="mt-1.5 text-xs text-pink-500 hover:text-pink-600 font-medium cursor-pointer"
                        >
                          {t("student.markAsRead")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {messages.length > 5 && (
                <button
                  onClick={() => setShowAllNotifications(!showAllNotifications)}
                  className="w-full text-xs text-brand hover:text-brand-light font-medium py-2 cursor-pointer"
                >
                  {showAllNotifications ? "↑" : `+${messages.length - 5}`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* School Announcements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Megaphone size={16} className="text-indigo-600" />
            </span>
            Школьная лента
          </h3>
          {visibleAnnouncements.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Нет объявлений</p>
          ) : (
            <div className="space-y-3">
              {visibleAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/80 hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">📢</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{ann.title}</span>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          ann.target === "all" ? "bg-emerald-50 text-emerald-600" :
                          ann.target === "teachers" ? "bg-purple-50 text-purple-600" :
                          "bg-blue-50 text-blue-600"
                        }`}>
                          {ann.target === "all" ? "Для всех" :
                           ann.target === "teachers" ? "Учителя" :
                           ann.target === "class-10-A" ? "Для 10-А" : "Для 9-Б"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{ann.body}</p>
                      <span className="text-[10px] text-gray-400 mt-1.5 block">Только что</span>
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
