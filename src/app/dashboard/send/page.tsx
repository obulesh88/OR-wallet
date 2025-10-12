'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Edit, Send, IndianRupee } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { SendMoneyDialog } from '../components/send-money-dialog';
import { useFirestore, useUser } from '@/firebase';
import { doc, onSnapshot, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type BankDetails = {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export default function SendPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const [recipient, setRecipient] = useState<BankDetails | null>(null);
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');
  const [oraBalance, setOraBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const conversionRate = 1000; // 1 INR = 1000 ORA
  const feePercentage = 0.02; // 2% fee
  
  const amountInr = amount === '' ? 0 : amount;
  const feeInInr = amountInr * feePercentage;
  const amountRecipientReceives = amountInr - feeInInr;
  const totalOraAmount = amountInr * conversionRate;
  
  const hasSufficientBalance = oraBalance >= totalOraAmount;

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

  useEffect(() => {
    const savedBankDetails = localStorage.getItem('bankDetails');
    if (savedBankDetails) {
      setRecipient(JSON.parse(savedBankDetails));
    } else {
        setEditing(true);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !firestore || amount === '' || amount <= 0) {
        toast({
            variant: 'destructive',
            title: 'Invalid amount',
            description: 'Please enter an amount greater than 0.',
        });
        return;
    }
    
    if (!hasSufficientBalance) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Balance',
        description: 'You do not have enough ORA coins for this transaction.',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const userDocRef = doc(firestore, "users", user.uid);
    const transactionsColRef = collection(firestore, "users", user.uid, "transactions");

    try {
        await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                throw new Error("User not found");
            }
            const currentOraBalance = userDoc.data().oraBalance || 0;
            if (currentOraBalance < totalOraAmount) {
                throw new Error("Insufficient balance.");
            }
            const newOraBalance = currentOraBalance - totalOraAmount;
            transaction.update(userDocRef, { oraBalance: newOraBalance });
        });

        const transactionData = {
          type: "withdraw",
          description: `Withdrawal of ₹${amountRecipientReceives.toFixed(2)} to bank account`,
          amount: -totalOraAmount,
          inrAmount: amount,
          date: serverTimestamp(),
          status: "Pending",
        };

        addDoc(transactionsColRef, transactionData).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: transactionsColRef.path,
            operation: 'create',
            requestResourceData: transactionData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

        toast({
            title: 'Transfer initiated',
            description: `Sending ₹${amountRecipientReceives.toFixed(2)}. This will debit ${totalOraAmount.toLocaleString()} ORA coins.`,
        });

        router.push('/dashboard');

    } catch(e: any) {
        toast({
            variant: 'destructive',
            title: 'Transaction Failed',
            description: e.message || 'An error occurred during the transaction.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDetailsUpdated = () => {
    const savedBankDetails = localStorage.getItem('bankDetails');
    if (savedBankDetails) {
      setRecipient(JSON.parse(savedBankDetails));
    }
    setEditing(false);
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !recipient) {
      router.push('/dashboard');
    }
    setEditing(open);
  }

  if (!recipient && !editing) {
    return null;
  }

  return (
    <div className="flex justify-center items-start">
      <div className='w-full max-w-md'>
      {editing ? (
        <SendMoneyDialog onBankDetailsSubmit={handleDetailsUpdated} open={editing} onOpenChange={handleOpenChange} isEditing={!!recipient} />
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send /> Send Money
              </CardTitle>
              <CardDescription>
                Your bank details are saved. Enter the amount to send in INR.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="amount">Amount (INR)</Label>
                    <span className='text-sm text-muted-foreground'>
                      Balance: {oraBalance.toLocaleString()} ORA
                    </span>
                  </div>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      placeholder="Enter amount in INR"
                      required
                      className="pl-8"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={isSubmitting}
                    />
                  </div>
                   {amount > 0 && !hasSufficientBalance && (
                    <p className="text-sm text-destructive">
                      Insufficient balance.
                    </p>
                  )}
                </div>
                {recipient && (
                  <div className="p-4 bg-muted rounded-md text-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">Recipient Details:</p>
                        <Button variant="ghost" size="icon" onClick={() => setEditing(true)} disabled={isSubmitting}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className='text-muted-foreground'>
                        <p>{recipient.accountHolder}</p>
                        <p>Ending in {recipient.accountNumber.slice(-4)}</p>
                        <p>{recipient.bankName}</p>
                      </div>
                  </div>
                )}
                {amount > 0 && (
                  <div className="p-4 bg-muted rounded-md text-sm space-y-4">
                      <p className="font-semibold">Transaction Summary</p>
                      <div className='space-y-2 text-muted-foreground'>
                        <div className='flex justify-between'>
                          <span>Amount to Send</span>
                          <span>
                            ₹{amountInr.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Fee (2%)</span>
                          <span>
                            - ₹{feeInInr.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <Separator className="bg-border/50" />
                        <div className='flex justify-between font-medium text-foreground'>
                          <span>Recipient gets</span>
                          <span>
                            ₹{amountRecipientReceives.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <Separator className="bg-border/50" />
                        <div className='flex justify-between font-medium text-foreground'>
                          <span>Deduction</span>
                          <span>{totalOraAmount.toLocaleString()} ORA</span>
                        </div>
                      </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={!hasSufficientBalance || amount === '' || amount <= 0 || isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Confirm & Send'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
      </div>
    </div>
  );
}
