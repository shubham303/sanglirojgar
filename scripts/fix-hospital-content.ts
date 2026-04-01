/**
 * Fix: rebuild the `content` field for all hospital-tagged jobs
 * so that "Healthcare" and "Hospital" tags are searchable.
 *
 * Usage:
 *   npx tsx scripts/fix-hospital-content.ts
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) { console.error("Missing Supabase env vars"); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Same buildContentString logic as db-supabase.ts
function buildContentString(
  jobTypeContent: string,
  district: string,
  taluka: string,
  description: string,
  employerName: string,
  tags: string[] = []
): string {
  return [jobTypeContent, ...tags, district, taluka, description, employerName].filter(Boolean).join(" ");
}

async function main() {
  // Build job type content map (name_mr + name_en per job type)
  const { data: jobTypes, error: jtErr } = await supabase
    .from("job_types")
    .select("id, name_mr, name_en");

  if (jtErr || !jobTypes) { console.error("Failed to fetch job types:", jtErr); process.exit(1); }

  const jobTypeContentMap = new Map<number, string>();
  for (const jt of jobTypes) {
    jobTypeContentMap.set(jt.id, [jt.name_mr, jt.name_en].filter(Boolean).join(" "));
  }

  // Read job IDs from hospital_jobs.txt
  const idsPath = path.resolve(__dirname, "../hospital_jobs.txt");
  const ids = fs.readFileSync(idsPath, "utf-8").trim().split("\n").filter(Boolean);
  console.log(`Rebuilding content for ${ids.length} hospital jobs...\n`);

  let success = 0, failed = 0;

  for (const id of ids) {
    const { data: job, error: fetchErr } = await supabase
      .from("jobs")
      .select("id, job_type_id, district, taluka, description, employer_name, tags")
      .eq("id", id)
      .single();

    if (fetchErr || !job) {
      console.error(`✗ ${id}: fetch failed - ${fetchErr?.message}`);
      failed++;
      continue;
    }

    const jobTypeContent = jobTypeContentMap.get(job.job_type_id) || "";
    const content = buildContentString(
      jobTypeContent,
      job.district || "",
      job.taluka || "",
      job.description || "",
      job.employer_name || "",
      job.tags || []
    );

    const { error: updateErr } = await supabase
      .from("jobs")
      .update({ content })
      .eq("id", id);

    if (updateErr) {
      console.error(`✗ ${id}: update failed - ${updateErr.message}`);
      failed++;
    } else {
      console.log(`✓ ${id} content rebuilt`);
      success++;
    }
  }

  console.log(`\nDone: ${success} updated, ${failed} failed.`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
