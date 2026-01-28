import React from "react";
import Image from "next/image";
import { FiUser, FiPhone, FiMail } from "react-icons/fi";
import { format } from "date-fns";
import { EntitySheet } from "../EntitySheet";
import { ProfileForm } from "../../schema/fields";

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  avatarUrl: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  address: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  emergencyPhone: string;
  emergencyName: string;
}

interface InfoItemProps {
  icon: React.ReactNode;
  value: string;
}

function InfoItem({ icon, value }: InfoItemProps) {
  return (
    <div className="flex items-center gap-2 text-sm sm:text-md">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="truncate">{value || "N/A"}</span>
    </div>
  );
}

interface KeyValueCardProps {
  items: { label: string; value: React.ReactNode }[];
}

export function KeyValueCard({ items }: KeyValueCardProps) {
  return (
    <div className="space-y-4 text-sm sm:text-md">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col sm:flex-row sm:items-center sm:gap-10 gap-1"
        >
          <p className="sm:w-[35%] font-semibold text-muted-foreground">
            {item.label}
          </p>
          <p className="wrap-break-word">{item.value ? item.value : "N/A"}</p>
        </div>
      ))}
    </div>
  );
}

interface ProfileCardProps {
  profile: Profile;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  core: any;
  avatarUrl?: string;
}

export function ProfileCard({ profile, core, avatarUrl }: ProfileCardProps) {
  const hasData =
    !!profile.dateOfBirth ||
    !!profile.gender ||
    !!profile.phone ||
    !!profile.emergencyName ||
    !!profile.emergencyPhone ||
    !!profile.maritalStatus ||
    !!profile.address ||
    !!profile.state ||
    !!profile.country;

  const initialData: Partial<ProfileForm> = hasData
    ? {
        dateOfBirth: profile.dateOfBirth!,
        gender: profile.gender!,
        phone: profile.phone!,
        emergencyName: profile.emergencyName!,
        emergencyPhone: profile.emergencyPhone!,
        maritalStatus: profile.maritalStatus!,
        address: profile.address!,
        state: profile.state!,
        country: profile.country!,
      }
    : {};

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 mt-6 sm:mt-10 border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="capitalize font-semibold text-lg sm:text-xl">
          Personal Information
        </h2>

        <div className="self-start sm:self-auto">
          <EntitySheet
            entityType="profile"
            initialData={hasData ? initialData : undefined}
            employeeId={core.id}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
        {/* Left: Avatar + Major Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 relative shrink-0">
            {avatarUrl && (profile.firstName || core?.firstName) ? (
              <Image
                src={avatarUrl}
                alt={`${core?.firstName ?? profile.firstName} ${
                  core?.lastName ?? profile.lastName
                }`}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                <FiUser size={42} className="text-gray-500" />
              </div>
            )}
          </div>

          <div className="min-w-0 text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-semibold truncate">
              {core.firstName} {core.lastName}
            </h2>
            <p className="text-sm text-muted-foreground mb-4 truncate">
              {core.employeeNumber}
            </p>

            <div className="space-y-2">
              <InfoItem icon={<FiUser size={16} />} value={profile.gender} />
              <InfoItem icon={<FiPhone size={16} />} value={profile.phone} />
              <InfoItem icon={<FiMail size={16} />} value={core.email} />
            </div>
          </div>
        </div>

        {/* Right: Other Details */}
        <KeyValueCard
          items={[
            {
              label: "DOB",
              value: profile.dateOfBirth
                ? format(new Date(profile.dateOfBirth), "MMM dd, yyyy")
                : "N/A",
            },
            { label: "Marital Status", value: profile.maritalStatus || "N/A" },
            { label: "Address", value: profile.address || "N/A" },
            { label: "State", value: profile.state || "N/A" },
            { label: "Country", value: profile.country || "N/A" },
            {
              label: "Emergency Contact",
              value: `${profile?.emergencyName || "N/A"}${
                profile?.emergencyPhone ? ` • ${profile.emergencyPhone}` : ""
              }`,
            },
          ]}
        />
      </div>
    </div>
  );
}
