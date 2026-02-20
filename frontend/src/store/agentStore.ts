import { create } from "zustand";
import type { RunConfig, RunSummary, Score, Fix, CicdRun } from "@/types";

interface AgentState {
    isRunning: boolean;
    runConfig: RunConfig | null;
    runSummary: RunSummary | null;
    score: Score | null;
    fixes: Fix[];
    cicdRuns: CicdRun[];
    startRun: (config: RunConfig) => void;
    resetRun: () => void;
}

function generateBranchName(teamName: string, leaderName: string): string {
    return `${teamName.toUpperCase().replace(/\s+/g, "_")}_${leaderName.toUpperCase().replace(/\s+/g, "_")}_AI_Fix`;
}

const MOCK_FIXES: Fix[] = [
    { file: "src/utils.py", bugType: "LINTING", lineNumber: 15, commitMessage: "[AI-AGENT] Remove unused import 'os'", status: "fixed" },
    { file: "src/validator.py", bugType: "SYNTAX", lineNumber: 8, commitMessage: "[AI-AGENT] Add missing colon after if statement", status: "fixed" },
    { file: "src/calculator.py", bugType: "LOGIC", lineNumber: 42, commitMessage: "[AI-AGENT] Fix off-by-one error in loop boundary", status: "fixed" },
    { file: "src/models.py", bugType: "TYPE_ERROR", lineNumber: 23, commitMessage: "[AI-AGENT] Fix incorrect type annotation str -> int", status: "fixed" },
    { file: "src/config.py", bugType: "IMPORT", lineNumber: 3, commitMessage: "[AI-AGENT] Fix circular import by restructuring", status: "fixed" },
    { file: "src/parser.py", bugType: "INDENTATION", lineNumber: 67, commitMessage: "[AI-AGENT] Fix mixed tabs and spaces", status: "fixed" },
    { file: "src/auth.py", bugType: "LOGIC", lineNumber: 91, commitMessage: "[AI-AGENT] Fix token expiry comparison logic", status: "fixed" },
    { file: "tests/test_utils.py", bugType: "SYNTAX", lineNumber: 12, commitMessage: "[AI-AGENT] Fix missing closing parenthesis", status: "failed" },
];

const MOCK_CICD_RUNS: CicdRun[] = [
    { iteration: 1, status: "failed", timestamp: "2026-02-20T06:00:00Z" },
    { iteration: 2, status: "failed", timestamp: "2026-02-20T06:02:15Z" },
    { iteration: 3, status: "passed", timestamp: "2026-02-20T06:03:42Z" },
];

export const useAgentStore = create<AgentState>((set) => ({
    isRunning: false,
    runConfig: null,
    runSummary: null,
    score: null,
    fixes: [],
    cicdRuns: [],

    startRun: (config) => {
        const totalFixes = MOCK_FIXES.filter((f) => f.status === "fixed").length;
        const totalFailures = MOCK_FIXES.length;
        const totalCommits = 18;
        const speedBonus = 10; // completed in < 5 min
        const efficiencyPenalty = 0; // 18 commits < 20
        const total = 100 + speedBonus - efficiencyPenalty;

        set({
            isRunning: false,
            runConfig: config,
            runSummary: {
                repoUrl: config.repoUrl,
                teamName: config.teamName,
                teamLeader: config.teamLeader,
                branchName: generateBranchName(config.teamName, config.teamLeader),
                totalFailures,
                totalFixes,
                cicdStatus: "PASSED",
                timeTaken: "3m 42s",
            },
            score: {
                base: 100,
                speedBonus,
                efficiencyPenalty,
                totalCommits,
                total,
            },
            fixes: MOCK_FIXES,
            cicdRuns: MOCK_CICD_RUNS,
        });
    },

    resetRun: () =>
        set({
            isRunning: false,
            runConfig: null,
            runSummary: null,
            score: null,
            fixes: [],
            cicdRuns: [],
        }),
}));
