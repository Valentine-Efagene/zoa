import { getSession } from "./auth";
import type {
  Application,
  FormDataMap,
  WorkflowDefinition,
  WorkflowSlug,
  WorkflowSummary,
  ApplicationDocument,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (auth) {
    const session = getSession();
    if (session?.idToken) {
      headers.set("Authorization", `Bearer ${session.idToken}`);
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
  } & T;

  if (!res.ok) {
    throw new ApiError(data.error ?? res.statusText, res.status);
  }
  return data as T;
}

export const api = {
  listWorkflows: () =>
    request<{ workflows: WorkflowSummary[] }>("/workflows", {}, false),

  getWorkflow: (slug: string) =>
    request<{ workflow: WorkflowDefinition }>(`/workflows/${slug}`, {}, false),

  listApplications: () =>
    request<{ applications: Application[] }>("/applications"),

  createApplication: (workflowSlug: WorkflowSlug, formData: FormDataMap = {}) =>
    request<{ application: Application; workflow: WorkflowDefinition }>(
      "/applications",
      {
        method: "POST",
        body: JSON.stringify({ workflowSlug, formData }),
      },
    ),

  getApplication: (id: string) =>
    request<{ application: Application; workflow: WorkflowDefinition }>(
      `/applications/${id}`,
    ),

  updateApplication: (
    id: string,
    body: { formData?: FormDataMap; status?: Application["status"] },
  ) =>
    request<{ application: Application }>(`/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  createUploadUrl: (
    applicationId: string,
    body: {
      documentType: string;
      fileName: string;
      contentType: string;
      size: number;
      ownerKey?: string;
    },
  ) =>
    request<{ uploadUrl: string; document: ApplicationDocument }>(
      `/applications/${applicationId}/documents/upload-url`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),
};

export { ApiError };
