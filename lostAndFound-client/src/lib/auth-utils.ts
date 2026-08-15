
export type UserRole = "ADMIN" | "CUSTOMER";

export type RouteConfig = {
    exact: string[],
    patterns: RegExp[],
}

export const authRoutes = ["/login", "/register", "/forgot-password"];

export const commonProtectedRoutes: RouteConfig = {
    exact: ["/my-profile", "/settings", "/change-password", "/reset-password"],
    patterns: [], 
}

export const customerProtectedRoutes: RouteConfig = {
    exact: ["/", "/profile", "/lost", "/found", "/reunited", "/saved"],
    patterns: [],
}

export const adminProtectedRoutes: RouteConfig = {
    patterns: [/^\/admin/], // Routes starting with /dashboard/*
    exact: [], // "/dashboard"
}

export const shopManagerProtectedRoutes: RouteConfig = {
    patterns: [/^\/dashboard/],
    exact: []
}



export const isAuthRoute = (pathname: string) => {
    return authRoutes.some((route: string) => route === pathname);
}

export const isRouteMatches = (pathname: string, routes: RouteConfig): boolean => {
    if (routes.exact.includes(pathname)) {
        return true;
    }
    return routes.patterns.some((pattern: RegExp) => pattern.test(pathname))
    
}



export const getRouteOwner = (pathname: string): "ADMIN" | "CUSTOMER" | "COMMON" | null => {
    if (isRouteMatches(pathname, adminProtectedRoutes)) {
        return "ADMIN"
    }
    
    if (isRouteMatches(pathname, customerProtectedRoutes)) {
        return "CUSTOMER"
    }
    if (isRouteMatches(pathname, commonProtectedRoutes)) {
        return "COMMON"
    }
    return null;
}


export const getDefaultDashboardRoute = (role: UserRole): string => {
    return "/"
}

export const isValidRedirectForRole = (redirectPath: string, role: UserRole): boolean => {
    const routeOwner = getRouteOwner(redirectPath);

    if (routeOwner === null || routeOwner === "COMMON") {
        return true;
    }

    if (routeOwner === role) {
        return true;
    }

    // Dashboard routes are shared between ADMIN, SHOP_MANAGER, and MEDIA_MANAGER
    const dashboardRoles: UserRole[] = ["ADMIN"];
    if (routeOwner && dashboardRoles.includes(routeOwner) && dashboardRoles.includes(role)) {
        return true;
    }

    return false;
}