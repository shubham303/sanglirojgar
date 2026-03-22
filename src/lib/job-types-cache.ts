export interface JobTypeOption {
  id: number;
  name_mr: string;
  name_en: string;
  label: string;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes

let cachedOptions: JobTypeOption[] | null = null;
let lastFetchTime = 0;
let fetchPromise: Promise<JobTypeOption[]> | null = null;

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

// Category-grouped job types
export interface CategoryGroupedJobTypeOption {
  category_id: number;
  category_mr: string;
  category_en: string;
  options: { id: number; name_mr: string; name_en: string; label: string }[];
}

let cachedCategoryGrouped: CategoryGroupedJobTypeOption[] | null = null;
let lastCategoryGroupedFetchTime = 0;
let fetchCategoryGroupedPromise: Promise<CategoryGroupedJobTypeOption[]> | null = null;

export async function fetchCategoryGroupedJobTypes(): Promise<CategoryGroupedJobTypeOption[]> {
  const now = Date.now();
  if (cachedCategoryGrouped && now - lastCategoryGroupedFetchTime < CACHE_TTL_MS) return cachedCategoryGrouped;
  if (fetchCategoryGroupedPromise) return fetchCategoryGroupedPromise;

  fetchCategoryGroupedPromise = fetch("/api/job-types?grouped=category")
    .then((res) => { if (!res.ok) throw new Error("API error"); return res.json() as Promise<CategoryGroupedJobTypeOption[]>; })
    .then((data) => { cachedCategoryGrouped = data; lastCategoryGroupedFetchTime = Date.now(); return data; })
    .catch(() => cachedCategoryGrouped || [])
    .finally(() => { fetchCategoryGroupedPromise = null; });

  return fetchCategoryGroupedPromise;
}

export function getCategoryGroupedJobTypesSync(): CategoryGroupedJobTypeOption[] {
  return cachedCategoryGrouped || [];
}

// Popular job types cache
let cachedPopular: JobTypeOption[] | null = null;
let lastPopularFetchTime = 0;
let fetchPopularPromise: Promise<JobTypeOption[]> | null = null;

export async function fetchPopularJobTypes(): Promise<JobTypeOption[]> {
  const now = Date.now();
  if (cachedPopular && now - lastPopularFetchTime < CACHE_TTL_MS) return cachedPopular;
  if (fetchPopularPromise) return fetchPopularPromise;

  fetchPopularPromise = fetch("/api/job-types?popular=true")
    .then((res) => { if (!res.ok) throw new Error("API error"); return res.json() as Promise<JobTypeOption[]>; })
    .then((data) => { cachedPopular = data; lastPopularFetchTime = Date.now(); return data; })
    .catch(() => cachedPopular || [])
    .finally(() => { fetchPopularPromise = null; });

  return fetchPopularPromise;
}

export function getPopularJobTypesSync(): JobTypeOption[] {
  return cachedPopular || [];
}
