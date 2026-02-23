import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import path from "path";
import { DbClient } from "./db";
import { Job } from "./types";

let _db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (!_db) {
    const dbPath = path.join(process.cwd(), "local.db");
    _db = new Database(dbPath);
    _db.pragma("journal_mode = WAL");

    // Auto-create table if it doesn't exist
    _db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        employer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        job_type TEXT NOT NULL,
        taluka TEXT NOT NULL,
        salary TEXT NOT NULL,
        description TEXT DEFAULT '',
        workers_needed INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        is_active INTEGER DEFAULT 1
      )
    `);
  }
  return _db;
}

// SQLite stores booleans as 0/1, convert to proper Job interface
function rowToJob(row: Record<string, unknown>): Job {
  return {
    ...row,
    is_active: row.is_active === 1,
  } as Job;
}

export function createLocalDb(): DbClient {
  return {
    async getActiveJobs() {
      try {
        const db = getDatabase();
        const rows = db
          .prepare("SELECT * FROM jobs WHERE is_active = 1 ORDER BY created_at DESC")
          .all() as Record<string, unknown>[];
        return { data: rows.map(rowToJob), error: null };
      } catch (e: unknown) {
        return { data: null, error: (e as Error).message };
      }
    },

    async getJobById(id: string) {
      try {
        const db = getDatabase();
        const row = db
          .prepare("SELECT * FROM jobs WHERE id = ?")
          .get(id) as Record<string, unknown> | undefined;
        return { data: row ? rowToJob(row) : null, error: null };
      } catch (e: unknown) {
        return { data: null, error: (e as Error).message };
      }
    },

    async createJob(job) {
      try {
        const db = getDatabase();
        const id = randomUUID();
        const now = new Date().toISOString();
        db.prepare(
          `INSERT INTO jobs (id, employer_name, phone, job_type, taluka, salary, description, workers_needed, created_at, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          id,
          job.employer_name,
          job.phone,
          job.job_type,
          job.taluka,
          job.salary,
          job.description || "",
          job.workers_needed,
          now,
          job.is_active ? 1 : 0
        );
        const row = db
          .prepare("SELECT * FROM jobs WHERE id = ?")
          .get(id) as Record<string, unknown>;
        return { data: rowToJob(row), error: null };
      } catch (e: unknown) {
        return { data: null, error: (e as Error).message };
      }
    },

    async updateJob(id: string, job: Partial<Job>) {
      try {
        const db = getDatabase();
        const fields: string[] = [];
        const values: unknown[] = [];

        for (const [key, value] of Object.entries(job)) {
          if (key === "id" || key === "created_at") continue;
          fields.push(`${key} = ?`);
          values.push(key === "is_active" ? (value ? 1 : 0) : value);
        }

        if (fields.length > 0) {
          values.push(id);
          db.prepare(
            `UPDATE jobs SET ${fields.join(", ")} WHERE id = ?`
          ).run(...values);
        }

        const row = db
          .prepare("SELECT * FROM jobs WHERE id = ?")
          .get(id) as Record<string, unknown> | undefined;
        return { data: row ? rowToJob(row) : null, error: null };
      } catch (e: unknown) {
        return { data: null, error: (e as Error).message };
      }
    },

    async softDeleteJob(id: string) {
      try {
        const db = getDatabase();
        db.prepare("UPDATE jobs SET is_active = 0 WHERE id = ?").run(id);
        return { error: null };
      } catch (e: unknown) {
        return { error: (e as Error).message };
      }
    },

    async getActiveJobsByPhone(phone: string) {
      try {
        const db = getDatabase();
        const rows = db
          .prepare(
            "SELECT * FROM jobs WHERE phone = ? AND is_active = 1 ORDER BY created_at DESC"
          )
          .all(phone) as Record<string, unknown>[];
        return { data: rows.map(rowToJob), error: null };
      } catch (e: unknown) {
        return { data: null, error: (e as Error).message };
      }
    },
  };
}
