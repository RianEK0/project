const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    const errorPayload = contentType.includes("application/json") ? await response.json() : { message: response.statusText };
    const error = new Error(errorPayload.message || "Request gagal");
    error.status = response.status;
    error.details = errorPayload.details || null;
    error.code = errorPayload.details?.code || null;
    throw error;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response;
}

export async function streamNotifications({ signal, onMessage }) {
  const response = await apiFetch("/notifications/stream", {
    method: "GET",
    signal,
    headers: { Accept: "text/event-stream" }
  });

  if (!response.body) throw new Error("Streaming notifikasi tidak didukung browser ini");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() || "";

    for (const eventBlock of events) {
      const data = eventBlock
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      if (!data) continue;

      try {
        onMessage(JSON.parse(data));
      } catch {
        // Abaikan event yang tidak valid dan pertahankan stream.
      }
    }
  }
}

export async function downloadFromApi(path, filename) {
  const response = await apiFetch(path, { method: "GET" });
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
