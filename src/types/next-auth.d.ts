// src/types/next-auth.d.ts
import type { DefaultSession } from "next-auth";

export type BackendTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      email?: string;
      companyId?: string;

      firstName?: string;
      lastName?: string;
      role?: string;
      avatar?: string;
      employmentStatus?: string;

      name?: string;
    };

    backendTokens?: BackendTokens;

    permissions?: string[];
    checklist?: Checklist;
    activeWorkspace?: Workspace;
    employeeId?: string | null;
    userAccountId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string;
      email?: string;
      companyId?: string;

      firstName?: string;
      lastName?: string;
      role?: string;
      avatar?: string;
      employmentStatus?: string;

      name?: string;
    };

    backendTokens?: BackendTokens;

    permissions?: string[];
    checklist?: Checklist;
    activeWorkspace?: Workspace;
    employeeId?: string | null;
    userAccountId?: string | null;

    accessTokenExpires?: number;
  }
}

export {};
