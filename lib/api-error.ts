export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetail,
  ) {
    super(problem.detail ?? problem.title ?? `HTTP ${status}`);
    this.name = "ApiError";
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  const status = response.status;
  try {
    const ct = response.headers.get("content-type") ?? "";
    if (ct.includes("json") || ct.includes("problem")) {
      const body = (await response.json()) as ProblemDetail;
      return new ApiError(status, body);
    }
  } catch {
    // fall through to generic error
  }
  return new ApiError(status, { status, title: response.statusText || `Error ${status}` });
}

/**
 * Returns a human-readable message from any caught value.
 * Use in mutation catch blocks to surface ProblemDetail.detail when available.
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
