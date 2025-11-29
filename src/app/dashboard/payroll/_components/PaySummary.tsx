import { Button } from "@/components/ui/button";
import { EmployeeDetail } from "@/types/payRunDetails";
import { formatCurrency } from "@/utils/formatCurrency";
import { format } from "date-fns";
import { Download } from "lucide-react";
import React from "react";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const PaySummary = ({
  payrollSummary,
}: {
  payrollSummary: EmployeeDetail[];
}) => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedFormat, setSelectedFormat] = React.useState("bank");
  const { toast } = useToast();
  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(
        `/api/payroll-report/payment-advice/${payrollSummary[0].payrollRunId}?format=${selectedFormat}`
      );

      const url = res.data?.data?.url?.url;
      if (url) {
        window.open(url, "_blank");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get download link.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayrollVariance = async () => {
    try {
      const res = await axiosInstance.get(
        "/api/payroll-report/company-payroll-variance"
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data,
    isLoading: isLoadingVariance,
    isError,
  } = useQuery({
    queryKey: ["variance"],
    queryFn: fetchPayrollVariance,
    enabled: !!session?.backendTokens.accessToken,
  });

  if (!payrollSummary || payrollSummary.length === 0) {
    return (
      <div className="flex justify-center items-center">
        <p className="text-muted-foreground">No payroll summary available</p>
      </div>
    );
  }

  if (status === "loading" || isLoadingVariance) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <div className="md:w-[90%] mx-auto mt-6">
      {data?.current && (
        <section className="flex space-x-6">
          <div className="border border-background rounded-md p-6 shadow-sm bg-background/30 w-[65%]">
            <div>
              <p className="text-md text-textPrimary capitalize">
                You are paying <strong>{data?.current.employee_count}</strong>{" "}
                employees for Period{" "}
                <span className="font-semibold">
                  {data?.current.payroll_date &&
                  !isNaN(new Date(data?.current.payroll_date).getTime())
                    ? format(new Date(data?.current.payroll_date), "MMMM, yyyy")
                    : "N/A"}
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <p className="text-sm">
                For breakdown of how these amounts were calculated
              </p>
              <Button
                variant="link"
                className="p-0 text-sm"
                onClick={() => {
                  setSelectedFormat("internal");
                  handleDownload();
                }}
                disabled={isLoading}
              >
                <Download size={16} />
                open the detailed report
              </Button>
            </div>
            <div className="flex items-center space-x-16 w-full my-6">
              <div>
                <p className="font-medium text-2xl">
                  {formatCurrency(data?.current.totalPayrollCost)}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Total Payroll Cost
                </p>
              </div>
              <div>
                <p className="font-medium text-2xl">
                  {formatCurrency(data?.current.total_netSalary)}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Employee Net Pay
                </p>
              </div>
            </div>
            <Button
              className="mt-4"
              onClick={() => {
                setSelectedFormat("bank");
                handleDownload();
              }}
              disabled={isLoading}
            >
              <Download size={16} />
              Download Bank Advice
            </Button>
          </div>
          <div className="w-[30%] hidden md:block border border-background rounded-md p-6 shadow-sm space-y-4 mx-auto text-center">
            <h3 className="text-md font-semibold text-textPrimary">
              Last Payroll Variance
            </h3>

            {[
              { label: "Gross", value: data?.variance.gross_salary_variance },
              { label: "Net", value: data?.variance.netSalary_variance },
              {
                label: "Deductions",
                value: data?.variance.deductions_variance,
              },
              {
                label: "Payroll Cost",
                value: data?.variance.payroll_cost_variance,
              },
              {
                label: "Employees",
                value: data?.variance.employee_count_variance,
              },
            ].map((item) => {
              const isPositive = item.value > 0;
              const isZero = item.value === 0;
              const arrow = isZero ? null : isPositive ? "↑" : "↓";
              const color = isZero
                ? "text-gray-500"
                : isPositive
                ? "text-green-600"
                : "text-red-600";

              return (
                <div key={item.label} className="text-md flex justify-between">
                  <span className="text-textSecondary">{item.label}:</span>{" "}
                  <span className={`font-medium ${color}`}>
                    {arrow}{" "}
                    {item.label === "Employees"
                      ? item.value
                      : formatCurrency(item.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default PaySummary;
