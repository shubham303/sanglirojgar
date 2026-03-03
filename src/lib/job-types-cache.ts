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
 * Returns stale cache on failure, or empty array if no cache exists.
 */
export async function fetchJobTypeOptions(): Promise<JobTypeOption[]> {
  const now = Date.now();

  if (cachedOptions && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedOptions;
  }

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
      return cachedOptions || [];
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

/**
 * Synchronous accessor — returns cached options or empty array.
 */
export function getJobTypeOptionsSync(): JobTypeOption[] {
  return cachedOptions || [];
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
      return cachedGrouped || [];
    })
    .finally(() => {
      fetchGroupedPromise = null;
    });

  return fetchGroupedPromise;
}

/**
 * Synchronous accessor — returns cached grouped options or empty array.
 */
export function getGroupedJobTypeOptionsSync(): GroupedJobTypeOption[] {
  return cachedGrouped || [];
}
