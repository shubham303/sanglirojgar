/**
 * Script to extract job postings from Facebook ad images using Gemini Vision API
 * and write them to a CSV file for review before uploading.
 *
 * Usage:
 *   npx tsx scripts/import-from-images.ts <folder-path>
 *
 * Environment:
 *   GEMINI_API_KEY — your Google Gemini API key
 *
 * Output:
 *   <folder-path>/jobs-to-review.csv — open in Excel, review, then upload with upload-from-csv.ts
 *
 * Example:
 *   GEMINI_API_KEY=AIza... npx tsx scripts/import-from-images.ts ./fb-ads
 */

import fs from "fs";
import path from "path";
import { JOB_TYPES as jobTypesData, getJobTypeIdByMarathi } from "../src/lib/constants";

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

const GEMINI_MODEL = "gemini-2.0-flash";

const CSV_COLUMNS = [
  "employer_name",
  "phone",
  "job_type_id",
  "district",
  "taluka",
  "salary",
  "description",
  "minimum_education",
  "experience_years",
  "workers_needed",
  "gender",
] as const;

const JOB_TYPES = jobTypesData.map((jt) => `${jt.marathi} (${jt.english})`);

const DISTRICTS = [
  "सांगली", "पुणे", "मुंबई", "नागपूर", "नाशिक", "औरंगाबाद", "सोलापूर",
  "कोल्हापूर", "सातारा", "अहमदनगर", "रत्नागिरी", "ठाणे", "रायगड",
  "सिंधुदुर्ग", "पालघर", "धुळे", "जळगाव", "नंदुरबार", "अमरावती",
  "अकोला", "बुलढाणा", "यवतमाळ", "वाशीम", "वर्धा", "भंडारा", "गोंदिया",
  "चंद्रपूर", "गडचिरोली", "जालना", "बीड", "लातूर", "उस्मानाबाद",
  "नांदेड", "परभणी", "हिंगोली",
];

const EXTRACTION_PROMPT = `You are extracting job posting data from a Facebook ad image. The image is in Marathi or Hindi (sometimes mixed with English). Extract the following fields as JSON:

{
  "employer_name": "Name of the employer or business (string, required)",
  "phone": "10-digit Indian phone number (string, digits only, required)",
  "job_type": "Must be one of the allowed job types listed below (string, required)",
  "district": "District name in Marathi from the allowed list below (string, required)",
  "taluka": "Taluka/city name in Marathi (string, required)",
  "salary": "Salary info as mentioned in the ad, e.g. '15000 रुपये महिना' or '500 रुपये प्रतिदिन' (string, required)",
  "description": "Any additional details about the job — work hours, requirements, benefits, address, etc. (string, optional)",
  "minimum_education": "One of: शिक्षण नाही, 10वी, 12वी, ITI, Graduate (पदवीधर), BA, BSc, BCom, Engineer. Leave empty if not mentioned. (string, optional)",
  "experience_years": "One of: 0, 1, 2, 3, 3+. Leave empty if not mentioned. (string, optional)",
  "workers_needed": "Number of workers needed (number, default 1)",
  "gender": "One of: male, female, both. Use 'female' if ad says महिला/ladies/female only, 'male' if ad says पुरुष/gents/male only, otherwise 'both' (string, default 'both')"
}

ALLOWED JOB TYPES (pick the closest match):
${JOB_TYPES.join("\n")}

ALLOWED DISTRICTS:
${DISTRICTS.join(", ")}

RULES:
- Extract ONLY what is visible in the image. Do not fabricate data.
- Phone number MUST be exactly 10 digits. If multiple numbers, pick the primary one.
- If the job type doesn't exactly match any allowed type, pick the closest one. If nothing fits, use "इतर (Other)".
- District must be from the allowed list. Map city names to their district (e.g., मिरज → सांगली, पिंपरी-चिंचवड → पुणे).
- For taluka, use the specific city/town name mentioned in the ad.
- If you cannot extract the required fields (employer_name, phone, job_type, district, taluka, salary), return: {"skip": true, "reason": "explanation"}
- Return ONLY valid JSON, no markdown or explanation.`;

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return map[ext.toLowerCase()] || "image/jpeg";
}

async function extractJobData(apiKey: string, imagePath: string) {
  const ext = path.extname(imagePath);
  const imageData = fs.readFileSync(imagePath);
  const base64 = imageData.toString("base64");
  const mimeType = getMimeType(ext);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: base64 } },
            { text: EXTRACTION_PROMPT },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const result = await res.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`No text in Gemini response: ${JSON.stringify(result)}`);

  // Extract JSON from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found in response: ${text}`);

  return JSON.parse(jsonMatch[0]);
}

function csvEscape(value: unknown): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function appendToCsv(csvPath: string, data: Record<string, unknown>) {
  const writeHeader = !fs.existsSync(csvPath);
  const row = CSV_COLUMNS.map((col) => csvEscape(data[col])).join(",");

  if (writeHeader) {
    fs.writeFileSync(csvPath, CSV_COLUMNS.join(",") + "\n" + row + "\n", "utf-8");
  } else {
    fs.appendFileSync(csvPath, row + "\n", "utf-8");
  }
}

async function main() {
  const folder = process.argv[2];
  if (!folder) {
    console.error("Usage: npx tsx scripts/import-from-images.ts <folder-path>");
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY environment variable is required");
    process.exit(1);
  }

  const absFolder = path.resolve(folder);

  if (!fs.existsSync(absFolder)) {
    console.error(`Folder not found: ${absFolder}`);
    process.exit(1);
  }

  const csvPath = path.join(absFolder, "jobs-to-review.csv");
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const files = fs.readdirSync(absFolder)
    .filter((f) => imageExtensions.includes(path.extname(f).toLowerCase()))
    .sort();

  console.log(`Found ${files.length} images in ${absFolder}\n`);

  let extracted = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(absFolder, file);
    console.log(`--- Processing: ${file}`);

    try {
      const data = await extractJobData(apiKey, filePath);

      if (data.skip) {
        console.log(`  SKIPPED: ${data.reason}`);
        skipped++;
        continue;
      }

      // Map Marathi job_type text to numeric ID
      const marathiName = (data.job_type || "").replace(/\s*\(.*\)$/, "").trim();
      const jobTypeId = getJobTypeIdByMarathi(marathiName) ?? 34; // default to "इतर"
      data.job_type_id = jobTypeId;

      console.log(`  Extracted: ${data.employer_name} | ${marathiName} (id=${jobTypeId}) | ${data.phone} | ${data.taluka}, ${data.district} | ₹${data.salary}`);

      appendToCsv(csvPath, data);
      extracted++;
    } catch (err) {
      console.log(`  ERROR: ${(err as Error).message}`);
      failed++;
    }

    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n=== DONE ===`);
  console.log(`Extracted: ${extracted} | Skipped: ${skipped} | Failed: ${failed} | Total: ${files.length}`);
  if (extracted > 0) {
    console.log(`\nCSV written to: ${csvPath}`);
    console.log(`Review the file in Excel, then upload with: npx tsx scripts/upload-from-csv.ts ${csvPath}`);
  }
}

main();
