"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, User, Eye, Briefcase, MapPin, UserCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ReactNode } from "react";
import { IUser } from "@/types/employees.type";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function EmployeeProfileCard({
  employee,
}: {
  employee: IUser | null;
}) {
  const { refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(
    employee?.avatar || null
  );

  const updateProfile = useUpdateMutation({
    endpoint: "api/auth/profile",
    successMessage: "Profile Updated",
    refetchKey: "user profile",
    onSuccess: () => {
      refreshUser();
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatarSrc(base64); // Show preview immediately

      // Trigger API call to update avatar
      await updateProfile({
        avatar: base64,
        email: employee?.email || "",
        first_name: employee?.first_name || "",
        last_name: employee?.last_name || "",
      });
    };
    reader.readAsDataURL(file);
  };

  interface ProfileInfoRowProps {
    icon: ReactNode;
    label: string;
    value: string;
  }

  const ProfileInfoRow = ({ icon, label, value }: ProfileInfoRowProps) => (
    <div className="flex items-start gap-4">
      <div className="p-2 bg-muted rounded-md text-foreground">{icon}</div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span className="text-base text-foreground">{value}</span>
      </div>
    </div>
  );

  return (
    <Card className="w-full shadow-none">
      <CardHeader className="flex flex-col items-center relative pb-2">
        <div className="relative">
          <Avatar
            className="w-32 h-32 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <AvatarImage
              src={avatarSrc ?? employee?.avatar ?? undefined}
              alt="Avatar"
            />
            <AvatarFallback>
              <User className="w-16 h-16 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <Button
            size="icon"
            variant="secondary"
            className="absolute top-3 right-1 w-7 h-7 rounded-full shadow bg-white"
            title="Edit Avatar"
            onClick={() => fileInputRef.current?.click()}
          >
            <Pencil className="w-4 h-4 text-monzo-brand" />
          </Button>
        </div>

        <CardTitle className="my-10 text-center text-lg">
          {employee?.first_name} {employee?.last_name}
          <div className="text-sm text-muted-foreground font-normal">
            {employee?.job_role}
          </div>
        </CardTitle>
        <Separator className="mt-6" />
      </CardHeader>

      <CardContent className="space-y-4 text-sm text-muted-foreground pt-4">
        <ProfileInfoRow
          icon={<Briefcase className="w-5 h-5" />}
          label="Department"
          value={employee?.department_name ?? "N/A"}
        />
        <ProfileInfoRow
          icon={<UserCheck className="w-5 h-5" />}
          label="Manager"
          value={employee?.employeeManager.name ?? "N/A"}
        />
        <ProfileInfoRow
          icon={<MapPin className="w-5 h-5" />}
          label="Location"
          value={employee?.location ?? "N/A"}
        />
        <div className="pt-4 flex justify-center">
          <Link href="/ess/profile" className="w-full">
            <Button className="w-full text-monzo-brand" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
