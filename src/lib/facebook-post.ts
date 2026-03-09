import { Job } from "./types";

/**
 * Post a new job to a Facebook Group via Graph API.
 * Fails silently — never blocks job submission.
 */
export async function postJobToFacebook(job: Job): Promise<void> {
  const groupId = process.env.FACEBOOK_GROUP_ID;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!groupId || !accessToken) return;

  const description = job.description
    ? job.description.length > 150
      ? job.description.slice(0, 150) + "..."
      : job.description
    : "";

  const message = [
    `🔴 नवीन नोकरी — ${job.job_type_display} | ${job.district}`,
    description,
    `थेट employer शी संपर्क करा 👉 www.mahajob.in/job/${job.id}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${groupId}/feed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          access_token: accessToken,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Facebook post failed:", err);
    }
  } catch (e) {
    console.error("Facebook post error:", e);
  }
}
