import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "db.json");

function readDb() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  try {
    const db = readDb();
    return NextResponse.json({ ...db.gradebook, profiles: db.profiles || {} });
  } catch {
    return NextResponse.json({ error: "Failed to read gradebook" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, subject, studentId, columnId, value } = body;

    const db = readDb();

    if (!db.gradebook.grades[classId]?.[subject]) {
      return NextResponse.json({ error: "Invalid class/subject" }, { status: 400 });
    }

    if (!db.gradebook.grades[classId][subject][studentId]) {
      db.gradebook.grades[classId][subject][studentId] = {};
    }

    if (value === null) {
      delete db.gradebook.grades[classId][subject][studentId][columnId];
    } else {
      db.gradebook.grades[classId][subject][studentId][columnId] = value;
    }

    writeDb(db);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save grade" }, { status: 500 });
  }
}
