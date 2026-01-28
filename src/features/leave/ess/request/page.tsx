"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import Loading from "@/shared/ui/loading";
import Link from "next/link";
import { FaChevronCircleLeft } from "react-icons/fa";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import PageHeader from "@/shared/ui/page-header";
import { useRouter } from "next/navigation";
import NavBackButton from "@/features/ess-layout/ui/NavBackButton";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import EmptyState from "@/shared/ui/empty-state";

interface LeaveBalanceRow {
  leaveTypeId: string;
  leaveTypeName: string;
  entitlement: number;
  used: number;
  balance: number;
}

export default function LeaveRequestPage() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const [leaveTypeId, setLeaveTypeId] = useState<string | undefined>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [note, setNote] = useState("");
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  /* ───── Fetch leave balances ───── */
  const fetchLeaveBalance = async (): Promise<LeaveBalanceRow[]> => {
    const res = await axiosInstance.get(
      `/api/leave-balance/employee/${session?.user.id}`,
    );
    return res.data.data;
  };

  const {
    data: leaveBalance = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["leave-balance", session?.user.id],
    queryFn: fetchLeaveBalance,
    enabled: !!session?.user?.id,
  });

  /* ───── Derived selected type details ───── */
  const selectedLeave = useMemo(
    () => leaveBalance.find((l) => l.leaveTypeId === leaveTypeId),
    [leaveTypeId, leaveBalance],
  );

  /* ───── Request mutation ───── */
  const createRequest = useCreateMutation({
    endpoint: "/api/leave-request",
    successMessage: "Leave request submitted",
    refetchKey: "leaves leave-balance",
    onSuccess: () => {
      setNote("");
      setStartDate(undefined);
      setEndDate(undefined);
      setLeaveTypeId(undefined);
      router.push("/ess/leave");
    },
  });

  /* ───── Helpers ───── */
  const workingDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    let count = 0;
    const cur = new Date(startDate);
    while (cur <= endDate) {
      const d = cur.getDay();
      if (d !== 0 && d !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }, [startDate, endDate]);

  const handleSubmit = async () => {
    if (!selectedLeave || !startDate || !endDate) return;
    const payload = {
      leaveTypeId: selectedLeave.leaveTypeId,
      startDate,
      endDate,
      reason: note,
      partialDay: "AM",
      employeeId: session?.user.id,
    };
    try {
      await createRequest(payload, setError);
    } catch (err) {
      console.error(err);
    }
  };

  /* ───── Loading / error / no-balance guards ───── */
  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="max-w-lg mx-auto space-y-4 p-6">
        <Link href="/ess">
          <Button variant="link" className="px-0 text-md">
            <FaChevronCircleLeft className="mr-2" /> Back to Dashboard
          </Button>
        </Link>
        <p className="text-red-500">Error loading leave balances.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );

  if (!leaveBalance.length)
    return (
      <div className="w-full space-y-4 ">
        <Link href="/dashboard">
          <Button variant="link" className="px-0 text-md">
            <FaChevronCircleLeft className="mr-2" /> Back to Dashboard
          </Button>
        </Link>
        <div className="mx-aut mt-24">
          <EmptyState
            title="No Leave Balance Found"
            description="You currently have no leave balances available. Please contact HR for assistance."
            image={
              "https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585350/onboarding_izogcj.svg"
            } // or "/images/empty-jobs.png" from public folder
          />
        </div>
      </div>
    );

  /* ───── MAIN FORM ───── */
  return (
    <div className="max-w-3xl space-y-6">
      <NavBackButton href="/ess/leave">Back to Leave Overview</NavBackButton>
      <PageHeader
        title="Request Leave"
        description="Submit a new leave request for approval."
        icon="📝"
      />
      {/* Leave type selector */}
      <div>
        <label className="font-medium mb-1 block">Leave Type</label>
        <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select leave type" />
          </SelectTrigger>
          <SelectContent>
            {leaveBalance.map((lb) => (
              <SelectItem key={lb.leaveTypeId} value={lb.leaveTypeId}>
                {lb.leaveTypeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DatePickerInput
          label="Start Date"
          date={startDate}
          setDate={setStartDate}
          open={openStart}
          setOpen={setOpenStart}
        />
        <DatePickerInput
          label="End Date"
          date={endDate}
          setDate={setEndDate}
          open={openEnd}
          setOpen={setOpenEnd}
        />
      </div>

      {/* Reason */}
      <div>
        <label className="font-medium mb-1 block">Reason / Notes</label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter reason here"
        />
      </div>

      {/* Stats */}
      {selectedLeave && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <p>Requested working days: {workingDays}</p>
          <p>
            Remaining balance: {selectedLeave.balance} /{" "}
            {selectedLeave.entitlement}
          </p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={!leaveTypeId || !startDate || !endDate}
      >
        Submit Request
      </Button>
    </div>
  );
}

/* ───── Small helper component ───── */
function DatePickerInput({
  label,
  date,
  setDate,
  open,
  setOpen,
}: {
  label: string;
  date: Date | undefined;
  setDate: (d?: Date) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
}) {
  return (
    <div>
      <label className="font-medium mb-1 block">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setOpen(false); // Close the calendar on selection
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
