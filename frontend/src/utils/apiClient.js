/**
 * Standard API Base URL resolution
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5050"
).replace(/\/$/, "");

/**
 * Standardized HTTP API Request Client with Automatic Auth Headers
 * @param {string} endpoint - API path (e.g. '/api/admin/stats')
 * @param {Object} options - Fetch options (method, body, headers, tokenKey)
 * @returns {Promise<{ ok: boolean, status: number, data: any, message?: string }>}
 */
export async function apiRequest(endpoint, { method = "GET", body = null, headers = {}, tokenKey = "admin_token" } = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem(tokenKey) || localStorage.getItem("fuelpass_token") || localStorage.getItem("admin_token");

  const requestHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const fetchOptions = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== "GET" && method !== "HEAD") {
    fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    let data = null;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      ok: response.ok,
      status: response.statusCode || response.status,
      data,
      message: (data && data.message) || (response.ok ? "Success" : "Request failed"),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      message: error.message || "Network error. Unable to connect to server.",
    };
  }
}
