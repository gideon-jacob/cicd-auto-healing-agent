import { Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileProps {
    username: string;
    avatarUrl?: string;
}

export function UserProfile({ username, avatarUrl }: UserProfileProps) {
    return (
        <div className="flex items-center justify-between p-4 border-t mt-auto">
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} alt={username} />
                    <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{username}</span>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                <Settings className="h-4 w-4" />
            </button>
        </div>
    );
}
