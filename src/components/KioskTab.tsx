"use client";

import { useEffect, useRef } from "react";
import { topStudentsKiosk } from "@/data/students";
import { substitutions, schedule } from "@/data/schedule";
import { getMMRTextColorKiosk, getCup } from "@/lib/utils";

export default function KioskTab() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let scrollPos = 0;
    const speed = 0.5;

    const scroll = () => {
      scrollPos += speed;
      if (scrollPos >= el.scrollHeight / 2) {
        scrollPos = 0;
      }
      el.scrollTop = scrollPos;
      animId = requestAnimationFrame(scroll);
    };

    animId = requestAnimationFrame(scroll);

    const pause = () => cancelAnimationFrame(animId);
    const resume = () => { animId = requestAnimationFrame(scroll); };

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen -mx-[calc((100vw-100%)/2)] -mt-8 bg-gray-950 text-white px-8 py-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-lg shadow-brand/30">
            <span className="text-white font-black text-2xl">A</span>
          </div>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Aqbobek Lyceum
            </h1>
            <p className="text-gray-500 text-lg">Информационный киоск</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black tabular-nums tracking-tight">{timeStr}</div>
          <div className="text-gray-500 text-lg capitalize">{dateStr}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900/50 rounded-3xl border border-gray-800/50 overflow-hidden">
          <div className="p-6 pb-3 border-b border-gray-800/50">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 text-xl">📝</span>
              Замены на сегодня
            </h2>
          </div>
          <div ref={scrollRef} className="h-[480px] overflow-hidden relative">
            <div className="p-4 space-y-3">
              {[...substitutions, ...substitutions].map((sub, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    sub.change === "Отменён"
                      ? "bg-red-500/10 border border-red-500/20"
                      : "bg-gray-800/40 border border-gray-700/30 hover:bg-gray-800/60"
                  }`}
                >
                  <div className="text-2xl font-black tabular-nums text-brand-light w-20 flex-shrink-0">
                    {sub.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xl font-bold">{sub.class}</span>
                      <span className={`text-xl font-bold ${sub.change === "Отменён" ? "text-red-400 line-through" : "text-white"}`}>
                        {sub.subject}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-base">
                      <span className="text-gray-400">{sub.teacher}</span>
                      <span className="text-gray-600">·</span>
                      <span className="text-gray-400">каб. {sub.room}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 ${
                    sub.change === "Отменён"
                      ? "bg-red-500/20 text-red-400"
                      : sub.change.includes("Замена")
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-blue-500/10 text-blue-400"
                  }`}>
                    {sub.change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900/50 rounded-3xl border border-gray-800/50 p-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
              <span className="text-amber-400">👑</span>
              Топ учеников дня
            </h2>
            <div className="space-y-4">
              {topStudentsKiosk.map((s, i) => (
                <div
                  key={s.name}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    i === 0
                      ? "bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20"
                      : "bg-gray-800/40 border border-gray-700/30"
                  }`}
                >
                  <div className="text-4xl flex-shrink-0 w-12 text-center">
                    {getCup(i)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-3xl">{s.avatar}</span>
                      <div>
                        <div className="text-lg font-bold truncate">{s.name}</div>
                        <div className="text-sm text-gray-500">Класс {s.grade}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-2xl font-black ${getMMRTextColorKiosk(s.mmr)}`}>
                      {s.mmr}
                    </div>
                    <div className="text-xs text-gray-500">MMR</div>
                    <div className="text-sm text-gray-400 mt-1">GPA {s.gpa}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-3xl border border-gray-800/50 p-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
              <span className="text-brand-light">🕐</span>
              Расписание на сегодня
            </h2>
            <div className="space-y-2">
              {schedule.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 border border-gray-700/20">
                  <div className="text-base font-mono text-gray-400 w-28 flex-shrink-0">{s.time}</div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold">{s.subject}</div>
                    <div className="text-sm text-gray-500">{s.teacher} · каб. {s.room}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
