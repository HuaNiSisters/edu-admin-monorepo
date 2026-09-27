import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessPath, getRole } from "@/core/userRoles/access";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  // Callback and error routes must be reachable before a session exists.
  if (["/auth/login", "/auth/error", "/auth/forgot-password"].includes(pathname)) {
    return supabaseResponse;
  }
  if (pathname === "/auth/sign-up" || pathname === "/auth/sign-up-success") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Fetch the current user: privileged operations must not trust stale role claims.
  const { data: { user } } = await supabase.auth.getUser();
  const role = getRole(user?.app_metadata);
  const denied = !user || !canAccessPath(role, pathname);
  if (denied) {
    if (pathname.startsWith("/api/")) {
      const response = NextResponse.json({ error: user ? "Forbidden." : "Please sign in." }, { status: user ? 403 : 401 });
      supabaseResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie));
      return response;
    }
    const url = new URL(user ? "/forbidden" : "/auth/login", request.url);
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie));
    return response;
  }
  return supabaseResponse;
}
