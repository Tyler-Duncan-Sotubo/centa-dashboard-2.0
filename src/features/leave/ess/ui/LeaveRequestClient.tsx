"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { FaChevronCircleLeft } from "react-icons/fa";
import { CalendarIcon } from "lucide-react";

import Loading from "@/shared/ui/loading";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import PageHeader from "@/shared/ui/page-header";
import NavBackButton from "@/features/ess-layout/ui/NavBackButton";
import EmptyState from "@/shared/ui/empty-state";
import { useLeaveBalance } from "../hooks/use-leave-balance";
import { useCreateLeaveRequest } from "../hooks/use-create-leave-request";
import { useSession } from "next-auth/react";

export default function LeaveRequestPage() {
  const { data: session } = useSession();
  const [leaveTypeId, setLeaveTypeId] = useState<string | undefined>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [note, setNote] = useState("");
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: leaveBalance = [],
    isLoading,
    isError,
    refetch,
  } = useLeaveBalance();

  const selectedLeave = useMemo(
    () => leaveBalance.find((l) => l.leaveTypeId === leaveTypeId),
    [leaveTypeId, leaveBalance],
  );

  const createRequest = useCreateLeaveRequest(() => {
    setNote("");
    setStartDate(undefined);
    setEndDate(undefined);
    setLeaveTypeId(undefined);
  });

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
    if (!selectedLeave || !startDate || !endDate || !session?.user?.id) return;

    const payload = {
      leaveTypeId: selectedLeave.leaveTypeId,
      startDate,
      endDate,
      reason: note,
      partialDay: "AM" as const,
      employeeId: session.user.id,
    };

    setIsSubmitting(true);
    await createRequest(payload, setError, () => setIsSubmitting(false));
  };

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
      <div className="w-full space-y-4">
        <Link href="/dashboard">
          <Button variant="link" className="px-0 text-md">
            <FaChevronCircleLeft className="mr-2" /> Back to Dashboard
          </Button>
        </Link>
        <div className="mx-aut mt-24">
          <EmptyState
            title="No Leave Balance Found"
            description="You currently have no leave balances available. Please contact HR for assistance."
            image="https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585350/onboarding_izogcj.svg"
          />
        </div>
      </div>
    );

  return (
    <div className="max-w-3xl space-y-6">
      <NavBackButton href="/ess/leave">Back to Leave Overview</NavBackButton>

      <PageHeader
        title="Request Leave"
        description="Submit a new leave request for approval."
        icon="📝"
      />

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

      <div>
        <label className="font-medium mb-1 block">Reason / Notes</label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter reason here"
        />
      </div>

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
        isLoading={isSubmitting}
      >
        Submit Request
      </Button>
    </div>
  );
}

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
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
