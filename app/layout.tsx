import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeScript } from "@/components/theme/theme-script";
import { Toaster } from "sonner";
import { DemoBanner } from "@/components/layout/demo-banner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PostPurush — API Client",
  description:
    "A modern, browser-based API client for developers. Build, send, and inspect HTTP requests with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-theme="og-shadcn" data-mode="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen overflow-hidden`}
      >
        <DemoBanner />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "bg-panel border border-border text-foreground shadow-xl shadow-black/20 rounded-xl",
              title: "text-sm font-medium text-foreground",
              description: "text-xs text-foreground-muted",
              error: "border-red-800/50",
              success: "border-emerald-800/50",
            },
          }}
        />
      </body>
    </html>
  );
}
