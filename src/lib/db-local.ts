import { Pool } from "pg";
import { randomUUID } from "crypto";
import { AdminJobFilters, DbClient, JobFilters, PaginatedJobs } from "./db";
import { Job, JobType } from "./types";
import { JOB_TYPES, getJobTypeLabel } from "./constants";

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

/** Cached job type lookup from DB, refreshed on first use per server lifetime */
let _jobTypeLabelMap: Map<number, string> | null = null;

async function getJobTypeLabelMap(): Promise<Map<number, string>> {
  if (_jobTypeLabelMap) return _jobTypeLabelMap;
  const pool = getPool();
  const { rows } = await pool.query("SELECT id, name_mr, name_en FROM job_types ORDER BY id ASC");
  _jobTypeLabelMap = new Map<number, string>();
  for (const jt of rows as JobType[]) {
    _jobTypeLabelMap.set(jt.id, `${jt.name_mr} (${jt.name_en})`);
  }
  return _jobTypeLabelMap;
}

function invalidateJobTypeLabelMap() {
  _jobTypeLabelMap = null;
}

/** Resolve job_type_display from DB-backed map, falling back to constants */
function resolveJobTypeDisplay(labelMap: Map<number, string>, jobTypeId: number): string {
  return labelMap.get(jobTypeId) || getJobTypeLabel(jobTypeId);
}

function addJobTypeDisplay(labelMap: Map<number, string>, row: Job): Job {
  return { ...row, job_type_display: resolveJobTypeDisplay(labelMap, row.job_type_id) };
}

function addJobTypeDisplayToList(labelMap: Map<number, string>, rows: Job[]): Job[] {
  return rows.map((r) => addJobTypeDisplay(labelMap, r));
}

