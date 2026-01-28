/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Backend shape your API returns
 */
export type BackendTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
};

export type Checklist = {
  staff: boolean;
  payroll: boolean;
  performance: boolean;
  hiring: boolean;
  attendance: boolean;
  leave: boolean;
};

export type Workspace = "employee" | "manager";

export type CustomUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  role: string;
  avatar: string;
  employmentStatus: string;

  // optional account user id for manager workspace switching
  userId?: string | null;

  backendTokens: BackendTokens;
  permissions: string[];
  checklist?: Checklist;
};

const DEFAULT_CHECKLIST: Checklist = {
  staff: false,
  payroll: false,
  performance: false,
  hiring: false,
  attendance: false,
  leave: false,
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {},

      async authorize(credentials) {
        const { user, backendTokens, permissions, checklist } = credentials as {
          user?: string;
          backendTokens?: string;
          permissions?: string[]; // may come as array already
          checklist?: string | Checklist;
        };

        if (!user || !backendTokens) return null;

        const parsedUser = JSON.parse(user) as Omit<
          CustomUser,
          "backendTokens"
        >;
        const parsedBackendTokens = JSON.parse(backendTokens) as BackendTokens;

        const parsedChecklist: Checklist | undefined =
          typeof checklist === "string"
            ? (JSON.parse(checklist) as Checklist)
            : (checklist ?? undefined);

        return {
          ...parsedUser,
          backendTokens: parsedBackendTokens,
          permissions: permissions ?? [],
          checklist: parsedChecklist,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in
      if (user) {
        const u = user as CustomUser;

        const employeeId = u.id ?? null;
        const userAccountId = u.userId ?? null;

        token.activeWorkspace = "employee" as Workspace;
        token.employeeId = employeeId;
        token.userAccountId = userAccountId;

        token.user = {
          id: employeeId!,
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
        token.checklist = u.checklist ?? DEFAULT_CHECKLIST;

        // store as an absolute timestamp in ms (recommended)
        token.accessTokenExpires =
          Date.now() + (u.backendTokens?.expiresIn ?? 0) * 1000;

        return token;
      }

      // Workspace switch update (client calls `useSession().update({ activeWorkspace: ... })`)
      if (trigger === "update") {
        const ws = (session as any)?.activeWorkspace as Workspace | undefined;

        if (ws) {
          token.activeWorkspace = ws;

          const nextId =
            ws === "manager" && token.userAccountId
              ? token.userAccountId
              : (token.employeeId ?? (token.user as any)?.id);

          token.user = { ...(token.user as any), id: nextId };
        }
      }

      return token;
    },

    async session({ session, token }) {
      // user shape
      (session as any).user = token.user;

      // custom fields
      (session as any).backendTokens = token.backendTokens;
      (session as any).permissions = token.permissions;
      (session as any).checklist = token.checklist;
      (session as any).activeWorkspace = token.activeWorkspace as Workspace;
      (session as any).employeeId = token.employeeId ?? null;
      (session as any).userAccountId = token.userAccountId ?? null;

      // keep session.expires aligned (string ISO)
      session.expires = (token as any).accessTokenExpires;

      return session;
    },
  },
});

/**
 * v5 replacement for `getServerSession(authOptions)`
 * Usage (Server Component / Route Handler):
 *   const session = await getServerAuthSession()
 */
export const getServerAuthSession = () => auth();
