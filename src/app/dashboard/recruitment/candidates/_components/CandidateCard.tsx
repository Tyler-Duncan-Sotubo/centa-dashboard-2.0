import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Candidate } from "@/types/candidate";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <p className="font-bold">{candidate.name}</p>
          <div>
            {candidate.resumeUrl && (
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline text-sm"
              >
                View Resume
              </a>
            )}
          </div>
        </div>
        <div className="text-sm font-medium">
          <p className="text-sm text-muted-foreground">{candidate.email}</p>
          <p className="text-sm text-muted-foreground">{candidate.phone}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          {candidate.skills.length > 0 ? (
            <ul className="text-sm list-inside">
              {candidate.skills.map((skill: string, i: number) => (
                <Badge key={i} className="mr-1 mb-1" variant={"outline"}>
                  {skill}
                </Badge>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              No skills listed
            </p>
          )}
        </div>
        <div className="mt-3">
          <Button className="w-1/3">Invite</Button>
        </div>
      </CardContent>
    </Card>
  );
}
