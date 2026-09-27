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
  if (role === UserRole.Tutor) {
    return pathname === "/" || isPathWithin(pathname, "/profile") ||
      pathname === "/auth/update-password";
  }
  if (isPathWithin(pathname, "/api/admin")) return false;
  if (isPathWithin(pathname, "/admin")) {
    return pathname === "/admin/users" || pathname === "/admin/employees" || /^\/admin\/employees\/[0-9a-f-]{36}$/i.test(pathname);
  }
  return true;
}

export function safeNextPath(value: string | null, fallback = "/profile") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x1f]/.test(value)) {
    return fallback;
  }
  return value;
}
