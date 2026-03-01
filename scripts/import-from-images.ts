/**
 * Script to extract job postings from Facebook ad images using Claude Vision API
 * and post them to the mahajob.in API.
 *
 * Usage:
 *   npx tsx scripts/import-from-images.ts <folder-path>
 *
 * Environment:
 *   ANTHROPIC_API_KEY — your Claude API key
 *
 * Example:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/import-from-images.ts ./fb-ads
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const API_URL = "https://www.mahajob.in/api/jobs";
const MODEL = "claude-sonnet-4-20250514";

const JOB_TYPES = [
  "सेल्समन (Salesman)",
  "डिलिव्हरी बॉय (Delivery Boy)",
  "स्वयंपाकी (Cook)",
  "वेटर (Waiter)",
  "सुरक्षा रक्षक (Security Guard)",
  "ड्रायव्हर (Driver)",
  "मेकॅनिक (Mechanic)",
  "इलेक्ट्रिशियन (Electrician)",
  "प्लंबर (Plumber)",
  "सुतार (Carpenter)",
  "वेल्डर (Welder)",
  "शिपाई (Peon)",
  "क्लिनर (Cleaner)",
  "रिसेप्शनिस्ट (Receptionist)",
  "अकाउंट सहाय्यक (Accounts Assistant)",
  "दुकान सहाय्यक (Shop Assistant)",
  "गोडाउन कामगार (Warehouse Worker)",
  "इतर (Other)",
];

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
  "minimum_education": "One of: 10वी, 12वी, Graduate (पदवीधर), BA, BSc, BCom, Engineer. Leave empty if not mentioned. (string, optional)",
  "experience_years": "One of: 0, 1, 2, 3, 3+. Leave empty if not mentioned. (string, optional)",
  "workers_needed": "Number of workers needed (number, default 1)"
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

function getMediaType(ext: string): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  const map: Record<string, "image/jpeg" | "image/png" | "image/gif" | "image/webp"> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return map[ext.toLowerCase()] || "image/jpeg";
}

async function extractJobData(client: Anthropic, imagePath: string) {
  const ext = path.extname(imagePath);
  const imageData = fs.readFileSync(imagePath);
  const base64 = imageData.toString("base64");
  const mediaType = getMediaType(ext);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          { type: "text", text: EXTRACTION_PROMPT },
        ],
      },
    ],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  // Extract JSON from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found in response: ${text}`);

  return JSON.parse(jsonMatch[0]);
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
  const folder = process.argv[2];
  if (!folder) {
    console.error("Usage: npx tsx scripts/import-from-images.ts <folder-path>");
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY environment variable is required");
    process.exit(1);
  }

  const client = new Anthropic();
  const absFolder = path.resolve(folder);

  if (!fs.existsSync(absFolder)) {
    console.error(`Folder not found: ${absFolder}`);
    process.exit(1);
  }

  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const files = fs.readdirSync(absFolder)
    .filter((f) => imageExtensions.includes(path.extname(f).toLowerCase()))
    .sort();

  console.log(`Found ${files.length} images in ${absFolder}\n`);

  let posted = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(absFolder, file);
    console.log(`--- Processing: ${file}`);

    try {
      const data = await extractJobData(client, filePath);

      if (data.skip) {
        console.log(`  SKIPPED: ${data.reason}`);
        skipped++;
        continue;
      }

      // Show extracted data for review
      console.log(`  Extracted: ${data.employer_name} | ${data.job_type} | ${data.phone} | ${data.taluka}, ${data.district} | ₹${data.salary}`);

      const result = await postJob(data);
      if (result.ok) {
        console.log(`  POSTED successfully`);
        posted++;
      } else {
        console.log(`  FAILED (${result.status}): ${JSON.stringify(result.body)}`);
        failed++;
      }
    } catch (err) {
      console.log(`  ERROR: ${(err as Error).message}`);
      failed++;
    }

    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n=== DONE ===`);
  console.log(`Posted: ${posted} | Skipped: ${skipped} | Failed: ${failed} | Total: ${files.length}`);
}

main();
