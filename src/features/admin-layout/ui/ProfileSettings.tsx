"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import { accountItems } from "@/features/admin-layout/config/account.data";
import { signOut, useSession } from "next-auth/react";
import { Avatars } from "@/shared/ui/avatars";

const ProfileSettings = () => {
  const { data: session } = useSession();

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("workspace");
      localStorage.removeItem("last_mgr");
      localStorage.removeItem("last_emp");
    }
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <DropdownMenu>
      {/* 👇 group is important for styling based on state */}
      <DropdownMenuTrigger className="focus:outline-hidden group flex items-center gap-2">
        <Avatars
          size="sm"
          name={session?.user.name || ""}
          src={session?.user.avatar || ""}
        />

        {/* 👇 rotates when open */}
        <ChevronDown
          size={18}
          className="transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="mr-6 capitalize w-60 font-bold space-y-2 py-4">
        {accountItems.map((item) => (
          <DropdownMenuItem
            key={item.label}
            className="px-5 flex items-center gap-4"
            asChild
          >
            <Link href={item.link}>
              <div className="flex items-center gap-4">
                {item.icon}
                <p className="text-md">{item.label}</p>
              </div>
            </Link>
          </DropdownMenuItem>
        ))}

        <div className="border-t-2" />

        <DropdownMenuItem className="px-5 py-2">
          <Link href="" onClick={handleLogout}>
            <div className="flex items-center gap-4">
              <LogOut size={25} className="text-textPrimary" />
              <p className="text-md">Logout</p>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileSettings;
