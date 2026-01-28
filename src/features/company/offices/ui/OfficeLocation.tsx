"use client";

import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/shared/ui/alert-dialog";
import { useDeleteMutation } from "@/shared/hooks/useDeleteMutation";
import PageHeader from "@/shared/ui/page-header";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { officeLocation } from "@/types/location.type";
import { EditLocationSheet } from "./EditLocationSheet";
import { CreateLocationSheet } from "./CreateLocationSheet";

const OfficeLocation = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchOfficeLocations = async () => {
    try {
      const res = await axiosInstance.get("/api/locations");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const {
    data: officeLocations,
    isLoading: isLoadingOffice,
    isError: isErrorOffice,
  } = useQuery<officeLocation[]>({
    queryKey: ["office-locations"],
    queryFn: fetchOfficeLocations,
    enabled: !!session?.backendTokens?.accessToken,
  });

  const Alert = ({ id, name }: { id: string; name: string }) => {
    const deleteOffice = useDeleteMutation({
      endpoint: `/api/locations/${id}`,
      successMessage: "Office location deleted successfully",
      refetchKey: "office-locations",
    });

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost">
            <Trash className="text-red-500" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Office Location</AlertDialogTitle>
            <AlertDialogDescription>
              {name === "Head Office"
                ? "You cannot delete the Head Office location."
                : `Are you sure you want to delete the office location "${name}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="text-white w-1/4 bg-red-600 hover:bg-red-600"
              onClick={() => {
                deleteOffice();
              }}
              disabled={name === "Head Office"}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  if (status === "loading" || isLoadingOffice) return <Loading />;
  if (isErrorOffice)
    return <div className="text-red-500">Failed to load leave settings</div>;

  return (
    <section>
      <section>
        <PageHeader
          title="Office Locations"
          description="Manage office locations and their geo-coordinates."
          tooltip="Office locations are used to define the physical locations of your offices, including their addresses and geo-coordinates. This information is important for attendance tracking and reporting purposes."
        >
          <CreateLocationSheet />
        </PageHeader>
        <div className="my-2 space-y-4 py-6 mt-10">
          <Table className="text-md border rounded-md">
            <TableHeader className="shadow-2xs rounded-lg border">
              <TableRow>
                <TableHead className="py-4">Location Name</TableHead>
                <TableHead className="py-4">Country</TableHead>
                <TableHead className="py-4">Street</TableHead>
                <TableHead className="py-4">City</TableHead>
                <TableHead className="py-4">State</TableHead>
                <TableHead className="py-4">Longitude</TableHead>
                <TableHead className="py-4">Latitude</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(officeLocations ?? []).length > 0 ? (
                officeLocations?.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell>{loc.name}</TableCell>
                    <TableCell>{loc.country}</TableCell>
                    <TableCell>{loc.street}</TableCell>
                    <TableCell>{loc.city}</TableCell>
                    <TableCell>{loc.state}</TableCell>
                    <TableCell>{loc.longitude}</TableCell>
                    <TableCell>{loc.latitude}</TableCell>
                    <TableCell className="text-center">
                      <EditLocationSheet
                        isOpen={false}
                        onClose={() => {}}
                        defaultValues={{
                          id: loc.id,
                          name: loc.name,
                          country: loc.country,
                          street: loc.street,
                          city: loc.city,
                          state: loc.state,
                          longitude: Number(loc.longitude),
                          latitude: Number(loc.latitude),
                        }}
                      />
                      <Alert id={loc.id} name={loc.name} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No office locations added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </section>
  );
};

export default OfficeLocation;
