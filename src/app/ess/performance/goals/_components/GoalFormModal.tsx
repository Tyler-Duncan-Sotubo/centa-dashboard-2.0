import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import Modal from "@/shared/ui/modal";
import { useEffect } from "react";
import { Textarea } from "@/shared/ui/textarea";
import { DateInput } from "@/shared/ui/date-input";
import { useSession } from "next-auth/react";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { Goal } from "@/types/performance/goals.type";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

// Dynamic schema based on whether you're creating or editing
const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().min(1),
  startDate: z.string().min(1),
});

const editSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().min(1),
  startDate: z.string().min(1),
});

export type GoalInput = z.infer<typeof createSchema | typeof editSchema>;

type Props = {
  open: boolean;
  setOpen: (val: boolean) => void;
  initialData?: Goal | null;
};

export default function GoalModal({ open, setOpen, initialData }: Props) {
  const isEditing = !!initialData;
  const { data: session } = useSession();

  // Use the appropriate schema based on whether we're editing or creating
  const formSchema = isEditing ? editSchema : createSchema;

  const form = useForm<GoalInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      dueDate: "",
      cycleId: "",
      ...initialData,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...form.getValues(),
        ...initialData,
      });
    }
  }, [initialData, form]);

  const createGoal = useCreateMutation({
    endpoint: "/api/performance-goals",
    successMessage: "Goal created successfully",
    refetchKey: "goals",
  });

  const updateGoal = useUpdateMutation({
    endpoint: `/api/performance-goals/${initialData?.id}`,
    successMessage: "Goal updated successfully",
    refetchKey: "goals",
  });

  const onSubmit = (data: GoalInput) => {
    if (isEditing) {
      updateGoal({
        ...data,
      });
    } else {
      createGoal({
        ...data,
        employeeId: session?.user.id as string,
        status: "active",
      });
    }
    setOpen(false);
    form.reset();
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title={isEditing ? "Edit Goal" : "Create Goal"}
      confirmText={isEditing ? "Update" : "Create"}
      cancelText="Cancel"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <Form {...form}>
        <form className="space-y-6 ">
          <FormField
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Name</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <Textarea {...field} className="resize-none" />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="startDate"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <DateInput value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="dueDate"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <DateInput value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </Modal>
  );
}
