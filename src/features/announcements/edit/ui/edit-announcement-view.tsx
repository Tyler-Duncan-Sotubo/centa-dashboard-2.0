"use client";

import Link from "next/link";
import { FaChevronCircleLeft } from "react-icons/fa";
import Loading from "@/shared/ui/loading";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";

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

import { formatDatetimeLocal } from "@/features/announcements/lib/datetime";
import { useEditAnnouncement } from "../hooks/use-edit-announcement";
import { RichTextEditor } from "@/shared/ui/rich-text-editor";

export function EditAnnouncementView() {
  const { form, onSubmit, elements, isLoading, isError } =
    useEditAnnouncement();

  if (isLoading) return <Loading />;
  if (isError || !elements) return <div>Error loading announcement</div>;

  return (
    <div className="p-5">
      <Link href="/dashboard/announcement">
        <Button variant="link" className="px-0 text-md mb-5">
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
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sidebar */}
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
                    value={field.value ?? ""}
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
