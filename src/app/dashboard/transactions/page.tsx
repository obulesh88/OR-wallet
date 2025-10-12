'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRightLeft } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { Transaction, transactionIcons } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";


function formatTransactionDate(date: Timestamp | string | Date): string {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function TransactionRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
        </TableRow>
    )
}

export default function TransactionsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && firestore) {
      setLoading(true);
      const transColRef = collection(firestore, "users", user.uid, "transactions");
      const q = query(transColRef, orderBy("date", "desc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userTransactions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Transaction));
        setTransactions(userTransactions);
        setLoading(false);
      }, (error) => {
          console.error("Error fetching transactions: ", error);
          setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, firestore]);

  const getIcon = (type: Transaction['type']) => {
    return transactionIcons[type] || transactionIcons.default;
  }

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
        {loading ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Amount (INR)</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => <TransactionRowSkeleton key={i} />)}
                </TableBody>
            </Table>
        ) : transactions.length > 0 ? (
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount (ORA)</TableHead>
                    <TableHead className="text-right">Amount (INR)</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map((transaction) => {
                    const Icon = getIcon(transaction.type);
                    return (
                        <TableRow key={transaction.id}>
                            <TableCell className="text-muted-foreground">
                                {formatTransactionDate(transaction.date)}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-muted rounded-full">
                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <span className="font-medium">{transaction.description}</span>
                                </div>
                            </TableCell>
                            <TableCell className={cn(
                                "font-semibold",
                                transaction.amount > 0
                                ? "text-primary"
                                : "text-foreground"
                            )}>
                                {transaction.amount > 0 ? "+" : ""}
                                {transaction.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {transaction.inrAmount ? `₹${transaction.inrAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                            </TableCell>
                             <TableCell className="text-right">
                                <Badge
                                    variant={
                                    transaction.status === 'Completed' ? 'secondary' : transaction.status === 'Pending' ? 'default' : 'destructive'
                                    }
                                    className={cn(
                                        transaction.status === 'Completed' ? 'bg-green-700/20 text-green-400 border-green-700/40 hover:bg-green-700/30' : 
                                        transaction.status === 'Pending' ? 'bg-amber-700/20 text-amber-400 border-amber-700/40 hover:bg-amber-700/30' :
                                        ''
                                    )}
                                >
                                    {transaction.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
            </Table>
        ) : (
            <div className="flex flex-col items-center justify-center text-center gap-4 p-12">
                <p className="text-muted-foreground">Your transactions will appear here.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
