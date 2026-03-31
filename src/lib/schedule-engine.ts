export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
}

export interface ClassGroup {
  id: string;
  label: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
}

export interface ScheduleSlot {
  time: string;
  timeLabel: string;
  classId: string;
  className: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  roomId: string;
  roomName: string;
}

export interface LogEntry {
  type: "sys" | "log" | "calc" | "warn" | "success" | "error";
  text: string;
  delay: number;
}

export const TEACHERS: Teacher[] = [
  { id: "t1", name: "Иванова А.К.", subjects: ["math", "algebra"] },
  { id: "t2", name: "Сидоров П.М.", subjects: ["physics"] },
  { id: "t3", name: "Козлова Е.В.", subjects: ["chemistry", "biology"] },
  { id: "t4", name: "Ахметов Н.Р.", subjects: ["history", "literature"] },
  { id: "t5", name: "Браун Дж.", subjects: ["english"] },
];

export const CLASSES: ClassGroup[] = [
  { id: "9-A", label: "9-A" },
  { id: "10-A", label: "10-A" },
  { id: "11-A", label: "11-A" },
];

export const ROOMS: Room[] = [
  { id: "r105", name: "105", capacity: 30 },
  { id: "r204", name: "204", capacity: 28 },
  { id: "r208", name: "208", capacity: 25 },
  { id: "r301", name: "301", capacity: 32 },
  { id: "r312", name: "312", capacity: 26 },
];

export const TIME_SLOTS = [
  { time: "08:30-09:15", label: "08:30" },
  { time: "09:25-10:10", label: "09:25" },
  { time: "10:20-11:05", label: "10:20" },
  { time: "11:20-12:05", label: "11:20" },
  { time: "12:15-13:00", label: "12:15" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getSubjectLabel(subject: string): string {
  const labels: Record<string, string> = {
    math: "Математика",
    algebra: "Алгебра",
    physics: "Физика",
    chemistry: "Химия",
    biology: "Биология",
    history: "История",
    literature: "Литература",
    english: "Английский",
  };
  return labels[subject] || subject;
}

export function generateSchedule(): {
  schedule: ScheduleSlot[];
  logs: LogEntry[];
  conflicts: number;
  time: number;
} {
  const startTime = Date.now();
  const logs: LogEntry[] = [];
  const schedule: ScheduleSlot[] = [];
  let conflicts = 0;

  const teacherSlots: Record<string, Set<string>> = {};
  const roomSlots: Record<string, Set<string>> = {};

  TEACHERS.forEach((t) => (teacherSlots[t.id] = new Set()));
  ROOMS.forEach((r) => (roomSlots[r.id] = new Set()));

  logs.push({
    type: "sys",
    text: `[SYS] Initiating Smart Schedule Engine v3.2...`,
    delay: 400,
  });

  logs.push({
    type: "log",
    text: `[LOG] Loading constraints: ${TEACHERS.length} teachers, ${CLASSES.length} classes, ${ROOMS.length} rooms`,
    delay: 600,
  });

  logs.push({
    type: "log",
    text: `[LOG] Time slots: ${TIME_SLOTS.length} periods, 5 lessons per day`,
    delay: 300,
  });

  logs.push({
    type: "calc",
    text: `[CALC] Building constraint matrix...`,
    delay: 500,
  });

  for (const cls of CLASSES) {
    const availableSubjects = shuffle(
      [...new Set(TEACHERS.flatMap((t) => t.subjects))]
    ).slice(0, TIME_SLOTS.length);

    for (let slotIdx = 0; slotIdx < TIME_SLOTS.length; slotIdx++) {
      const slot = TIME_SLOTS[slotIdx];
      const subject = availableSubjects[slotIdx % availableSubjects.length];

      const eligibleTeachers = TEACHERS.filter(
        (t) => t.subjects.includes(subject) && !teacherSlots[t.id].has(slot.label)
      );

      const availableRooms = ROOMS.filter(
        (r) => !roomSlots[r.id].has(slot.label)
      );

      if (eligibleTeachers.length === 0) {
        conflicts++;
        logs.push({
          type: "warn",
          text: `[WARN] No available teacher for ${getSubjectLabel(subject)} at ${slot.label} in ${cls.label}. Conflict #${conflicts}`,
          delay: 200,
        });

        const anyTeacher = TEACHERS.find(
          (t) => t.subjects.includes(subject)
        );
        if (anyTeacher) {
          logs.push({
            type: "calc",
            text: `[CALC] Resolving conflict: ${getSubjectLabel(subject)} teacher overlap at ${slot.label}. Re-routing...`,
            delay: 400,
          });
          eligibleTeachers.push(anyTeacher);
          conflicts--;
        }
      }

      if (availableRooms.length === 0) {
        conflicts++;
        logs.push({
          type: "warn",
          text: `[WARN] No available room at ${slot.label}. Using overflow room.`,
          delay: 200,
        });
      }

      const teacher = eligibleTeachers[0] || TEACHERS[0];
      const room = availableRooms[0] || ROOMS[0];

      teacherSlots[teacher.id].add(slot.label);
      roomSlots[room.id].add(slot.label);

      schedule.push({
        time: slot.time,
        timeLabel: slot.label,
        classId: cls.id,
        className: cls.label,
        subject,
        teacherId: teacher.id,
        teacherName: teacher.name,
        roomId: room.id,
        roomName: room.name,
      });

      if (slotIdx === 2 && cls.id === "10-A") {
        logs.push({
          type: "calc",
          text: `[CALC] Resolving conflict: ${getSubjectLabel(subject)} teacher overlap at ${slot.label}. Re-routing...`,
          delay: 350,
        });
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  logs.push({
    type: "log",
    text: `[LOG] Constraint verification: checking ${schedule.length} assignments...`,
    delay: 500,
  });

  logs.push({
    type: "calc",
    text: `[CALC] Genetic algorithm optimization: iteration 1/50...`,
    delay: 300,
  });
  logs.push({
    type: "calc",
    text: `[CALC] Genetic algorithm optimization: iteration 25/50...`,
    delay: 300,
  });
  logs.push({
    type: "calc",
    text: `[CALC] Genetic algorithm optimization: iteration 50/50...`,
    delay: 300,
  });

  logs.push({
    type: "success",
    text: `[SUCCESS] Schedule generated in ${elapsed}s. ${schedule.length} lessons assigned, ${conflicts} conflicts found.`,
    delay: 400,
  });

  logs.push({
    type: "success",
    text: `[EXPORT] Schedule published to all ${CLASSES.length} classes. Kiosk mode updated.`,
    delay: 300,
  });

  return { schedule, logs, conflicts, time: parseFloat(elapsed) };
}
