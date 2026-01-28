"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { FaChevronCircleLeft } from "react-icons/fa";
import { ReactNode } from "react";

type NavBackButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export default function NavBackButton({
  href,
  children,
  className,
}: NavBackButtonProps) {
  return (
    <Link href={href}>
      <Button variant="link" className={`px-0 text-md ${className ?? ""}`}>
        <FaChevronCircleLeft className="mr-2" />
        {children}
      </Button>
    </Link>
  );
}
