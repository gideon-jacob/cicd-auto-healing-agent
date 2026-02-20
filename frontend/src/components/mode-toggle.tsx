import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()

    const isDark = theme === "dark"

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                        Appearance
                    </span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                    {isDark ? "Dark" : "Light"}
                </span>
            </div>

            {/* Pill toggle */}
            <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="group relative flex items-center w-full h-9 rounded-lg bg-muted/60 p-1 transition-colors hover:bg-muted"
                aria-label="Toggle theme"
            >
                {/* Sliding highlight */}
                <span
                    className={`absolute h-7 w-[calc(50%-4px)] rounded-md bg-background shadow-sm border border-border/50 transition-all duration-300 ease-in-out ${isDark ? "left-[calc(50%+2px)]" : "left-1"
                        }`}
                />

                {/* Light option */}
                <span
                    className={`relative z-10 flex items-center justify-center gap-1.5 flex-1 h-7 text-xs font-medium transition-colors duration-200 ${!isDark
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-muted-foreground/80"
                        }`}
                >
                    <Sun className="h-3.5 w-3.5" />
                    Light
                </span>

                {/* Dark option */}
                <span
                    className={`relative z-10 flex items-center justify-center gap-1.5 flex-1 h-7 text-xs font-medium transition-colors duration-200 ${isDark
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-muted-foreground/80"
                        }`}
                >
                    <Moon className="h-3.5 w-3.5" />
                    Dark
                </span>
            </button>
        </div>
    )
}
