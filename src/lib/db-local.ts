import { Pool } from "pg";
import { randomUUID } from "crypto";
import { DbClient, JobFilters, PaginatedJobs } from "./db";
import { Job, JobType } from "./types";
import { JOB_TYPES } from "./constants";

let _pool: Pool | null = null;
let _initialized = false;

function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString:
        process.env.DATABASE_URL || "postgresql://localhost:5432/sanglirojgar",
    });
  }
  return _pool;
}

async function ensureTablesExist() {
  if (_initialized) return;
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      employer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      job_type TEXT NOT NULL,
      taluka TEXT NOT NULL,
      salary TEXT NOT NULL,
      description TEXT DEFAULT '',
      minimum_education TEXT DEFAULT NULL,
      experience_years TEXT DEFAULT NULL,
      workers_needed INTEGER NOT NULL DEFAULT 1,
      call_count INTEGER NOT NULL DEFAULT 0,
      whatsapp_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      is_active BOOLEAN DEFAULT TRUE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS job_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Seed job_types from constants if table is empty
  const { rows } = await pool.query("SELECT COUNT(*) as cnt FROM job_types");
  if (parseInt(rows[0].cnt) === 0) {
    for (const name of JOB_TYPES) {
      await pool.query(
        "INSERT INTO job_types (id, name) VALUES ($1, $2)",
        [randomUUID(), name]
      );
    }
  }

  _initialized = true;
}

