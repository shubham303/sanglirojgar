import { JOB_TYPE_OPTIONS } from "./constants";

export interface JobTypeOption {
  id: number;
  label: string;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes

let cachedOptions: JobTypeOption[] | null = null;
let lastFetchTime = 0;
let fetchPromise: Promise<JobTypeOption[]> | null = null;

/**
 * Async fetch of job type options from the API.
 * Deduplicates concurrent calls and caches for 60 minutes.
 * Falls back to stale cache or hardcoded constants on failure.
 */
export async function fetchJobTypeOptions(): Promise<JobTypeOption[]> {
  const now = Date.now();

  // Return cached data if still fresh
  if (cachedOptions && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedOptions;
  }

  // Deduplicate concurrent requests
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch("/api/job-types")
    .then((res) => {
      if (!res.ok) throw new Error("API error");
      return res.json() as Promise<JobTypeOption[]>;
    })
    .then((data) => {
      cachedOptions = data;
      lastFetchTime = Date.now();
      return data;
    })
    .catch(() => {
      // Return stale cache if available, else hardcoded fallback
      return cachedOptions || JOB_TYPE_OPTIONS.map((o) => ({ id: o.id, label: o.label }));
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

/**
 * Synchronous accessor — returns cached options or hardcoded fallback.
 * Guarantees a non-empty array so dropdowns always have data on first render.
 */
export function getJobTypeOptionsSync(): JobTypeOption[] {
  return cachedOptions || JOB_TYPE_OPTIONS.map((o) => ({ id: o.id, label: o.label }));
}
