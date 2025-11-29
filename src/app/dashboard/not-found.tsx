import NotFoundSection from "@/components/NotFoundSection";

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
