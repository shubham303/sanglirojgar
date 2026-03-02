/**
 * One-time script to fix job_type_id values in the jobs table.
 *
 * Problem: jobs.job_type_id doesn't match job_types.id — so all jobs display as "इतर (Other)".
 * Fix: Read the text in jobs.job_type column, extract the English name from brackets,
 *       find the closest match in job_types.name_en, and update job_type_id.
 *
 * Usage:
 *   npx tsx scripts/fix-job-type-ids.ts          # dry run (shows what would change)
 *   npx tsx scripts/fix-job-type-ids.ts --apply   # actually update the DB
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const dryRun = !process.argv.includes("--apply");

/** Extract English text from a bilingual string like "सेल्समन (Salesman)" */
function extractEnglish(text: string): string {
  const match = text.match(/\(([^)]+)\)\s*$/);
  return match ? match[1].trim() : text.trim();
}

/** Manual mapping for known synonyms that don't match automatically */
const MANUAL_EN_MAP: Record<string, string> = {
  "accounts assistant": "Accountant",
};

/** Simple similarity: lowercase match, then starts-with, then includes */
function findBestMatch(
  englishText: string,
  jobTypes: { id: number; name_mr: string; name_en: string }[]
): { id: number; name_mr: string; name_en: string } | null {
  const needle = englishText.toLowerCase().trim();
  if (!needle) return null;

  // Check manual mapping first
  const mapped = MANUAL_EN_MAP[needle];
  if (mapped) {
    const manual = jobTypes.find((jt) => jt.name_en.toLowerCase() === mapped.toLowerCase());
    if (manual) return manual;
  }

  // Exact match on name_en (case-insensitive)
  const exact = jobTypes.find((jt) => jt.name_en.toLowerCase() === needle);
  if (exact) return exact;

  // Exact match on name_mr
  const exactMr = jobTypes.find((jt) => jt.name_mr.toLowerCase() === needle);
  if (exactMr) return exactMr;

  // Starts-with match
  const startsWith = jobTypes.find(
    (jt) =>
      jt.name_en.toLowerCase().startsWith(needle) ||
      needle.startsWith(jt.name_en.toLowerCase())
  );
  if (startsWith) return startsWith;

  // Contains match
  const contains = jobTypes.find(
    (jt) =>
      jt.name_en.toLowerCase().includes(needle) ||
      needle.includes(jt.name_en.toLowerCase())
  );
  if (contains) return contains;

  return null;
}

async function main() {
  console.log(dryRun ? "=== DRY RUN (pass --apply to update DB) ===\n" : "=== APPLYING CHANGES ===\n");

  // 1. Fetch all job types from DB
  const { data: jobTypes, error: jtErr } = await supabase
    .from("job_types")
    .select("id, name_mr, name_en")
    .order("id", { ascending: true });

  if (jtErr || !jobTypes) {
    console.error("Failed to fetch job_types:", jtErr?.message);
    process.exit(1);
  }

  console.log(`Job types in DB (${jobTypes.length}):`);
  for (const jt of jobTypes) {
    console.log(`  id=${jt.id}  ${jt.name_mr} (${jt.name_en})`);
  }
  console.log();

  // 2. Fetch all jobs — include job_type column if it exists
  const { data: jobs, error: jobsErr } = await supabase
    .from("jobs")
    .select("id, job_type_id, job_type, employer_name")
    .order("created_at", { ascending: true });

  if (jobsErr) {
    // If job_type column doesn't exist, try without it
    console.log("Note: Could not fetch job_type column, trying without it...\n");
    const { data: jobs2, error: jobsErr2 } = await supabase
      .from("jobs")
      .select("id, job_type_id, employer_name")
      .order("created_at", { ascending: true });

    if (jobsErr2 || !jobs2) {
      console.error("Failed to fetch jobs:", jobsErr2?.message);
      process.exit(1);
    }

    // Without the text column, show current state and exit
    console.log(`Jobs (${jobs2.length}):`);
    const idCounts = new Map<number, number>();
    for (const j of jobs2) {
      idCounts.set(j.job_type_id, (idCounts.get(j.job_type_id) || 0) + 1);
    }
    console.log("\nCurrent job_type_id distribution:");
    for (const [id, count] of [...idCounts.entries()].sort((a, b) => b[1] - a[1])) {
      const jt = jobTypes.find((t) => t.id === id);
      console.log(`  id=${id} → ${jt ? `${jt.name_mr} (${jt.name_en})` : "NOT FOUND IN job_types"} — ${count} jobs`);
    }
    console.log("\nNo job_type text column found. Cannot auto-fix. You may need to update IDs manually.");
    process.exit(0);
  }

  if (!jobs || jobs.length === 0) {
    console.log("No jobs found.");
    process.exit(0);
  }

  console.log(`Found ${jobs.length} jobs. Checking each...\n`);

  let needsFix = 0;
  let alreadyCorrect = 0;
  let noMatch = 0;
  let updated = 0;

  for (const job of jobs) {
    const jobTypeText = (job as Record<string, unknown>).job_type as string | undefined;

    if (!jobTypeText) {
      // No text column value — check if current ID is valid
      const currentType = jobTypes.find((jt) => jt.id === job.job_type_id);
      if (currentType) {
        alreadyCorrect++;
      } else {
        console.log(`  ? Job ${job.id} (${job.employer_name}): job_type_id=${job.job_type_id} — NOT in job_types table, no text to match`);
        noMatch++;
      }
      continue;
    }

    // Extract English name from text like "सेल्समन (Salesman)"
    const englishName = extractEnglish(jobTypeText);
    const bestMatch = findBestMatch(englishName, jobTypes);

    // Also try matching the full text or Marathi part
    const marathiName = jobTypeText.replace(/\s*\(.*\)$/, "").trim();
    const marathiMatch = !bestMatch ? findBestMatch(marathiName, jobTypes) : null;
    const finalMatch = bestMatch || marathiMatch;

    if (!finalMatch) {
      console.log(`  ✗ Job ${job.id} (${job.employer_name}): "${jobTypeText}" — NO MATCH FOUND`);
      noMatch++;
      continue;
    }

    if (job.job_type_id === finalMatch.id) {
      alreadyCorrect++;
      continue;
    }

    const currentType = jobTypes.find((jt) => jt.id === job.job_type_id);
    console.log(
      `  → Job ${job.id} (${job.employer_name}): "${jobTypeText}" — ` +
      `id ${job.job_type_id} (${currentType?.name_en || "?"}) → ${finalMatch.id} (${finalMatch.name_en})`
    );
    needsFix++;

    if (!dryRun) {
      const { error: updateErr } = await supabase
        .from("jobs")
        .update({ job_type_id: finalMatch.id })
        .eq("id", job.id);

      if (updateErr) {
        console.log(`    ERROR updating: ${updateErr.message}`);
      } else {
        updated++;
      }
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total jobs:      ${jobs.length}`);
  console.log(`Already correct: ${alreadyCorrect}`);
  console.log(`Needs fix:       ${needsFix}`);
  console.log(`No match found:  ${noMatch}`);
  if (!dryRun) {
    console.log(`Updated:         ${updated}`);
  } else if (needsFix > 0) {
    console.log(`\nRun with --apply to update the DB.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
