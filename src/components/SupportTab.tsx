"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { users } from "@/data/users";
import {
  Send,
  Paperclip,
  Bot,
  Headphones,
  CheckCheck,
  Search,
} from "lucide-react";

/* ──────────────────────── Types ──────────────────────── */

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai" | "admin";
  timestamp: number;
  read: boolean;
}

interface Ticket {
  id: string;
  userName: string;
  userRole: string;
  userAvatar: string;
  lastMessage: string;
  unread: number;
  online: boolean;
  messages: ChatMessage[];
}

/* ──────────────────────── Constants ──────────────────────── */

const AI_STORAGE_KEY = "ai_chat_history";
const SUPPORT_STORAGE_KEY = "global_support_chats";

type SupportChats = Record<string, ChatMessage[]>;

const AI_GREETING: ChatMessage = {
  id: "ai-1",
  text: "Привет! Я ИИ-помощник лицея Aqbobek. Чем могу помочь? Могу ответить на вопросы по расписанию, оценкам, мероприятиям и другим школьным темам.",
  sender: "ai",
  timestamp: Date.now() - 120000,
  read: true,
};

const ADMIN_GREETING: ChatMessage = {
  id: "adm-1",
  text: "Здравствуйте! Вы связались с администрацией лицея. Опишите вашу проблему, и мы постараемся помочь как можно скорее.",
  sender: "admin",
  timestamp: Date.now() - 60000,
  read: true,
};

const ROLE_AVATAR: Record<string, string> = {
  student: "🧑‍🎓",
  teacher: "👩‍🏫",
  parent: "👨",
  admin: "🛡️",
};

/* ──────────────────────── Mock data for seeding ──────────────── */

const MOCK_CONVERSATIONS: SupportChats = {
  "aidar.nurlanov@student.aqbobek.kz": [
    { id: "m1", text: "Здравствуйте! У меня не отображается оценка по физике за СОР 2", sender: "user", timestamp: Date.now() - 300000, read: true },
    { id: "m2", text: "Проверьте, пожалуйста, в журнале — возможно, оценка ещё не выставлена", sender: "admin", timestamp: Date.now() - 240000, read: true },
    { id: "m3", text: "Нет, учитель сказал что уже выставил. В Smart Gradebook тоже нет", sender: "user", timestamp: Date.now() - 180000, read: true },
    { id: "m4", text: "Можете скинуть скриншот? Мы передадим техникам", sender: "admin", timestamp: Date.now() - 120000, read: false },
    { id: "m5", text: "У меня не отображается оценка по физике за СОР 2", sender: "user", timestamp: Date.now() - 60000, read: false },
  ],
  "gulnar.amanova@aqbobek.kz": [
    { id: "m1", text: "Добрый день! Не могу загрузить расписание на следующую неделю", sender: "user", timestamp: Date.now() - 600000, read: true },
    { id: "m2", text: "Не могу загрузить расписание на следующую неделю", sender: "user", timestamp: Date.now() - 60000, read: false },
  ],
  "nurlan.parent@aqbobek.kz": [
    { id: "m1", text: "Здравствуйте! Как узнать текущий баланс на обедах ребёнка?", sender: "user", timestamp: Date.now() - 3600000, read: true },
    { id: "m2", text: "Баланс можно проверить в разделе Smart-обед на dashboard вашего ребёнка", sender: "admin", timestamp: Date.now() - 3500000, read: true },
    { id: "m3", text: "Как узнать текущий баланс на обедах?", sender: "user", timestamp: Date.now() - 3400000, read: true },
  ],
  "amina.kasymova@student.aqbobek.kz": [
    { id: "m1", text: "Пароль не подходит к порталу, пробовала несколько раз", sender: "user", timestamp: Date.now() - 7200000, read: true },
    { id: "m2", text: "Проблема решена! Пароль сброшен. Проверьте почту.", sender: "admin", timestamp: Date.now() - 7100000, read: true },
  ],
};

const MOCK_USER_NAMES: Record<string, string> = {
  "aidar.nurlanov@student.aqbobek.kz": "Айдар Нурланов",
  "gulnar.amanova@aqbobek.kz": "Гульнар Аманова",
  "nurlan.parent@aqbobek.kz": "Нурлан Нурланов",
  "amina.kasymova@student.aqbobek.kz": "Амина Касымова",
};

