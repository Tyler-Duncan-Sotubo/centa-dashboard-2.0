"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { IUser } from "@/types/employees.type";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

// 🔹 Define Context Type
interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔹 Fetch Authenticated User and Save to Local Storage
  const refreshUser = async () => {
    setLoading(true);
    if (session?.backendTokens?.accessToken) {
      try {
        const res = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/employees/employee-active`,
        );
        if (res.status === 200) {
          setUser(res.data.data);
          localStorage.setItem("user", JSON.stringify(res.data.data));
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setUser(null);
        localStorage.removeItem("user"); // ✅ Clear storage on failure
      } finally {
        setLoading(false);
      }
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/api/auth/logout", {}); // Call API to log out
      localStorage.removeItem("user"); // ✅ Clear storage on failure
      setUser(null); // Clear user state
      router.replace("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom Hook for using Auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
