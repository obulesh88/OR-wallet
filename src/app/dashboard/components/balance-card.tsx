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
import { IndianRupee, History, Send, Coins } from "lucide-react";
import Link from "next/link";

export function BalanceCard() {
  const balance = 0;
  const rupeeBalance = balance / 100;

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
        <Button asChild>
            <Link href="/dashboard/send">
                <Send className="mr-2 h-4 w-4" /> Send
            </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/dashboard/transactions">
            <History className="mr-2 h-4 w-4" /> History
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function OraBalanceCard() {
  const oraBalance = 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Your ORA Balance</CardTitle>
        <Coins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold tracking-tighter">
        {oraBalance.toLocaleString()}
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          ORA Coins
        </CardDescription>
      </CardContent>
    </Card>
  )
}