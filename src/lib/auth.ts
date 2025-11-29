// File: src/lib/authOptions.ts
import { NextAuthOptions, DefaultSession } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

// ──────────────────────────────────────────────────────────────────────────────
// 1) Define “BackendTokens” shape ‒ this is exactly what your backend returns
// ──────────────────────────────────────────────────────────────────────────────
interface BackendTokens {
  accessToken: string; // e.g. JWT string used for API calls
  refreshToken: string; // e.g. refresh token string
  expiresIn: number; // how many seconds until accessToken expires
}

type Checklist = {
  staff: boolean;
  payroll: boolean;
  performance: boolean;
  hiring: boolean;
  attendance: boolean;
  leave: boolean;
};

// ──────────────────────────────────────────────────────────────────────────────
// 2) Define exactly what “CustomUser” looks like.
//    This should match whatever your backend is returning under `user`.
// ──────────────────────────────────────────────────────────────────────────────
interface CustomUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  role: string;
  avatar: string; // if your backend sends an “avatar” URL
  employmentStatus: string;
  backendTokens: BackendTokens;
  permissions: string[]; // e.g. ["view_users", "edit_posts"]
  checklist?: Checklist;
}

type Workspace = "employee" | "manager";

// ──────────────────────────────────────────────────────────────────────────────
// 3) Module Augmentation: extend NextAuth’s Session & JWT types
//    so that TypeScript knows exactly what lives on `session.user` and `token`.
// ──────────────────────────────────────────────────────────────────────────────
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      companyId: string;
      role: string;
      avatar: string;
      employmentStatus: string;
    };
    employeeId?: string | null;
    userAccountId?: string | null;
    activeWorkspace: "employee" | "manager";
    backendTokens: BackendTokens;
    permissions: string[]; // e.g. ["view_users", "edit_posts"]
    checklist: Checklist;
  }

  /** When you call `signIn("credentials", { user, backendTokens })`,
   *  NextAuth will pass that “user” object into callbacks as `User`. */
}

declare module "next-auth/jwt" {
  interface JWT {
    /** copy of `CustomUser` minus the tokens themselves */
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      companyId: string;
      role: string;
      avatar: string;
      employmentStatus: string;
    };
    employeeId?: string | null;
    userAccountId?: string | null;
    backendTokens: BackendTokens;
    permissions: string[]; // e.g. ["view_users", "edit_posts"]
    accessTokenExpires: number;
    checklist: Checklist;
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {}, // no built‐in fields; we pass user+tokens manually at signIn()
      async authorize(credentials: unknown) {
        const { user, backendTokens, permissions, checklist } = credentials as {
          user: string;
          backendTokens: string;
          permissions: string[];
          checklist?: string | Checklist;
        };

        const parsedUser = JSON.parse(user);
        const parsedBackendTokens = JSON.parse(backendTokens);
        const parsedChecklist =
          typeof checklist === "string"
            ? JSON.parse(checklist)
            : checklist ?? undefined;

        if (!parsedUser || !parsedBackendTokens) return null;

        return {
          ...parsedUser,
          backendTokens: parsedBackendTokens,
          permissions,
          checklist: parsedChecklist,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in
      if (user) {
        const u = user as CustomUser & { userId?: string | null };

        const employeeId = u.id ?? null; // always present
        const userAccountId = u.userId ?? null; // may be null

        // Set default workspace and ID without a comparison
        token.activeWorkspace = "employee";
        token.employeeId = employeeId;
        token.userAccountId = userAccountId;

        token.user = {
          id: employeeId!, // default expose employee id
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          companyId: u.companyId,
          role: u.role,
          avatar: u.avatar,
          employmentStatus: u.employmentStatus,
        };

        token.backendTokens = u.backendTokens;
        token.permissions = u.permissions ?? [];
        token.accessTokenExpires = u.backendTokens.expiresIn;

        token.checklist = u.checklist ?? {
          staff: false,
          payroll: false,
          performance: false,
          hiring: false,
          attendance: false,
          leave: false,
        };

        return token;
      }

      // Workspace switcher update
      if (trigger === "update") {
        const ws = session.activeWorkspace; // typed in your module augmentation
        if (ws) {
          token.activeWorkspace = ws as Workspace;

          const nextId =
            ws === "manager" && token.userAccountId
              ? token.userAccountId
              : token.employeeId ?? token.user.id;

          token.user = { ...token.user, id: nextId };
        }
      }

      return token;
    },

    async session({ token, session }) {
      session.user = token.user;
      session.backendTokens = token.backendTokens;
      session.permissions = token.permissions;
      session.expires = new Date(token.accessTokenExpires).toISOString();
      session.activeWorkspace = token.activeWorkspace as Workspace;
      session.employeeId = token.employeeId ?? null;
      session.userAccountId = token.userAccountId ?? null;
      session.checklist = token.checklist;
      return session;
    },
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);
