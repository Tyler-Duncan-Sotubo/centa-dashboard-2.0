"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useState } from "react";
import FormError from "@/components/ui/form-error";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export default function AddCategoryModal() {
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const addCategory = useCreateMutation({
    endpoint: `/api/announcement/category`,
    successMessage: "Category added",
    refetchKey: "categories",
    onSuccess: () => {
      form.reset();
      setError(null);
      setIsOpen(false);
    },
  });

  interface CategoryFormValues {
    name: string;
  }

  const onSubmit = async (data: CategoryFormValues): Promise<void> => {
    await addCategory(data, setError);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="ml-auto px-0"
          onClick={() => setIsOpen(true)}
          data-testid="add-category-button"
        >
          + New Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="category-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <Input placeholder="Enter category name..." {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <FormError message={error} />}
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="submit"
            isLoading={form.formState.isSubmitting}
            form="category-form"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
