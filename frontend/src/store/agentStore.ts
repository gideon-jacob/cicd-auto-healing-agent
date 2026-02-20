import { create } from "zustand";
import type {
    AgentRunRequest,
    RunStatus,
    RunSummary,
    Score,
    Fix,
    TimelineIteration,
    PipelineStage,
    AgentStep,
    Repo,
    Build,
} from "@/types";
import * as api from "@/lib/api";

// ─── State Shape ─────────────────────────────────────────────────────────────

interface AgentState {
    // Run state
    runId: string | null;
    status: RunStatus | null;
    isRunning: boolean;
    error: string | null;

    // Run config
    repoUrl: string;
    teamName: string;
    teamLeader: string;
    branchName: string;

    // Run data
    summary: RunSummary | null;
    score: Score | null;
    fixes: Fix[];
    timeline: TimelineIteration[];
    pipelineStages: PipelineStage[];
    agentSteps: AgentStep[];
    currentIteration: number;
    maxIterations: number;

    // Repos / Builds
    repos: Repo[];
    builds: Build[];

    // Polling
    _pollTimer: ReturnType<typeof setInterval> | null;

    // Actions
    startRun: (req: AgentRunRequest) => Promise<void>;
    selectRepo: (name: string, url: string, teamName: string, teamLeader: string) => Promise<void>;
    pollStatus: () => Promise<void>;
    startPolling: () => void;
    stopPolling: () => void;
    loadRepos: () => Promise<void>;
    loadBuilds: (repoName: string) => Promise<void>;
    resetRun: () => void;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

function generateBranchName(teamName: string, leaderName: string): string {
    return `${teamName.toUpperCase().replace(/\s+/g, "_")}_${leaderName.toUpperCase().replace(/\s+/g, "_")}_AI_Fix`;
}

const MOCK_FIXES: Fix[] = [
    { file: "src/utils.py", bugType: "LINTING", lineNumber: 15, description: "Unused import 'os'", commitMessage: "[AI-AGENT] Remove unused import 'os'", commitSha: "a1b2c3d", status: "FIXED", iteration: 1 },
    { file: "src/validator.py", bugType: "SYNTAX", lineNumber: 8, description: "Missing colon after if", commitMessage: "[AI-AGENT] Add missing colon after if statement", commitSha: "d4e5f6g", status: "FIXED", iteration: 1 },
    { file: "src/calculator.py", bugType: "LOGIC", lineNumber: 42, description: "Off-by-one error", commitMessage: "[AI-AGENT] Fix off-by-one error in loop boundary", commitSha: "h7i8j9k", status: "FIXED", iteration: 1 },
    { file: "src/models.py", bugType: "TYPE_ERROR", lineNumber: 23, description: "Wrong type annotation", commitMessage: "[AI-AGENT] Fix type annotation str -> int", commitSha: "l0m1n2o", status: "FIXED", iteration: 2 },
    { file: "src/config.py", bugType: "IMPORT", lineNumber: 3, description: "Circular import", commitMessage: "[AI-AGENT] Fix circular import by restructuring", commitSha: "p3q4r5s", status: "FIXED", iteration: 2 },
    { file: "src/parser.py", bugType: "INDENTATION", lineNumber: 67, description: "Mixed tabs and spaces", commitMessage: "[AI-AGENT] Fix mixed tabs and spaces", commitSha: "t6u7v8w", status: "FIXED", iteration: 2 },
    { file: "src/auth.py", bugType: "LOGIC", lineNumber: 91, description: "Token expiry comparison", commitMessage: "[AI-AGENT] Fix token expiry comparison logic", commitSha: "x9y0z1a", status: "FIXED", iteration: 3 },
    { file: "tests/test_utils.py", bugType: "SYNTAX", lineNumber: 12, description: "Missing parenthesis", commitMessage: "[AI-AGENT] Fix missing closing parenthesis", commitSha: "b2c3d4e", status: "FAILED", iteration: 3 },
];

const MOCK_TIMELINE: TimelineIteration[] = [
    { iteration: 1, status: "FAILED", startedAt: "2026-02-20T06:00:00Z", finishedAt: "2026-02-20T06:01:30Z", failuresFound: 3, fixesApplied: 3, jenkinsBuildUrl: "" },
    { iteration: 2, status: "FAILED", startedAt: "2026-02-20T06:01:45Z", finishedAt: "2026-02-20T06:02:55Z", failuresFound: 3, fixesApplied: 3, jenkinsBuildUrl: "" },
    { iteration: 3, status: "PASSED", startedAt: "2026-02-20T06:03:10Z", finishedAt: "2026-02-20T06:03:42Z", failuresFound: 2, fixesApplied: 1, jenkinsBuildUrl: "" },
];

const MOCK_BUILDS: Build[] = [
    { runId: "run-001", buildNumber: 1, status: "FAILED", branchName: "STACK_OVER_LORDS_PRASANNAA_AI_Fix", startedAt: "2026-02-19T10:00:00Z", finishedAt: "2026-02-19T10:03:12Z" },
    { runId: "run-002", buildNumber: 2, status: "FAILED", branchName: "STACK_OVER_LORDS_PRASANNAA_AI_Fix", startedAt: "2026-02-19T14:22:00Z", finishedAt: "2026-02-19T14:25:45Z" },
    { runId: "run-003", buildNumber: 3, status: "PASSED", branchName: "STACK_OVER_LORDS_PRASANNAA_AI_Fix", startedAt: "2026-02-20T06:00:00Z", finishedAt: "2026-02-20T06:03:42Z" },
];

function applyMockData(config: AgentRunRequest): Partial<AgentState> {
    const branchName = generateBranchName(config.teamName, config.teamLeader);
    return {
        runId: `mock-${Date.now()}`,
        status: "PASSED",
        isRunning: false,
        repoUrl: config.repoUrl,
        teamName: config.teamName,
        teamLeader: config.teamLeader,
        branchName,
        summary: {
            totalFailuresDetected: 8,
            totalFixesApplied: 7,
            finalCicdStatus: "PASSED",
            totalTimeSeconds: 222,
            startedAt: "2026-02-20T06:00:00Z",
            finishedAt: "2026-02-20T06:03:42Z",
        },
        score: { base: 100, speedBonus: 10, efficiencyPenalty: 0, total: 110, totalCommits: 18 },
        fixes: MOCK_FIXES,
        timeline: MOCK_TIMELINE,
        currentIteration: 3,
        maxIterations: 5,
        pipelineStages: [],
        agentSteps: [],
        builds: MOCK_BUILDS,
    };
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAgentStore = create<AgentState>((set, get) => ({
    runId: null,
    status: null,
    isRunning: false,
    error: null,
    repoUrl: "",
    teamName: "",
    teamLeader: "",
    branchName: "",
    summary: null,
    score: null,
    fixes: [],
    timeline: [],
    pipelineStages: [],
    agentSteps: [],
    currentIteration: 0,
    maxIterations: 5,
    repos: [],
    builds: [],
    _pollTimer: null,

    startRun: async (req) => {
        set({ isRunning: true, error: null, status: "QUEUED" });
        try {
            const res = await api.triggerRun(req);
            set({
                runId: res.runId,
                status: res.status,
                branchName: res.branchName,
                repoUrl: req.repoUrl,
                teamName: req.teamName,
                teamLeader: req.teamLeader,
            });
            // Start polling for live updates
            get().startPolling();
        } catch {
            // API unavailable — use mock data for demo
            set(applyMockData(req));
        }
    },

    selectRepo: async (name, url, teamName, teamLeader) => {
        get().stopPolling();
        const branchName = generateBranchName(teamName, teamLeader);
        // Set repo context immediately
        set({
            isRunning: false,
            error: null,
            repoUrl: url,
            teamName,
            teamLeader,
            branchName,
            runId: null,
            status: null,
            summary: null,
            score: null,
            fixes: [],
            timeline: [],
            pipelineStages: [],
            agentSteps: [],
            currentIteration: 0,
        });
        // Try loading builds from API, fallback to mock
        try {
            const res = await api.listBuilds(name);
            set({ builds: res.builds });
        } catch {
            set({ builds: MOCK_BUILDS });
        }
    },

    pollStatus: async () => {
        const { runId } = get();
        if (!runId || runId.startsWith("mock-")) return;

        try {
            const [statusRes, fixesRes, timelineRes] = await Promise.all([
                api.getRunStatus(runId),
                api.getRunFixes(runId),
                api.getRunTimeline(runId),
            ]);

            const isTerminal = ["PASSED", "FAILED", "ERROR"].includes(statusRes.status);

            set({
                status: statusRes.status,
                summary: statusRes.summary,
                score: statusRes.score,
                pipelineStages: statusRes.pipelineStages,
                agentSteps: statusRes.agentSteps,
                currentIteration: statusRes.currentIteration,
                maxIterations: statusRes.maxIterations,
                repoUrl: statusRes.repoUrl,
                teamName: statusRes.teamName,
                teamLeader: statusRes.teamLeader,
                branchName: statusRes.branchName,
                fixes: fixesRes.fixes,
                timeline: timelineRes.iterations,
                isRunning: !isTerminal,
            });

            if (isTerminal) {
                get().stopPolling();
            }
        } catch {
            // Silently skip poll errors
        }
    },

    startPolling: () => {
        const existing = get()._pollTimer;
        if (existing) clearInterval(existing);
        const timer = setInterval(() => get().pollStatus(), 3000);
        set({ _pollTimer: timer });
    },

    stopPolling: () => {
        const timer = get()._pollTimer;
        if (timer) {
            clearInterval(timer);
            set({ _pollTimer: null });
        }
    },

    loadRepos: async () => {
        try {
            const res = await api.listRepos();
            set({ repos: res.repos });
        } catch {
            // Keep existing repos if API unavailable
        }
    },

    loadBuilds: async (repoName) => {
        try {
            const res = await api.listBuilds(repoName);
            set({ builds: res.builds });
        } catch {
            // Keep existing builds if API unavailable
        }
    },

    resetRun: () => {
        get().stopPolling();
        set({
            runId: null,
            status: null,
            isRunning: false,
            error: null,
            repoUrl: "",
            teamName: "",
            teamLeader: "",
            branchName: "",
            summary: null,
            score: null,
            fixes: [],
            timeline: [],
            pipelineStages: [],
            agentSteps: [],
            currentIteration: 0,
            maxIterations: 5,
            builds: [],
        });
    },
}));
