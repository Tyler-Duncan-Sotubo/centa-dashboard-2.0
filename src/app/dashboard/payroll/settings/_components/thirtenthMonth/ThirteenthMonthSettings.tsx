"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { format } from "date-fns";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { CalendarIcon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export default function ThirteenthMonthSettings() {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [typeSaved, setTypeSaved] = useState(false);
  const [amountSaved, setAmountSaved] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [paymentDate, setPaymentDate] = useState("2024-12-28");
  const [amount, setAmount] = useState(100000);
  const [percentage, setPercentage] = useState(0);
  const [type, setType] = useState<"fixed" | "percentage">("fixed");
  const [dateSaved, setDateSaved] = useState(false);

  async function update(key: string, value: unknown) {
    try {
      await axiosInstance.patch(
        "/api/payroll-settings/update-payroll-setting",
        { key, value }
      );
    } catch {
      toast({
        title: `Failed to update ${key}`,
        variant: "destructive",
      });
    }
  }

  async function fetchSettings() {
    try {
      const res = await axiosInstance.get("/api/payroll-settings/13th-month");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  }

  const { isLoading, isError } = useQuery({
    queryKey: ["thirteenth-month-settings"],
    queryFn: async () => {
      const data = await fetchSettings();
      setEnabled(Boolean(data.enable13thMonth));
      setPaymentDate(data.paymentDate || "2024-12-28");
      setAmount(data.paymentAmount || 0);
      setPercentage(data.paymentPercentage || 0);
      setType(data.paymentType || "fixed");
      return data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  const Saved = () => {
    return (
      <div className="flex items-center gap-1 ml-2">
        <CheckCircle size={16} className="text-green-400" />
        <span className="text-green-400 text-sm">Saved</span>
      </div>
    );
  };

  return (
    <Card className="md:w-2/3 mt-4 mb-20">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex justify-between items-center">
          13th Month Salary
          <Switch
            id="enable_13th_month"
            checked={enabled}
            onCheckedChange={(val) => {
              setEnabled(val);
              update("enable_13th_month", val);
            }}
          />
        </CardTitle>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4 mt-2">
          <Label className="mb-1 flex items-center gap-10">
            Payment Date
            {dateSaved && <Saved />}
          </Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !paymentDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {paymentDate ? (
                  format(new Date(paymentDate), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 mt-2">
              <Calendar
                mode="single"
                selected={paymentDate ? new Date(paymentDate) : undefined}
                onSelect={(date) => {
                  if (date instanceof Date) {
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, "0");
                    const dd = String(date.getDate()).padStart(2, "0");
                    const formattedDate = `${yyyy}-${mm}-${dd}`;
                    setPaymentDate(formattedDate);
                    update("13th_month_payment_date", formattedDate).then(
                      () => {
                        setDateSaved(true);
                        setTimeout(() => setDateSaved(false), 4000);
                      }
                    );
                    setCalendarOpen(false);
                  }
                }}
                className="mb-4"
              />
            </PopoverContent>
          </Popover>

          <div>
            <Label className="mb-3 flex justify-between items-center gap-2">
              Payment Type
              {typeSaved && <Saved />}
            </Label>
            <Select
              value={type}
              onValueChange={(val: "fixed" | "percentage") => {
                setType(val);
                update("13th_month_payment_type", val);
                setTypeSaved(true);
                setTimeout(() => setTypeSaved(false), 3000);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="percentage">% of Gross Salary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "fixed" ? (
            <div>
              <Label className="mb-3 flex justify-between items-center gap-2">
                Fixed Amount (₦)
                {amountSaved && <Saved />}
              </Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setAmount(val);
                  update("13th_month_payment_amount", val);
                  setAmountSaved(true);
                  setTimeout(() => setAmountSaved(false), 3000);
                }}
              />
            </div>
          ) : (
            <div>
              <Label className="mb-3 flex justify-between items-center gap-2">
                Percentage of Salary (%)
                {amountSaved && <Saved />}
              </Label>
              <Input
                type="number"
                value={percentage}
                step="0.1"
                onChange={async (e) => {
                  const val = parseFloat(e.target.value);
                  setPercentage(val);
                  await update("13th_month_payment_percentage", val);
                  setAmountSaved(true);
                  setTimeout(() => setAmountSaved(false), 3000);
                }}
              />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
