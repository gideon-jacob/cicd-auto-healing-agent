import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
    name: string;
    icon?: LucideIcon;
    active?: boolean;
    onClick?: () => void;
}

export function NavItem({ name, icon: Icon, active, onClick }: NavItemProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors text-sm font-medium",
                active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{name}</span>
        </div>
    );
}