const MOCK_USER_ROLES: Record<string, string> = {
  "aidar.nurlanov@student.aqbobek.kz": "Студент",
  "gulnar.amanova@aqbobek.kz": "Учитель",
  "nurlan.parent@aqbobek.kz": "Родитель",
  "amina.kasymova@student.aqbobek.kz": "Студент",
};

/* ──────────────────────── Helpers ──────────────────────── */

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function makeId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function getUserChatId(user: { email: string; profileId: string }): string {
  return user.profileId || user.email;
}

function getUserDisplayName(
  userId: string,
  fallbackName?: string
): string {
  return MOCK_USER_NAMES[userId] || fallbackName || userId;
}

function getUserDisplayRole(
  userId: string,
  fallbackRole?: string
): string {
  return MOCK_USER_ROLES[userId] || fallbackRole || "Пользователь";
}

function getUserAvatar(userId: string): string {
  return ROLE_AVATAR[getUserDisplayRole(userId).toLowerCase()] || "👤";
}

/* ──────────────── localStorage helpers ──────────────── */

function loadAiChat(): ChatMessage[] {
  if (typeof window === "undefined") return [{ ...AI_GREETING }];
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [{ ...AI_GREETING }];
}

function saveAiChat(messages: ChatMessage[]) {
  try {
    localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(messages));
  } catch {}
}

