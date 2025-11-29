// components/performance/CurrentCycleCard.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DeleteIconDialog } from "@/components/DeleteIconDialog";
import { FaEdit } from "react-icons/fa";
import CreateCycleModal from "./CreateCycleModal";
import { useState } from "react";

export default function CurrentCycleCard() {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["current-cycle"],
    queryFn: async () => {
      const response = await axiosAuth.get("/api/performance-cycle/current");
      return response.data.data;
    },
    enabled: !!session?.backendTokens.accessToken,
  });

  if (isLoading) {
    return (
      <div className="space-y-1 border p-4 rounded-lg bg-white shadow-sm font-semibold">
        <h3 className="text-xmd text-muted-foreground">Current Cycle</h3>
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <>
      {data ? (
        <div className="space-y-1 border p-4 rounded-lg bg-white shadow-sm font-semibold group">
          <div className="flex items-center justify-between">
            <h3 className="text-xmd  text-muted-foreground">Current Cycle</h3>
            <div className="invisible group-hover:visible">
              <Button
                variant="link"
                size="icon"
                onClick={() => setIsOpen(true)}
              >
                <FaEdit />
              </Button>
              <DeleteIconDialog itemId={data.id} type="cycle" />
            </div>
          </div>
          <div className="text-xmd space-y-2">
            <p>{data.name}</p>
            <p className="text-muted-foreground">
              {data.startDate} → {data.endDate}
            </p>
          </div>
          <CreateCycleModal
            open={isOpen}
            setOpen={setIsOpen}
            initialData={data} // or undefined for new
          />
        </div>
      ) : (
        ""
      )}
    </>
  );
}
