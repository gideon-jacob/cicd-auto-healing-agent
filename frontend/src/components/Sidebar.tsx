import { Search, FolderGit2, Cpu } from "lucide-react";
import { NavItem } from "./NavItem";
import { UserProfile } from "./UserProfile";
import { ModeToggle } from "./mode-toggle";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const REPOS = [
    { name: "cicd-auto-healing-agent", active: false },
    { name: "personal-website", active: false },
    { name: "ecommerce-platform", active: false },
    { name: "notes-app", active: false },
];

export function Sidebar() {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const filteredRepos = REPOS.filter((repo) =>
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
                        active={repo.active}
                        onClick={() => navigate(`/repo/${repo.name}`)}
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
