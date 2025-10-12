'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFirestore, useUser } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { ArrowRight, Coins, IndianRupee, Repeat } from "lucide-react";
import { useEffect, useState } from "react";

export function ConvertCard() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [oraAmount, setOraAmount] = useState<number | ''>('');
  const [oraBalance, setOraBalance] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  
  const conversionRate = 1 / 1000; // 1000 ORA = 1 INR

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setOraBalance(doc.data().oraBalance || 0);
        }
      });
      return () => unsubscribe();
    }
  }, [user, firestore]);
  
  const inrAmount = oraAmount !== '' ? oraAmount * conversionRate : 0;
  const hasSufficientBalance = oraAmount !== '' && oraBalance >= oraAmount;

  const handleConvert = async () => {
    if (!user || !firestore || oraAmount === '' || oraAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount of ORA to convert.",
      });
      return;
    }

    if (!hasSufficientBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: "You do not have enough ORA to complete this conversion.",
      });
      return;
    }

    setIsConverting(true);

    const userDocRef = doc(firestore, "users", user.uid);
    const transactionsColRef = collection(firestore, "users", user.uid, "transactions");

    try {
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          throw new Error("User document not found");
        }

        const currentOraBalance = userDoc.data().oraBalance || 0;
        const currentInrBalance = userDoc.data().balance || 0;

        if (currentOraBalance < oraAmount) {
          throw new Error("Insufficient ORA balance");
        }

        const newOraBalance = currentOraBalance - oraAmount;
        const newInrBalance = currentInrBalance + (inrAmount * 100); // Store as paise

        transaction.update(userDocRef, {
          oraBalance: newOraBalance,
          balance: newInrBalance,
        });

        // Add transaction record
        const transactionData = {
          type: "convert",
          description: `Converted ${oraAmount.toLocaleString()} ORA to INR`,
          amount: -oraAmount,
          inrAmount: inrAmount,
          date: serverTimestamp(),
          status: "Completed",
        };
        // We are not awaiting this to avoid blocking UI
        addDoc(transactionsColRef, transactionData).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: transactionsColRef.path,
            operation: 'create',
            requestResourceData: transactionData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      });

      toast({
        title: "Conversion Successful",
        description: `You have converted ${oraAmount.toLocaleString()} ORA to ₹${inrAmount.toFixed(2)}.`,
      });
      setOraAmount('');

    } catch (e: any) {
      console.error("Conversion failed: ", e);
      toast({
        variant: "destructive",
        title: "Conversion Failed",
        description: e.message || "An unexpected error occurred.",
      });
    } finally {
      setIsConverting(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Convert</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-2 relative">
            <div className="p-4 bg-muted rounded-md">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">From</span>
                    <span className="text-xs text-muted-foreground">Available balance: {oraBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Coins className="w-6 h-6 text-primary" />
                        <span className="font-bold text-lg">ORA</span>
                    </div>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      className="text-right text-lg font-bold border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                      value={oraAmount}
                      onChange={(e) => setOraAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={isConverting}
                    />
                </div>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Button variant="ghost" size="icon" className="bg-card hover:bg-muted rounded-full border">
                    <Repeat className="w-5 h-5" />
                </Button>
            </div>
            <div className="p-4 bg-muted rounded-md">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">To</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <IndianRupee className="w-6 h-6 text-green-500" />
                        <span className="font-bold text-lg">INR</span>
                    </div>
                    <div className="text-right text-lg font-bold">
                      {inrAmount > 0 ? `₹${inrAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}` : '--'}
                    </div>
                </div>
            </div>
        </div>
         {oraAmount !== '' && !hasSufficientBalance && (
            <p className="text-sm text-center text-destructive">
                Insufficient ORA balance.
            </p>
        )}
        <div className="text-sm text-center text-muted-foreground">
            1,000 ORA ≈ ₹1
        </div>

        <Button size="lg" className="w-full" onClick={handleConvert} disabled={!hasSufficientBalance || isConverting || oraAmount === '' || oraAmount <= 0}>
          {isConverting ? 'Converting...' : 'Convert ORA to INR'}
        </Button>
      </CardContent>
    </Card>
  );
}