async function ensureTablesExist() {
  if (_initialized) return;
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS job_types (
      id INTEGER PRIMARY KEY,
      name_mr TEXT NOT NULL UNIQUE,
      name_en TEXT NOT NULL
    )
  `);

  // Seed job_types from constants if table is empty
  const { rows: jtRows } = await pool.query("SELECT COUNT(*) as cnt FROM job_types");
  if (parseInt(jtRows[0].cnt) === 0) {
    for (const jt of JOB_TYPES) {
      await pool.query(
        "INSERT INTO job_types (id, name_mr, name_en) VALUES ($1, $2, $3)",
        [jt.id, jt.marathi, jt.english]
      );
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      employer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      job_type_id INTEGER NOT NULL REFERENCES job_types(id),
      state TEXT NOT NULL DEFAULT 'महाराष्ट्र',
      district TEXT NOT NULL DEFAULT 'सांगली',
      taluka TEXT NOT NULL,
      salary TEXT NOT NULL,
      description TEXT DEFAULT '',
      minimum_education TEXT DEFAULT NULL,
      experience_years TEXT DEFAULT NULL,
      workers_needed INTEGER NOT NULL DEFAULT 1,
      gender TEXT NOT NULL DEFAULT 'both',
      call_count INTEGER NOT NULL DEFAULT 0,
      whatsapp_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      is_active BOOLEAN DEFAULT TRUE
    )
  `);

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

        if (filters.job_type_id) {
          conditions.push(`job_type_id = $${paramIdx}`);
          values.push(filters.job_type_id);
          paramIdx++;
        }
        if (filters.district) {
          conditions.push(`district = $${paramIdx}`);
          values.push(filters.district);
          paramIdx++;
        }
        if (filters.taluka) {
          conditions.push(`taluka = $${paramIdx}`);
          values.push(filters.taluka);
          paramIdx++;
        }
        if (filters.search) {
          conditions.push(
            `(employer_name ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`
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

        const labelMap = await getJobTypeLabelMap();
        const result: PaginatedJobs = {
          jobs: addJobTypeDisplayToList(labelMap, rows as Job[]),
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

    async getAllJobsPaginated(filters: AdminJobFilters) {
      try {
        await ensureTablesExist();
        const pool = getPool();
        const conditions: string[] = [];
        const values: unknown[] = [];
        let paramIdx = 1;

        if (filters.is_active !== undefined) {
          conditions.push(`is_active = $${paramIdx}`);
          values.push(filters.is_active);
          paramIdx++;
        }
        if (filters.phone) {
          conditions.push(`phone = $${paramIdx}`);
          values.push(filters.phone);
          paramIdx++;
        }
        if (filters.job_type_id) {
          conditions.push(`job_type_id = $${paramIdx}`);
          values.push(filters.job_type_id);
          paramIdx++;
        }
        if (filters.district) {
          conditions.push(`district = $${paramIdx}`);
          values.push(filters.district);
          paramIdx++;
        }
        if (filters.taluka) {
          conditions.push(`taluka = $${paramIdx}`);
          values.push(filters.taluka);
          paramIdx++;
        }
        if (filters.search) {
          conditions.push(
            `(employer_name ILIKE $${paramIdx} OR description ILIKE $${paramIdx} OR phone ILIKE $${paramIdx})`
          );
          values.push(`%${filters.search}%`);
          paramIdx++;
        }

        const where = conditions.length > 0 ? conditions.join(" AND ") : "TRUE";

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

        const labelMap = await getJobTypeLabelMap();
        const result: PaginatedJobs = {
          jobs: addJobTypeDisplayToList(labelMap, rows as Job[]),
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
        if (!rows[0]) return { data: null, error: null };
        const labelMap = await getJobTypeLabelMap();
        return { data: addJobTypeDisplay(labelMap, rows[0] as Job), error: null };
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
          `INSERT INTO jobs (id, employer_name, phone, job_type_id, state, district, taluka, salary, description, minimum_education, experience_years, workers_needed, gender, created_at, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            id,
            job.employer_name,
            job.phone,
            job.job_type_id,
            job.state,
            job.district,
            job.taluka,
            job.salary,
            job.description || "",
            job.minimum_education || null,
            job.experience_years || null,
            job.workers_needed,
            job.gender || "both",
            now,
            job.is_active,
          ]
        );
        const { rows } = await getPool().query(
          "SELECT * FROM jobs WHERE id = $1",
          [id]
        );
        const labelMap = await getJobTypeLabelMap();
        return { data: addJobTypeDisplay(labelMap, rows[0] as Job), error: null };
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
          if (key === "id" || key === "created_at" || key === "job_type_display") continue;
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
        if (!rows[0]) return { data: null, error: null };
        const labelMap = await getJobTypeLabelMap();
        return { data: addJobTypeDisplay(labelMap, rows[0] as Job), error: null };
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
        const labelMap = await getJobTypeLabelMap();
        return { data: addJobTypeDisplayToList(labelMap, rows as Job[]), error: null };
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
        const labelMap = await getJobTypeLabelMap();
        return { data: addJobTypeDisplayToList(labelMap, rows as Job[]), error: null };
      } catch (e: unknown) {
        return { data: null, error: (e as Error).message };
      }
    },

    async getJobTypes() {
      try {
        await ensureTablesExist();
        const { rows } = await getPool().query(
          "SELECT * FROM job_types ORDER BY id ASC"
        );
        return { data: rows as JobType[], error: null };
      } catch (e: unknown) {
        return { data: null, error: (e as Error).message };
      }
    },

    async addJobType(name: string) {
      try {
        await ensureTablesExist();
        // Find max ID and add 1
        const { rows: maxRows } = await getPool().query(
          "SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM job_types"
        );
        const nextId = parseInt(maxRows[0].next_id);
        await getPool().query(
          "INSERT INTO job_types (id, name_mr, name_en) VALUES ($1, $2, $3)",
          [nextId, name, name]
        );
        const { rows } = await getPool().query(
          "SELECT * FROM job_types WHERE id = $1",
          [nextId]
        );
        invalidateJobTypeLabelMap();
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

    async getEmployers() {
      try {
        await ensureTablesExist();
        const { rows } = await getPool().query(
          `SELECT phone,
             (SELECT employer_name FROM jobs j2 WHERE j2.phone = j1.phone ORDER BY created_at ASC LIMIT 1) as employer_name,
             COUNT(*) as job_count
           FROM jobs j1
           GROUP BY phone
           ORDER BY MAX(created_at) DESC`
        );
        const employers: import("./types").Employer[] = rows.map((r) => ({
          phone: r.phone,
          employer_name: r.employer_name,
          job_count: parseInt(r.job_count),
        }));
        return { data: employers, error: null };
      } catch (e: unknown) {
        return { data: null, error: (e as Error).message };
      }
    },

    async deleteJobType(id: string) {
      try {
        await ensureTablesExist();
        const pool = getPool();
        const numericId = parseInt(id);

        // Check if any active jobs use this type
        const { rows: countRows } = await pool.query(
          "SELECT COUNT(*) as cnt FROM jobs WHERE job_type_id = $1 AND is_active = TRUE",
          [numericId]
        );
        const count = parseInt(countRows[0].cnt);
        if (count > 0) {
          return {
            error: `हा प्रकार काढता येणार नाही — ${count} जाहिरात(ती) या प्रकारात आहेत`,
          };
        }

        await pool.query("DELETE FROM job_types WHERE id = $1", [numericId]);
        invalidateJobTypeLabelMap();
        return { error: null };
      } catch (e: unknown) {
        return { error: (e as Error).message };
      }
    },
  };
}
