// File: /components/NotFoundSection.tsx

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

interface NotFoundSectionProps {
  title?: string;
  description?: string;
  imageSrc?: string;
  buttonHref?: string;
  buttonText?: string;
  height?: string; // e.g., "h-screen" for full viewport height
}

export default function NotFoundSection({
  title = "404",
  description = "The page you are looking for doesn’t exist.",
  imageSrc = "https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757584747/not-found_x5rjne.svg",
  buttonHref = "/",
  buttonText = "Go Home",
  height = "h-screen",
}: NotFoundSectionProps) {
  return (
    <div className={`${height} flex items-center justify-center bg-white`}>
      <div className="text-center max-w-md">
        <Image
          src={imageSrc}
          alt="Not Found"
          width={300}
          height={300}
          className="mx-auto mb-6"
        />
        <h2 className="text-4xl font-bold mb-2">{title}</h2>
        <p className="text-lg mb-4">{description}</p>
        <Link href={buttonHref}>
          <Button>{buttonText}</Button>
        </Link>
      </div>
    </div>
  );
}
