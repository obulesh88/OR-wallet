import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { transactions } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ArrowRightLeft } from "lucide-react";

export default function TransactionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft />
          All Transactions
        </CardTitle>
        <CardDescription>
          A complete record of all your account activity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      <transaction.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {transaction.description}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{transaction.type}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(transaction.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      transaction.status === "Completed"
                        ? "secondary"
                        : transaction.status === "Pending"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold",
                    transaction.amount > 0
                      ? "text-[hsl(var(--accent))]"
                      : "text-foreground"
                  )}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
