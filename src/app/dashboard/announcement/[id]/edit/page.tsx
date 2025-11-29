"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import Loading from "@/components/ui/loading";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { z } from "zod";
import { RichTextEditor } from "../../../../../components/RichTextEditor";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaChevronCircleLeft } from "react-icons/fa";
import Link from "next/link";
import { announcementSchema } from "@/schema/annoucement.schema";

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function EditAnnouncementPage() {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const { id } = useParams();
  const router = useRouter();

  const fetchAnnouncement = async () => {
    try {
      const res = await axiosAuth.get(`/api/announcement/${id}`);
      return res.data.data.announcement;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosAuth.get("/api/announcement/create-elements");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  // Fetch the single announcement
  const {
    data: announcement,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["announcement", id],
    queryFn: fetchAnnouncement,
    enabled: !!session?.backendTokens.accessToken && !!id,
  });

  const {
    data: elements,
    isLoading: isLoadingElements,
    isError: isErrorElements,
  } = useQuery({
    queryKey: ["create elements", "categories"],
    queryFn: fetchCategories,
    enabled: !!session?.backendTokens.accessToken && !!announcement,
  });

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: announcement,
  });

  const updateAnnouncement = useUpdateMutation({
    endpoint: `/api/announcement/${id}`,
    successMessage: "Announcement updated successfully",
    refetchKey: "announcements",
    onSuccess: () => router.push("/dashboard/announcement"),
  });

  useEffect(() => {
    if (announcement) {
      form.reset(announcement);
    }
  }, [announcement, form]);

  const onSubmit = async (data: AnnouncementFormValues) => {
    await updateAnnouncement(data);
  };

  if (isLoading || isLoadingElements) return <Loading />;
  if (isError || isErrorElements) return <div>Error loading announcement</div>;

  function formatDatetimeLocal(dateString: string | undefined): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  }

  return (
    <div className="p-5">
      <Link href="/dashboard/announcement">
        <Button variant={"link"} className="px-0 text-md mb-5 ">
          <FaChevronCircleLeft />
          Back to Announcements
        </Button>
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Edit Announcement</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-3 gap-10"
        >
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <Input placeholder="Title..." {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="body"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sidebar Meta */}
          <div className="space-y-6">
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
                      {elements?.categories.map(
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
                      {elements?.departments.map(
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
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {elements?.locations.map(
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
                  <Input
                    type="datetime-local"
                    value={formatDatetimeLocal(field.value)}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="isPublished"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FormLabel>Published</FormLabel>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              isLoading={form.formState.isSubmitting}
              className="w-full"
            >
              Update Announcement
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
