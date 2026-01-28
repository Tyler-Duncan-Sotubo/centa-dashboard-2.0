import NotFoundSection from "@/shared/ui/not-found-section";

export default function DashboardNotFound() {
  return (
    <NotFoundSection
      description="This dashboard section doesn’t exist."
      buttonHref="/dashboard"
      buttonText="Back to Dashboard"
      height="h-[75vh]" // Adjust height as needed
    />
  );
}
