/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { formatSource } from "@/shared/utils/formatSource";
import Mustache from "mustache";
import { useToast } from "@/shared/hooks/use-toast";
import { DateInput } from "@/shared/ui/date-input";
import { useSession } from "next-auth/react";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import FormError from "@/shared/ui/form-error";
import { Switch } from "@/shared/ui/switch";

const SIGNATURE_FIELDS = new Set([
  "sig_emp",
  "sig_cand",
  "date_emp",
  "date_cand",
]);

type InputValue = string | number | boolean;

function inferFieldType(
  fieldName: string,
): "string" | "number" | "date" | "boolean" {
  const lower = fieldName.toLowerCase();
  if (lower.includes("date")) return "date";
  if (
    lower.includes("salary") ||
    lower.includes("amount") ||
    lower.includes("rate")
  )
    return "number";
  if (lower.startsWith("is") || lower.startsWith("has")) return "boolean";
  return "string";
}

export default function OfferCreatePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const templateId = searchParams.get("templateId");
  const newStageId = searchParams.get("newStageId");
  const axios = useAxiosAuth();
  const { toast } = useToast();

  const [userInput, setUserInput] = useState<Record<string, InputValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [error, setError] = useState<string | null>(null);

  const submitOffer = useCreateMutation({
    endpoint: "/api/offers",
    successMessage: "Offer letter created successfully!",
    refetchKey: "offers",
    onSuccess: () => {
      router.push("/dashboard/recruitment/offers");
      setError(null);
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["offer-template-variables", applicationId, templateId],
    queryFn: async () => {
      const res = await axios.get("/api/offers/variables", {
        params: { templateId, applicationId },
      });
      return res.data.data as {
        variables: string[];
        autoFilled: Record<string, string>;
        templateContent: string;
      };
    },
    enabled:
      Boolean(session?.backendTokens?.accessToken) &&
      !!applicationId &&
      !!templateId,
  });

  const handleChange = (key: string, value: InputValue) => {
    setUserInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!applicationId || !templateId || !data) return;

    const allData = { ...userInput, ...data.autoFilled };
    const missing = data.variables.filter(
      (key) => !allData[key] && !SIGNATURE_FIELDS.has(key),
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
      await submitOffer(
        {
          applicationId,
          templateId,
          newStageId,
          pdfData: allData,
        },
        setError,
      );
    } catch (error) {
      console.error("Error creating offer:", error);
      toast({
        title: "Error",
        description: "Failed to create offer letter. Please try again.",
        variant: "destructive",
      });
      return;
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

  if (isLoading || status === "loading" || !applicationId || !templateId)
    return <Loading />;
  if (isError || !data)
    return <p className="text-red-500">Failed to load offer template data.</p>;

  const editableVars = data.variables.filter((v) => !SIGNATURE_FIELDS.has(v));
  const signatureVars = data.variables.filter((v) => SIGNATURE_FIELDS.has(v));

  return (
    <div className="max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Create Offer Letter</h1>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="form">Fill Fields</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <div className="space-y-4">
            {editableVars.map((key) => {
              const type = inferFieldType(key);
              const autoValue = data.autoFilled[key];
              const userValue = userInput[key];

              return (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium">
                    {formatSource(key)}
                    {autoValue && (
                      <span className="ml-2 text-muted-foreground">
                        (auto-filled)
                      </span>
                    )}
                  </label>

                  {autoValue ? (
                    <Input value={autoValue} disabled />
                  ) : type === "date" ? (
                    <DateInput
                      value={(userValue as string) || ""}
                      onChange={(val) => handleChange(key, val)}
                    />
                  ) : type === "number" ? (
                    <Input
                      type="number"
                      value={
                        typeof userValue === "boolean"
                          ? userValue
                            ? "true"
                            : ""
                          : (userValue ?? "")
                      }
                      onChange={(e) =>
                        handleChange(
                          key,
                          e.target.value ? parseFloat(e.target.value) : "",
                        )
                      }
                    />
                  ) : type === "boolean" ? (
                    <Switch
                      checked={Boolean(userValue)}
                      onCheckedChange={(val) => handleChange(key, val)}
                    />
                  ) : (
                    <Input
                      value={
                        typeof userValue === "boolean"
                          ? userValue
                            ? "true"
                            : ""
                          : (userValue ?? "")
                      }
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  )}
                </div>
              );
            })}

            {signatureVars.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                  Will be filled during signing:
                </h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  {signatureVars.map((v) => (
                    <li key={v}>{formatSource(v)}</li>
                  ))}
                </ul>
              </div>
            )}

            {error && <FormError message={error} />}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Generating..." : "Generate Offer Letter"}
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
