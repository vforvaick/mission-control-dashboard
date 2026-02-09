"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const pageNames: Record<string, string> = {
    "/": "Kanban Board",
    "/agents": "Agent Status",
    "/activity": "Activity Feed",
    "/settings": "Settings",
};

export function Header() {
    const pathname = usePathname();
    const pageName = pageNames[pathname] || "Dashboard";

    return (
        <header className="fixed top-0 left-64 right-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="flex h-full items-center justify-between px-6">
                {/* Page Title */}
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-semibold text-foreground">{pageName}</h1>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                        Live
                    </Badge>
                </div>

                {/* Search */}
                <div className="flex-1 max-w-md mx-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks, agents..."
                            className="w-full pl-10 pr-12 bg-muted/50 border-border/50 focus:border-primary/50"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Command className="h-3 w-3" />
                            <span>K</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                            3
                        </span>
                    </Button>

                    <div className="h-8 w-px bg-border" />

                    {/* User Avatar - Lelouch (Supreme Strategist) */}
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-primary/30">
                            <AvatarImage src="/avatars/lelouch.png" alt="Lelouch" />
                            <AvatarFallback className="gradient-geass text-white text-sm font-bold">
                                LL
                            </AvatarFallback>
                        </Avatar>
                        <div className="hidden md:block">
                            <p className="text-sm font-medium text-foreground">Commander</p>
                            <p className="text-xs text-muted-foreground">@lelouch</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
