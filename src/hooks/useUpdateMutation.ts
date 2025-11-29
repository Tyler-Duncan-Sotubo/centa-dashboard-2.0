import { axiosInstance } from "@/lib/axios";
import { extractErrorMessage } from "@/utils/errorHandler";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UpdateMutationParams<T> = {
  endpoint: string;
  successMessage?: string;
  refetchKey?: string; // For refreshing queries
  onSuccess?: (updated: unknown) => void;
  onError?: (errorMsg: string) => void;
  method?: "PATCH" | "PUT"; // Default is PATCH
};

/**
 * Reusable mutation hook for updating data via PATCH/PUT request.
 */
export function useUpdateMutation<T>({
  endpoint,
  successMessage,
  refetchKey,
  onSuccess,
  onError,
  method = "PATCH",
}: UpdateMutationParams<T>) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  /**
   * Executes the mutation.
   * @param data - The data to be sent in the request.
   * @param setError - Function to set error state in the UI.
   * @param onClose - Optional function to close a modal.
   */
  const update = async (
    data?: T,
    setError?: (errorMsg: string) => void,
    onClose?: () => void
  ) => {
    try {
      const res = await axiosInstance({
        method,
        url: endpoint,
        data,
        headers: {
          Authorization: `Bearer ${session?.backendTokens.accessToken}`,
        },
      });

      if (res.data && successMessage) {
        toast({
          title: successMessage,
          description: "successful",
          variant: "success",
        });

        onClose?.(); // Close modal if provided

        if (refetchKey) {
          refetchKey
            .split(" ")
            .forEach((key) =>
              queryClient.invalidateQueries({ queryKey: [key] })
            );
        }

        onSuccess?.(res.data);

        // **return the created data** for the caller
        return res.data;
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);

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

  return update;
}
