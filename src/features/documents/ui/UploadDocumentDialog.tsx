"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import FormError from "@/shared/ui/form-error";
import { FileUploader } from "@/shared/ui/file-uploader";
import { FaCloudUploadAlt } from "react-icons/fa";

const documentSchema = z.object({
  type: z.string().min(1, "Type is required"),
  category: z.string().min(1, "Category is required"),
  file: z
    .object({
      name: z.string(),
      type: z.string(),
      base64: z.string(),
    })
    .nullable()
    .refine((v) => v !== null, "File is required"),
});

type DocumentFormData = z.infer<typeof documentSchema>;

export function UploadDocumentDialog({
  folderId,
}: { folderId?: string | null } = {}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      type: "",
      category: "",
      file: undefined,
    },
  });

  const uploadDocument = useCreateMutation({
    endpoint: "/api/documents",
    successMessage: "File uploaded successfully",
    refetchKey: "folders",
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  const onSubmit = async (values: DocumentFormData) => {
    try {
      await uploadDocument(
        {
          ...values,
          folderId: folderId,
        },
        setError,
        form.reset,
      );
    } catch (err) {
      console.error("Upload error", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FaCloudUploadAlt className="mr-2" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload New Document</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. contract, payroll" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. uploads, docs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document File</FormLabel>
                  <FormControl>
                    <FileUploader
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <FormError message={error} />}

            <DialogFooter>
              <Button type="submit" isLoading={form.formState.isSubmitting}>
                Upload
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
