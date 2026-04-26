const AUTH_ROUTE_PREFIX = "/auth";

export const ADMIN_ROUTE_PREFIX = "/admin";

export const ROUTES = {
  FORBIDDEN: "/forbidden",
  AUTH: {
    LOGIN: "/auth/login",
    SIGN_UP: "/auth/sign-up",
    RESET_PASSWORD: "/auth/forgot-password",
  },
  ADMIN: {
    EMPLOYEES: `${ADMIN_ROUTE_PREFIX}/employees`,
  },
};

export const RECEPTION_ADMIN_ROUTES = [`${ADMIN_ROUTE_PREFIX}/employees`];
