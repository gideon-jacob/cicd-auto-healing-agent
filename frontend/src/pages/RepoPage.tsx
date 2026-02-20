import { useParams, useNavigate } from "react-router-dom";
import { useAgentStore } from "@/store/agentStore";
import { RunSummaryCard } from "@/components/dashboard/RunSummaryCard";
import { ScoreBreakdown } from "@/components/dashboard/ScoreBreakdown";
import { FixesTable } from "@/components/dashboard/FixesTable";
import { CicdTimeline } from "@/components/dashboard/CicdTimeline";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity } from "lucide-react";

export default function RepoPage() {
    const { repoName } = useParams();
    const navigate = useNavigate();
    const runSummary = useAgentStore((s) => s.runSummary);

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
                    {runSummary && (
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${runSummary.cicdStatus === "PASSED"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-red-500/15 text-red-400"
                            }`}>
                            {runSummary.cicdStatus}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 lg:p-8 overflow-auto">
                {runSummary ? (
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Stats bar */}
                        <div className="animate-fade-in-up">
                            <StatsBar />
                        </div>

                        {/* Row 1: Summary + Score */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in-up-delay-1">
                            <div className="lg:col-span-3">
                                <RunSummaryCard />
                            </div>
                            <div className="lg:col-span-2">
                                <ScoreBreakdown />
                            </div>
                        </div>

                        {/* Row 2: Fixes + Timeline side by side */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in-up-delay-2">
                            <div className="xl:col-span-2">
                                <FixesTable />
                            </div>
                            <div>
                                <CicdTimeline />
                            </div>
                        </div>
                    </div>
                ) : (
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
