"use client";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Toaster } from "@/components/ui/sonner";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { AccountMenu } from "@/components/account-menu";
import { useAuth } from "@/hooks/use-auth";

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
  const { currentUser, isUserLoggedIn } = useAuth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider className="fixed inset-0 overflow-hidden">
            {isUserLoggedIn() && <AppSidebar />}
            <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background p-5 text-foreground">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="text-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground" />
                </div>
                <div className="flex items-center gap-4">
                  <ModeToggle />
                  {currentUser && <AccountMenu user={currentUser} />}
                </div>
              </div>
              <SidebarInset className="min-h-0 overflow-y-auto">
                <div className="flex min-h-full flex-col">
                  <Toaster />
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
