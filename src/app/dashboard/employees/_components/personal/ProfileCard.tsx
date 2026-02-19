import React from "react";
import Image from "next/image";
import { FiUser, FiPhone, FiMail } from "react-icons/fi";
import { format, parseISO, isValid as isValidDate } from "date-fns";
import { EntitySheet } from "../EntitySheet";
import { ProfileForm } from "../../schema/fields";
import { Avatars } from "@/shared/ui/avatars";

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  avatarUrl: string;
  dateOfBirth: string | null;
  gender: string | null;
  maritalStatus: string | null;
  address: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  emergencyPhone: string | null;
  emergencyName: string | null;
}

interface InfoItemProps {
  icon: React.ReactNode;
  value?: string | null;
}

function InfoItem({ icon, value }: InfoItemProps) {
  const display = value && value.trim().length > 0 ? value : "N/A";
  return (
    <div className="flex items-center space-x-2 text-md">
      <span className="text-muted-foreground">{icon}</span>
      <span>{display}</span>
    </div>
  );
}

interface KeyValueCardProps {
  items: { label: string; value?: React.ReactNode }[];
}

export function KeyValueCard({ items }: KeyValueCardProps) {
  return (
    <div className="space-y-3 text-md">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-10">
          <p className="w-[30%] font-semibold">{item.label}</p>
          <p>{item.value ?? "N/A"}</p>
        </div>
      ))}
    </div>
  );
}

interface ProfileCardProps {
  profile?: Partial<Profile> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  core: any; // expects at least { id, firstName, lastName, employeeNumber, email }
  avatarUrl?: string;
}

export function ProfileCard({ profile, core, avatarUrl }: ProfileCardProps) {
  // Safeguard: profile can be undefined while data is loading
  const p = profile ?? {};

  // Determine if we have any profile data at all
  const hasData =
    !!p.dateOfBirth ||
    !!p.gender ||
    !!p.phone ||
    !!p.emergencyName ||
    !!p.emergencyPhone ||
    !!p.maritalStatus ||
    !!p.address ||
    !!p.state ||
    !!p.country;

  // Build initial form data only if we have something
  const initialData: Partial<ProfileForm> | undefined = hasData
    ? {
        dateOfBirth: p.dateOfBirth ?? "",
        gender: p.gender ?? "",
        phone: p.phone ?? "",
        emergencyName: p.emergencyName ?? "",
        emergencyPhone: p.emergencyPhone ?? "",
        maritalStatus: p.maritalStatus ?? "",
        address: p.address ?? "",
        state: p.state ?? "",
        country: p.country ?? "",
        status: "",
      }
    : undefined;

  // Safe DOB formatting
  const dobDisplay = (() => {
    if (!p.dateOfBirth) return "N/A";
    const parsed =
      // handle both ISO and date-like strings
      isNaN(Date.parse(p.dateOfBirth))
        ? parseISO(p.dateOfBirth) // try ISO parse
        : new Date(p.dateOfBirth);
    return isValidDate(parsed) ? format(parsed, "MMM dd, yyyy") : "N/A";
  })();

  return (
    <div className="shadow-md bg-white rounded-lg p-6 mt-10 border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="capitalize font-semibold mb-6 text-xl">
          Personal Information
        </h2>
        <EntitySheet
          entityType="profile"
          initialData={initialData}
          employeeId={core?.id}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left: Avatar + Major Details */}
        <div className="flex items-center space-x-6">
          <div className="w-44 h-44 relative shrink-0">
            <Avatars
              src={avatarUrl ?? p.avatarUrl}
              name={`${core?.firstName ?? ""} ${core?.lastName ?? ""}`}
              size="2xl"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              {core?.firstName ?? ""} {core?.lastName ?? ""}
            </h2>
            <p className="text-md text-muted-foreground mb-5">
              {core?.employeeNumber ?? ""}
            </p>

            <div className="space-y-2">
              <InfoItem icon={<FiUser size={16} />} value={p.gender ?? ""} />
              <InfoItem icon={<FiPhone size={16} />} value={p.phone ?? ""} />
              <InfoItem icon={<FiMail size={16} />} value={core?.email ?? ""} />
            </div>
          </div>
        </div>

        {/* Right: Other Details */}
        <KeyValueCard
          items={[
            { label: "DOB", value: dobDisplay },
            { label: "Marital Status", value: p.maritalStatus ?? "N/A" },
            { label: "Address", value: p.address ?? "N/A" },
            { label: "State", value: p.state ?? "N/A" },
            { label: "Country", value: p.country ?? "N/A" },
            {
              label: "Emergency Contact",
              value:
                p.emergencyName || p.emergencyPhone
                  ? `${p.emergencyName ?? ""}${
                      p.emergencyName && p.emergencyPhone ? " " : ""
                    }${p.emergencyPhone ?? ""}`
                  : "N/A",
            },
          ]}
        />
      </div>
    </div>
  );
}
