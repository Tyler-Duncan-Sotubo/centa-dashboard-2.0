import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "./button";

interface EmptyStateProps {
  title: string;
  description?: string;

  /** Either image OR icon */
  image?: StaticImageData | string;
  icon?: ReactNode;

  imageAlt?: string;

  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  title,
  description,
  image,
  icon,
  imageAlt = "Empty state illustration",
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center mt-10 pb-10 text-center text-muted-foreground">
      {/* Icon OR Image */}
      {icon ? (
        <div className="mb-6 flex items-center justify-center text-muted-foreground">
          <div className="text-7xl text-monzo-background">{icon}</div>
        </div>
      ) : image ? (
        <div className="mb-6 relative w-80 h-80">
          <Image src={image} alt={imageAlt} fill className="object-contain" />
        </div>
      ) : null}

      <h2 className="text-xl font-semibold text-foreground">{title}</h2>

      {description && (
        <p className="mt-2 text-base max-w-lg mx-auto">{description}</p>
      )}

      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-4">
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
