const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include", // Essential for cross-origin Better Auth cookies
  };

  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkErr) {
    const errorMsg =
      networkErr?.name === "TypeError" && networkErr?.message?.includes("fetch")
        ? `Cannot connect to backend server at ${API_BASE_URL}. Please ensure your backend is running (cd server && npm run dev).`
        : networkErr?.message || "Network request failed.";
    const err = new Error(errorMsg);
    err.code = "NETWORK_ERROR";
    err.originalError = networkErr;
    throw err;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error?.message || data?.message || "An unexpected error occurred.";
    const err = new Error(errorMsg);
    err.status = response.status;
    err.code = data?.error?.code || "REQUEST_FAILED";
    err.data = data;
    throw err;
  }

  return data;
}
