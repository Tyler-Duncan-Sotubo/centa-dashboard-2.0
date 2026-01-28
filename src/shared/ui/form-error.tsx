import React from "react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

const FormError: React.FC<FormErrorProps> = ({ message, className }) => {
  if (!message) return null;

  return (
    <p className={cn("mx-2 mt-1 text-md font-semibold text-error", className)}>
      {message}
    </p>
  );
};

export default FormError;
