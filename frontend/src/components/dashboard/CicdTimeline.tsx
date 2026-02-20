import { useAgentStore } from "@/store/agentStore";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, Timer } from "lucide-react";

export function CicdTimeline() {
    const timeline = useAgentStore((s) => s.timeline);
    const currentIteration = useAgentStore((s) => s.currentIteration);
    const maxIterations = useAgentStore((s) => s.maxIterations);

    if (timeline.length === 0) return null;

    return (
        <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                    <span className="text-base">CI/CD Timeline</span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Timer className="h-3.5 w-3.5" />
                        {currentIteration}/{maxIterations}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {timeline.map((iter, i) => {
                        const isPassed = iter.status === "PASSED";
                        const isLast = i === timeline.length - 1;
                        const time = new Date(iter.startedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        });

                        return (
                            <div key={iter.iteration} className="flex gap-4 pb-6 last:pb-0">
                                {/* Timeline connector */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${isPassed
                                                ? "bg-emerald-500/15 text-emerald-400"
                                                : "bg-red-500/15 text-red-400"
                                            }`}
                                    >
                                        {isPassed ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <XCircle className="h-4 w-4" />
                                        )}
                                    </div>
                                    {!isLast && (
                                        <div className="w-px flex-1 bg-border/50 mt-1" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex items-start justify-between pt-1">
                                    <div>
                                        <p className="text-sm font-medium">
                                            Iteration #{iter.iteration}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
                                        {(iter.failuresFound > 0 || iter.fixesApplied > 0) && (
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {iter.failuresFound} found · {iter.fixesApplied} fixed
                                            </p>
                                        )}
                                    </div>
                                    <div
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${isPassed
                                                ? "bg-emerald-500/15 text-emerald-400"
                                                : "bg-red-500/15 text-red-400"
                                            }`}
                                    >
                                        {isPassed ? "PASS" : "FAIL"}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
