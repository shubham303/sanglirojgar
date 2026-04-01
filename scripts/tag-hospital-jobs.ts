/**
 * Script to find all hospital/healthcare-related jobs and add
 * "Healthcare" and "Hospital" tags to them.
 *
 * Steps:
 * 1. Fetch all jobs from DB with their job type names
 * 2. Identify healthcare/hospital-related jobs by description + job type
 * 3. Save matching job IDs to hospital_jobs.txt
 * 4. Update each job's tags to include "Healthcare" and "Hospital"
 *
 * Usage:
 *   npx tsx scripts/tag-hospital-jobs.ts
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

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Keywords that indicate a healthcare/hospital-related job
const HEALTHCARE_KEYWORDS = [
  // English
  "hospital", "healthcare", "health care", "medical", "clinic", "nursing",
  "nurse", "doctor", "physician", "pharmacist", "pharmacy", "pathology",
  "lab technician", "laboratory", "x-ray", "xray", "radiology", "icu",
  "opd", "ot technician", "operation theatre", "ambulance", "paramedic",
  "physiotherapy", "physiotherapist", "dentist", "dental", "optometry",
  "optometrist", "ayurvedic", "homeopathic", "ward boy", "wardboy",
  "compounder", "receptionist hospital", "medical store", "medicine",
  "patient care", "health worker", "asha worker", "anm", "gnm", "bsc nursing",
  "mbbs", "bams", "bhms", "md ", "staff nurse", "sister", "matron",
  "surgeon", "anesthesia", "dialysis", "blood bank", "ot assistant",
  // Marathi
  "हॉस्पिटल", "रुग्णालय", "दवाखाना", "क्लिनिक", "नर्स", "नर्सिंग",
  "डॉक्टर", "वैद्यकीय", "फार्मसी", "फार्मासिस्ट", "औषधालय", "पॅथॉलॉजी",
  "लॅब टेक्निशियन", "एक्स-रे", "रेडिओलॉजी", "आयसीयू", "ओपीडी",
  "ऑपरेशन थिएटर", "रुग्णवाहिका", "फिजिओथेरपी", "दंतवैद्य", "आयुर्वेदिक",
  "होमिओपॅथिक", "वॉर्डबॉय", "वॉर्ड बॉय", "कंपाउंडर", "मेडिकल स्टोअर",
  "औषध", "रुग्ण सेवा", "आरोग्य सेवक", "आशा वर्कर", "स्टाफ नर्स",
  "डायलिसिस", "ब्लड बँक", "सर्जन", "भूलतज्ञ",
];

// Healthcare-related job type names (English)
const HEALTHCARE_JOB_TYPES = [
  "nurse", "nursing", "doctor", "pharmacist", "ward boy", "wardboy",
  "lab technician", "medical", "hospital", "healthcare", "paramedic",
  "physiotherapist", "compounder", "staff nurse", "ot technician",
  "x-ray technician", "pathologist", "dentist", "receptionist",
];

function isHealthcareJob(description: string, jobTypeName: string): boolean {
  const text = (description + " " + jobTypeName).toLowerCase();

  // Check healthcare keywords in description + job type
  for (const kw of HEALTHCARE_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) {
      return true;
    }
  }

  // Check if the job type itself is healthcare-related
  const jobTypeLower = jobTypeName.toLowerCase();
  for (const jt of HEALTHCARE_JOB_TYPES) {
    if (jobTypeLower.includes(jt)) {
      return true;
    }
  }

  return false;
}

async function main() {
  console.log("Fetching all jobs from database...\n");

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, description, tags, job_types(name_en, name_mr)")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error || !jobs) {
    console.error("Failed to fetch jobs:", error);
    process.exit(1);
  }

  console.log(`Total jobs fetched: ${jobs.length}\n`);

  // Step 1: Identify healthcare/hospital jobs
  const healthcareJobs: { id: string; jobType: string; description: string; existingTags: string[] }[] = [];

  for (const job of jobs) {
    const jobTypeEn = (job.job_types as unknown as { name_en: string; name_mr: string } | null)?.name_en || "";
    const jobTypeMr = (job.job_types as unknown as { name_en: string; name_mr: string } | null)?.name_mr || "";
    const description = job.description || "";

    if (isHealthcareJob(description, jobTypeEn + " " + jobTypeMr)) {
      healthcareJobs.push({
        id: job.id,
        jobType: jobTypeEn || jobTypeMr,
        description: description.substring(0, 100),
        existingTags: (job.tags as string[]) || [],
      });
    }
  }

  console.log(`Found ${healthcareJobs.length} healthcare/hospital-related jobs:\n`);

  // Print the list
  for (const job of healthcareJobs) {
    console.log(`  ${job.id} | ${job.jobType} | ${job.description}...`);
  }

  // Step 2: Save to hospital_jobs.txt
  const outputPath = path.resolve(__dirname, "../hospital_jobs.txt");
  const fileContent = healthcareJobs.map((j) => j.id).join("\n");
  fs.writeFileSync(outputPath, fileContent, "utf-8");
  console.log(`\nSaved ${healthcareJobs.length} job IDs to hospital_jobs.txt\n`);

  // Step 3: Update each job to include "Healthcare" and "Hospital" tags
  const TAGS_TO_ADD = ["Healthcare", "Hospital"];
  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const job of healthcareJobs) {
    // Merge new tags with existing, avoiding duplicates
    const existingTags = job.existingTags;
    const newTags = [...new Set([...existingTags, ...TAGS_TO_ADD])];

    // Skip if already has both tags
    if (existingTags.includes("Healthcare") && existingTags.includes("Hospital")) {
      console.log(`— ${job.id} skipped (already has both tags)`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("jobs")
      .update({ tags: newTags })
      .eq("id", job.id);

    if (updateError) {
      console.error(`✗ ${job.id}: ${updateError.message}`);
      failed++;
    } else {
      console.log(`✓ ${job.id} [${job.jobType}] → tags: [${newTags.join(", ")}]`);
      success++;
    }
  }

  console.log(`\nDone: ${success} updated, ${skipped} skipped, ${failed} failed out of ${healthcareJobs.length} healthcare jobs.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
