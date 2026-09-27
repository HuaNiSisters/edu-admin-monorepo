"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { ChevronDown, KeyRound, LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/api/supabase/client";
import { getRole } from "@/core/userRoles/access";
import { EMPLOYEE_ROLE_OPTIONS } from "@/lib/employees/schema";

export function AccountMenu({ user }: { user: User }) {
  const router = useRouter();
  const [employeeName, setEmployeeName] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    async function loadName() {
      const { data: linkedEmployee } = await supabase
        .from("Tutor")
        .select("first_name, last_name")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      let employee = linkedEmployee;
      // Older accounts may have an employee record without an Auth link yet.
      // This lookup is display-only and remains subject to the user's RLS access.
      if (!employee && user.email) {
        const { data } = await supabase
          .from("Tutor")
          .select("first_name, last_name")
          .is("auth_user_id", null)
          .eq("email", user.email)
          .maybeSingle();
        employee = data;
      }
      if (!cancelled && employee) {
        setEmployeeName({
          userId: user.id,
          name: `${employee.first_name} ${employee.last_name}`.trim(),
        });
      }
    }
    void loadName().catch(() => {
      /* Keep the display fallback if the lookup fails. */
    });
    return () => {
      cancelled = true;
    };
  }, [user.id, user.email]);

  // Metadata is only a display fallback; permissions always use trusted roles.
  const metadataName = [
    user.user_metadata?.first_name,
    user.user_metadata?.last_name,
  ]
    .filter((value) => typeof value === "string")
    .join(" ")
    .trim();
  const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name;
  const name =
    (employeeName?.userId === user.id ? employeeName.name : null) ||
    metadataName ||
    (typeof fullName === "string" ? fullName.trim() : "") ||
    "My Profile";
  const role =
    EMPLOYEE_ROLE_OPTIONS.find(
      (option) => option.value === getRole(user.app_metadata),
    )?.label ?? "No role assigned";

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      router.replace("/auth/login");
      router.refresh();
    } catch {
      toast.error("Could not log out. Please try again.", {
        position: "top-center",
      });
      setLoggingOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto gap-2 px-3 py-2"
          disabled={loggingOut}
          aria-label={`My Profile: ${name}, ${role}`}
        >
          <UserRound className="size-4 shrink-0" />
          <span className="flex min-w-0 flex-col items-start text-left">
            <span className="max-w-[140px] truncate text-sm font-medium sm:max-w-[220px]">
              {name}
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              {role}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserRound />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/auth/update-password">
            <KeyRound />
            Change password
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={loggingOut}
          onSelect={() => {
            void logout();
          }}
        >
          <LogOut />
          {loggingOut ? "Logging out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