export function createLocalDb(): DbClient {
  return {
    async getActiveJobsPaginated(filters: JobFilters) {
      try {
        await ensureTablesExist();
        const pool = getPool();
        const conditions = ["is_active = TRUE"];
        const values: unknown[] = [];
        let paramIdx = 1;

        if (filters.job_type) {
          conditions.push(`job_type = $${paramIdx}`);
          values.push(filters.job_type);
          paramIdx++;
        }
        if (filters.taluka) {
          conditions.push(`taluka = $${paramIdx}`);
          values.push(filters.taluka);
          paramIdx++;
        }
        if (filters.search) {
          conditions.push(
            `(employer_name ILIKE $${paramIdx} OR description ILIKE $${paramIdx} OR job_type ILIKE $${paramIdx})`
          );
          values.push(`%${filters.search}%`);
          paramIdx++;
        }

        const where = conditions.join(" AND ");

        const countResult = await pool.query(
          `SELECT COUNT(*) as cnt FROM jobs WHERE ${where}`,
          values
        );
        const total = parseInt(countResult.rows[0].cnt);

        const offset = (filters.page - 1) * filters.limit;
        const dataValues = [...values, filters.limit, offset];
        const { rows } = await pool.query(
          `SELECT * FROM jobs WHERE ${where} ORDER BY created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
          dataValues
        );

        const result: PaginatedJobs = {
          jobs: rows as Job[],
          total,
          page: filters.page,
          limit: filters.limit,
          hasMore: offset + rows.length < total,
        };
        return { data: result, error: null };
      } catch (e: unknown) {
        return { data: null, error: (e as Error).message };
      }
    },

    async getJobById(id: string) {
      try {
        await ensureTablesExist();
        const { rows } = await getPool().query(
          "SELECT * FROM jobs WHERE id = $1",
          [id]
        );
        return { data: (rows[0] as Job) ?? null, error: null };
      } catch (e: unknown) {
        return { data: null, error: (e as Error).message };
      }
    },

    async createJob(job) {
      try {
        await ensureTablesExist();
        const id = randomUUID();
        const now = new Date().toISOString();
        await getPool().query(
          `INSERT INTO jobs (id, employer_name, phone, job_type, taluka, salary, description, minimum_education, experience_years, workers_needed, created_at, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            id,
            job.employer_name,
            job.phone,
            job.job_type,
            job.taluka,
            job.salary,
            job.description || "",
            job.minimum_education || null,
            job.experience_years || null,
            job.workers_needed,
            now,
            job.is_active,
          ]
        );
        const { rows } = await getPool().query(
          "SELECT * FROM jobs WHERE id = $1",
          [id]
        );
        return { data: rows[0] as Job, error: null };
      } catch (e: unknown) {
        return { data: null, error: (e as Error).message };
      }
    },

    async updateJob(id: string, job: Partial<Job>) {
      try {
        await ensureTablesExist();
        const fields: string[] = [];
        const values: unknown[] = [];
        let paramIdx = 1;

        for (const [key, value] of Object.entries(job)) {
          if (key === "id" || key === "created_at") continue;
          fields.push(`${key} = $${paramIdx}`);
          values.push(value);
          paramIdx++;
        }

        if (fields.length > 0) {
          values.push(id);
          await getPool().query(
            `UPDATE jobs SET ${fields.join(", ")} WHERE id = $${paramIdx}`,
            values
          );
        }

        const { rows } = await getPool().query(
          "SELECT * FROM jobs WHERE id = $1",
          [id]
        );
        return { data: (rows[0] as Job) ?? null, error: null };
      } catch (e: unknown) {
        return { data: null, error: (e as Error).message };
      }
    },

    async softDeleteJob(id: string) {
      try {
        await ensureTablesExist();
        await getPool().query(
          "UPDATE jobs SET is_active = FALSE WHERE id = $1",
          [id]
        );
        return { error: null };
      } catch (e: unknown) {
        return { error: (e as Error).message };
      }
    },

    async hardDeleteJob(id: string) {
      try {
        await ensureTablesExist();
        await getPool().query("DELETE FROM jobs WHERE id = $1", [id]);
        return { error: null };
      } catch (e: unknown) {
        return { error: (e as Error).message };
      }
    },

    async getActiveJobsByPhone(phone: string) {
      try {
        await ensureTablesExist();
        const { rows } = await getPool().query(
          "SELECT * FROM jobs WHERE phone = $1 AND is_active = TRUE ORDER BY created_at DESC",
          [phone]
        );
        return { data: rows as Job[], error: null };
      } catch (e: unknown) {
        return { data: null, error: (e as Error).message };
      }
    },

    async getAllJobsByPhone(phone: string) {
      try {
        await ensureTablesExist();
        const { rows } = await getPool().query(
          "SELECT * FROM jobs WHERE phone = $1 ORDER BY is_active DESC, created_at DESC",
          [phone]
        );
        return { data: rows as Job[], error: null };
      } catch (e: unknown) {
        return { data: null, error: (e as Error).message };
      }
    },

    async getJobTypes() {
      try {
        await ensureTablesExist();
        const { rows } = await getPool().query(
          "SELECT * FROM job_types ORDER BY created_at ASC"
        );
        return { data: rows as JobType[], error: null };
      } catch (e: unknown) {
        return { data: null, error: (e as Error).message };
      }
    },

    async addJobType(name: string) {
      try {
        await ensureTablesExist();
        const id = randomUUID();
        const now = new Date().toISOString();
        await getPool().query(
          "INSERT INTO job_types (id, name, created_at) VALUES ($1, $2, $3)",
          [id, name, now]
        );
        const { rows } = await getPool().query(
          "SELECT * FROM job_types WHERE id = $1",
          [id]
        );
        return { data: rows[0] as JobType, error: null };
      } catch (e: unknown) {
        const msg = (e as Error).message;
        if (msg.includes("unique") || msg.includes("duplicate")) {
          return { data: null, error: "हा कामाचा प्रकार आधीच अस्तित्वात आहे" };
        }
        return { data: null, error: msg };
      }
    },

    async incrementJobClick(id: string, field: "call_count" | "whatsapp_count") {
      try {
        await ensureTablesExist();
        await getPool().query(
          `UPDATE jobs SET ${field} = ${field} + 1 WHERE id = $1`,
          [id]
        );
        return { error: null };
      } catch (e: unknown) {
        return { error: (e as Error).message };
      }
    },

    async deleteJobType(id: string) {
      try {
        await ensureTablesExist();
        const pool = getPool();

        // Get the type name
        const { rows: typeRows } = await pool.query(
          "SELECT name FROM job_types WHERE id = $1",
          [id]
        );
        if (typeRows.length === 0) {
          return { error: "कामाचा प्रकार सापडला नाही" };
        }

        // Check if any active jobs use this type
        const { rows: countRows } = await pool.query(
          "SELECT COUNT(*) as cnt FROM jobs WHERE job_type = $1 AND is_active = TRUE",
          [typeRows[0].name]
        );
        const count = parseInt(countRows[0].cnt);
        if (count > 0) {
          return {
            error: `हा प्रकार काढता येणार नाही — ${count} जाहिरात(ती) या प्रकारात आहेत`,
          };
        }

        await pool.query("DELETE FROM job_types WHERE id = $1", [id]);
        return { error: null };
      } catch (e: unknown) {
        return { error: (e as Error).message };
      }
    },
  };
}
