"use client";

import { ConvexProvider as ConvexClientProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

const convex = new ConvexReactClient(convexUrl);

export function ConvexProvider({ children }: { children: ReactNode }) {
    return (
        <ConvexClientProvider client={convex}>
            {children}
        </ConvexClientProvider>
    );
}

export { convex };
