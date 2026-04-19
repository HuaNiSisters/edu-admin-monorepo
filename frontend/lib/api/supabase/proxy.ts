import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../../utils";
import {
  ADMIN_ROUTE_PREFIX,
  RECEPTION_ADMIN_ROUTES,
  ROUTES,
} from "@/core/routes/consts";
import { UserRole } from "@/core/userRoles/types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Pages that don't require authentication
  if (
    request.nextUrl.pathname === ROUTES.AUTH.LOGIN ||
    request.nextUrl.pathname === ROUTES.AUTH.SIGN_UP ||
    request.nextUrl.pathname === ROUTES.AUTH.RESET_PASSWORD
  ) {
    return supabaseResponse;
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

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Pages that require authentication
  if (!user) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.AUTH.LOGIN;
    return NextResponse.redirect(url);
  }

  // Pages that require the user to be an admin
  if (request.nextUrl.pathname.startsWith(ADMIN_ROUTE_PREFIX)) {
    if (
      user.user_metadata?.role === UserRole.Receptionist &&
      RECEPTION_ADMIN_ROUTES.includes(request.nextUrl.pathname)
    ) {
      return supabaseResponse;
    }

    if (user.user_metadata?.role === UserRole.Admin) {
      return supabaseResponse;
    }
    // Otherwise, 403 or redirect to home page
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.FORBIDDEN;
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
