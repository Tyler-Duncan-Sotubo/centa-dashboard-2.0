"use client";

import Loading from "@/components/ui/loading";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa6";
import EmailTemplateList from "./_components/EmailTemplateList";
import CreateEmailTemplateModal from "./_components/CreateEmailTemplateModal";

const EmailTemplateSettings = () => {
  const axiosInstance = useAxiosAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

  const fetchEmailTemplates = async () => {
    try {
      const res = await axiosInstance.get("/api/interviews/email-templates");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: emailTemplates,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["emailTemplates"],
    queryFn: () => fetchEmailTemplates(),
    enabled: !!session?.backendTokens.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading email templates</p>;

  return (
    <div className="px-4 mt-5">
      <PageHeader
        title="Interview Email Templates"
        description="Customize your interview communication. Create or manage email templates for different stages of your hiring process."
      >
        <Button onClick={() => setIsOpen(true)}>
          <FaPlus className="mr-2" />
          Add New Template
        </Button>
      </PageHeader>

      <EmailTemplateList templates={emailTemplates} />

      <CreateEmailTemplateModal open={isOpen} setOpen={setIsOpen} />
    </div>
  );
};

export default EmailTemplateSettings;
