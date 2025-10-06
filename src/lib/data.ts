import { Coins, Gift, ShoppingBag, Users } from "lucide-react";

export type Transaction = {
  id: string;
  type: "earn" | "withdraw" | "convert";
  description: string;
  amount: number;
  date: string;
  status: "Completed" | "Pending" | "Failed";
  icon: React.ElementType;
};

export const transactions: Transaction[] = [
  {
    id: "txn_1",
    type: "earn",
    description: "Daily login bonus",
    amount: 100,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Completed",
    icon: Coins,
  },
  {
    id: "txn_2",
    type: "convert",
    description: "Converted to Amazon Gift Card",
    amount: -5000,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Completed",
    icon: Gift,
  },
  {
    id: "txn_3",
    type: "earn",
    description: "Referral bonus from @johndoe",
    amount: 500,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Completed",
    icon: Users,
  },
  {
    id: "txn_4",
    type: "withdraw",
    description: "Withdrawal to BTC Wallet",
    amount: -10000,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Pending",
    icon: ShoppingBag,
  },
  {
    id: "txn_5",
    type: "earn",
    description: "Watched a rewarded ad",
    amount: 25,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Completed",
    icon: Coins,
  },
];
