// frontend/lib/api.js
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

function makeUrl(pathOrUrl = "") {
  if (!pathOrUrl) return API_BASE + "/";
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${API_BASE}/${pathOrUrl.replace(/^\/+/, "")}`;
}

/* Token helpers */
export function saveTokens(access, refresh) {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
}
export function getAccessToken() {
  return typeof window !== "undefined" ? localStorage.getItem("access") : null;
}
export function getRefreshToken() {
  return typeof window !== "undefined" ? localStorage.getItem("refresh") : null;
}
export function clearTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
  }
}

/**
 * authFetch: pathOrUrl can be a path like "attendance/attendances/" or a full URL.
 * options.body can be FormData (it won't set Content-Type in that case).
 */
export async function authFetch(pathOrUrl, options = {}) {
  const url = makeUrl(pathOrUrl);
  const opts = { ...options };
  opts.headers = opts.headers ? { ...opts.headers } : {};

  const token = getAccessToken();
  if (token) opts.headers["Authorization"] = `Bearer ${token}`;

  // If body is NOT FormData and no content-type, set JSON
  if (!(opts.body instanceof FormData) && !opts.headers["Content-Type"]) {
    opts.headers["Content-Type"] = "application/json";
  }

  let res = await fetch(url, opts);

  // If unauthorized, try refreshing the token (if refresh exists)
  if (res.status === 401) {
    const refresh = getRefreshToken();
    if (!refresh) {
      clearTokens();
      return res;
    }

    // intenta refresh
    try {
      const r = await fetch(makeUrl("auth/token/refresh/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (r.ok) {
        const d = await r.json();
        // guardar nuevo access (y refresh si viene)
        saveTokens(d.access, d.refresh ?? refresh);
        // reintentar la petición original con nuevo access
        opts.headers["Authorization"] = `Bearer ${d.access}`;
        res = await fetch(url, opts);
      } else {
        // refresh falló
        clearTokens();
        return res;
      }
    } catch (err) {
      clearTokens();
      return res;
    }
  }

  return res;
}
