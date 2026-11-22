import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { INITIAL_DB } from "@/data/seed";
import { EOfficeDatabase } from "@/types/eoffice";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "eoffice-db.json");

function readDb(): EOfficeDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), "utf-8");
      return INITIAL_DB;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw) as EOfficeDatabase;
  } catch {
    return INITIAL_DB;
  }
}

function writeDb(data: EOfficeDatabase) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const db = readDb();
  return NextResponse.json(db);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body?.action === "RESET") {
      writeDb(INITIAL_DB);
      return NextResponse.json(INITIAL_DB);
    }
    if (body?.db) {
      writeDb(body.db as EOfficeDatabase);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
