import { Coins, Gift, ShoppingBag, Landmark } from "lucide-react";
import { type Timestamp } from "firebase/firestore";

export type Transaction = {
  id: string;
  type: "earn" | "withdraw" | "convert" | "send";
  description: string;
  amount: number;
  date: Timestamp | string;
  status: "Completed" | "Pending" | "Failed";
  icon: React.ElementType;
  inrAmount?: number;
};

export const transactionIcons = {
    earn: Coins,
    withdraw: Landmark,
    convert: Gift,
    send: ShoppingBag,
    default: Coins,
};
