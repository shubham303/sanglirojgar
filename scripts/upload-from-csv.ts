/**
 * Script to upload jobs from a reviewed CSV file to the mahajob.in API.
 *
 * Usage:
 *   npx tsx scripts/upload-from-csv.ts [csv-path]
 *
 * Default CSV path: fb-ads/jobs-to-review.csv
 *
 * CSV columns:
 *   employer_name,phone,job_type_id,district,taluka,salary,description,minimum_education,experience_years,workers_needed
 */

import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

const API_URL = "https://www.mahajob.in/api/jobs";

/**
 * Parse a CSV line, handling quoted fields with commas and escaped quotes.
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        fields.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  fields.push(current);

  return fields;
}

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? "";
    }
    rows.push(row);
  }

  return rows;
}

async function postJob(data: Record<string, unknown>): Promise<{ ok: boolean; status: number; body: unknown }> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  return { ok: res.ok, status: res.status, body };
}

async function main() {
  const csvPath = path.resolve(process.argv[2] || "fb-ads/jobs-to-review.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCsv(content);

  if (rows.length === 0) {
    console.error("No data rows found in CSV");
    process.exit(1);
  }

  console.log(`Found ${rows.length} jobs in ${csvPath}\n`);

  let posted = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const label = `[${i + 1}/${rows.length}] ${row.employer_name} — job_type_id=${row.job_type_id}`;

    // Convert numeric fields
    const data: Record<string, unknown> = { ...row };
    if (data.workers_needed) {
      data.workers_needed = Number(data.workers_needed) || 1;
    }
    if (data.job_type_id) {
      data.job_type_id = Number(data.job_type_id);
    }
    // Remove empty optional fields
    for (const key of ["description", "minimum_education", "experience_years", "salary"]) {
      if (!data[key]) delete data[key];
    }

    try {
      const result = await postJob(data);
      if (result.ok) {
        console.log(`  OK  ${label}`);
        posted++;
      } else {
        console.log(`  FAIL ${label} — ${result.status}: ${JSON.stringify(result.body)}`);
        failed++;
      }
    } catch (err) {
      console.log(`  ERR  ${label} — ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Posted: ${posted} | Failed: ${failed} | Total: ${rows.length}`);
}

main();
