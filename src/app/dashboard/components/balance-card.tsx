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
import { useFirestore, useUser } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { IndianRupee, History, Send, Coins, ArrowDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

export function BalanceCard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, 
        (doc) => {
          if (doc.exists()) {
            setBalance(doc.data().balance || 0);
          }
        },
        async (err) => {
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        }
      );
      return () => unsubscribe();
    }
  }, [user, firestore]);

  const rupeeBalance = balance;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Your INR Balance</CardTitle>
        <IndianRupee className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold tracking-tighter">
        ₹{rupeeBalance.toLocaleString("en-IN", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
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
        <Button variant="outline" asChild>
          <Link href="https://rzp.io/rzp/pJpIHylk" target="_blank" rel="noopener noreferrer">
            <ArrowDown className="mr-2 h-4 w-4" /> Receive
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
  const { user } = useUser();
  const firestore = useFirestore();
  const [oraBalance, setOraBalance] = useState(0);

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, 
        (doc) => {
          if (doc.exists()) {
            setOraBalance(doc.data().oraBalance || 0);
          }
        },
        async (err) => {
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        }
      );
      return () => unsubscribe();
    }
  }, [user, firestore]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb/2">
        <CardTitle className="text-sm font-medium">Your OR Balance</CardTitle>
        <Coins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold tracking-tighter">
        {oraBalance.toLocaleString()}
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          OR Coins
        </CardDescription>
      </CardContent>
    </Card>
  )
}
