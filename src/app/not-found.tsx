import NotFoundSection from "@/shared/ui/not-found-section";

export default function GlobalNotFound() {
  return (
    <NotFoundSection
      description="The page you are looking for doesn’t exist."
      buttonHref="/"
      buttonText="Go Home"
    />
  );
}
