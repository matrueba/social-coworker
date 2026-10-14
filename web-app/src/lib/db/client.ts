import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'data', 'social-copilot.db')

/** Baseline schema (version 0). Later changes live in MIGRATIONS below. */
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS reports (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    client_name TEXT NOT NULL,
    notes       TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'Pendiente'
                CHECK (status IN ('Pendiente', 'En Progreso', 'Completo')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);

  CREATE TABLE IF NOT EXISTS visits (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name        TEXT NOT NULL,
    visit_date         TEXT NOT NULL,
    interview_notes    TEXT NOT NULL,
    socioeconomic_data TEXT NOT NULL,
    life_history       TEXT NOT NULL,
    created_at         TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_visits_date ON visits (visit_date DESC, id DESC);
`

/**
 * Incremental schema changes. Each entry runs once, in order, inside a transaction;
 * the applied count is tracked with `PRAGMA user_version`. Never edit or reorder
 * existing entries: append new ones.
 */
const MIGRATIONS: ((db: Database.Database) => void)[] = [
  // 1: structured report content (7 sections, JSON) + optional link to the source visit
  (db) => {
    db.exec(`
      ALTER TABLE reports ADD COLUMN content TEXT NOT NULL DEFAULT '{}';
      ALTER TABLE reports ADD COLUMN visit_id INTEGER REFERENCES visits(id) ON DELETE SET NULL;
      UPDATE reports SET content = json_object('caseSummary', notes);
      ALTER TABLE reports DROP COLUMN notes;
      CREATE INDEX IF NOT EXISTS idx_reports_visit ON reports (visit_id);
    `)
  },
  // 2: AI drafts. A report with confirmed_at IS NULL is a draft pending human review
  (db) => {
    db.exec(`
      ALTER TABLE reports ADD COLUMN source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai'));
      ALTER TABLE reports ADD COLUMN confirmed_at TEXT;
      UPDATE reports SET confirmed_at = created_at;
    `)
  },
]

function migrate(db: Database.Database): void {
  db.exec(SCHEMA)
  const current = db.pragma('user_version', { simple: true }) as number
  for (let version = current; version < MIGRATIONS.length; version++) {
    db.transaction(() => {
      MIGRATIONS[version](db)
      db.pragma(`user_version = ${version + 1}`)
    })()
  }
}

const globalForDb = globalThis as unknown as { db?: Database.Database }

// Module-level flag: resets on hot reload so schema changes apply without restarting the dev server
let migrated = false

function createDb(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  return db
}

/** Singleton SQLite connection (survives Next.js hot reloads in dev). */
export function getDb(): Database.Database {
  if (!globalForDb.db) globalForDb.db = createDb()
  if (!migrated) {
    migrate(globalForDb.db)
    migrated = true
  }
  return globalForDb.db
}
