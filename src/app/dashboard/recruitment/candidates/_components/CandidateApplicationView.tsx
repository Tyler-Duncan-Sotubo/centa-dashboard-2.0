import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { ApplicationDetails } from "@/types/application";
import { format } from "date-fns";
import Link from "next/link";
import { FaDownload } from "react-icons/fa";

interface FieldRowProps {
  label: string;
  value?: string | number | null;
}

export function FieldRow({ label, value }: FieldRowProps) {
  if (!value) return null;

  return (
    <div className="flex flex-col space-y-0.5">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-md font-medium capitalize">{value}</span>
    </div>
  );
}

export function CandidateApplicationView({
  data,
}: {
  data: ApplicationDetails | undefined;
}) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">
          No application data found
        </p>
      </div>
    );
  }

  const { application, candidate, fieldResponses, questionResponses } = data;

  const getField = (label: string) =>
    fieldResponses.find((f) => f.label.toLowerCase() === label.toLowerCase())
      ?.value;

  function EducationExperienceSection({
    getField,
  }: {
    getField: (label: string) => string | number | undefined;
  }) {
    return (
      <div className="space-y-6">
        {/* Education */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Education</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldRow
              label="Institution"
              value={getField("Institution Name")}
            />
            <FieldRow label="Course" value={getField("Course of Study")} />
            <FieldRow label="Qualification" value={getField("Qualification")} />
            <FieldRow
              label="Graduation"
              value={getField("Year of Graduation")}
            />
          </div>
        </div>

        {/* Experience */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Experience</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldRow label="Company" value={getField("Company Name")} />
            <FieldRow label="Job Title" value={getField("Job Title")} />
            <FieldRow label="Description" value={getField("Job Description")} />
            <FieldRow
              label="Dates"
              value={
                getField("Start Date") && getField("End Date")
                  ? `${format(
                      new Date(getField("Start Date")!),
                      "PPP",
                    )} - ${format(new Date(getField("End Date")!), "PPP")}`
                  : "N/A"
              }
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Skills</h3>
          <FieldRow label="Skills" value={getField("Skills")} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl text-md mb-10">
      {/* Candidate Overview */}
      <div className="space-y-4">
        <section className="flex items-start justify-between max-w-2xl mb-10">
          <div>
            <h2 className="text-2xl font-semibold">{candidate.fullName}</h2>
            <p className="text-muted-foreground">{candidate.email}</p>
          </div>

          <div>
            <Link href={`${candidate.resumeUrl}`} target="_blank">
              <Button variant={"outline"} className="text-md">
                <FaDownload size={30} />
                Resume/CV
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Phone" value={candidate.phone} />
          <FieldRow label="Source" value={candidate.source} />
          <FieldRow label="Status" value={application.status} />
          <FieldRow
            label="Applied"
            value={new Date(application.appliedAt).toLocaleDateString()}
          />
        </section>
      </div>
      <Separator />
      {/* Education & Experience */}
      <div>
        <EducationExperienceSection getField={getField} />
      </div>
      <Separator />
      {/* Custom Questions */}
      {questionResponses.length > 0 && (
        <section className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">Additional Questions</h3>
          </div>
          <div className="space-y-3">
            {questionResponses.map((q) => (
              <div key={q.question}>
                <p className="text-md font-medium text-muted-foreground">
                  {q.question}
                </p>
                <p className="text-base">{q.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      <Separator />
    </div>
  );
}
