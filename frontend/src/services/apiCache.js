/**
 * apiCache.js — Stale-While-Revalidate cache for API calls
 * 
 * HOW IT WORKS:
 * 1. First visit: fetches from server, shows loading skeleton
 * 2. Second visit: immediately returns cached data (no skeleton!),
 *    then quietly refreshes in background
 * 3. Cache expires after TTL (default: 3 minutes)
 */

const CACHE_PREFIX = "cc_cache_";
const DEFAULT_TTL_MS = 3 * 60 * 1000; // 3 minutes

/**
 * Save data to localStorage cache
 */
function setCache(key, data, ttlMs = DEFAULT_TTL_MS) {
  try {
    const entry = {
      data,
      expiresAt: Date.now() + ttlMs,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage might be full or unavailable — silently ignore
  }
}

/**
 * Get data from localStorage cache.
 * Returns { data, isStale } or null if no cache.
 */
function getCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    const isStale = Date.now() > entry.expiresAt;
    return { data: entry.data, isStale };
  } catch {
    return null;
  }
}

/**
 * Clear a specific cache entry (call after mutations like POST/DELETE)
 */
export function invalidateCache(key) {
  localStorage.removeItem(CACHE_PREFIX + key);
}

/**
 * Clear all API caches (call on logout)
 */
export function clearAllCache() {
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith(CACHE_PREFIX)) localStorage.removeItem(k);
  });
}

/**
 * Main cached fetch function.
 * 
 * Usage:
 *   const data = await cachedGet(api, "blood/stats/", {
 *     cacheKey: "blood_stats",
 *     onCacheHit: (cachedData) => setStats(cachedData), // instant!
 *   });
 *   setStats(data); // fresh data
 * 
 * @param {object} apiInstance - axios api instance
 * @param {string} url - API endpoint
 * @param {object} options
 * @param {string} options.cacheKey - unique cache key
 * @param {number} [options.ttl] - cache TTL in ms (default 3 min)
 * @param {function} [options.onCacheHit] - called immediately with cached data
 * @param {object} [options.params] - query params
 * @returns {Promise<any>} fresh data from server
 */
export async function cachedGet(apiInstance, url, options = {}) {
  const { cacheKey, ttl = DEFAULT_TTL_MS, onCacheHit, params } = options;

  if (cacheKey) {
    const cached = getCache(cacheKey);
    if (cached) {
      // Immediately show cached data (no loading!)
      if (onCacheHit) onCacheHit(cached.data);
      
      // If not stale, we might still want to refresh but skip if fresh
      if (!cached.isStale) {
        // Return cached data — no need to hit server
        return cached.data;
      }
      // If stale, fall through to fetch fresh data in background
    }
  }

  // Fetch fresh data from server
  const response = await apiInstance.get(url, params ? { params } : undefined);
  const freshData = response.data;

  // Save to cache
  if (cacheKey) {
    setCache(cacheKey, freshData, ttl);
  }

  return freshData;
}

/**
 * Fetch multiple endpoints with caching.
 * All requests run in parallel (Promise.allSettled).
 * 
 * Usage:
 *   const results = await cachedGetAll(api, [
 *     { url: "blood/stats/", cacheKey: "blood_stats", onCacheHit: setStats },
 *     { url: "blood/donors/", cacheKey: "blood_donors", onCacheHit: setDonors },
 *   ]);
 */
export async function cachedGetAll(apiInstance, requests) {
  // First: immediately apply all cached data
  const cacheResults = requests.map(({ cacheKey, onCacheHit }) => {
    if (!cacheKey) return null;
    const cached = getCache(cacheKey);
    if (cached && onCacheHit) {
      onCacheHit(cached.data);
      return cached;
    }
    return null;
  });

  // Check if all are fresh (not stale) — if so skip network
  const allFresh = cacheResults.every(
    (r) => r !== null && !r.isStale
  );
  if (allFresh) return cacheResults.map((r) => r.data);

  // Fetch fresh data in parallel
  const responses = await Promise.allSettled(
    requests.map(({ url, params }) =>
      apiInstance.get(url, params ? { params } : undefined)
    )
  );

  // Update cache + return results
  return responses.map((res, i) => {
    if (res.status === "fulfilled") {
      const freshData = res.value.data;
      const { cacheKey, ttl } = requests[i];
      if (cacheKey) setCache(cacheKey, freshData, ttl);
      return freshData;
    }
    // If fetch failed but we had cache, keep cached data
    const cached = cacheResults[i];
    return cached ? cached.data : null;
  });
}
