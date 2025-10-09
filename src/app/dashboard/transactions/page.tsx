import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        <div className="flex flex-col items-center justify-center text-center gap-4 p-12">
            <p className="text-muted-foreground">Your transactions will appear here.</p>
        </div>
      </CardContent>
    </Card>
  );
}
