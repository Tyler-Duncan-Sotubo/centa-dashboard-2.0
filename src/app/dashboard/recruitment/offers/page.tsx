"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { OfferLetter } from "@/types/offer.type";
import OfferLettersTable from "./_components/OfferLettersTable";
import EmptyState from "@/shared/ui/empty-state";
import { HiOutlineDocumentText } from "react-icons/hi2";

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
    enabled: Boolean(session?.backendTokens?.accessToken),
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
        <div className="flex min-h-[70vh] items-center justify-center">
          <EmptyState
            title="No Offer Letters Found"
            description="You don’t have any offer letters yet. Once offers are created, they’ll appear here."
            icon={<HiOutlineDocumentText />}
            actionLabel="Create A Job"
            actionHref="/dashboard/recruitment/jobs"
          />
        </div>
      ) : (
        <OfferLettersTable data={offers} />
      )}
    </div>
  );
};

export default OfferPage;
