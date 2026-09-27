import { useState, useEffect } from "react";
import { createClient } from "@/lib/api/supabase/client";
import { User } from "@supabase/supabase-js";
import { UserRole } from "@/core/userRoles/types";

const supabase = createClient();

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Fetch initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!cancelled) setCurrentUser(user);
    });

    // Subscribe to auth changes (login, logout, token refresh, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  function isUserLoggedIn() {
    return !!currentUser;
  }

  function isUserAdmin() {
    return currentUser?.app_metadata?.role === UserRole.Admin;
  }

  function isUserReceptionist() {
    return currentUser?.app_metadata?.role === UserRole.Receptionist;
  }

  function isUserTutor() {
    return currentUser?.app_metadata?.role === UserRole.Tutor;
  }

  return { currentUser, isUserLoggedIn, isUserAdmin, isUserReceptionist, isUserTutor };
}
