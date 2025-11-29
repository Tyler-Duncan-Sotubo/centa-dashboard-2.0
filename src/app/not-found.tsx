import NotFoundSection from "@/components/NotFoundSection";

export default function GlobalNotFound() {
  return (
    <NotFoundSection
      description="The page you are looking for doesn’t exist."
      buttonHref="/"
      buttonText="Go Home"
    />
  );
}
