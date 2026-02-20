import type {
    AgentRunRequest,
    AgentRunResponse,
    RunStatusResponse,
    Fix,
    TimelineIteration,
    Repo,
    Build,
} from "@/types";

// ─── Config ──────────────────────────────────────────────────────────────────

const API_BASE_URL =
    (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a snake_case key to camelCase */
function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/** Recursively convert all keys from snake_case to camelCase */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapKeys(obj: any): any {
    if (Array.isArray(obj)) return obj.map(mapKeys);
    if (obj !== null && typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [snakeToCamel(k), mapKeys(v)])
        );
    }
    return obj;
}

/** Convert a camelCase key to snake_case */
function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/** Convert all keys from camelCase to snake_case (shallow) */
function toSnake(obj: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [camelToSnake(k), v])
    );
}

export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const res = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...init?.headers,
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new ApiError(
            res.status,
            (body as { message?: string }).message ?? `Request failed: ${res.status}`,
        );
    }

    const json = await res.json();
    return mapKeys(json) as T;
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

/** POST /api/agent/run */
export async function triggerRun(req: AgentRunRequest): Promise<AgentRunResponse> {
    return request<AgentRunResponse>("/api/agent/run", {
        method: "POST",
        body: JSON.stringify(toSnake(req as unknown as Record<string, unknown>)),
    });
}

/** GET /api/runs/:run_id/status */
export async function getRunStatus(runId: string): Promise<RunStatusResponse> {
    return request<RunStatusResponse>(`/api/runs/${runId}/status`);
}

/** GET /api/runs/:run_id/fixes */
export async function getRunFixes(runId: string): Promise<{ fixes: Fix[] }> {
    return request<{ fixes: Fix[] }>(`/api/runs/${runId}/fixes`);
}

/** GET /api/runs/:run_id/timeline */
export async function getRunTimeline(runId: string): Promise<{
    iterations: TimelineIteration[];
    currentIteration: number;
    maxIterations: number;
}> {
    return request(`/api/runs/${runId}/timeline`);
}

/** GET /api/runs/:run_id/results */
export async function getRunResults(runId: string): Promise<Record<string, unknown>> {
    return request(`/api/runs/${runId}/results`);
}

/** GET /api/repos */
export async function listRepos(): Promise<{ repos: Repo[] }> {
    return request<{ repos: Repo[] }>("/api/repos");
}

/** GET /api/repos/:repo_name/builds */
export async function listBuilds(repoName: string): Promise<{ builds: Build[] }> {
    return request<{ builds: Build[] }>(`/api/repos/${repoName}/builds`);
}
