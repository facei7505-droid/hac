import type { Substitution, ScheduleEntry } from "@/types";

export const substitutions: Substitution[] = [
  { time: "08:30", class: "10-A", subject: "math", teacher: "Иванова А.К.", room: "204", change: "Замена: Петров → Иванова" },
  { time: "09:20", class: "9-Б", subject: "physics", teacher: "Сидоров П.М.", room: "312", change: "Кабинет: 115 → 312" },
  { time: "10:15", class: "11-А", subject: "chemistry", teacher: "Козлова Е.В.", room: "208", change: "Замена: Мухамедьярова → Козлова" },
  { time: "11:00", class: "8-В", subject: "history", teacher: "Ахметов Н.Р.", room: "105", change: "kiosk.cancelled" },
  { time: "11:50", class: "10-Б", subject: "english", teacher: "Браун Дж.", room: "301", change: "Замена: Уильямс → Браун" },
  { time: "12:40", class: "7-А", subject: "biology", teacher: "Турсунова Г.М.", room: "210", change: "Кабинет: 205 → 210" },
  { time: "13:30", class: "11-Б", subject: "cs", teacher: "Кенжебаев А.Т.", room: "401", change: "Замена: Сатпаев → Кенжебаев" },
  { time: "14:20", class: "9-А", subject: "literature", teacher: "Нурланова С.К.", room: "108", change: "Замена: Ермекова → Нурланова" },
  { time: "15:10", class: "8-А", subject: "geography", teacher: "Омаров Д.С.", room: "203", change: "Кабинет: 301 → 203" },
  { time: "16:00", class: "7-Б", subject: "music", teacher: "Асанова Р.Н.", room: "Музыкальный", change: "Замена: Жумабаева → Асанова" },
];

export const schedule: ScheduleEntry[] = [
  { time: "08:30 - 09:15", subject: "math", teacher: "Иванова А.К.", room: "204" },
  { time: "09:25 - 10:10", subject: "physics", teacher: "Сидоров П.М.", room: "312" },
  { time: "10:20 - 11:05", subject: "chemistry", teacher: "Козлова Е.В.", room: "208" },
  { time: "11:20 - 12:05", subject: "history", teacher: "Ахметов Н.Р.", room: "105" },
  { time: "12:15 - 13:00", subject: "english", teacher: "Браун Дж.", room: "301" },
];
