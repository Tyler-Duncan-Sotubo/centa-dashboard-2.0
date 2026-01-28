"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { Eye } from "lucide-react";
import { OfferTemplatesResponse } from "@/types/offer.type";
import { FaCirclePlus, FaClone, FaGlobe, FaTrash } from "react-icons/fa6";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { useDeleteMutation } from "@/shared/hooks/useDeleteMutation";
import { FaBuilding } from "react-icons/fa";
import { OfferTemplatePreviewModal } from "../offers/_components/OfferTemplatePreviewModal";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/shared/ui/page-header";

export default function OfferLetterTemplates() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch offer templates
  const fetchTemplates = async (): Promise<OfferTemplatesResponse> => {
    const res = await axiosInstance.get("/api/offer-letter/company-templates");
    return res.data.data;
  };

  const { data, isLoading, isError } = useQuery<OfferTemplatesResponse>({
    queryKey: ["offer-letter-templates"],
    queryFn: fetchTemplates,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  /* --- Clone system template → company template --- */
  const cloneTemplate = useCreateMutation({
    endpoint: "/api/offer-letter/clone-company-template",
    successMessage: "Template cloned!",
    refetchKey: "offer-letter-templates",
  });

  const handleClone = async (id: string) => {
    setIsSubmitting(true);
    try {
      await cloneTemplate({ templateId: id });
    } catch (error) {
      console.error("Error cloning scorecard:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading offers or templates</p>;

  /* ------------------------ UI ------------------------ */
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  function DeleteAlert({
    id,
    trigger,
  }: {
    id: string;
    trigger?: React.ReactNode;
  }) {
    const [open, setOpen] = useState(false);

    const deleteMutation = useDeleteMutation({
      endpoint: `/api/offer-letter/template/${id}`,
      refetchKey: "offer-letter-templates",
      successMessage: "Offer letter template deleted successfully",
    });

    const handleConfirm = async () => {
      setDeleting(true);
      try {
        await deleteMutation();
      } finally {
        setDeleting(false);
        setOpen(false);
      }
    };

    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          {trigger ?? (
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          )}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this template?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All data associated with this
              template will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={deleting}
            >
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <div className="px-4 space-y-6">
      <PageHeader
        title="Offer Letter Templates"
        description="Create and manage your offer letter templates."
      >
        <Link href="/dashboard/recruitment/offer-templates/create">
          <Button className="gap-2">
            <FaCirclePlus /> New Template
          </Button>
        </Link>
      </PageHeader>
      {/* ───── Your Letter Templates ───── */}
      {((data && data.companyTemplates?.length) ?? 0) > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-6">
          <h2 className="text-lg font-semibold col-span-full">
            Your Offer Letter Templates
          </h2>

          {data &&
            data.companyTemplates!.map((tpl) => (
              <Card key={tpl.id}>
                <CardContent className="p-4 space-y-14">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-md font-semibold">{tpl.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tpl.description || "No description"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        tpl.isSystemTemplate ? "completed" : "outline"
                      }
                    >
                      <FaBuilding className="mr-1" />
                      {tpl.isSystemTemplate ? "System" : "Company"}
                    </Badge>
                  </div>

                  <div className="flex justify-between mt-10">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/recruitment/offer-templates/${tpl.id}`}
                      >
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteAlert
                        id={tpl.id}
                        trigger={
                          <Button variant="destructive" size="sm">
                            <FaTrash />
                          </Button>
                        }
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => setPreviewHtml(tpl.content)}
                    >
                      <Eye className="h-4 w-4" /> Preview
                    </Button>
                  </div>
                </CardContent>

                {previewHtml && (
                  <OfferTemplatePreviewModal
                    open={!!previewHtml}
                    templateHtml={previewHtml}
                    onOpenChange={() => setPreviewHtml(null)}
                  />
                )}
              </Card>
            ))}
        </div>
      )}

      {/* ───── System Templates (Clone-able) ───── */}
      {((data && data.systemTemplates?.length) ?? 0) > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-10 mb-20">
          <h2 className="text-lg font-semibold col-span-full">
            Templates You Can Clone
          </h2>

          {data &&
            data.systemTemplates!.map((tpl) => (
              <Card key={tpl.id}>
                <CardContent className="p-4 space-y-14">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-md font-semibold">{tpl.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tpl.description || "No description"}
                      </p>
                    </div>
                    <Badge variant="completed">
                      <FaGlobe className="mr-1" />
                      Global
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleClone(tpl.id)}
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                    >
                      <FaClone />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => setPreviewHtml(tpl.content)}
                    >
                      <Eye className="h-4 w-4" /> Preview
                    </Button>
                  </div>
                </CardContent>

                {previewHtml && (
                  <OfferTemplatePreviewModal
                    open={!!previewHtml}
                    templateHtml={previewHtml}
                    onOpenChange={() => setPreviewHtml(null)}
                  />
                )}
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
