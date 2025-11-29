"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { OfferTemplatesResponse } from "@/types/offer.type";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { OfferTemplatePreviewModal } from "./OfferTemplatePreviewModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  newStageId: string;
}

export const TemplateSelectionModal = ({
  isOpen,
  onClose,
  applicationId,
  newStageId,
}: Props) => {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const router = useRouter();

  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const { data, isLoading } = useQuery<OfferTemplatesResponse>({
    queryKey: ["offer-letter-templates"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/api/offer-letter/company-templates"
      );
      return res.data.data;
    },
    enabled: isOpen && !!session?.backendTokens.accessToken,
  });

  const handleSelect = (templateId: string) => {
    router.push(
      `/dashboard/recruitment/offers/create?applicationId=${applicationId}&templateId=${templateId}&newStageId=${newStageId}`
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Select Offer Letter Template"
        confirmText=""
        cancelText="Close"
      >
        {isLoading ? (
          <p>Loading templates...</p>
        ) : (
          <div className="space-y-8 mt-4">
            {/* Company Templates */}
            {(data?.companyTemplates?.length ?? 0) > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Your Company Templates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data?.companyTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="border rounded p-4 shadow-sm flex flex-col gap-2"
                    >
                      <div>
                        <h4 className="font-medium">{tpl.name}</h4>
                        <p className="text-muted-foreground text-sm">
                          {tpl.description || "No description"}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewHtml(tpl.content)}
                        >
                          <Eye className="w-4 h-4 mr-1" /> Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSelect(tpl.id)}
                          className="ml-auto"
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Global Templates */}
            {(data?.systemTemplates?.length ?? 0) > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Global Templates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data?.systemTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="border rounded p-4 shadow-sm flex flex-col gap-2"
                    >
                      <div>
                        <h4 className="font-medium">{tpl.name}</h4>
                        <p className="text-muted-foreground text-sm">
                          {tpl.description || "No description"}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewHtml(tpl.content)}
                        >
                          <Eye className="w-4 h-4 mr-1" /> Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSelect(tpl.id)}
                          className="ml-auto"
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {previewHtml && (
        <OfferTemplatePreviewModal
          open={!!previewHtml}
          templateHtml={previewHtml}
          onOpenChange={() => setPreviewHtml(null)}
        />
      )}
    </>
  );
};
