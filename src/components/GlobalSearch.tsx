"use client";

import { useState, useRef, useEffect } from "react";
import { useProfile } from "@/lib/profile-context";
import { useRouter } from "next/navigation";
import { Search, GraduationCap, BookOpen } from "lucide-react";

export default function GlobalSearch({ lang }: { lang: string }) {
  const { searchProfiles } = useProfile();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReturnType<typeof searchProfiles>>([]);
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    setSelectedIdx(-1);
    if (value.trim().length >= 1) {
      const found = searchProfiles(value);
      setResults(found);
      setOpen(true);
    } else {
      setResults([]);
      setOpen(false);
    }
  }

  function handleSelect(profileId: string) {
    setQuery("");
    setResults([]);
    setOpen(false);
    router.push(`/${lang}/profile/${profileId}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && selectedIdx >= 0 && selectedIdx < results.length) {
      handleSelect(results[selectedIdx].id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 1 && results.length > 0 && setOpen(true)}
          placeholder="Поиск учеников и учителей..."
          className="w-64 pl-9 pr-4 py-2 rounded-xl bg-gray-100/80 border border-gray-200/80 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:bg-white transition-all"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden z-50 min-w-[320px]">
          {results.map((profile, idx) => (
            <button
              key={profile.id}
              onClick={() => handleSelect(profile.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                idx === selectedIdx ? "bg-brand/5" : "hover:bg-gray-50"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                {profile.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{profile.name}</span>
                  {profile.role === "student" ? (
                    <GraduationCap size={12} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <BookOpen size={12} className="text-gray-400 flex-shrink-0" />
                  )}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {profile.role === "student"
                    ? `Класс ${profile.grade} · MMR ${profile.mmr || 0}`
                    : `${profile.subjects?.join(", ")} · Куратор ${profile.curatorOf || "—"}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.trim().length >= 1 && results.length === 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-xl p-4 z-50 min-w-[320px] text-center">
          <p className="text-sm text-gray-400">Ничего не найдено</p>
        </div>
      )}
    </div>
  );
}
