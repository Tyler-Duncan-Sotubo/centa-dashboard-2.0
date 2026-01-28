"use client";

import Loading from "@/shared/ui/loading";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { ApplicationDetails } from "@/types/application";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { CandidateApplicationView } from "../_components/CandidateApplicationView";
import ResumeScoreSection from "../_components/ResumeScoreSection";
import InterviewDetails from "../_components/InterviewDetails";
import GradingSection from "../_components/GradingSection";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { FaChevronCircleLeft } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import StageHistorySection from "../_components/StageHistorySection";
import MessagingUI from "../_messaging/MessagingUI";
import { CentaAIBot } from "@/shared/ui/CentaAIBot";
import { use } from "react";

interface Props {
  params: Promise<{ id: string }>;
}
const CandidateViewPage = ({ params }: Props) => {
  const { id } = use(params);
  const axiosInstance = useAxiosAuth();
  const { data: session, status } = useSession();

  const fetchCandidateApplication = async () => {
    try {
      const res = await axiosInstance.get(`/api/applications/${id}`);
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, isError } = useQuery<ApplicationDetails>({
    queryKey: ["candidate-application", id],
    queryFn: () => fetchCandidateApplication(),
    enabled: Boolean(session?.backendTokens?.accessToken),
    refetchOnMount: true,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  const currentUserId = session?.user?.id;

  const currentInterviewer = data?.interview?.interviewers.find(
    (interviewer) => interviewer.id === currentUserId,
  );

  return (
    <div className="max-w-5xl px-4">
      <Link href={`/dashboard/recruitment/jobs/${data?.application.jobId}`}>
        <Button variant={"link"} className="px-0 text-md">
          <FaChevronCircleLeft size={30} />
          Back to All Candidates
        </Button>
      </Link>
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details" icon={<FaUser />}>
            Candidate Details
          </TabsTrigger>
          <TabsTrigger value="resume-score">
            <CentaAIBot />
            <p className="ml-3"> Resume Score</p>
          </TabsTrigger>
          {data?.interview && (
            <>
              <TabsTrigger value="interview">Interview Details</TabsTrigger>
              {/* <TabsTrigger value="messages">Messages</TabsTrigger> */}
              <TabsTrigger value="offer">Grading</TabsTrigger>
            </>
          )}
          <TabsTrigger value="stage-history">Stage History</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <CandidateApplicationView data={data} />
        </TabsContent>

        <TabsContent value="resume-score">
          <ResumeScoreSection score={data?.application.resumeScore} />
        </TabsContent>

        {data?.interview && (
          <>
            <TabsContent value="interview">
              <InterviewDetails data={data} />
            </TabsContent>

            <TabsContent value="messages">
              <MessagingUI candidateEmail={data?.candidate.email} />
            </TabsContent>

            <TabsContent value="offer">
              {currentInterviewer ? (
                <GradingSection
                  interviewers={[currentInterviewer]}
                  interviewId={data?.interview.id}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  You are not assigned to this interview.
                </p>
              )}
            </TabsContent>
          </>
        )}

        <TabsContent value="stage-history">
          <StageHistorySection stageHistory={data?.stageHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateViewPage;
