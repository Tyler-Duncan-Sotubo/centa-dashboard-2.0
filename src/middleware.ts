// middleware.ts
import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    const perms = (token?.permissions ?? []) as string[];

    // dashboard route
    if (pathname.startsWith("/dashboard")) {
      if (!perms.includes("dashboard.login")) {
        // if they at least have employee permission → send them there
        if (perms.includes("ess.login")) {
          return NextResponse.redirect(new URL("/ess", req.url));
        }
        // otherwise → login page
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }

    // employee route
    if (pathname.startsWith("/ess")) {
      if (!perms.includes("ess.login")) {
        // if they can access dashboard, redirect there
        if (perms.includes("dashboard.login")) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/ess/:path*"],
};
