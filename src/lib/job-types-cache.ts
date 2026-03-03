import { JOB_TYPE_OPTIONS, JOB_TYPE_OPTIONS_GROUPED, GroupedJobTypeOptions } from "./constants";

export interface JobTypeOption {
  id: number;
  label: string;
}

export interface GroupedJobTypeOption {
  industry_id: number;
  industry_mr: string;
  industry_en: string;
  options: JobTypeOption[];
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes

let cachedOptions: JobTypeOption[] | null = null;
let cachedGrouped: GroupedJobTypeOption[] | null = null;
let lastFetchTime = 0;
let lastGroupedFetchTime = 0;
let fetchPromise: Promise<JobTypeOption[]> | null = null;
let fetchGroupedPromise: Promise<GroupedJobTypeOption[]> | null = null;

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

function toGrouped(data: GroupedJobTypeOptions[]): GroupedJobTypeOption[] {
  return data.map((g) => ({
    industry_id: g.industry_id,
    industry_mr: g.industry_mr,
    industry_en: g.industry_en,
    options: g.options.map((o) => ({ id: o.id, label: o.label })),
  }));
}

/**
 * Async fetch of grouped job type options from the API.
 * Returns industry-grouped structure for <optgroup> dropdowns.
 */
export async function fetchGroupedJobTypeOptions(): Promise<GroupedJobTypeOption[]> {
  const now = Date.now();

  if (cachedGrouped && now - lastGroupedFetchTime < CACHE_TTL_MS) {
    return cachedGrouped;
  }

  if (fetchGroupedPromise) return fetchGroupedPromise;

  fetchGroupedPromise = fetch("/api/job-types?grouped=true")
    .then((res) => {
      if (!res.ok) throw new Error("API error");
      return res.json() as Promise<GroupedJobTypeOption[]>;
    })
    .then((data) => {
      cachedGrouped = data;
      lastGroupedFetchTime = Date.now();
      return data;
    })
    .catch(() => {
      return cachedGrouped || toGrouped(JOB_TYPE_OPTIONS_GROUPED);
    })
    .finally(() => {
      fetchGroupedPromise = null;
    });

  return fetchGroupedPromise;
}

/**
 * Synchronous accessor — returns cached grouped options or hardcoded fallback.
 */
export function getGroupedJobTypeOptionsSync(): GroupedJobTypeOption[] {
  return cachedGrouped || toGrouped(JOB_TYPE_OPTIONS_GROUPED);
}
