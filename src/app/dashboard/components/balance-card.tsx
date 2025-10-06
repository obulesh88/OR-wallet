import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Coins, Plus, ArrowDown } from "lucide-react";

export function BalanceCard() {
  const balance = 12345.67;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
        <Coins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold tracking-tighter">
          {balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Available coins in your wallet
        </CardDescription>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button>
          <Plus className="mr-2" /> Add Coins
        </Button>
        <Button variant="secondary">
          <ArrowDown className="mr-2" /> Withdraw
        </Button>
      </CardFooter>
    </Card>
  );
}