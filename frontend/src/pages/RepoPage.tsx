import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAgentStore } from "@/store/agentStore";
import { RunSummaryCard } from "@/components/dashboard/RunSummaryCard";
import { ScoreBreakdown } from "@/components/dashboard/ScoreBreakdown";
import { FixesTable } from "@/components/dashboard/FixesTable";
import { CicdTimeline } from "@/components/dashboard/CicdTimeline";
import { StatsBar } from "@/components/dashboard/StatsBar";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, Loader2, GitBranch, Globe, History, Sparkles } from "lucide-react";

export default function RepoPage() {
    const { repoName } = useParams();
    const navigate = useNavigate();
    const summary = useAgentStore((s) => s.summary);
    const status = useAgentStore((s) => s.status);
    const isRunning = useAgentStore((s) => s.isRunning);
    const startPolling = useAgentStore((s) => s.startPolling);
    const stopPolling = useAgentStore((s) => s.stopPolling);
    const runId = useAgentStore((s) => s.runId);
    const builds = useAgentStore((s) => s.builds);
    const repoUrl = useAgentStore((s) => s.repoUrl);
    const teamName = useAgentStore((s) => s.teamName);
    const teamLeader = useAgentStore((s) => s.teamLeader);
    const branchName = useAgentStore((s) => s.branchName);
    const startRun = useAgentStore((s) => s.startRun);

    const handleRunAgent = async () => {
        if (!repoUrl) return;
        await startRun({ repoUrl, teamName, teamLeader });
    };

    // Poll while the run is active (non-mock)
    useEffect(() => {
        if (runId && !runId.startsWith("mock-") && isRunning) {
            startPolling();
        }
        return () => stopPolling();
    }, [runId, isRunning, startPolling, stopPolling]);

    const hasRunData = summary !== null;
    const hasContext = repoUrl !== "";
    const displayStatus = status ?? (summary ? "PASSED" : null);

    return (
        <div className="w-full min-h-full flex flex-col">
            {/* Top bar */}
            <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/")}
                            className="gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Dashboard
                        </Button>
                        <div className="h-5 w-px bg-border" />
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            <h1 className="text-lg font-semibold tracking-tight">
                                {repoName || "Repository"}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {isRunning && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Live
                            </div>
                        )}
                        {displayStatus && (
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${displayStatus === "PASSED"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : displayStatus === "FAILED" || displayStatus === "ERROR"
                                    ? "bg-red-500/15 text-red-400"
                                    : "bg-amber-500/15 text-amber-400"
                                }`}>
                                {displayStatus}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 lg:p-8 overflow-auto">
                {hasRunData ? (
                    /* ── Active / Completed Run Dashboard ── */
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div className="animate-fade-in-up">
                            <StatsBar />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in-up-delay-1">
                            <div className="lg:col-span-3">
                                <RunSummaryCard />
                            </div>
                            <div className="lg:col-span-2">
                                <ScoreBreakdown />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in-up-delay-2">
                            <div className="xl:col-span-2">
                                <FixesTable />
                            </div>
                            <div>
                                <CicdTimeline />
                            </div>
                        </div>
                    </div>
                ) : hasContext ? (
                    /* ── Repo Selected (from sidebar) — Show repo info + past builds ── */
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Repo info header */}
                        <Card className="border-border/50 animate-fade-in-up">
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 shrink-0">
                                        <Globe className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-xl font-bold tracking-tight">{repoName}</h2>
                                        <a
                                            href={repoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                                        >
                                            {repoUrl}
                                        </a>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span>Team: <strong className="text-foreground">{teamName}</strong></span>
                                            <span>Leader: <strong className="text-foreground">{teamLeader}</strong></span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                                            <GitBranch className="h-3 w-3" />
                                            <code className="font-mono">{branchName}</code>
                                        </div>
                                        <Button
                                            onClick={handleRunAgent}
                                            disabled={isRunning}
                                            size="sm"
                                            className="gap-2"
                                        >
                                            {isRunning ? (
                                                <>
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    Running...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                    Run Agent
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Past Builds */}
                        <Card className="border-border/50 animate-fade-in-up-delay-1">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-base">
                                        <History className="h-4 w-4 text-muted-foreground" />
                                        Past Runs
                                    </div>
                                    <span className="text-xs font-normal text-muted-foreground">
                                        {builds.length} build{builds.length !== 1 ? "s" : ""}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {builds.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-border/50 hover:bg-transparent">
                                                <TableHead className="pl-6">#</TableHead>
                                                <TableHead>Run ID</TableHead>
                                                <TableHead>Branch</TableHead>
                                                <TableHead>Started</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead className="text-center pr-6">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {builds.map((build) => {
                                                const started = new Date(build.startedAt);
                                                const finished = build.finishedAt ? new Date(build.finishedAt) : null;
                                                const durationSec = finished
                                                    ? Math.round((finished.getTime() - started.getTime()) / 1000)
                                                    : null;
                                                const durationStr = durationSec !== null
                                                    ? `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`
                                                    : "—";

                                                return (
                                                    <TableRow key={build.runId} className="border-border/50 group">
                                                        <TableCell className="pl-6 tabular-nums font-medium">
                                                            {build.buildNumber}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                                            {build.runId}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                                                            {build.branchName}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {started.toLocaleString([], {
                                                                month: "short",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </TableCell>
                                                        <TableCell className="text-xs tabular-nums text-muted-foreground">
                                                            {durationStr}
                                                        </TableCell>
                                                        <TableCell className="text-center pr-6">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${build.status === "PASSED"
                                                                ? "bg-emerald-500/15 text-emerald-400"
                                                                : "bg-red-500/15 text-red-400"
                                                                }`}>
                                                                {build.status}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="py-8 text-center text-sm text-muted-foreground">
                                        No past builds found for this repository.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* ── No data at all ── */
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4 max-w-md animate-fade-in-up">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-2">
                                <Activity className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h2 className="text-xl font-semibold">No Agent Run Yet</h2>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Go back to the dashboard and run the healing agent on this repository to see results.
                            </p>
                            <Button variant="outline" onClick={() => navigate("/")} className="mt-2">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
