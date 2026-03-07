"use client";
import Link from "next/link";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/mode-toggle";
import { Toaster } from "@/components/ui/sonner";
import { ErrorProvider } from "@/contexts/ErrorContext";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const documentTitle = "document.title";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <div className="block w-full">
              <div className="h-16 flex items-center p-5 justify-between text-foreground bg-background border-b border-border">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="text-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground" />
                  <span className="text-foreground text-sm font-medium">
                    {documentTitle}
                  </span>
                </div>
                <ModeToggle />
              </div>
              <SidebarInset>
                <div className="flex min-h-screen flex-col">
                  <ErrorProvider>
                    <main className="flex-1 p-10">{children}</main>
                  </ErrorProvider>
                </div>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
