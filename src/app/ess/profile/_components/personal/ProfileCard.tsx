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
    <div className="flex items-center space-x-2 text-md">
      {/* If value is empty, show "N/A" */}
      {value ? (
        <span className="text-muted-foreground">{icon}</span>
      ) : (
        <span className="text-red-500"></span>
      )}
      <span>{value}</span>
    </div>
  );
}

interface KeyValueCardProps {
  items: { label: string; value: React.ReactNode }[];
}

export function KeyValueCard({ items }: KeyValueCardProps) {
  return (
    <div className="space-y-3 text-md">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-10">
          <p className="w-[30%] font-semibold">{item.label}</p>
          <p>{item.value ? item.value : "N/A"}</p>
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
  // determine if we have any existing profile data
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

  // only include the fields we care about
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
    <div className="bg-white rounded-lg p-6 mt-10 border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="capitalize font-semibold mb-6 text-xl">
          Personal Information
        </h2>
        <EntitySheet
          entityType="profile"
          initialData={hasData ? initialData : undefined}
          employeeId={core.id}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left: Avatar + Major Details */}
        <div className="flex items-center space-x-6 md::mb-0 mb-6">
          <div className="w-44 h-44 relative flex-shrink-0">
            {avatarUrl && profile.firstName ? (
              <Image
                src={avatarUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                <FiUser size={48} className="text-gray-500" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {core.firstName} {core.lastName}
            </h2>
            <p className="text-md text-muted-foreground mb-5">
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
            { label: "Marital Status", value: profile.maritalStatus },
            {
              label: "Address",
              value: `${profile.address ? profile.address : "N/A"}`,
            },
            {
              label: "State",
              value: `${profile.state ? profile.state : "N/A"}`,
            },
            {
              label: "Address",
              value: `${profile.country ? profile.country : "N/A"}`,
            },
            {
              label: "Emergency Contact",
              value: `${
                profile?.emergencyName ? profile.emergencyName : "N/A"
              } ${profile?.emergencyPhone ? profile.emergencyPhone : ""}`,
            },
          ]}
        />
      </div>
    </div>
  );
}
