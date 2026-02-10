import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexProvider } from "@/lib/convex";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AuthGuard } from "@/components/auth/auth-guard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mission Control | Isekai Crossover Legion",
  description: "Real-time Kanban dashboard for the multi-agent AI command system",
  keywords: ["AI agents", "mission control", "kanban", "isekai", "anime"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ConvexProvider>
          <AuthGuard>
            <TooltipProvider>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 flex flex-col ml-64">
                  <Header />
                  <main className="flex-1 p-6 pt-20">
                    {children}
                  </main>
                </div>
              </div>
            </TooltipProvider>
          </AuthGuard>
        </ConvexProvider>
      </body>
    </html>
  );
}
