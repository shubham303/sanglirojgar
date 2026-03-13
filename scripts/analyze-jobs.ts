/**
 * Script to analyze all jobs and recommend job type + industry changes.
 *
 * Fetches all jobs, job types, and industries from Supabase,
 * then outputs a CSV for manual review.
 *
 * Usage:
 *   npx tsx scripts/analyze-jobs.ts
 *
 * Output: scripts/job-analysis.csv
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
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or key in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface JobRow {
  id: string;
  job_type_id: number;
  description: string;
  salary: string;
  district: string;
  taluka: string;
  is_active: boolean;
  is_deleted: boolean;
  employers: { name: string } | null;
}

interface JobTypeRow {
  id: number;
  name_mr: string;
  name_en: string;
  industry_id: number;
}

interface IndustryRow {
  id: number;
  name_mr: string;
  name_en: string;
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

async function fetchAll<T>(table: string, select: string): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + batchSize - 1);
    if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...(data as T[]));
    if (data.length < batchSize) break;
    from += batchSize;
  }
  return all;
}

async function main() {
  console.log("Fetching industries...");
  const industries = await fetchAll<IndustryRow>("industries", "id, name_mr, name_en");
  const industryMap = new Map(industries.map((i) => [i.id, i]));
  console.log(`  Found ${industries.length} industries`);

  console.log("Fetching job types...");
  const jobTypes = await fetchAll<JobTypeRow>("job_types", "id, name_mr, name_en, industry_id");
  const jobTypeMap = new Map(jobTypes.map((jt) => [jt.id, jt]));
  console.log(`  Found ${jobTypes.length} job types`);

  console.log("Fetching jobs...");
  const jobs = await fetchAll<JobRow>("jobs", "id, job_type_id, description, salary, district, taluka, is_active, is_deleted, employers(name)");
  console.log(`  Found ${jobs.length} total jobs`);

  // Print current industries for reference
  console.log("\n--- Current Industries ---");
  for (const ind of industries) {
    const count = jobTypes.filter((jt) => jt.industry_id === ind.id).length;
    console.log(`  [${ind.id}] ${ind.name_mr} (${ind.name_en}) — ${count} job types`);
  }

  console.log("\n--- Current Job Types ---");
  for (const jt of jobTypes) {
    const ind = industryMap.get(jt.industry_id);
    const indName = ind ? ind.name_en : "Unknown";
    console.log(`  [${jt.id}] ${jt.name_mr} (${jt.name_en}) — Industry: ${indName}`);
  }

  // Build CSV
  const header = [
    "id",
    "employer",
    "district",
    "taluka",
    "description",
    "salary",
    "is_active",
    "current_job_type_id",
    "current_job_type",
    "current_industry",
    "recommended_job_type",
    "recommended_industry",
    "notes",
  ].join(",");

  const rows: string[] = [header];

  for (const job of jobs) {
    if (job.is_deleted) continue;

    const jt = jobTypeMap.get(job.job_type_id);
    const currentJobType = jt ? `${jt.name_en}` : `Unknown (id:${job.job_type_id})`;
    const currentIndustry = jt ? (industryMap.get(jt.industry_id)?.name_en || "Unknown") : "Unknown";
    const employerName = job.employers?.name || "";
    const desc = (job.description || "").replace(/\s+/g, " ").trim();

    // Analyze and recommend
    const { recommendedJobType, recommendedIndustry, notes } = analyzeJob(
      desc,
      job.salary,
      currentJobType,
      currentIndustry,
      employerName
    );

    rows.push(
      [
        escapeCsv(job.id),
        escapeCsv(employerName),
        escapeCsv(job.district),
        escapeCsv(job.taluka),
        escapeCsv(desc.substring(0, 200)),
        escapeCsv(job.salary || ""),
        job.is_active ? "yes" : "no",
        String(job.job_type_id),
        escapeCsv(currentJobType),
        escapeCsv(currentIndustry),
        escapeCsv(recommendedJobType),
        escapeCsv(recommendedIndustry),
        escapeCsv(notes),
      ].join(",")
    );
  }

  const outPath = path.resolve(__dirname, "job-analysis.csv");
  fs.writeFileSync(outPath, rows.join("\n"), "utf-8");
  console.log(`\nCSV written to: ${outPath}`);
  console.log(`Total rows (excluding deleted): ${rows.length - 1}`);
}

/**
 * Rule-based analysis to recommend job type and industry.
 * Checks description and existing assignment for mismatches.
 */
