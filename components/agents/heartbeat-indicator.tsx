"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface HeartbeatIndicatorProps {
    lastHeartbeat: number;
}

const CLIENT_BASE_TS = Date.now();

export function HeartbeatIndicator({ lastHeartbeat }: HeartbeatIndicatorProps) {
    const [elapsedDelta, setElapsedDelta] = useState(0);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setElapsedDelta((value) => value + 1000);
        }, 1000);
        return () => window.clearInterval(timer);
    }, []);

    const { label, dotClass } = useMemo(() => {
        const elapsed = Math.max(0, CLIENT_BASE_TS - lastHeartbeat + elapsedDelta);
        const minutes = Math.floor(elapsed / 60000);

        if (minutes < 10) {
            return { label: `${minutes}m ago`, dotClass: "bg-green-500 animate-pulse" };
        }
        if (minutes < 30) {
            return { label: `${minutes}m ago`, dotClass: "bg-yellow-500" };
        }
        return { label: `${minutes}m ago`, dotClass: "bg-red-500" };
    }, [lastHeartbeat, elapsedDelta]);

    return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className={cn("h-2 w-2 rounded-full", dotClass)} />
            <span>{label}</span>
        </div>
    );
}
