"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { categorySchema, type CategoryFormValues } from "../schema/category";

export function useAddCategory() {
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
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

  const onSubmit = async (data: CategoryFormValues): Promise<void> => {
    await addCategory(data, setError);
  };

  return useMemo(
    () => ({ form, error, isOpen, setIsOpen, onSubmit }),
    [form, error, isOpen, onSubmit],
  );
}
