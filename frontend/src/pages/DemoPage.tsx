import { useState } from "react"
import { useDemoStore } from "@/store/useDemoStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import {
    Activity,
    CreditCard,
    DollarSign,
    Download,
    Users,
    Bell,
    Minus,
    Plus,
    RotateCcw,
    Zap
} from "lucide-react"

export default function DemoPage() {
    const { count, increase, decrease, reset } = useDemoStore()
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true)
    const [volume, setVolume] = useState([50])

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
                <div className="flex items-center gap-2 font-semibold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Zap className="h-5 w-5" />
                    </div>
                    <span className="text-lg">AutoHeal</span>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <ModeToggle />
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Notifications</span>
                    </Button>
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$45,231.89</div>
                            <p className="text-xs text-muted-foreground">
                                +20.1% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+2350</div>
                            <p className="text-xs text-muted-foreground">
                                +180.1% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sales</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+12,234</div>
                            <p className="text-xs text-muted-foreground">
                                +19% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Now
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+573</div>
                            <p className="text-xs text-muted-foreground">
                                +201 since last hour
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Zustand Counter Demo</CardTitle>
                            <CardDescription>
                                Manage the global count state powered by Zustand.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                                <span className="text-8xl font-black tracking-tighter text-primary">{count}</span>
                                <Badge variant="outline" className="text-sm">Global State</Badge>
                            </div>
                            <div className="flex items-center justify-center gap-4">
                                <Button onClick={decrease} variant="outline" size="icon" className="h-12 w-12 rounded-full">
                                    <Minus className="h-6 w-6" />
                                </Button>
                                <Button onClick={reset} variant="ghost" size="lg" className="min-w-[100px]">
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                                <Button onClick={increase} size="icon" className="h-12 w-12 rounded-full">
                                    <Plus className="h-6 w-6" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>
                                Adjust dashboard settings and preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="general" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="general">General</TabsTrigger>
                                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                                </TabsList>
                                <TabsContent value="general" className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="volume">System Volume</Label>
                                        <div className="flex items-center gap-4">
                                            <Slider
                                                id="volume"
                                                value={volume}
                                                max={100}
                                                step={1}
                                                onValueChange={setVolume}
                                                className="flex-1"
                                            />
                                            <span className="w-8 text-right text-sm text-muted-foreground">{volume}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between space-y-2">
                                        <Label htmlFor="airplane-mode" className="flex flex-col space-y-1">
                                            <span>Airplane Mode</span>
                                            <span className="font-normal text-xs text-muted-foreground">Disable all network communications</span>
                                        </Label>
                                        <Switch id="airplane-mode" />
                                    </div>
                                </TabsContent>
                                <TabsContent value="notifications" className="space-y-4 py-4">
                                    <div className="flex items-center justify-between space-y-2">
                                        <Label htmlFor="notifications" className="flex flex-col space-y-1">
                                            <span>Enable Notifications</span>
                                            <span className="font-normal text-xs text-muted-foreground">Receive updates and alerts</span>
                                        </Label>
                                        <Switch
                                            id="notifications"
                                            checked={isNotificationsEnabled}
                                            onCheckedChange={setIsNotificationsEnabled}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email for alerts</Label>
                                        <Input id="email" placeholder="user@example.com" type="email" />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                Save Configuration
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    )
}
