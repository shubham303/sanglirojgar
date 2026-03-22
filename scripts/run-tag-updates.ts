/**
 * Script to auto-tag all active jobs using keyword matching.
 * Matches job description (English + Marathi) against a predefined tag list
 * and updates the tags column in Supabase.
 *
 * Usage:
 *   npx tsx scripts/run-tag-updates.ts
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

// tag → keywords to match (case-insensitive, substring match)
const TAG_KEYWORDS: Record<string, string[]> = {
  // Work Location
  "Restaurant":              ["restaurant", "रेस्टॉरंट", "रेस्टुरांट", "restro"],
  "MIDC":                    ["midc", "एमआयडीसी", "m.i.d.c"],
  "Canteen":                 ["canteen", "कॅन्टीन", "कॅन्टिन"],
  "Cafe":                    ["cafe", "café", "कॅफे"],
  "Shop":                    ["shop", "दुकान"],
  "Showroom":                ["showroom", "शोरूम"],
  "Bank":                    ["bank", "बँक", "बैंक"],
  "School":                  ["school", "शाळा"],
  "College":                 ["college", "कॉलेज"],
  "Hotel":                   ["hotel", "हॉटेल"],
  "Mall":                    ["mall", "मॉल"],
  "Hospital":                ["hospital", "हॉस्पिटल", "रुग्णालय"],
  "Airport":                 ["airport", "एअरपोर्ट", "विमानतळ"],
  "Clinic":                  ["clinic", "क्लिनिक", "दवाखाना"],
  "Petrol Pump":             ["petrol pump", "पेट्रोल पंप"],
  "IT Park":                 ["it park", "आयटी पार्क", "itpark"],
  "Farm":                    ["farm", "शेती", "शेत"],
  "Warehouse":               ["warehouse", "वेअरहाऊस", "गोदाम"],
  "Construction Site":       ["construction site", "बांधकाम साइट", "site work"],
  "Government Office":       ["government office", "सरकारी कार्यालय", "govt office"],
  "Home / Residential":      ["home based", "work from home", "घरून काम", "घरी काम", "live-in", "live in", "residential"],
  "Office Building":         ["office building", "corporate office", "head office"],
  "Salon / Parlour":         ["salon", "parlour", "parlor", "सलून", "पार्लर", "beauty parlour"],
  "Gym":                     ["gym", "जिम", "gymnasium", "fitness"],

  // Sector
  "Government":              ["government", "सरकारी", "govt", "municipal", "nagar palika", "नगरपालिका", "zp ", "jilha parishad", "जिल्हा परिषद", "महानगरपालिका"],
  "Private Company":         ["pvt", "private", " ltd", "प्रायव्हेट", "खाजगी"],
  "NGO / Trust":             ["ngo", " trust", "foundation", "संस्था", "न्यास", "charitable"],
  "Real Estate":             ["real estate", "property", "builder", "प्रॉपर्टी", "बिल्डर", "realty"],
  "Automobile":              ["automobile", "automotive", "car showroom", "bike showroom", "vehicle", "ऑटोमोबाईल", "टू व्हीलर शोरूम", "फोर व्हीलर"],
  "Facility Management":     ["facility management", "facility", "facilities", "फॅसिलिटी"],
  "Agriculture":             ["agriculture", "agri", "कृषी", "farming"],
  "Security Agency":         ["security agency", "security company", "सिक्युरिटी एजन्सी"],
  "Transport Company":       ["transport company", "logistics", "courier", "ट्रान्सपोर्ट कंपनी"],
  "IT Company":              ["it company", "software company", "tech company", "आयटी कंपनी", "software firm"],
  "Manufacturing Company":   ["manufacturing", "factory", "कारखाना", "plant", "उत्पादन कंपनी", "मॅन्युफॅक्चरिंग"],

  // Work Conditions
  "Part Time":               ["part time", "part-time", "अर्धवेळ"],
  "Full Time":               ["full time", "full-time", "पूर्णवेळ"],
  "Night Shift":             ["night shift", "रात्र पाळी", "रात्रपाळी", "night duty"],
  "Day Shift":               ["day shift", "दिवस पाळी", "दिवसपाळी"],
  "Permanent":               ["permanent", "कायमस्वरूपी", "कायम नोकरी"],
  "Contract":                ["contract", "कंत्राट", "कंट्रॅक्ट"],
  "Work From Home":          ["work from home", "wfh", "घरून काम", "घरी काम"],
  "Live-in (Food & Stay Provided)": ["live-in", "live in", "राहण्याची सोय", "जेवण व राहण्याची", "food and stay", "food & stay", "accommodation provided", "जेवण राहणे"],
  "Two Wheeler Required":    ["two wheeler", "दुचाकी", "bike required", "स्वतःची गाडी", "वाहन आवश्यक", "own vehicle"],
};

function detectTags(description: string, jobTypeName: string): string[] {
  const text = (description + " " + jobTypeName).toLowerCase();
  const matched: string[] = [];

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      matched.push(tag);
    }
  }

  return matched;
}

async function main() {
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, description, job_types(name_en)")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error || !jobs) { console.error("Failed to fetch jobs:", error); process.exit(1); }

  console.log(`Processing ${jobs.length} jobs...\n`);

  let success = 0, failed = 0, skipped = 0;

  for (const job of jobs) {
    const jobType = (job.job_types as unknown as { name_en: string } | null)?.name_en || "";
    const description = job.description || "";

    if (!description.trim()) {
      console.log(`— ${job.id} skipped (no description)`);
      skipped++;
      continue;
    }

    const tags = detectTags(description, jobType);

    const { error: updateError } = await supabase
      .from("jobs")
      .update({ tags })
      .eq("id", job.id);

    if (updateError) {
      console.error(`✗ ${job.id}: ${updateError.message}`);
      failed++;
    } else {
      console.log(`✓ ${job.id} [${jobType}] → [${tags.join(", ") || "no tags"}]`);
      success++;
    }
  }

  console.log(`\nDone: ${success} tagged, ${skipped} skipped, ${failed} failed out of ${jobs.length} total.`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
