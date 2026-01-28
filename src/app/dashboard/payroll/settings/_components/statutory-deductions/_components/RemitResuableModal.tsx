import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/shared/ui/modal";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

// Define a schema generator so each modal field is validated
const generateSchema = (fields: { name: string; label: string }[]) => {
  const shape = fields.reduce(
    (acc, field) => {
      acc[field.name] = z.string().min(1, `${field.label} is required`);
      return acc;
    },
    {} as Record<string, z.ZodTypeAny>,
  );
  return z.object(shape);
};

interface FieldDef {
  name: string;
  label: string;
  placeholder?: string;
}

interface ReusableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
  fields: FieldDef[];
  title: string;
  confirmText?: string;
}

export const RemitReusableModal = ({
  isOpen,
  onClose,
  onSubmit,
  fields,
  title,
  confirmText = "Submit",
}: ReusableModalProps) => {
  const schema = generateSchema(fields);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: fields.reduce(
      (acc, field) => {
        acc[field.name] = "";
        return acc;
      },
      {} as Record<string, string>,
    ),
  });

  const handleSubmit = (values: Record<string, string>) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      confirmText={confirmText}
      onConfirm={form.handleSubmit(handleSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <Form {...form}>
        <form className="space-y-4 my-4">
          {fields.map((field) => (
            <FormField
              key={field.name}
              name={field.name}
              control={form.control}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel required>{field.label}</FormLabel>
                  <FormControl>
                    <Input
                      {...formField}
                      placeholder={field.placeholder || field.label}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </form>
      </Form>
    </Modal>
  );
};
