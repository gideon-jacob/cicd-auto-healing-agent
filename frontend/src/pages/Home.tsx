import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, GitBranch, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAgentStore } from "@/store/agentStore";

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [repoUrl, setRepoUrl] = useState("");
    const [teamName, setTeamName] = useState("");
    const [teamLeader, setTeamLeader] = useState("");
    const navigate = useNavigate();
    const startRun = useAgentStore((s) => s.startRun);

    const handleRunAgent = () => {
        if (!repoUrl.trim() || !teamName.trim() || !teamLeader.trim()) return;
        setIsLoading(true);
        setTimeout(() => {
            startRun({ repoUrl, teamName, teamLeader });
            setIsLoading(false);
            const repoName = repoUrl.split("/").pop() || "new-repo";
            navigate(`/repo/${repoName}`);
        }, 3000);
    };

    const isFormValid = repoUrl.trim() && teamName.trim() && teamLeader.trim();

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4">
            {/* Hero header */}
            <div className="text-center mb-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                    <Shield className="h-3 w-3" />
                    Autonomous CI/CD Healing
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
                    DevOps Agent
                </h1>
                <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
                    Automatically detect, fix, and verify CI/CD pipeline failures using multi-agent AI
                </p>
            </div>

            <Card className="w-full animate-fade-in-up-delay-1 border-border/50 shadow-xl shadow-black/5 dark:shadow-black/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Analyze Repository
                    </CardTitle>
                    <CardDescription>
                        Enter your repository details to start the automated healing agent.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full items-center gap-5">
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="repoUrl" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                GitHub Repository URL
                            </Label>
                            <Input
                                id="repoUrl"
                                placeholder="https://github.com/username/repo"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                className="h-11"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="teamName" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Team Name
                                </Label>
                                <Input
                                    id="teamName"
                                    placeholder="e.g. RIFT ORGANISERS"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className="h-11"
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="teamLeader" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Team Leader
                                </Label>
                                <Input
                                    id="teamLeader"
                                    placeholder="e.g. Saiyam Kumar"
                                    value={teamLeader}
                                    onChange={(e) => setTeamLeader(e.target.value)}
                                    className="h-11"
                                />
                            </div>
                        </div>
                        {isFormValid && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 text-xs text-muted-foreground animate-fade-in-up">
                                <GitBranch className="h-3.5 w-3.5" />
                                Branch: <code className="font-mono text-foreground/80">
                                    {teamName.toUpperCase().replace(/\s+/g, "_")}_{teamLeader.toUpperCase().replace(/\s+/g, "_")}_AI_Fix
                                </code>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={() => { setRepoUrl(""); setTeamName(""); setTeamLeader(""); }}
                        disabled={isLoading}
                    >
                        Clear
                    </Button>
                    <Button
                        onClick={handleRunAgent}
                        disabled={isLoading || !isFormValid}
                        className="min-w-[140px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Run Agent
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
