'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Transaction, transactionIcons } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";


function formatTransactionDate(date: Timestamp | string | Date): string {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
}

function TransactionSkeleton() {
    return (
        <div className="flex items-center">
            <Skeleton className="h-9 w-9 rounded-full mr-4" />
            <div className="flex-grow space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-4 w-1/5" />
        </div>
    )
}

export function TransactionHistory() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && firestore) {
      setLoading(true);
      const transColRef = collection(firestore, "users", user.uid, "transactions");
      const q = query(transColRef, orderBy("date", "desc"), limit(4));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const userTransactions = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
          } as Transaction));
          setTransactions(userTransactions);
          setLoading(false);
        }, 
        async (error) => {
          const permissionError = new FirestorePermissionError({
            path: transColRef.path,
            operation: 'list',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [user, firestore]);

  const getIcon = (type: Transaction['type']) => {
    return transactionIcons[type] || transactionIcons.default;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          A log of your recent account activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
           Array.from({ length: 4 }).map((_, i) => <TransactionSkeleton key={i} />)
        ) : transactions.length > 0 ? (
          transactions.map((transaction) => {
            const Icon = getIcon(transaction.type);
            return (
              <div key={transaction.id} className="flex items-center">
                <div className="p-2 bg-muted rounded-full mr-4">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-grow">
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTransactionDate(transaction.date)}
                  </p>
                </div>
                <div
                  className={cn(
                    "font-semibold",
                    transaction.amount > 0
                      ? "text-primary"
                      : "text-foreground"
                  )}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount.toLocaleString()}
                </div>
              </div>
            )
          })
        ) : (
            <p className="text-sm text-muted-foreground text-center">No recent transactions found.</p>
        )}
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
