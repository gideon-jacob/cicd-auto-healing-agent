export type BugType = "LINTING" | "SYNTAX" | "LOGIC" | "TYPE_ERROR" | "IMPORT" | "INDENTATION";
export type FixStatus = "fixed" | "failed";
export type CicdStatus = "PASSED" | "FAILED" | "RUNNING";

export interface Fix {
    file: string;
    bugType: BugType;
    lineNumber: number;
    commitMessage: string;
    status: FixStatus;
}

export interface CicdRun {
    iteration: number;
    status: "passed" | "failed";
    timestamp: string;
}

export interface RunConfig {
    repoUrl: string;
    teamName: string;
    teamLeader: string;
}

export interface RunSummary {
    repoUrl: string;
    teamName: string;
    teamLeader: string;
    branchName: string;
    totalFailures: number;
    totalFixes: number;
    cicdStatus: CicdStatus;
    timeTaken: string; // e.g. "3m 42s"
}

export interface Score {
    base: number;
    speedBonus: number;
    efficiencyPenalty: number;
    totalCommits: number;
    total: number;
}
