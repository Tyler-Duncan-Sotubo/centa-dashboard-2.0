"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import Loading from "@/components/ui/loading";
import PageHeader from "@/components/pageHeader";
import { OfferLetter } from "@/types/offer.type";
import OfferLettersTable from "./_components/OfferLettersTable";
import EmptyState from "@/components/empty-state";

const OfferPage = () => {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchOffers = async (): Promise<OfferLetter[]> => {
    const res = await axiosInstance.get("/api/offers");
    return res.data.data as OfferLetter[];
  };

  const {
    data: offers,
    isLoading: offersLoading,
    isError: offersError,
  } = useQuery<OfferLetter[]>({
    queryKey: ["offers"],
    queryFn: fetchOffers,
    enabled: !!session?.backendTokens.accessToken,
  });

  if (offersLoading) return <Loading />;
  if (offersError) return <p>Error loading offers</p>;

  return (
    <div className="p-5">
      <div className="mb-6">
        <PageHeader
          title="Active Offers"
          description="Track active job offers and their statuses."
        ></PageHeader>
      </div>

      {offers?.length === 0 ? (
        <EmptyState
          title="No Offer Letters Found"
          description="You don’t have any offer letters yet. Once offers are created, they’ll appear here."
          image={
            "https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585356/offer_rvfioe.svg"
          }
          actionLabel="Create A Job"
          actionHref="/dashboard/recruitment/jobs"
        />
      ) : (
        <OfferLettersTable data={offers} />
      )}
    </div>
  );
};

export default OfferPage;
