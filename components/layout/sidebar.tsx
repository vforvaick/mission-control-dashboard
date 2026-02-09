"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Activity,
    Settings,
    Zap,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Kanban", href: "/", icon: LayoutDashboard },
    { name: "Agents", href: "/agents", icon: Users },
    { name: "Activity", href: "/activity", icon: Activity },
];

const domains = [
    { name: "Office", color: "bg-blue-500", count: 0 },
    { name: "Trading", color: "bg-green-500", count: 0 },
    { name: "Personal", color: "bg-purple-500", count: 0 },
    { name: "Deployment", color: "bg-orange-500", count: 0 },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-border px-6">
                <div className="relative">
                    <div className="h-10 w-10 rounded-lg gradient-geass flex items-center justify-center glow-red">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-neon-green status-online" />
                </div>
                <div>
                    <h1 className="font-bold text-foreground">Mission Control</h1>
                    <p className="text-xs text-muted-foreground">Isekai Legion</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 px-3 py-4">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Navigation
                </p>
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary glow-red"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 transition-colors",
                                isActive ? "text-primary" : ""
                            )} />
                            {item.name}
                            {isActive && (
                                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Domains */}
            <div className="px-3 py-4">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Domains
                </p>
                <div className="space-y-1">
                    {domains.map((domain) => (
                        <div
                            key={domain.name}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                            <div className={cn("h-2 w-2 rounded-full", domain.color)} />
                            <span>{domain.name}</span>
                            <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
                                {domain.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Agent Quick Stats */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full status-online" />
                        <span className="text-muted-foreground">13 Agents</span>
                    </div>
                    <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Settings className="h-4 w-4" />
                    </Link>
                </div>
                <div className="mt-2 flex gap-1">
                    {[...Array(13)].map((_, i) => (
                        <div
                            key={i}
                            className="h-1 flex-1 rounded-full bg-primary/30"
                            style={{ animationDelay: `${i * 100}ms` }}
                        />
                    ))}
                </div>
            </div>
        </aside>
    );
}
