import { useEffect } from "react";
import { Search, FolderGit2, Cpu, Users } from "lucide-react";
import { NavItem } from "./NavItem";
import { UserProfile } from "./UserProfile";
import { ModeToggle } from "./mode-toggle";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgentStore } from "@/store/agentStore";

const TEAM_NAME = "Stack Over Lords";
const TEAM_LEADER = "Prasannaa";

const FALLBACK_REPOS = [
    { name: "cicd-auto-healing-agent", url: "https://github.com/gideon-jacob/cicd-auto-healing-agent" },
    { name: "pec-tracking-online-portal", url: "https://github.com/pec-developers/pec-tracking-online-portal" },
    { name: "pec-events-app", url: "https://github.com/pec-developers/pec-events-app" },
    { name: "online-shop-microservices", url: "https://github.com/gideon-jacob/online-shop-microservices" },
];

export function Sidebar() {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const repos = useAgentStore((s) => s.repos);
    const loadRepos = useAgentStore((s) => s.loadRepos);
    const selectRepo = useAgentStore((s) => s.selectRepo);

    useEffect(() => {
        loadRepos();
    }, [loadRepos]);

    // Use API repos if available, otherwise fallback
    const repoList = repos.length > 0
        ? repos.map((r) => ({ name: r.name, url: r.repoUrl }))
        : FALLBACK_REPOS;

    const filteredRepos = repoList.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-64 border-r border-border/50 h-screen flex flex-col bg-sidebar">
            {/* Brand Header */}
            <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/15">
                        <Cpu className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-tight">DevOps Agent</h2>
                        <p className="text-[10px] text-muted-foreground">CI/CD Healing Platform</p>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                        placeholder="Search repositories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 h-9 rounded-lg border border-input bg-background/50 px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>
            </div>

            {/* Team Info */}
            <div className="px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Users className="h-3 w-3" />
                    <span className="uppercase tracking-wider font-semibold text-[10px]">Team</span>
                </div>
                <p className="text-sm font-medium">{TEAM_NAME}</p>
                <p className="text-xs text-muted-foreground">Leader: {TEAM_LEADER}</p>
            </div>

            {/* Navigation Items (Repos) */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Repositories
                </div>
                {filteredRepos.map((repo) => (
                    <NavItem
                        key={repo.name}
                        name={repo.name}
                        icon={FolderGit2}
                        onClick={() => {
                            selectRepo(repo.name, repo.url, TEAM_NAME, TEAM_LEADER);
                            navigate(`/repo/${repo.name}`);
                        }}
                    />
                ))}
                {filteredRepos.length === 0 && (
                    <div className="px-2 py-6 text-xs text-center text-muted-foreground">
                        No repositories found.
                    </div>
                )}
            </div>

            {/* Theme Toggle Section */}
            <div className="px-3 py-3 border-t border-border/50">
                <ModeToggle />
            </div>

            {/* User Profile */}
            <UserProfile username="gideon" avatarUrl="https://github.com/shadcn.png" />
        </div>
    );
}