function analyzeJob(
  description: string,
  salary: string,
  currentJobType: string,
  currentIndustry: string,
  employer: string
): { recommendedJobType: string; recommendedIndustry: string; notes: string } {
  const desc = (description + " " + (salary || "")).toLowerCase();
  const emp = employer.toLowerCase();
  const allText = desc + " " + emp;

  // Default: keep current
  let recommendedJobType = "OK";
  let recommendedIndustry = "OK";
  let notes = "";

  // ---- INDUSTRY DETECTION ----

  // Airport / Aviation
  if (match(allText, ["airport", "aviation", "airline", "flight", "एअरपोर्ट", "विमानतळ", "एअरलाइन"])) {
    if (currentIndustry !== "Airport") {
      recommendedIndustry = "Airport";
      notes = addNote(notes, "aviation/airport keywords found");
    }
  }

  // Navy / Defence / Military
  if (match(allText, ["navy", "military", "army", "defence", "defense", "सैन्य", "नौदल", "लष्कर"])) {
    if (currentIndustry !== "Navy / Defence") {
      recommendedIndustry = "Navy / Defence";
      notes = addNote(notes, "defence/military keywords found");
    }
  }

  // Finance / Banking
  if (match(allText, ["bank", "finance", "loan", "बँक", "फायनान्स", "कर्ज", "insurance", "विमा", "nbfc", "microfinance"])) {
    if (currentIndustry !== "Finance" && currentIndustry !== "Trading") {
      recommendedIndustry = "Finance";
      notes = addNote(notes, "finance/banking keywords found");
    }
  }

  // Education / Teaching
  if (match(allText, ["school", "college", "teacher", "शाळा", "शिक्षक", "कॉलेज", "tutor", "coaching", "शिकवणी", "professor"])) {
    if (currentIndustry !== "Education") {
      recommendedIndustry = "Education";
      notes = addNote(notes, "education keywords found");
    }
  }

  // Hospital / Healthcare
  if (match(allText, ["hospital", "clinic", "doctor", "nurse", "हॉस्पिटल", "दवाखाना", "नर्स", "medical", "pharma", "pharmacy", "औषध"])) {
    if (currentIndustry !== "Hospital") {
      recommendedIndustry = "Hospital";
      notes = addNote(notes, "healthcare keywords found");
    }
  }

  // Hotel / Restaurant / Food
  if (match(allText, ["hotel", "restaurant", "dhaba", "mess", "canteen", "हॉटेल", "रेस्टॉरंट", "ढाबा", "मेस", "catering", "केटरिंग"])) {
    if (currentIndustry !== "Hotel / Restaurant") {
      recommendedIndustry = "Hotel / Restaurant";
      notes = addNote(notes, "hotel/restaurant keywords found");
    }
  }

  // IT / Software
  if (match(allText, ["software", "developer", "IT company", "coding", "web", "app develop", "सॉफ्टवेअर"])) {
    if (currentIndustry !== "Software / IT") {
      recommendedIndustry = "Software / IT";
      notes = addNote(notes, "IT/software keywords found");
    }
  }

  // Construction
  if (match(allText, ["construction", "building", "site", "बांधकाम", "cement", "सिमेंट", "civil", "contractor", "ठेकेदार"])) {
    if (currentIndustry !== "Construction") {
      recommendedIndustry = "Construction";
      notes = addNote(notes, "construction keywords found");
    }
  }

  // Manufacturing / Factory
  if (match(allText, ["factory", "plant", "manufacturing", "कारखाना", "फॅक्टरी", "production", "उत्पादन", "machine operator"])) {
    if (currentIndustry !== "Manufacturing") {
      recommendedIndustry = "Manufacturing";
      notes = addNote(notes, "manufacturing/factory keywords found");
    }
  }

  // Real Estate
  if (match(allText, ["real estate", "property", "flat", "plot", "builder", "बिल्डर", "रिअल इस्टेट"])) {
    if (currentIndustry !== "Real Estate") {
      recommendedIndustry = "Real Estate";
      notes = addNote(notes, "real estate keywords found");
    }
  }

  // Agriculture / Farming
  if (match(allText, ["farm", "agriculture", "शेत", "कृषी", "dairy", "डेअरी", "poultry", "पोल्ट्री", "nursery", "नर्सरी", "sugar factory", "साखर"])) {
    if (currentIndustry !== "Agriculture") {
      recommendedIndustry = "Agriculture";
      notes = addNote(notes, "agriculture/farming keywords found");
    }
  }

  // Transport / Logistics
  if (match(allText, ["transport", "logistics", "courier", "delivery", "वाहतूक", "ट्रान्सपोर्ट", "गोदाम", "warehouse", "godown"])) {
    if (currentIndustry !== "Transport / Logistics") {
      recommendedIndustry = "Transport / Logistics";
      notes = addNote(notes, "transport/logistics keywords found");
    }
  }

  // Retail / Shop
  if (match(allText, ["shop", "store", "दुकान", "showroom", "शोरूम", "mall", "retail", "किराणा"])) {
    if (currentIndustry !== "Retail / Shop") {
      recommendedIndustry = "Retail / Shop";
      notes = addNote(notes, "retail/shop keywords found");
    }
  }

  // Automobile / Garage
  if (match(allText, ["garage", "automobile", "गॅरेज", "ऑटोमोबाईल", "car wash", "service center", "two wheeler", "four wheeler", "bike", "car"])) {
    if (currentIndustry !== "Automobile") {
      recommendedIndustry = "Automobile";
      notes = addNote(notes, "automobile keywords found");
    }
  }

  // Textile / Garment
  if (match(allText, ["textile", "garment", "cloth", "कापड", "टेक्सटाइल", "tailoring", "शिवणकाम", "सिलाई", "readymade"])) {
    if (currentIndustry !== "Textile / Garment") {
      recommendedIndustry = "Textile / Garment";
      notes = addNote(notes, "textile/garment keywords found");
    }
  }

  // Government
  if (match(allText, ["government", "sarkari", "सरकारी", "panchayat", "पंचायत", "municipal", "महानगरपालिका", "gramsevak"])) {
    if (currentIndustry !== "Government") {
      recommendedIndustry = "Government";
      notes = addNote(notes, "government keywords found");
    }
  }

  // ---- JOB TYPE DETECTION (common mismatches) ----

  // Driver in wrong category
  if (match(desc, ["driver", "ड्रायव्हर", "चालक"]) && !currentJobType.toLowerCase().includes("driver")) {
    recommendedJobType = "Driver";
    notes = addNote(notes, "description mentions driver work");
  }

  // Salesman / Sales
  if (match(desc, ["sales", "सेल्स", "marketing", "मार्केटिंग", "विक्री"]) &&
      !currentJobType.toLowerCase().includes("sales") && !currentJobType.toLowerCase().includes("marketing")) {
    recommendedJobType = "Salesman / Marketing";
    notes = addNote(notes, "description mentions sales/marketing");
  }

  // Security Guard
  if (match(desc, ["security", "guard", "सुरक्षा", "गार्ड", "watchman", "चौकीदार"]) &&
      !currentJobType.toLowerCase().includes("security") && !currentJobType.toLowerCase().includes("guard")) {
    recommendedJobType = "Security Guard";
    notes = addNote(notes, "description mentions security/guard work");
  }

  // Helper / Peon
  if (match(desc, ["helper", "हेल्पर", "peon", "शिपाई", "office boy"]) &&
      !currentJobType.toLowerCase().includes("helper") && !currentJobType.toLowerCase().includes("peon")) {
    recommendedJobType = "Helper / Peon";
    notes = addNote(notes, "description mentions helper/peon work");
  }

  // Cook
  if (match(desc, ["cook", "स्वयंपाकी", "chef", "शेफ"]) &&
      !currentJobType.toLowerCase().includes("cook") && !currentJobType.toLowerCase().includes("chef")) {
    recommendedJobType = "Cook / Chef";
    notes = addNote(notes, "description mentions cooking");
  }

  // Delivery
  if (match(desc, ["delivery", "डिलिव्हरी"]) &&
      !currentJobType.toLowerCase().includes("delivery")) {
    recommendedJobType = "Delivery Boy";
    notes = addNote(notes, "description mentions delivery");
  }

  // Accountant
  if (match(desc, ["account", "अकाउंट", "tally", "gst", "tax"]) &&
      !currentJobType.toLowerCase().includes("account")) {
    recommendedJobType = "Accountant";
    notes = addNote(notes, "description mentions accounting");
  }

  // Supervisor
  if (match(desc, ["supervisor", "सुपरवायझर", "foreman"]) &&
      !currentJobType.toLowerCase().includes("supervisor")) {
    recommendedJobType = "Supervisor";
    notes = addNote(notes, "description mentions supervisor role");
  }

  // Telecaller
  if (match(desc, ["telecall", "टेलिकॉल", "call center", "कॉल सेंटर", "bpo"]) &&
      !currentJobType.toLowerCase().includes("telecall")) {
    recommendedJobType = "Telecaller";
    notes = addNote(notes, "description mentions telecalling");
  }

  // Data Entry / Computer Operator
  if (match(desc, ["data entry", "डेटा एन्ट्री", "computer operator", "कॉम्प्युटर ऑपरेटर", "typing"]) &&
      !currentJobType.toLowerCase().includes("data") && !currentJobType.toLowerCase().includes("computer")) {
    recommendedJobType = "Data Entry / Computer Operator";
    notes = addNote(notes, "description mentions data entry/computer work");
  }

  // Teacher
  if (match(desc, ["teacher", "शिक्षक", "tutor", "शिक्षिका", "faculty"]) &&
      !currentJobType.toLowerCase().includes("teacher")) {
    recommendedJobType = "Teacher";
    notes = addNote(notes, "description mentions teaching");
  }

  // Nurse
  if (match(desc, ["nurse", "नर्स", "nursing"]) &&
      !currentJobType.toLowerCase().includes("nurse")) {
    recommendedJobType = "Nurse";
    notes = addNote(notes, "description mentions nursing");
  }

  if (recommendedJobType === "OK" && recommendedIndustry === "OK") {
    notes = "looks correct";
  }

  return { recommendedJobType, recommendedIndustry, notes };
}

function match(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw.toLowerCase()));
}

function addNote(existing: string, note: string): string {
  return existing ? `${existing}; ${note}` : note;
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
