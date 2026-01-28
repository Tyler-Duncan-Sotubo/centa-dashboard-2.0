"use client";

import React from "react";
import UserProfile from "./UserProfile";
import { User } from "@/types/user.type";
// import { fetchUserProfile } from "@/server/actions/fetch/user";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const UserProfilePage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchUserProfile = async () => {
    try {
      const res = await axiosInstance.get("/api/auth/profile");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery<User>({
    queryKey: ["user", "profile"],
    queryFn: fetchUserProfile,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return <UserProfile user={user} />;
};

export default UserProfilePage;
