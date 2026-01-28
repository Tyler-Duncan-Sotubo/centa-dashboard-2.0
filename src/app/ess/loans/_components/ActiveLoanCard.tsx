import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { Loan } from "@/types/loans.type";
import { addMonths, endOfMonth, format } from "date-fns";
import { Separator } from "@/shared/ui/separator";

export function ActiveLoanCard({ loan }: { loan: Loan }) {
  const installmentAmount = Number(loan.preferredMonthlyPayment);
  const amountRepaid = Number(loan.totalPaid);
  const remainingAmount = Number(loan.outstandingBalance);
  const totalInstallments = loan.tenureMonths;
  const loanAmount = Number(loan.amount);

  const installmentsPaid =
    installmentAmount > 0 ? Math.floor(amountRepaid / installmentAmount) : 0;

  const installmentsRemaining = totalInstallments - installmentsPaid;

  const progressPercent = Math.min(
    (amountRepaid / Number(loan.amount)) * 100,
    100,
  );

  const nextInstallmentDate = format(
    endOfMonth(addMonths(new Date(loan.createdAt), installmentsPaid)),
    "dd MMM yyyy",
  );

  return (
    <div className="max-w-2xl px-4 py-8 space-y-6 bg-white rounded-xl border ">
      <section>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-semibold">
              {formatCurrency(loanAmount)}
            </p>
            <Badge
              variant={
                loan.paymentStatus === "overdue"
                  ? "rejected"
                  : loan.paymentStatus === "closed"
                    ? "approved"
                    : "pending"
              }
            >
              {loan.paymentStatus.toUpperCase()}
            </Badge>
          </div>
          <div className="w-32 mt-5">
            <Progress value={progressPercent} />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {progressPercent.toFixed(0)}% paid
            </p>
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">
          <span>{loan.name}</span> - <span>{loan.loanNumber}</span>
        </h3>
        <Separator />
      </section>

      <div className="space-y-2 text-md flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">Installment</p>
          <p>{formatCurrency(installmentAmount)}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Amount Repaid</p>
          <p>{formatCurrency(amountRepaid)}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Remaining</p>
          <p>{formatCurrency(remainingAmount)}</p>
        </div>
      </div>
      <div className="flex justify-between text-md">
        <div className="flex space-x-2">
          <span className="text-muted-foreground">Next Installment</span>
          <span>{nextInstallmentDate}</span>
        </div>

        <div className="flex space-x-2">
          <span className="text-muted-foreground">Installments Left</span>
          <span>
            {installmentsRemaining} of {totalInstallments}
          </span>
        </div>
      </div>
    </div>
  );
}
