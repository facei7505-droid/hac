"use client";

import { useState, useRef, useMemo } from "react";
import { useProfile } from "@/lib/profile-context";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast-context";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Clock,
  CheckCircle,
  Pencil,
  Plus,
  X,
  Upload,
  ArrowLeft,
  Star,
  BookOpen,
  GraduationCap,
  History,
} from "lucide-react";

const AVATARS = ["🧑‍🎓", "👧", "👦", "🧒", "👩‍🏫", "👨‍🏫", "🧑‍💻", "🧑‍🔬", "🧑‍🎨", "🧑‍🚀"];

const ACHIEVEMENT_CATEGORIES = [
  "Проект",
  "Спорт",
  "Наука",
  "Олимпиада",
  "Искусство",
  "Волонтёрство",
  "Спорт/Киберспорт",
];

const ACHIEVEMENT_ICONS: Record<string, string> = {
  Проект: "🏆",
  Спорт: "🏅",
  Наука: "🔬",
  Олимпиада: "🥇",
  Искусство: "🎨",
  Волонтёрство: "🤝",
  "Спорт/Киберспорт": "🎮",
};

function getActivityColor(level: number): string {
  if (level >= 5) return "bg-emerald-500";
  if (level >= 4) return "bg-emerald-400";
  if (level >= 3) return "bg-emerald-300";
  if (level >= 2) return "bg-emerald-200";
  if (level >= 1) return "bg-emerald-100";
  return "bg-slate-700";
}

function getActivityColorHex(level: number): string {
  if (level >= 5) return "#22c55e";
  if (level >= 4) return "#4ade80";
  if (level >= 3) return "#86efac";
  if (level >= 2) return "#bbf7d0";
  if (level >= 1) return "#dcfce7";
  return "#334155";
}

function getMmrGradient(mmr: number): string {
  if (mmr >= 2000) return "from-yellow-400 to-amber-500";
  if (mmr >= 1500) return "from-purple-400 to-violet-500";
  if (mmr >= 1000) return "from-blue-400 to-cyan-500";
  return "from-gray-400 to-gray-500";
}

function getMmrTier(mmr: number): string {
  if (mmr >= 2000) return "Legendary";
  if (mmr >= 1500) return "Gold";
  if (mmr >= 1000) return "Silver";
  return "Bronze";
}

