import { useAgentStore } from "@/store/agentStore";
import { Bug, CheckCircle2, GitCommitHorizontal, Clock } from "lucide-react";

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function StatsBar() {
    const summary = useAgentStore((s) => s.summary);
    const score = useAgentStore((s) => s.score);
    if (!summary) return null;

    const stats = [
        {
            label: "Failures Detected",
            value: summary.totalFailuresDetected,
            icon: Bug,
            color: "text-red-400",
            bg: "bg-red-500/10",
        },
        {
            label: "Fixes Applied",
            value: summary.totalFixesApplied,
            icon: CheckCircle2,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Commits",
            value: score?.totalCommits ?? 0,
            icon: GitCommitHorizontal,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            label: "Time Taken",
            value: formatTime(summary.totalTimeSeconds),
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="flex items-center gap-3 rounded-xl border bg-card/50 p-4 transition-colors hover:bg-card"
                >
                    <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${stat.bg}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                        <p className="text-xl font-bold tabular-nums">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
