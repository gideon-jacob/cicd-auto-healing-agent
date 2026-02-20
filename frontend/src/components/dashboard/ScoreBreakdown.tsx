import { useAgentStore } from "@/store/agentStore";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Gauge, GitCommitHorizontal, Trophy } from "lucide-react";

export function ScoreBreakdown() {
    const score = useAgentStore((s) => s.score);
    if (!score) return null;

    const maxScore = 110;
    const percentage = Math.min(Math.round((score.total / maxScore) * 100), 100);

    return (
        <Card className="h-full border-border/50">
            <CardHeader className="pb-4">
                <CardTitle className="text-base">Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                {/* Big score display */}
                <div className="flex items-center justify-center">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl" />
                        <div className="relative flex flex-col items-center px-6 py-4">
                            <Trophy className="h-5 w-5 text-emerald-400 mb-1" />
                            <span className="text-4xl font-extrabold tabular-nums text-emerald-400">
                                {score.total}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">Final Score</span>
                        </div>
                    </div>
                </div>

                <Progress value={percentage} className="h-2" />

                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="flex items-center justify-center h-6 w-6 rounded bg-muted/50">
                                <Gauge className="h-3.5 w-3.5" />
                            </div>
                            Base Score
                        </div>
                        <span className="font-semibold tabular-nums">{score.base}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="flex items-center justify-center h-6 w-6 rounded bg-emerald-500/10">
                                <Zap className="h-3.5 w-3.5 text-emerald-400" />
                            </div>
                            Speed Bonus
                        </div>
                        <span className="font-semibold tabular-nums text-emerald-400">+{score.speedBonus}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="flex items-center justify-center h-6 w-6 rounded bg-muted/50">
                                <GitCommitHorizontal className="h-3.5 w-3.5" />
                            </div>
                            Efficiency ({score.totalCommits} commits)
                        </div>
                        <span className={`font-semibold tabular-nums ${score.efficiencyPenalty > 0 ? "text-red-400" : "text-emerald-400"}`}>
                            {score.efficiencyPenalty > 0 ? `−${score.efficiencyPenalty}` : "−0"}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
