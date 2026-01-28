"use client";

import Link from "next/link";
import { FaChevronCircleLeft } from "react-icons/fa";

import { Button } from "@/shared/ui/button";
import Loading from "@/shared/ui/loading";
import ErrorState from "@/shared/ui/error-state";
import FormError from "@/shared/ui/form-error";
import { Input } from "@/shared/ui/input";
import { RichTextEditor } from "../../../../shared/ui/rich-text-editor";
import { FileUploader } from "@/shared/ui/file-uploader";
import { CentaAISuggest } from "@/shared/ui/centa-ai-suggest";
import { DateInput } from "@/shared/ui/date-input";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { useCreateAnnouncement } from "../hooks/use-create-announcement";

export function CreateAnnouncementView() {
  const {
    form,
    image,
    setImage,
    error,
    aiError,
    aiSubmitting,
    elementsQuery,
    onSubmit,
    applyAiSuggestion,
    refetchElements,
  } = useCreateAnnouncement();

  if (elementsQuery.isLoading) return <Loading />;

  if (elementsQuery.isError || !elementsQuery.data?.categories) {
    return (
      <ErrorState
        message="Failed to load categories. Please try again."
        onRetry={refetchElements}
        isLoading={elementsQuery.isLoading}
      />
    );
  }

  const elements = elementsQuery.data;

  return (
    <div className="p-5">
      <Link href="/dashboard/announcement">
        <Button variant="link" className="px-0 text-md mb-5">
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
          {/* LEFT */}
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
                    {aiError ? <FormError message={aiError} /> : null}
                    <Button
                      type="button"
                      variant="link"
                      disabled={aiSubmitting}
                      className="mb-3 text-xl font-semibold p-0"
                      onClick={applyAiSuggestion}
                    >
                      <CentaAISuggest isLoading={aiSubmitting} />
                    </Button>
                  </div>

                  <RichTextEditor
                    value={field.value ?? ""} // ensure string
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {error ? <FormError message={error} /> : null}
          </div>

          {/* RIGHT */}
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
                      {elements.categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
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
                      {elements.departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
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
                      {elements.locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
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
