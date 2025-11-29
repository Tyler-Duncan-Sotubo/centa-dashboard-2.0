"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "../../../../components/RichTextEditor";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploader } from "@/components/common/FileUploader";
import { useState } from "react";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import FormError from "@/components/ui/form-error";
import { FaChevronCircleLeft } from "react-icons/fa";
import Link from "next/link";
import { marked } from "marked";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { announcementSchema } from "@/schema/annoucement.schema";
import { CentaAISuggest } from "@/components/ui/centa-ai-suggest";
import ErrorState from "@/components/ErrorState";
import { useToast } from "@/hooks/use-toast";
import { DateInput } from "@/components/ui/date-input";

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function CreateAnnouncementPage() {
  const { toast } = useToast();
  const axiosAuth = useAxiosAuth();
  const router = useRouter();
  const { data: session } = useSession();
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      isPublished: false,
    },
  });
  const [image, setImage] = useState<{
    name: string;
    type: string;
    base64: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [AiError, setAIError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await axiosAuth.get("/api/announcement/create-elements");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["create elements", "categories"],
    queryFn: fetchCategories,
    enabled: !!session?.backendTokens.accessToken,
  });

  const createAnnouncement = useCreateMutation({
    endpoint: `/api/announcement`,
    successMessage: "Announcement created successfully",
    refetchKey: "announcements",
    onSuccess: () => router.push("/dashboard/announcement"),
  });

  const onSubmit = async (data: AnnouncementFormValues) => {
    if (!data.categoryId) {
      toast({
        title: "Category Required",
        description: "Please select a category for the announcement.",
        variant: "destructive",
      });
      return;
    }
    await createAnnouncement(
      {
        ...data,
        image: image?.base64 || "",
      },
      setError,
      form.reset
    );
  };

  if (isLoading) return <Loading />;
  if (isError || !data?.categories)
    return (
      <ErrorState
        message="Failed to load categories. Please try again."
        onRetry={refetch}
        isLoading={isLoading}
      />
    );

  const generateAnnouncementBody = async (title: string, category: string) => {
    setAIError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/generate-body", {
        method: "POST",
        body: JSON.stringify({ title, category }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setIsSubmitting(false);
      return data.body;
    } catch (error) {
      console.error("AI generation failed:", error);
      return "";
    }
  };

  return (
    <div className="p-5">
      <Link href="/dashboard/announcement">
        <Button variant={"link"} className="px-0 text-md mb-5 ">
          <FaChevronCircleLeft />
          Back to Announcements
        </Button>
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Create Announcement</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-12 gap-5"
        >
          {/* LEFT SIDE - MAIN CONTENT */}
          <div className="col-span-9 space-y-6">
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <Input placeholder="Announcement title..." {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="body"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-2 flex items-center justify-between">
                    <FormLabel>Body</FormLabel>
                    {AiError && <FormError message={AiError} />}
                    <Button
                      type="button"
                      variant="link"
                      disabled={isSubmitting}
                      className="mb-3 text-xl font-semibold p-0"
                      onClick={async () => {
                        const title = form.getValues("title");
                        const categoryId = form.getValues("categoryId");
                        const categoryName =
                          data?.categories.find(
                            (c: { id: string; name: string }) =>
                              c.id === categoryId
                          )?.name || "All";

                        if (!title) {
                          setAIError("Please enter title first.");
                          return;
                        }

                        setIsSubmitting(true);
                        const aiContent = await generateAnnouncementBody(
                          title,
                          categoryName
                        );
                        setIsSubmitting(false);

                        if (!aiContent) {
                          setAIError("AI generation failed");
                          return;
                        }

                        const htmlContent = await marked(aiContent);
                        form.setValue("body", htmlContent);
                      }}
                    >
                      <CentaAISuggest isLoading={isSubmitting} />
                    </Button>
                  </div>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    key={field.value}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <FormError message={error} />}
          </div>

          {/* RIGHT SIDE - META */}
          <div className="space-y-6 col-span-3">
            <div>
              <p className="font-semibold mb-2">Add Featured Image</p>
              <FileUploader
                value={image}
                onChange={setImage}
                label="Upload Receipt"
              />
            </div>
            <FormField
              name="categoryId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {data &&
                        data.categories?.map(
                          (cat: { id: string; name: string }) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          )
                        )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="departmentId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent
                      side="bottom"
                      avoidCollisions={false}
                      className="max-h-60 overflow-y-auto"
                    >
                      {data &&
                        data?.departments?.map(
                          (dept: { id: string; name: string }) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          )
                        )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="locationId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {data &&
                        data?.locations?.map(
                          (loc: { id: string; name: string }) => (
                            <SelectItem key={loc.id} value={loc.id}>
                              {loc.name}
                            </SelectItem>
                          )
                        )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="publishedAt"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Published Date</FormLabel>
                  <DateInput
                    onChange={field.onChange}
                    value={field.value || ""}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              isLoading={form.formState.isSubmitting}
              className="w-full"
            >
              Create Announcement
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
