/* Client-side API helper. All requests go through the same-origin
   /api/proxy route handler, which forwards cookies and the body to
   the Express backend and propagates Set-Cookie responses. */

const PROXY_PREFIX = "/api/proxy/";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/** Turns backend-relative asset paths (/uploads/...) into same-origin URLs
    served by the /api/proxy route, so images load regardless of the
    frontend/backend origin and of Cross-Origin-Resource-Policy headers. */
export const toAssetUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith(PROXY_PREFIX)) return path;
  if (path.startsWith("/")) return `${PROXY_PREFIX}${path.slice(1)}`;
  return path;
};

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> => {
  const res = await fetch(`${PROXY_PREFIX}${path}`, options);
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!res.ok || !body?.success) {
    throw new ApiError(body?.message || `Request failed (${res.status})`, res.status);
  }
  return body;
};

export const apiClient = {
  get: <T>(path: string) => apiFetch<T>(path),

  postJson: <T>(path: string, data: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  patchJson: <T>(path: string, data: unknown) =>
    apiFetch<T>(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),

  postForm: <T>(path: string, formData: FormData) =>
    apiFetch<T>(path, {
      method: "POST",
      body: formData,
    }),

  patchForm: <T>(path: string, formData: FormData) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: formData,
    }),
};
