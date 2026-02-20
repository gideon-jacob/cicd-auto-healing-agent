// ─── Enums ───────────────────────────────────────────────────────────────────

export type RunStatus =
    | "QUEUED"
    | "CLONING"
    | "RUNNING"
    | "AGENT_FIXING"
    | "PASSED"
    | "FAILED"
    | "ERROR";

export type BugType =
    | "LINTING"
    | "SYNTAX"
    | "LOGIC"
    | "TYPE_ERROR"
    | "IMPORT"
    | "INDENTATION";

export type FixStatus = "FIXED" | "FAILED";

export type StageStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "SKIPPED";

export type AgentStepStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED";

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface Fix {
    file: string;
    bugType: BugType;
    lineNumber: number;
    description: string;
    commitMessage: string;
    commitSha: string;
    status: FixStatus;
    iteration: number;
}

export interface PipelineStage {
    name: string;
    status: StageStatus;
    startedAt: string | null;
    finishedAt: string | null;
    errorLog?: string;
}

export interface AgentStep {
    step: number;
    action: string;
    status: AgentStepStatus;
    timestamp: string;
}

export interface TimelineIteration {
    iteration: number;
    status: string;
    startedAt: string;
    finishedAt: string | null;
    failuresFound: number;
    fixesApplied: number;
    jenkinsBuildUrl: string;
}

export interface Score {
    base: number;
    speedBonus: number;
    efficiencyPenalty: number;
    total: number;
    totalCommits: number;
}

export interface RunSummary {
    totalFailuresDetected: number;
    totalFixesApplied: number;
    finalCicdStatus: string;
    totalTimeSeconds: number;
    startedAt: string;
    finishedAt: string | null;
}

// ─── Request / Response ──────────────────────────────────────────────────────

export interface AgentRunRequest {
    repoUrl: string;
    teamName: string;
    teamLeader: string;
}

export interface AgentRunResponse {
    runId: string;
    status: RunStatus;
    branchName: string;
    createdAt: string;
}

// ─── Status response (GET /runs/:id/status) ──────────────────────────────────

export interface RunStatusResponse {
    runId: string;
    status: RunStatus;
    repoUrl: string;
    teamName: string;
    teamLeader: string;
    branchName: string;
    summary: RunSummary;
    score: Score;
    currentIteration: number;
    maxIterations: number;
    pipelineStages: PipelineStage[];
    agentSteps: AgentStep[];
}

// ─── Repo / Build ────────────────────────────────────────────────────────────

export interface Repo {
    name: string;
    repoUrl: string;
    latestRunId: string;
    latestStatus: RunStatus;
    createdAt: string;
}

export interface Build {
    runId: string;
    buildNumber: number;
    status: RunStatus;
    branchName: string;
    startedAt: string;
    finishedAt: string | null;
}
