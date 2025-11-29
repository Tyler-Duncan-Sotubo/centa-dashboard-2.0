"use client";

import { Button } from "@/components/ui/button";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useState } from "react";
import { BiMailSend } from "react-icons/bi";

type Props = {
  offerId: string;
  candidateEmail: string;
};

export default function SendOfferButton({ offerId, candidateEmail }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOffer = useCreateMutation({
    endpoint: `/api/offers/${offerId}/send`,
    successMessage: "Offer sent successfully",
    refetchKey: "offers",
    onSuccess: () => {
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Error sending offer:", error);
      setIsLoading(false);
    },
  });

  const sendOffer = async () => {
    setIsLoading(true);
    await handleSendOffer({ email: candidateEmail });
  };

  return (
    <Button size="sm" onClick={() => sendOffer()} disabled={isLoading}>
      <BiMailSend />
      {isLoading ? "Sending..." : "Send Offer"}
    </Button>
  );
}
