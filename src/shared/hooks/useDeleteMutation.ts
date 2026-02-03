import { axiosInstance } from "@/lib/axios";
import { extractErrorMessage } from "@/shared/utils/errorHandler";
import { useToast } from "@/shared/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { logClientEvent } from "@/lib/logger/client-logger";

type DeleteMutationParams = {
  endpoint: string;
  successMessage?: string;
  refetchKey?: string; // For refreshing queries
  onSuccess?: () => void;
  onError?: (errorMsg: string) => void;
};

/**
 * Reusable mutation hook for deleting data via DELETE request.
 */
export function useDeleteMutation({
  endpoint,
  successMessage = "Deleted successfully!",
  refetchKey,
  onSuccess,
  onError,
}: DeleteMutationParams) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  /**
   * Executes the mutation.
   * @param setError - Function to set error state in the UI.
   * @param onClose - Optional function to close a modal.
   */
  const remove = async (
    setError?: (errorMsg: string) => void,
    onClose?: () => void,
  ) => {
    try {
      const res = await axiosInstance.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${session?.backendTokens?.accessToken}`,
        },
      });

      if (res.status === 200 || res.status === 204) {
        toast({
          title: successMessage,
          description: "The item has been successfully removed.",
          variant: "success",
        });

        onClose?.(); // Close modal if provided

        if (refetchKey) {
          refetchKey
            .split(" ")
            .forEach((key) =>
              queryClient.invalidateQueries({ queryKey: [key] }),
            );
        }

        onSuccess?.();
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);

      logClientEvent("error", "Delete mutation failed", {
        kind: "mutation_error",
        action: "delete",
        endpoint,
        message: errorMessage,
      });

      // Display error in UI
      setError?.(errorMessage);

      // Show error toast
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      onError?.(errorMessage);
    }
  };

  return remove;
}
