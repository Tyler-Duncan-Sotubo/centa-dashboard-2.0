"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaPlusCircle } from "react-icons/fa";
import Link from "next/link";
import { quickActions } from "@/data/quick-action.data";

export const QuickAdd = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none ">
        <FaPlusCircle size={30} className="text-brand" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-10 capitalize w-60 font-bold space-y-2 py-4">
        {quickActions.map((item) => (
          <DropdownMenuItem
            key={item.label}
            className="px-5 flex items-center gap-4"
            asChild
          >
            <Link href={item.link}>
              <div className="flex items-center gap-2 text-brand font-bold">
                {item.icon}
                <p className="text-md">{item.label}</p>
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
