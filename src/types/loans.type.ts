export interface Loan {
  loanId: string;
  amount: string;
  status:
    | "pending"
    | "ongoing"
    | "paid"
    | "completed"
    | "approved"
    | "rejected";
  totalPaid: string;
  tenureMonths: number;
  preferredMonthlyPayment: string;
  employeeName: string;
  outstandingBalance: string;
  name: string;
  createdAt: string;
  paymentStatus: "on_track" | "overdue" | "closed" | "open";
  loanNumber: string;
}
