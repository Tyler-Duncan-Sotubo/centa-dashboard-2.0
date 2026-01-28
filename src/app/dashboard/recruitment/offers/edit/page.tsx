/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import { formatSource } from "@/shared/utils/formatSource";
import Mustache from "mustache";
import FormError from "@/shared/ui/form-error";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { useSession } from "next-auth/react";
import Loading from "@/shared/ui/loading";
import { FaChevronCircleLeft } from "react-icons/fa";
import Link from "next/link";

const SIGNATURE_FIELDS = new Set([
  "sig_emp",
  "sig_cand",
  "date_emp",
  "date_cand",
]);

export default function OfferEditPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId");
  const router = useRouter();
  const axios = useAxiosAuth();
  const { toast } = useToast();
  const [userInput, setUserInput] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["edit-offer-template", offerId],
    queryFn: async () => {
      const res = await axios.get(`/api/offers/variables/${offerId}`);
      return res.data.data;
    },
    enabled: !!offerId && Boolean(session?.backendTokens?.accessToken),
  });

  useEffect(() => {
    if (data?.autoFilled) setUserInput(data.autoFilled);
  }, [data]);

  const updateOffer = useUpdateMutation({
    endpoint: `/api/offers/${offerId}`,
    successMessage: "Offer letter updated!",
    refetchKey: "offers",
    onSuccess: () => router.push("/dashboard/recruitment/offers"),
  });

  const handleChange = (key: string, value: string) => {
    setUserInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const missing = data.variables.filter(
      (key: string) => !userInput[key] && !SIGNATURE_FIELDS.has(key),
    );

    if (missing.length > 0) {
      toast({
        title: "Missing Fields",
        description: `Please fill in the following fields: ${missing.join(
          ", ",
        )}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await updateOffer({ pdfData: userInput }, setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewHtml = useMemo(() => {
    try {
      if (!data?.templateContent) return "";
      const combined = { ...data.autoFilled, ...userInput };
      return Mustache.render(data.templateContent, combined);
    } catch {
      return "<p class='text-red-500'>Error rendering preview</p>";
    }
  }, [data, userInput]);

  if (isLoading || status === "loading" || !offerId) return <Loading />;
  if (isError || !data)
    return <p className="text-red-500">Failed to load data.</p>;

  const editableVars = data.variables.filter(
    (v: string) => !SIGNATURE_FIELDS.has(v),
  );
  const signatureVars = data.variables.filter((v: string) =>
    SIGNATURE_FIELDS.has(v),
  );

  return (
    <div className="max-w-4xl space-y-4 px-4">
      <Link href="/dashboard/recruitment/offers">
        <Button variant={"link"} className="px-0 text-md ">
          <FaChevronCircleLeft size={30} />
          <span className="ml-2">Back to Offers</span>
        </Button>
      </Link>
      <h1 className="text-2xl font-semibold">Edit Offer Letter</h1>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="form">Edit Fields</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <div className="space-y-4">
            {editableVars.map((key: string) => {
              const value = userInput[key] || "";

              return (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium">
                    {formatSource(key)}
                  </label>

                  <Input
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                </div>
              );
            })}

            {signatureVars.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  These fields are filled during signing:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {signatureVars.map((v: string) => (
                    <li key={v}>{formatSource(v)}</li>
                  ))}
                </ul>
              </div>
            )}

            {error && <FormError message={error} />}
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <style jsx global>{`
            .offer-preview p {
              margin-bottom: 1rem;
              line-height: 1.6;
            }
            .offer-preview h3 {
              margin: 1.5rem 0 0.75rem;
              font-size: 1.125rem;
            }
            .offer-preview hr {
              margin: 2rem 0;
              border: none;
              border-top: 1px solid #ddd;
            }
            .offer-preview table {
              border-collapse: collapse;
              width: 100%;
              margin-top: 1rem;
            }
            .offer-preview th,
            .offer-preview td {
              border: 1px solid #ccc;
              padding: 6px 8px;
              text-align: left;
            }
          `}</style>

          <div
            className="offer-preview rounded-md border p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
