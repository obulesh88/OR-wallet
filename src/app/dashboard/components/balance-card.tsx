'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IndianRupee, History } from "lucide-react";
import Link from "next/link";
import { SendMoneyDialog } from "./send-money-dialog";
import { useState } from "react";

export function BalanceCard() {
  const balance = 0;
  const rupeeBalance = balance / 100;
  const [_, setRecipient] = useState(null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Your INR Balance</CardTitle>
        <IndianRupee className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold tracking-tighter">
        ₹{rupeeBalance.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Available to withdraw
        </CardDescription>
      </CardContent>
      <CardFooter className="flex gap-2">
        <SendMoneyDialog onBankDetailsSubmit={() => {
           const savedBankDetails = localStorage.getItem('bankDetails');
           if (savedBankDetails) {
             setRecipient(JSON.parse(savedBankDetails));
           }
        }} />
        <Button variant="secondary" asChild>
          <Link href="/dashboard/transactions">
            <History className="mr-2" /> Wallet History
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
