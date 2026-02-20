import { useAgentStore } from "@/store/agentStore";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Globe, Users } from "lucide-react";

export function RunSummaryCard() {
    const summary = useAgentStore((s) => s.summary);
    const repoUrl = useAgentStore((s) => s.repoUrl);
    const teamName = useAgentStore((s) => s.teamName);
    const teamLeader = useAgentStore((s) => s.teamLeader);
    const branchName = useAgentStore((s) => s.branchName);
    const status = useAgentStore((s) => s.status);

    if (!summary) return null;

    const cicdStatus = summary.finalCicdStatus ?? status ?? "RUNNING";

    return (
        <Card className="h-full border-border/50">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                    <span className="text-base">Run Summary</span>
                    <Badge
                        className={
                            cicdStatus === "PASSED"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 shadow-emerald-500/10 shadow-sm"
                                : cicdStatus === "FAILED" || cicdStatus === "ERROR"
                                    ? "bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500/20 shadow-red-500/10 shadow-sm"
                                    : "bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 shadow-amber-500/10 shadow-sm"
                        }
                    >
                        {cicdStatus}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-5">
                    <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/10 shrink-0 mt-0.5">
                            <Globe className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Repository</p>
                            <p className="font-medium text-sm break-all mt-0.5">{repoUrl}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-purple-500/10 shrink-0 mt-0.5">
                            <Users className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Team</p>
                            <p className="font-medium text-sm mt-0.5">{teamName}</p>
                            <p className="text-xs text-muted-foreground">Leader: {teamLeader}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10 shrink-0 mt-0.5">
                            <GitBranch className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Branch Created</p>
                            <code className="text-xs font-mono bg-muted/50 px-2 py-1 rounded mt-1 inline-block break-all">
                                {branchName}
                            </code>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
