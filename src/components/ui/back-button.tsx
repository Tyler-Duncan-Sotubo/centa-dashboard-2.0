"use client";

import Link from "next/link";
import { Button } from "./button";
import { FaChevronCircleLeft } from "react-icons/fa";

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export default function BackButton({
  href,
  label = "Back",
  className = "",
}: BackButtonProps) {
  return (
    <Link href={href}>
      <Button variant="link" className={`px-0 text-md mb-5 gap-2 ${className}`}>
        <FaChevronCircleLeft size={30} />
        {label}
      </Button>
    </Link>
  );
}
