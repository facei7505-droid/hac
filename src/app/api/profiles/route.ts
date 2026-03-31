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
    return NextResponse.json(db.profiles || {});
  } catch {
    return NextResponse.json({ error: "Failed to read profiles" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const db = readDb();
    if (!db.profiles || !db.profiles[id]) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    db.profiles[id] = { ...db.profiles[id], ...updates };
    writeDb(db);

    return NextResponse.json({ success: true, profile: db.profiles[id] });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
