"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "./I18nProvider";
import { ArrowLeft, Send, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

const CONTACTS: Contact[] = [
  { id: "t1", name: "Гульнар Аманова", role: "Учитель математики", avatar: "👩‍🏫" },
  { id: "t2", name: "Сидоров П.М.", role: "Учитель физики", avatar: "👨‍🏫" },
  { id: "u1", name: "Айдар Нурланов", role: "Ученик 10-А", avatar: "🧑‍🎓" },
  { id: "u2", name: "Нурлан Оразов", role: "Ученик 9-Б", avatar: "👦" },
  { id: "u3", name: "Данияр Ахметов", role: "Ученик 10-А", avatar: "👦" },
  { id: "u4", name: "Амина Касымова", role: "Ученица 10-А", avatar: "👧" },
];

const CHATS_KEY = "global_chats";

function loadChats(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHATS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveChats(chats: ChatMessage[]) {
  try { localStorage.setItem(CHATS_KEY, JSON.stringify(chats)); } catch {}
}

export default function MessengerTab({ initialChatId }: { initialChatId?: string | null }) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const currentUserId = user?.profileId || "";
  const [activeContactId, setActiveContactId] = useState<string | null>(initialChatId || null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChats());
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contacts = CONTACTS.filter((c) => c.id !== currentUserId);
  const activeContact = contacts.find((c) => c.id === activeContactId) || null;

  const filteredContacts = searchQuery.trim()
    ? contacts.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : contacts;

  const currentChatMessages = activeContactId
    ? messages.filter(
        (m) =>
          (m.senderId === currentUserId && m.receiverId === activeContactId) ||
          (m.senderId === activeContactId && m.receiverId === currentUserId)
      )
    : [];

  useEffect(() => {
    function reload() {
      setMessages(loadChats());
    }
    function handleStorage(e: StorageEvent) {
      if (e.key === CHATS_KEY) reload();
    }
    window.addEventListener("storage", handleStorage);
    window.addEventListener("chatUpdated", reload);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("chatUpdated", reload);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChatMessages.length]);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || !activeContactId || !currentUserId) return;

    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      senderId: currentUserId,
      receiverId: activeContactId,
      text: inputText.trim(),
      timestamp: Date.now(),
    };

    const updated = [...messages, msg];
    setMessages(updated);
    saveChats(updated);
    window.dispatchEvent(new Event("chatUpdated"));
    setInputText("");
  }, [inputText, activeContactId, currentUserId, messages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  function formatTime(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(ts: number): string {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Сегодня";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Вчера";
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  }

  function getLastMessage(contactId: string): ChatMessage | null {
    const chatMsgs = messages.filter(
      (m) =>
        (m.senderId === currentUserId && m.receiverId === contactId) ||
        (m.senderId === contactId && m.receiverId === currentUserId)
    );
    return chatMsgs.length > 0 ? chatMsgs[chatMsgs.length - 1] : null;
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex bg-white">
      {/* Contacts sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => router.push(`/${lang}`)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-bold text-gray-900">Мессенджер</h2>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:bg-white transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => {
            const lastMsg = getLastMessage(contact.id);
            const isActive = activeContactId === contact.id;
            return (
              <button
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all cursor-pointer border-b border-gray-50 ${
                  isActive ? "bg-brand/5 border-l-2 border-l-brand" : "hover:bg-gray-50"
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl flex-shrink-0">
                  {contact.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{contact.name}</div>
                  <div className="text-xs text-gray-400 truncate">
                    {lastMsg
                      ? lastMsg.senderId === currentUserId
                        ? `Вы: ${lastMsg.text}`
                        : lastMsg.text
                      : contact.role}
                  </div>
                </div>
                {lastMsg && (
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {formatDate(lastMsg.timestamp)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeContact ? (
          <>
            {/* Chat header */}
            <div className="h-14 flex items-center gap-3 px-5 border-b border-gray-200 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg">
                {activeContact.avatar}
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">{activeContact.name}</div>
                <div className="text-[11px] text-gray-400">{activeContact.role}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50/50">
              {currentChatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  Начните переписку с {activeContact.name}
                </div>
              ) : (
                currentChatMessages.map((msg) => {
                  const isMine = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMine
                            ? "bg-brand text-white rounded-br-md"
                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                        }`}
                      >
                        <div>{msg.text}</div>
                        <div className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-gray-400"}`}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Написать сообщение..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:bg-white transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || !currentUserId}
                  className="p-2.5 rounded-xl bg-brand text-white hover:bg-brand-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-lg font-medium text-gray-500">Выберите чат</p>
              <p className="text-sm text-gray-400 mt-1">Выберите контакт слева, чтобы начать переписку</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
