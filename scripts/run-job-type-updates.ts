/**
 * Script to update job_type_id for mismatched jobs via the admin API.
 * Run with: npx tsx scripts/run-job-type-updates.ts
 *
 * Requires:
 *   NEXT_PUBLIC_APP_URL — base URL of the running app (e.g. http://localhost:3000)
 *   ADMIN_SECRET       — admin password (same as login)
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!ADMIN_SECRET) {
  console.error("Error: ADMIN_SECRET env var is required");
  process.exit(1);
}

const updates: { job_id: string; job_type_id: number }[] = [
  { "job_id": "d8dadce7-c113-449a-ac5d-b0952e7d2313", "job_type_id": 12 },
  { "job_id": "dd5ecc4a-7975-418b-a9d9-9eec0854c6b9", "job_type_id": 89 },
  { "job_id": "98fd501c-8a0f-42ff-bc7b-5a8e6248526b", "job_type_id": 40 },
  { "job_id": "3f64dee4-9bdb-4dff-aab8-483afebbdfd2", "job_type_id": 20 },
  { "job_id": "4803b347-1b96-442f-83fe-aa5486a71dbc", "job_type_id": 103 },
  { "job_id": "75001f35-bb74-4459-9289-9c97382b9a78", "job_type_id": 89 },
  { "job_id": "672d00ee-ffb4-4457-81e1-011adf54e87d", "job_type_id": 9 },
  { "job_id": "1ed7ec8b-84ab-4543-a692-b3a8687bce37", "job_type_id": 88 },
  { "job_id": "5ae967eb-b8a9-41fc-ad13-27bc3926385f", "job_type_id": 124 },
  { "job_id": "2e5906f0-dae8-472a-a8e3-30fb837b9d60", "job_type_id": 130 },
  { "job_id": "10e1958b-07bd-412e-85bf-902f263494ad", "job_type_id": 75 },
  { "job_id": "4720989c-fa18-4583-a076-13ad03f3339d", "job_type_id": 124 },
  { "job_id": "ceb81515-1e10-45bc-8be4-75db7b2b5122", "job_type_id": 17 },
  { "job_id": "6f826ed2-1eec-435a-8619-96b43d5431c0", "job_type_id": 103 },
  { "job_id": "92c7e4f5-0c0a-4ad6-9863-30116e59c455", "job_type_id": 40 },
  { "job_id": "bfcf79e1-0f8a-4a66-8f2b-8c2ce1d9affe", "job_type_id": 40 },
  { "job_id": "ab091341-3a4e-4037-a424-28eb87e19874", "job_type_id": 124 },
  { "job_id": "82f2bffe-1835-429e-944d-a531557b0760", "job_type_id": 24 },
  { "job_id": "23ace0bd-38fc-4432-8d73-5b2b82ccfb3b", "job_type_id": 18 },
  { "job_id": "7608f241-62da-46bd-bab3-e7538faa680d", "job_type_id": 40 },
  { "job_id": "45aef6b6-00e1-4a31-be0a-bb697e7a8cbc", "job_type_id": 72 },
  { "job_id": "eff6e17f-d903-4f08-8a61-e7cb5d99500f", "job_type_id": 71 },
  { "job_id": "88d2d579-51cf-4bce-a0fd-1aef92aa733b", "job_type_id": 22 },
  { "job_id": "d060241d-aaed-46df-a655-e337f6735bc5", "job_type_id": 99 },
  { "job_id": "d8444d22-c21b-4291-bbe4-0d9df5f80b87", "job_type_id": 13 },
  { "job_id": "38a7d089-9d5c-424e-b1ac-8ce7e75afb1e", "job_type_id": 103 },
  { "job_id": "de4dbab9-5a8b-49af-b6e5-1cf0af746890", "job_type_id": 29 },
  { "job_id": "48857845-05ad-412b-8960-aafb231a54fa", "job_type_id": 47 },
  { "job_id": "82cdb48f-a48e-43e3-acb3-5743c47ed5ee", "job_type_id": 92 },
  { "job_id": "e5cbe66a-5ce2-46c6-828b-52ecb9cb9393", "job_type_id": 109 },
  { "job_id": "554a86ad-dfff-498f-bcc1-96a5e270d59e", "job_type_id": 66 },
  { "job_id": "310f12d5-ce44-4828-8894-c1280fd754b3", "job_type_id": 12 },
  { "job_id": "42f5c312-dcbc-4548-8a7c-7496d6905811", "job_type_id": 17 },
  { "job_id": "dcde7ed5-e091-410b-8531-09f55da08320", "job_type_id": 117 },
  { "job_id": "7bdfea3e-4301-4114-bc49-98c5726879aa", "job_type_id": 18 },
  { "job_id": "254ab65f-7911-4b80-9c80-43e7e7b0d2ba", "job_type_id": 24 },
  { "job_id": "a22c034d-5216-4902-9420-c603b6d4b703", "job_type_id": 130 },
  { "job_id": "92d07474-92cf-48fb-9a6f-49f0290ede51", "job_type_id": 29 },
  { "job_id": "41fa10e6-6702-451f-b300-53ade3cd60af", "job_type_id": 29 },
  { "job_id": "2ed6514a-2036-42b3-8820-74c800b24143", "job_type_id": 109 },
  { "job_id": "fdc21c41-0105-4b9c-a4d7-c7cd8d9d3683", "job_type_id": 119 },
  { "job_id": "2a11aed4-8f5f-4984-ae31-b0e956523cad", "job_type_id": 120 },
  { "job_id": "cac853fe-9bc6-4268-84d8-26a934983672", "job_type_id": 48 },
  { "job_id": "001c3497-b06b-41a5-8a9b-836e26062baf", "job_type_id": 121 },
  { "job_id": "f090207a-3e79-4935-912e-583866b98001", "job_type_id": 17 },
  { "job_id": "a2f9c747-07ff-4cf9-bbc6-46fe6f3d268a", "job_type_id": 51 },
  { "job_id": "25137fb2-1a86-4349-9915-e973383733c0", "job_type_id": 122 },
  { "job_id": "36e3f626-c22b-445b-85ad-b458f2b118d3", "job_type_id": 91 },
  { "job_id": "fef80cc3-6d67-4b70-8a2d-82e8146c221b", "job_type_id": 109 },
  { "job_id": "f6253978-1794-44ca-bb8f-487fb5ad6656", "job_type_id": 85 },
  { "job_id": "1a173970-8c25-426c-bdfa-07521b369d35", "job_type_id": 12 },
  { "job_id": "4b3ea36d-f097-4bad-8053-252d3f0e9499", "job_type_id": 8 },
  { "job_id": "41fb3fe2-4f91-462e-9f6a-6b184836c7a1", "job_type_id": 12 },
  { "job_id": "018ccf95-c1a4-4ace-805a-dff6146f65f3", "job_type_id": 8 },
  { "job_id": "2289cd1a-3cd1-4ce2-a8ec-7e9b15be48b3", "job_type_id": 39 },
  { "job_id": "3723c0fd-7e37-4f51-83c5-ac858e422652", "job_type_id": 66 },
  { "job_id": "13b305e4-58c5-4adf-8c77-59b09c6dda2c", "job_type_id": 20 },
  { "job_id": "510bd0df-6cf7-4e40-aa39-469a55ae9097", "job_type_id": 106 },
  { "job_id": "1253b606-32fb-48aa-a788-2b7551513805", "job_type_id": 3 },
  { "job_id": "fac07cb8-c880-4207-9042-ee618443a6f5", "job_type_id": 52 },
  { "job_id": "ae4cb36e-f884-425e-b7fa-2d7414abe645", "job_type_id": 103 },
  { "job_id": "354b0241-c90f-4c91-9361-882380ab72be", "job_type_id": 126 },
  { "job_id": "2768104a-d5fb-44fa-a4ad-c043b375914f", "job_type_id": 91 },
  { "job_id": "bce26980-eca8-488e-a57d-678279352cfb", "job_type_id": 106 },
  { "job_id": "76189824-be38-4c3c-9225-30aa32e90509", "job_type_id": 106 },
  { "job_id": "2b61e473-7dd2-4c58-a05b-86b9164322fe", "job_type_id": 112 },
  { "job_id": "1bf63fd2-bc46-4454-9671-0448cc8234f2", "job_type_id": 29 },
  { "job_id": "5a79ec85-a701-46c3-9dee-979e602530df", "job_type_id": 40 },
  { "job_id": "0beed474-0e81-459d-9f2e-10e491551a4d", "job_type_id": 40 },
  { "job_id": "9224b58a-1a25-4b6c-b818-1c5c77b2d5d7", "job_type_id": 50 },
  { "job_id": "1764bbc9-1732-4149-b270-ed4d28e9947e", "job_type_id": 109 },
  { "job_id": "3812143c-7296-492c-a099-00a1dcf93927", "job_type_id": 93 },
  { "job_id": "36888fdf-bc57-47a5-8c42-f6e511ba920a", "job_type_id": 72 },
  { "job_id": "ba9e50d2-d729-42c8-a62b-3cc2c94c07f2", "job_type_id": 75 },
  { "job_id": "f1356f08-d73e-4dbe-bcf6-9631e961c68c", "job_type_id": 109 },
  { "job_id": "66309bb8-1e22-46ad-9a9f-ba7cc288fe10", "job_type_id": 36 },
  { "job_id": "9e7c0683-5199-4d12-b391-a89daa45c2a9", "job_type_id": 117 },
  { "job_id": "b45810e5-72a6-4826-a43e-c508b6274425", "job_type_id": 120 },
  { "job_id": "c7e89f11-162f-4d48-8b1e-4db09e73544a", "job_type_id": 93 },
  { "job_id": "555f2edb-d92c-40de-895f-79c92a74cb6c", "job_type_id": 112 },
  { "job_id": "67401589-3574-407e-90c5-d6de0b769196", "job_type_id": 29 },
  { "job_id": "c18fda98-f1e6-441c-90ab-16562be1e07a", "job_type_id": 130 },
  { "job_id": "4d4f0e9c-84c0-4fc9-bacb-e0df9f74989f", "job_type_id": 26 },
  { "job_id": "195a3dd8-466a-4751-8139-427aecdf7589", "job_type_id": 112 },
  { "job_id": "2ff5de3c-1c8c-49b9-8961-6fed702b75d9", "job_type_id": 112 },
  { "job_id": "4a70318a-1e8e-43c4-8d0d-99c3b33f1505", "job_type_id": 5 },
  { "job_id": "0604438c-1e34-40d5-bb63-c8313ff86270", "job_type_id": 51 },
];

// First, log into admin to get the session cookie
async function login(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: ADMIN_SECRET, password: ADMIN_SECRET }),
  });
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  }
  const cookie = res.headers.get("set-cookie");
  if (!cookie) throw new Error("No session cookie in login response");
  // Extract just the cookie value part
  return cookie.split(";")[0];
}

async function updateJobType(cookie: string, job_id: string, job_type_id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/admin/jobs/update-type`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({ job_id, job_type_id }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed (${res.status}): ${body}`);
  }
}

async function main() {
  console.log(`Logging in to ${BASE_URL}...`);
  const cookie = await login();
  console.log("Logged in. Starting updates...\n");

  let success = 0;
  let failed = 0;

  for (const { job_id, job_type_id } of updates) {
    try {
      await updateJobType(cookie, job_id, job_type_id);
      console.log(`✓ ${job_id} → job_type_id=${job_type_id}`);
      success++;
    } catch (err) {
      console.error(`✗ ${job_id} → job_type_id=${job_type_id}: ${err}`);
      failed++;
    }
  }

  console.log(`\nDone: ${success} succeeded, ${failed} failed out of ${updates.length} total.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