function loadSupportChats(): SupportChats {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SUPPORT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveSupportChats(data: SupportChats) {
  try {
    localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function updateSupportChat(
  userId: string,
  updater: (prev: ChatMessage[]) => ChatMessage[]
) {
  const all = loadSupportChats();
  all[userId] = updater(all[userId] || []);
  saveSupportChats(all);
}

function seedMockTicketsIfEmpty() {
  if (typeof window === "undefined") return;
  try {
    const existing = localStorage.getItem(SUPPORT_STORAGE_KEY);
    if (!existing || Object.keys(JSON.parse(existing || "{}")).length === 0) {
      localStorage.setItem(
        SUPPORT_STORAGE_KEY,
        JSON.stringify(MOCK_CONVERSATIONS)
      );
    }
  } catch {
    localStorage.setItem(
      SUPPORT_STORAGE_KEY,
      JSON.stringify(MOCK_CONVERSATIONS)
    );
  }
}

function chatsToTickets(chats: SupportChats): Ticket[] {
  return Object.entries(chats)
    .filter(([, msgs]) => msgs.length > 0)
    .map(([userId, messages]) => {
      const firstUserMsg = messages.find((m) => m.sender === "user");
      return {
        id: userId,
        userName: getUserDisplayName(
          userId,
          firstUserMsg?.text.slice(0, 30)
        ),
        userRole: getUserDisplayRole(userId),
        userAvatar: getUserAvatar(userId),
        lastMessage: messages[messages.length - 1]?.text || "",
        unread: messages.filter((m) => m.sender !== "admin" && !m.read).length,
        online: Math.random() > 0.5,
        messages,
      };
    })
    .sort(
      (a, b) =>
        (b.messages[b.messages.length - 1]?.timestamp || 0) -
        (a.messages[a.messages.length - 1]?.timestamp || 0)
    );
}

/* ══════════════════════════════════════════════════════════
   USER SUPPORT CHAT  (Student / Teacher / Parent)
   ══════════════════════════════════════════════════════════ */

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 mr-2">ИИ печатает</span>
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

function UserSupportChat({
  userName,
  userChatId,
  userRole,
}: {
  userName: string;
  userChatId: string;
  userRole: string;
}) {
  const [activeChannel, setActiveChannel] = useState<"ai" | "admin">("ai");
  const [messages, setMessages] = useState<Record<"ai" | "admin", ChatMessage[]>>({
    ai: [{ ...AI_GREETING }],
    admin: [{ ...ADMIN_GREETING }],
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Load from localStorage on mount */
  useEffect(() => {
    setMessages({
      ai: loadAiChat(),
      admin: loadSupportChats()[userChatId]?.length
        ? loadSupportChats()[userChatId]
        : [{ ...ADMIN_GREETING }],
    });
  }, [userChatId]);

  /* Poll admin channel for admin replies */
  useEffect(() => {
    const interval = setInterval(() => {
      const chats = loadSupportChats();
      const myChat = chats[userChatId];
      if (myChat && myChat.length > 0) {
        setMessages((prev) => {
          if (JSON.stringify(prev.admin) !== JSON.stringify(myChat)) {
            return { ...prev, admin: myChat };
          }
          return prev;
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [userChatId]);

  /* Auto-scroll */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeChannel, isLoading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: makeId(),
      text,
      sender: "user",
      timestamp: Date.now(),
      read: true,
    };

    if (activeChannel === "admin") {
      /* Student sending to admin channel → save to global_support_chats */
      setMessages((prev) => {
        const updated = { ...prev, admin: [...prev.admin, userMsg] };
        updateSupportChat(userChatId, () => updated.admin);
        return updated;
      });
      setInput("");

      /* Auto-reply confirmation */
      setTimeout(() => {
        const reply: ChatMessage = {
          id: makeId(),
          text: "Ваше сообщение принято. Администратор ответит в ближайшее время.",
          sender: "admin",
          timestamp: Date.now(),
          read: true,
        };
        setMessages((prev) => {
          const updated = { ...prev, admin: [...prev.admin, reply] };
          updateSupportChat(userChatId, () => updated.admin);
          return updated;
        });
      }, 1200);
      return;
    }

    /* AI channel */
    setMessages((prev) => {
      const updated = { ...prev, ai: [...prev.ai, userMsg] };
      saveAiChat(updated.ai);
      return updated;
    });
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка связи с сервером ИИ");
      }

      const aiMsg: ChatMessage = {
        id: makeId(),
        text: data.reply,
        sender: "ai",
        timestamp: Date.now(),
        read: true,
      };
      setMessages((prev) => {
        const updated = { ...prev, ai: [...prev.ai, aiMsg] };
        saveAiChat(updated.ai);
        return updated;
      });
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: makeId(),
        text: `🔴 Ошибка API: ${err?.message || "Неизвестная ошибка"}`,
        sender: "ai",
        timestamp: Date.now(),
        read: true,
      };
      setMessages((prev) => {
        const updated = { ...prev, ai: [...prev.ai, errMsg] };
        saveAiChat(updated.ai);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, activeChannel, isLoading, userChatId]);

  const channelMessages = messages[activeChannel];

  return (
    <div className="flex flex-col h-full">
      {/* Channel selector */}
      <div className="flex gap-2 p-4 border-b border-gray-100 bg-white">
        <button
          onClick={() => setActiveChannel("ai")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeChannel === "ai"
              ? "bg-brand text-white shadow-md shadow-brand/20"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Bot size={16} />
          AI-Помощник
        </button>
        <button
          onClick={() => setActiveChannel("admin")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeChannel === "admin"
              ? "bg-brand text-white shadow-md shadow-brand/20"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Headphones size={16} />
          Связь с Администрацией
        </button>
      </div>

      {/* Chat window */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50"
      >
        {channelMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === "user"
                  ? "bg-brand text-white rounded-br-md"
                  : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
              }`}
            >
              <p>{msg.text}</p>
              <div
                className={`flex items-center gap-1 mt-1 ${
                  msg.sender === "user" ? "justify-end" : ""
                }`}
              >
                <span
                  className={`text-[10px] ${
                    msg.sender === "user" ? "text-white/60" : "text-gray-400"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </span>
                {msg.sender === "user" && (
                  <CheckCheck size={12} className="text-white/60" />
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && activeChannel === "ai" && <TypingIndicator />}
      </div>

      {/* Input bar */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2">
          <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <Paperclip size={18} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Написать сообщение..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={send}
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-xl bg-brand text-white hover:bg-brand-light transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ADMIN SUPPORT DASHBOARD  (WhatsApp Web style)
   ══════════════════════════════════════════════════════════ */

function AdminSupportDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    seedMockTicketsIfEmpty();
    return chatsToTickets(loadSupportChats());
  });
  const [selectedId, setSelectedId] = useState<string>("");
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const selected = tickets.find((t) => t.id === selectedId) || null;

  /* Sync from localStorage: storage event (cross-tab) + polling (same-tab) */
  useEffect(() => {
    const syncFromStorage = () => {
      const newTickets = chatsToTickets(loadSupportChats());
      setTickets(newTickets);
      setSelectedId((prev) => {
        if (prev && newTickets.some((t) => t.id === prev)) return prev;
        return newTickets[0]?.id || "";
      });
    };

    window.addEventListener("storage", syncFromStorage);
    const interval = setInterval(syncFromStorage, 2000);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      clearInterval(interval);
    };
  }, []);

  /* Auto-scroll */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selected?.messages.length, selectedId]);

  const filteredTickets = tickets.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.userName.toLowerCase().includes(q) ||
      t.userRole.toLowerCase().includes(q)
    );
  });

  const sendReply = useCallback(
    (text: string) => {
      if (!text.trim() || !selected) return;
      const msg: ChatMessage = {
        id: makeId(),
        text: text.trim(),
        sender: "admin",
        timestamp: Date.now(),
        read: true,
      };

      const userId = selected.id;

      /* Update React state */
      setTickets((prev) =>
        prev.map((t) =>
          t.id === userId
            ? { ...t, messages: [...t.messages, msg], lastMessage: text.trim() }
            : t
        )
      );
      setInput("");

      /* Persist to localStorage */
      updateSupportChat(userId, (prev) => [...prev, msg]);
    },
    [selected]
  );

  const markRead = useCallback((ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              unread: 0,
              messages: t.messages.map((m) => ({ ...m, read: true })),
            }
          : t
      )
    );
    updateSupportChat(ticketId, (prev) =>
      prev.map((m) => ({ ...m, read: true }))
    );
  }, []);

  return (
    <div className="flex h-full">
      {/* ── Left: Chat List ── */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Техподдержка</h2>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск чатов..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredTickets.map((ticket) => {
            const isActive = ticket.id === selectedId;
            return (
              <button
                key={ticket.id}
                onClick={() => {
                  setSelectedId(ticket.id);
                  markRead(ticket.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer border-b border-gray-50 ${
                  isActive ? "bg-brand/5" : "hover:bg-gray-50"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                    {ticket.userAvatar}
                  </div>
                  {ticket.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {ticket.userName}
                    </span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                      {formatTime(
                        ticket.messages[ticket.messages.length - 1]?.timestamp ||
                          Date.now()
                      )}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 mb-0.5">
                    {ticket.userRole}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {ticket.lastMessage}
                  </p>
                </div>
                {ticket.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {ticket.unread}
                  </div>
                )}
              </button>
            );
          })}
          {filteredTickets.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-400">
              Чаты не найдены
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Active Chat ── */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selected ? (
          <>
            {/* Header */}
            <div className="h-14 flex items-center gap-3 px-6 bg-white border-b border-gray-200 flex-shrink-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                  {selected.userAvatar}
                </div>
                {selected.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {selected.userName}
                </div>
                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                  {selected.online ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Online
                    </>
                  ) : (
                    "Был(а) недавно"
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-3"
            >
              {selected.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "admin" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.sender === "admin"
                        ? "bg-emerald-600 text-white rounded-br-md"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div
                      className={`flex items-center gap-1 mt-1 ${
                        msg.sender === "admin" ? "justify-end" : ""
                      }`}
                    >
                      <span
                        className={`text-[10px] ${
                          msg.sender === "admin"
                            ? "text-white/60"
                            : "text-gray-400"
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </span>
                      {msg.sender === "admin" && (
                        <CheckCheck size={12} className="text-white/60" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Replies + Input */}
            <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => sendReply("Проблема решена ✅")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200"
                >
                  Проблема решена
                </button>
                <button
                  onClick={() =>
                    sendReply(
                      "Передано техникам. Ожидайте ответ в ближайшее время."
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
                >
                  Передано техникам
                </button>
                <button
                  onClick={() =>
                    sendReply(
                      "Спасибо за обращение! Если будут ещё вопросы — пишите."
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-gray-50 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                >
                  Спасибо за обращение
                </button>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                  <Paperclip size={18} />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendReply(input)}
                  placeholder="Написать сообщение..."
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                />
                <button
                  onClick={() => sendReply(input)}
                  disabled={!input.trim()}
                  className="p-2 rounded-xl bg-brand text-white hover:bg-brand-light transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Выберите чат для начала общения
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT — picks interface by role
   ══════════════════════════════════════════════════════════ */

export default function SupportTab() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "admin") {
    return (
      <div className="h-[calc(100vh-3.5rem)]">
        <AdminSupportDashboard />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <UserSupportChat
        userName={user.name}
        userChatId={getUserChatId(user)}
        userRole={user.role}
      />
    </div>
  );
}
