// ─── Enums ───────────────────────────────────────────────────────────────────

export type RunStatus =
    | 'QUEUED'
    | 'CLONING'
    | 'RUNNING'
    | 'AGENT_FIXING'
    | 'PASSED'
    | 'FAILED'
    | 'ERROR';

export type BugType =
    | 'LINTING'
    | 'SYNTAX'
    | 'LOGIC'
    | 'TYPE_ERROR'
    | 'IMPORT'
    | 'INDENTATION';

export type FixStatus = 'FIXED' | 'FAILED';

export type StageStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';

export type AgentStepStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'FAILED';

// ─── Request / Response ──────────────────────────────────────────────────────

export interface AgentRunRequest {
    repo_url: string;
    team_name: string;
    team_leader: string;
}

export interface AgentRunResponse {
    run_id: string;
    status: RunStatus;
    branch_name: string;
    created_at: string;
}

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface PipelineStage {
    name: string;
    status: StageStatus;
    started_at: string | null;
    finished_at: string | null;
    error_log?: string;
}

export interface AgentStep {
    step: number;
    action: string;
    status: AgentStepStatus;
    timestamp: string;
}

export interface Fix {
    file: string;
    bug_type: BugType;
    line_number: number;
    description: string;
    commit_message: string;
    commit_sha: string;
    status: FixStatus;
    iteration: number;
}

export interface Score {
    base: number;
    speed_bonus: number;
    efficiency_penalty: number;
    total: number;
    total_commits: number;
}

export interface RunSummary {
    total_failures_detected: number;
    total_fixes_applied: number;
    final_cicd_status: string;
    total_time_seconds: number;
    started_at: string;
    finished_at: string | null;
}

export interface TimelineIteration {
    iteration: number;
    status: string;
    started_at: string;
    finished_at: string | null;
    failures_found: number;
    fixes_applied: number;
    jenkins_build_url: string;
}

// ─── Aggregate Run Object ────────────────────────────────────────────────────

export interface AgentRun {
    run_id: string;
    status: RunStatus;
    repo_url: string;
    repo_name: string;
    team_name: string;
    team_leader: string;
    branch_name: string;
    created_at: string;

    summary: RunSummary;
    score: Score;

    current_iteration: number;
    max_iterations: number;

    pipeline_stages: PipelineStage[];
    agent_steps: AgentStep[];
    fixes: Fix[];
    timeline: TimelineIteration[];
}

// ─── Repo / Build ────────────────────────────────────────────────────────────

export interface Repo {
    name: string;
    repo_url: string;
    latest_run_id: string;
    latest_status: RunStatus;
    created_at: string;
}

export interface Build {
    run_id: string;
    build_number: number;
    status: RunStatus;
    branch_name: string;
    started_at: string;
    finished_at: string | null;
}

// ─── Jenkins Webhook ─────────────────────────────────────────────────────────

export interface JenkinsWebhookPayload {
    build_number: number;
    status: 'SUCCESS' | 'FAILURE';
    repo_url: string;
    branch: string;
    log_url: string;
    timestamp: string;
}

// ─── Results JSON ────────────────────────────────────────────────────────────

export interface ResultsJSON {
    run_id: string;
    repo_url: string;
    team_name: string;
    team_leader: string;
    branch_name: string;
    status: RunStatus;
    summary: RunSummary;
    score: Score;
    fixes: Fix[];
    timeline: TimelineIteration[];
    generated_at: string;
}
