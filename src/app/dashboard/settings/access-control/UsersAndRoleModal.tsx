import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/shared/ui/input";
import Modal from "@/shared/ui/modal";
import {
  Form,
  FormControl,
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
import FormError from "@/shared/ui/form-error";
import { userSchema } from "@/schema/user.schema";
import { User } from "@/types/user.type";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

interface UsersAndRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  user?: User | null;
}

const UsersAndRoleModal = ({
  isOpen,
  onClose,
  isEditing = false,
  user,
}: UsersAndRoleModalProps) => {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
    },
  });

  // Update form values when `user` changes
  useEffect(() => {
    if (user && isEditing) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
      });
    }
  }, [user, form, isEditing]);

  const createUserInvite = useCreateMutation({
    endpoint: "/api/auth/invite",
    successMessage: "User invite sent successfully",
    refetchKey: "users",
  });

  const updateUserRole = useUpdateMutation({
    endpoint: `/api/auth/edit-user-role/${user?.id}`,
    successMessage: "User role updated successfully",
    refetchKey: "users",
  });

  async function onSubmit(values: z.infer<typeof userSchema>) {
    if (isEditing) {
      await updateUserRole(values, setError, onClose);
      form.reset();
    } else {
      await createUserInvite(values, setError, form.reset, onClose);
    }
  }

  const roles = [
    { name: "Admin", value: "admin" },
    { name: "HR Manager", value: "hr_manager" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit User" : "Invite User"}
      confirmText={isEditing ? "Save" : "Send Invite"}
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <section>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 my-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="role"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role, index) => (
                        <SelectItem key={index} value={role.value}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <FormError message={error} />}
          </form>
        </Form>
      </section>
    </Modal>
  );
};

export default UsersAndRoleModal;
