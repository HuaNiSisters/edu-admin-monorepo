import { UserRole } from "./types";

export function getRole(appMetadata: Record<string, unknown> | undefined): UserRole | null {
  const role = appMetadata?.role;
  return role === UserRole.Admin || role === UserRole.Receptionist || role === UserRole.Tutor
    ? role
    : null;
}

export function isPathWithin(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function canAccessPath(role: UserRole | null, pathname: string): boolean {
  if (pathname === "/forbidden") return true;
  if (!role) return false;
  if (role === UserRole.Admin) return true;
  if (pathname === "/" || pathname === "/home" || isPathWithin(pathname, "/profile") ||
      pathname === "/auth/update-password") return true;

  if (role === UserRole.Tutor) {
    return pathname === "/students/search" ||
      isPathWithin(pathname, "/students/attendance") ||
      /^\/student\/[0-9a-f-]{36}$/i.test(pathname);
  }

  if (isPathWithin(pathname, "/api/admin")) return false;
  if (pathname === "/admin/employees" || /^\/admin\/employees\/[0-9a-f-]{36}$/i.test(pathname)) return true;
  if (isPathWithin(pathname, "/admin")) return false;
  return isPathWithin(pathname, "/students") || isPathWithin(pathname, "/student");
}

export function safeNextPath(value: string | null, fallback = "/profile") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x1f]/.test(value)) {
    return fallback;
  }
  return value;
}
