import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet } from "lucide-react";
import Link from "next/link";

export function AddMoneyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-5" /> Add Money
        </CardTitle>
        <CardDescription>
          Add money to your wallet using UPI, debit/credit card, or net
          banking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" asChild>
          <Link href="/dashboard/add-money">Add Money</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
