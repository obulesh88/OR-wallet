import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { transactions } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function TransactionHistory() {
  const recentTransactions = transactions.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          A log of your recent account activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center">
            <div className="p-2 bg-muted rounded-full mr-4">
              <transaction.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-grow">
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>
            <div
              className={cn(
                "font-semibold",
                transaction.amount > 0
                  ? "text-[hsl(var(--accent))]"
                  : "text-foreground"
              )}
            >
              {transaction.amount > 0 ? "+" : ""}
              {transaction.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard/transactions">
            View all transactions <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
