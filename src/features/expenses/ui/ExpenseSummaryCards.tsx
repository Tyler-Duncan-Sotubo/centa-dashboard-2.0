import { Card, CardContent } from "@/shared/ui/card";
import { Expense } from "./ExpenseColumns";
import { format } from "date-fns";
import { DollarSign, CalendarClock, Clock, PieChart } from "lucide-react";
import { formatCurrency } from "@/shared/utils/formatCurrency";

export function ExpenseSummaryCards({ data }: { data: Expense[] | undefined }) {
  const parseAmount = (value: unknown) => Number(value) || 0;

  const approvedExpenses =
    data?.filter(
      (item) => item.status === "paid" || item.status === "pending",
    ) ?? [];

  const total = data
    ? approvedExpenses.reduce((sum, item) => sum + parseAmount(item.amount), 0)
    : 0;

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayTotal =
    approvedExpenses
      ?.filter((item) => item.date === todayStr)
      .reduce((sum, item) => sum + parseAmount(item.amount), 0) ?? 0;

  const pendingTotal =
    approvedExpenses
      ?.filter((item) => item.status === "pending")
      .reduce((sum, item) => sum + parseAmount(item.amount), 0) ?? 0;

  const mostSpentCategory = (() => {
    const categoryTotals: Record<string, number> = {};
    approvedExpenses?.forEach((item) => {
      const amt = parseAmount(item.amount);
      categoryTotals[item.category] =
        (categoryTotals[item.category] || 0) + amt;
    });
    const maxCategory = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1],
    )[0];
    return maxCategory
      ? `${maxCategory[0]} (${formatCurrency(maxCategory[1])})`
      : "-";
  })();

  const cardData = [
    {
      title: "Total Expenses",
      value: formatCurrency(total),
      icon: <DollarSign className="w-4 h-4 text-white" />,
      color: "bg-green-500",
    },
    {
      title: "Today",
      value: formatCurrency(todayTotal),
      icon: <CalendarClock className="w-4 h-4 text-white" />,
      color: "bg-blue-500",
    },
    {
      title: "Pending",
      value: formatCurrency(pendingTotal),
      icon: <Clock className="w-4 h-4 text-white" />,
      color: "bg-yellow-500",
    },
    {
      title: "Top Category",
      value: mostSpentCategory,
      icon: <PieChart className="w-4 h-4 text-white" />,
      change: "vs. all categories",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-10">
      {cardData.map((card) => (
        <Card
          key={card.title}
          className="shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl shadow-xl ${card.color}`}>
                {card.icon}
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                {card.title}
              </span>
            </div>
            <div className="text-2xl font-bold mt-2">{card.value}</div>
            <span className="text-xs text-muted-foreground">{card.change}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
