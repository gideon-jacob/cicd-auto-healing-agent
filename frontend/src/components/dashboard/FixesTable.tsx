import { useAgentStore } from "@/store/agentStore";
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
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

const bugTypeColors: Record<string, string> = {
    LINTING: "bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/15",
    SYNTAX: "bg-orange-500/15 text-orange-400 border-orange-500/20 hover:bg-orange-500/15",
    LOGIC: "bg-purple-500/15 text-purple-400 border-purple-500/20 hover:bg-purple-500/15",
    TYPE_ERROR: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/15",
    IMPORT: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/15",
    INDENTATION: "bg-pink-500/15 text-pink-400 border-pink-500/20 hover:bg-pink-500/15",
};

export function FixesTable() {
    const fixes = useAgentStore((s) => s.fixes);
    if (fixes.length === 0) return null;

    const fixedCount = fixes.filter((f) => f.status === "FIXED").length;

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                    <span className="text-base">Fixes Applied</span>
                    <span className="text-xs font-normal text-muted-foreground">
                        {fixedCount}/{fixes.length} resolved
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead className="pl-6">File</TableHead>
                            <TableHead>Bug Type</TableHead>
                            <TableHead className="text-center">Line</TableHead>
                            <TableHead>Commit Message</TableHead>
                            <TableHead className="text-center pr-6">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fixes.map((fix, i) => (
                            <TableRow key={i} className="border-border/50 group">
                                <TableCell className="font-mono text-xs pl-6 text-foreground/80 group-hover:text-foreground transition-colors">
                                    {fix.file}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] px-2 ${bugTypeColors[fix.bugType] || ""}`}
                                    >
                                        {fix.bugType}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center tabular-nums text-muted-foreground">
                                    {fix.lineNumber}
                                </TableCell>
                                <TableCell className="text-xs max-w-[280px] truncate text-muted-foreground">
                                    {fix.commitMessage}
                                </TableCell>
                                <TableCell className="text-center pr-6">
                                    {fix.status === "FIXED" ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Fixed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-red-400 text-xs font-medium">
                                            <XCircle className="h-3.5 w-3.5" />
                                            Failed
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
