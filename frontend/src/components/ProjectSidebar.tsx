import { ArrowLeft, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavItem } from "./NavItem";
import { UserProfile } from "./UserProfile";

const BUILDS = [
    { name: "Build #1024 - Failed", active: false },
    { name: "Build #1023 - Success", active: false },
    { name: "Build #1022 - Success", active: false },
    { name: "Build #1021 - Failed", active: false },
];

export function ProjectSidebar() {
    const navigate = useNavigate();

    return (
        <div className="w-64 border-r h-screen flex flex-col bg-background">
            {/* Back Button Header */}
            <div className="p-4 border-b flex items-center gap-2">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </button>
            </div>

            {/* Builds List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Recent Builds
                </div>
                {BUILDS.map((build) => (
                    <NavItem
                        key={build.name}
                        name={build.name}
                        icon={Box}
                        active={build.active}
                    />
                ))}
            </div>

            {/* User Profile */}
            <UserProfile username="gideon" avatarUrl="https://github.com/shadcn.png" />
        </div>
    );
}