export default function ProfileView({ profileId, lang }: { profileId: string; lang: string }) {
  const { getProfile, updateProfile, addAchievement } = useProfile();
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const profile = getProfile(profileId);
  const isOwnProfile = user?.profileId === profileId;
  const isAdmin = user?.role === "admin";
  const canEdit = isOwnProfile || isAdmin;

  const [editMode, setEditMode] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editInterests, setEditInterests] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [achTitle, setAchTitle] = useState("");
  const [achCategory, setAchCategory] = useState(ACHIEVEMENT_CATEGORIES[0]);
  const [achFileUrl, setAchFileUrl] = useState("");
  const [showGradeHistory, setShowGradeHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-2">Профиль не найден</h2>
          <p className="text-slate-400 mb-6">Пользователь с ID &quot;{profileId}&quot; не существует</p>
          <button
            onClick={() => router.push(`/${lang}`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors cursor-pointer"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  const isStudent = profile.role === "student";
  const mmr = profile.mmr || 0;
  const mmrTier = getMmrTier(mmr);

  function startEdit() {
    if (!profile) return;
    setEditBio(profile.bio);
    setEditInterests(profile.interests.join(", "));
    setEditAvatar(profile.avatar);
    setEditMode(true);
  }

  function saveEdit() {
    if (!profile) return;
    updateProfile(profileId, {
      bio: editBio,
      interests: editInterests.split(",").map((s) => s.trim()).filter(Boolean),
      avatar: editAvatar,
    });
    setEditMode(false);
    addToast("Профиль обновлён!", "success");
  }

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setEditAvatar(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  function submitAchievement() {
    if (!achTitle.trim()) return;
    addAchievement(profileId, {
      title: achTitle.trim(),
      category: achCategory,
      icon: ACHIEVEMENT_ICONS[achCategory] || "🏆",
      ...(achFileUrl.trim() ? { fileUrl: achFileUrl.trim() } : {}),
    });
    setAchTitle("");
    setAchCategory(ACHIEVEMENT_CATEGORIES[0]);
    setAchFileUrl("");
    setShowAchievementForm(false);
    addToast("Достижение отправлено на проверку администратору!", "success");
  }

  const gridCols = 53;
  const gridRows = 7;
  const grid: number[][] = [];
  for (let row = 0; row < gridRows; row++) {
    grid.push([]);
    for (let col = 0; col < gridCols; col++) {
      const idx = col * gridRows + row;
      grid[row].push(profile.activityGrid[idx] || 0);
    }
  }

  const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="h-14 flex-shrink-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 flex items-center px-6 gap-4">
        <button
          onClick={() => router.push(`/${lang}`)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Назад</span>
        </button>
        <div className="flex-1" />
        {isAdmin && !isOwnProfile && (
          <span className="px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
            Admin View
          </span>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Left Column - Bio */}
          <div className="space-y-4">
            {/* Avatar + Info Card */}
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-slate-700 border-4 border-slate-600 shadow-2xl flex items-center justify-center text-6xl overflow-hidden">
                    {editAvatar && editAvatar.startsWith("data:") ? (
                      <img src={editAvatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      profile.avatar
                    )}
                  </div>
                  {isStudent && (
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getMmrGradient(mmr)} text-white shadow-lg whitespace-nowrap`}>
                      {mmrTier} · {mmr}
                    </div>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-white mt-6">{profile.name}</h1>

                <div className="flex items-center gap-2 mt-2">
                  {isStudent ? (
                    <span className="flex items-center gap-1 text-slate-400 text-sm">
                      <GraduationCap size={14} />
                      Класс {profile.grade}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400 text-sm">
                      <BookOpen size={14} />
                      Учитель
                    </span>
                  )}
                </div>

                {isStudent && profile.mmr && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star size={14} className="text-amber-400" />
                    <span className="text-sm font-semibold text-amber-400">MMR {mmr}</span>
                  </div>
                )}

                {profile.role === "teacher" && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-slate-400">{profile.subjects?.join(", ")}</p>
                    {profile.curatorOf && (
                      <p className="text-xs text-blue-400">Куратор {profile.curatorOf}</p>
                    )}
                  </div>
                )}

                {!isOwnProfile && user && (
                  <button
                    onClick={() => router.push(`/${lang}/messenger?chatId=${profileId}`)}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 cursor-pointer active:scale-95"
                  >
                    💬 Отправить сообщение
                  </button>
                )}

                <p className="text-slate-300 text-sm mt-4 leading-relaxed">{profile.bio}</p>

                <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                  {profile.interests.map((interest) => (
                    <span key={interest} className="px-2.5 py-1 rounded-lg bg-slate-700/60 text-slate-300 text-xs font-medium border border-slate-600/50">
                      {interest}
                    </span>
                  ))}
                </div>

                {canEdit && !editMode && (
                  <button
                    onClick={startEdit}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-600/50 transition-colors cursor-pointer"
                  >
                    <Pencil size={14} />
                    {isAdmin && !isOwnProfile ? "Редактировать (Admin)" : "Редактировать профиль"}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats for students */}
            {isStudent && (
              <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Статистика</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-white">{profile.achievements.filter((a) => a.status === "approved").length}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Достижений</div>
                  </div>
                  <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-white">{profile.interests.length}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Интересов</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Main Content */}
          <div className="space-y-6">
            {/* Activity Graph */}
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">📊</span>
                Активность — успеваемость и посещаемость
              </h3>
              <div className="overflow-x-auto">
                <div className="inline-block">
                  <div className="flex gap-[3px] mb-1 ml-[32px]">
                    {months.map((m, i) => (
                      <div key={m} className="text-[10px] text-slate-500" style={{ width: `${(gridCols / 12) * 13 - 3}px` }}>
                        {i % 2 === 0 ? m : ""}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-[3px]">
                    <div className="flex flex-col gap-[3px] mr-1">
                      {["Пн", "", "Ср", "", "Пт", "", "Вс"].map((d, i) => (
                        <div key={i} className="h-[13px] text-[9px] text-slate-600 leading-[13px] w-[28px] text-right pr-1">{d}</div>
                      ))}
                    </div>
                    {Array.from({ length: gridCols }).map((_, col) => (
                      <div key={col} className="flex flex-col gap-[3px]">
                        {Array.from({ length: gridRows }).map((_, row) => {
                          const level = grid[row][col];
                          return (
                            <div key={row} className={`w-[13px] h-[13px] rounded-[3px] ${getActivityColor(level)} transition-all duration-200 hover:ring-2 hover:ring-white/30`} title={`Уровень: ${level}`} />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mt-3 justify-end">
                    <span className="text-[10px] text-slate-500 mr-1">Меньше</span>
                    {[0, 1, 2, 3, 4, 5].map((l) => (
                      <div key={l} className="w-[13px] h-[13px] rounded-[3px]" style={{ backgroundColor: getActivityColorHex(l) }} />
                    ))}
                    <span className="text-[10px] text-slate-500 ml-1">Больше</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs">
                    <Trophy size={14} />
                  </span>
                  Закреплённые достижения
                </h3>
                {isOwnProfile && (
                  <button
                    onClick={() => setShowAchievementForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium border border-blue-500/30 transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                    Добавить достижение
                  </button>
                )}
              </div>

              {profile.achievements.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="text-slate-500 text-sm">Пока нет достижений</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className={`relative rounded-xl border p-4 transition-all ${
                        ach.status === "approved"
                          ? "bg-slate-700/40 border-slate-600/50 hover:border-slate-500/50"
                          : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{ach.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">{ach.title}</h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-600/50 text-slate-300">{ach.category}</span>
                            <span className="text-[10px] text-slate-500">{ach.date}</span>
                            {ach.fileUrl && (
                              <a href={ach.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300">📎 Файл</a>
                            )}
                          </div>
                        </div>
                        {ach.status === "pending" ? (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-400">
                            <Clock size={12} />
                            <span className="text-[10px] font-medium">Ожидает</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                            <CheckCircle size={12} />
                            <span className="text-[10px] font-medium">Одобрено</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Grade History for students */}
            {isStudent && (
              <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">
                      <History size={14} />
                    </span>
                    История оценок
                  </h3>
                </div>
                <button
                  onClick={() => setShowGradeHistory(true)}
                  className="w-full py-3 rounded-xl bg-slate-700/40 hover:bg-slate-700/60 text-slate-300 text-sm font-medium flex items-center justify-center gap-2 border border-slate-600/30 transition-colors cursor-pointer"
                >
                  <History size={14} />
                  Посмотреть всю историю оценок
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl w-full max-w-lg mx-4 animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
              <h2 className="text-lg font-bold text-white">
                {isAdmin && !isOwnProfile ? "Редактирование (Admin)" : "Редактировать профиль"}
              </h2>
              <button onClick={() => setEditMode(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Аватар</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-3xl overflow-hidden">
                    {editAvatar && editAvatar.startsWith("data:") ? (
                      <img src={editAvatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      editAvatar
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {AVATARS.map((a) => (
                      <button
                        key={a}
                        onClick={() => setEditAvatar(a)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all cursor-pointer ${
                          editAvatar === a ? "bg-blue-600 ring-2 ring-blue-400" : "bg-slate-700 hover:bg-slate-600"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Upload size={12} />
                    Загрузить файл
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">О себе</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  placeholder="Расскажите о себе..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Интересы (через запятую)</label>
                <input
                  type="text"
                  value={editInterests}
                  onChange={(e) => setEditInterests(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Программирование, Математика, Футбол"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-700/50">
              <button onClick={() => setEditMode(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium transition-colors cursor-pointer">
                Отмена
              </button>
              <button onClick={saveEdit} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer">
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Achievement Modal */}
      {showAchievementForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl w-full max-w-md mx-4 animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
              <h2 className="text-lg font-bold text-white">Новое достижение</h2>
              <button onClick={() => setShowAchievementForm(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Название</label>
                <input
                  type="text"
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Название достижения"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Категория</label>
                <select
                  value={achCategory}
                  onChange={(e) => setAchCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {ACHIEVEMENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Ссылка на файл (грамота, сертификат)</label>
                <input
                  type="url"
                  value={achFileUrl}
                  onChange={(e) => setAchFileUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="https://example.com/certificate.pdf"
                />
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-300">
                  ⏳ Достижение будет отправлено на проверку администратору. После одобрения вы получите +50 MMR.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-700/50">
              <button onClick={() => setShowAchievementForm(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium transition-colors cursor-pointer">
                Отмена
              </button>
              <button onClick={submitAchievement} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer">
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade History Modal */}
      {showGradeHistory && isStudent && (
        <GradeHistoryProfileModal
          profileId={profileId}
          profileName={profile.name}
          onClose={() => setShowGradeHistory(false)}
        />
      )}
    </div>
  );
}

function GradeHistoryProfileModal({
  profileId,
  profileName,
  onClose,
}: {
  profileId: string;
  profileName: string;
  onClose: () => void;
}) {
  const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

  const grades = useMemo(() => {
    const result: { subject: string; grade: number | "Н"; type: string; date: string; sortKey: number }[] = [];

    try {
      if (typeof window === "undefined") return result;
      const overridesRaw = localStorage.getItem("aqbobek_student_overrides");
      const timestampsRaw = localStorage.getItem("aqbobek_grade_timestamps");
      const overrides = overridesRaw ? JSON.parse(overridesRaw) : {};
      const timestamps = timestampsRaw ? JSON.parse(timestampsRaw) : {};

      const studentOverrides = overrides[profileId] || {};
      const studentTimestamps = timestamps[profileId] || {};

      for (const [subject, grades] of Object.entries(studentOverrides)) {
        const subjTs = studentTimestamps[subject] || {};
        for (const [colId, val] of Object.entries(grades as Record<string, unknown>)) {
          if (val !== null && val !== undefined) {
            const ts = (subjTs as Record<string, string>)[colId];
            const dateObj = ts ? new Date(ts) : new Date();
            result.push({
              subject,
              grade: val as number | "Н",
              type: "Новая оценка",
              date: ts
                ? `${dateObj.getDate()}.${(dateObj.getMonth() + 1).toString().padStart(2, "0")}.${dateObj.getFullYear()}`
                : "Только что",
              sortKey: dateObj.getTime(),
            });
          }
        }
      }
    } catch {}

    result.sort((a, b) => b.sortKey - a.sortKey);
    return result;
  }, [profileId]);

  function getGradeColor(val: number | "Н"): string {
    if (val === "Н") return "bg-amber-100 text-amber-700 border-amber-200";
    if (val === 5) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (val === 4) return "bg-blue-100 text-blue-700 border-blue-200";
    if (val === 3) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-100 text-red-700 border-red-200";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl w-full max-w-lg mx-4 animate-scale-in max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History size={18} className="text-blue-400" />
            История оценок — {profileName}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          {grades.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-slate-400 text-sm">Нет оценок</p>
            </div>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-700" />
              <div className="space-y-4">
                {grades.map((g, i) => (
                  <div key={i} className="relative flex items-start gap-3">
                    <div className="absolute left-[-16px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-800 shadow-sm" />
                    <div className="flex-1 bg-slate-700/40 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${getGradeColor(g.grade)}`}>
                            {g.grade}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-white">{g.subject}</div>
                            <div className="text-[10px] text-slate-400">{g.type}</div>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{g.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
