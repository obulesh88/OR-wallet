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
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { processPayout } from '@/app/actions/razorpay';
import { Skeleton } from '@/components/ui/skeleton';

type BankDetails = {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export default function SendPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();

  const [recipient, setRecipient] = useState<BankDetails | null>(null);
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');
  const [oraBalance, setOraBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const conversionRate = 1000; // 1 INR = 1000 ORA
  const feePercentage = 0.02; // 2% fee
  
  const amountInr = amount === '' ? 0 : amount;
  const feeInInr = amountInr * feePercentage;
  const amountRecipientReceives = amountInr - feeInInr;
  const totalOraAmount = amountInr * conversionRate;
  
  const hasSufficientBalance = oraBalance >= totalOraAmount;

  useEffect(() => {
    if (user && firestore) {
      setLoading(true);
      const userDocRef = doc(firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, 
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setOraBalance(data.oraBalance || 0);
            setRecipient(data.bankDetails || null);
            if (!data.bankDetails) {
              setEditing(true); // Prompt to add details if they don't exist
            }
          }
          setLoading(false);
        },
        async (err) => {
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else if (!isUserLoading) {
      setLoading(false);
    }
  }, [user, firestore, isUserLoading]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !firestore || !recipient || amount === '' || amount <= 0) {
        toast({
            variant: 'destructive',
            title: 'Invalid Input',
            description: 'Please ensure all details are correct and amount is greater than 0.',
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
    
    try {
      // First, deduct balance in a transaction to ensure atomicity
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

      // If balance deduction is successful, proceed with Razorpay payout
      const payoutResult = await processPayout({
        amount: amountRecipientReceives,
        currency: 'INR',
        accountHolderName: recipient.accountHolder,
        accountNumber: recipient.accountNumber,
        ifsc: recipient.ifscCode,
        userEmail: user.email ?? 'no-email@orwallet.com',
        userName: user.displayName ?? 'OR Wallet User',
        userId: user.uid,
      });

      if (!payoutResult.success || !payoutResult.payout) {
        // If payout fails, we need to refund the user's ORA balance.
        // A more robust solution would use a cloud function to manage this reversal.
        await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) { throw new Error("User not found for refund"); }
            const currentOraBalance = userDoc.data().oraBalance || 0;
            transaction.update(userDocRef, { oraBalance: currentOraBalance + totalOraAmount });
        });
        throw new Error(payoutResult.error || 'Payout failed on Razorpay.');
      }
      
      // If payout is successful, log the transaction in Firestore
      const transactionsColRef = collection(firestore, "users", user.uid, "transactions");
      const transactionData = {
        type: "withdraw",
        description: `Withdrawal of ₹${amountRecipientReceives.toFixed(2)} to bank account`,
        amount: -totalOraAmount,
        inrAmount: amount,
        date: serverTimestamp(),
        status: "Completed",
        razorpayPayoutId: payoutResult.payout.id,
      };
      // Not awaiting this to avoid blocking UI, but logging errors.
      addDoc(transactionsColRef, transactionData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: transactionsColRef.path,
          operation: 'create',
          requestResourceData: transactionData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

      toast({
          title: 'Withdrawal Successful',
          description: `₹${amountRecipientReceives.toFixed(2)} is on its way to your bank account.`,
      });

      router.push('/dashboard/transactions');

    } catch(e: any) {
        toast({
            variant: 'destructive',
            title: 'Withdrawal Failed',
            description: e.message || 'An error occurred during the withdrawal.',
        });
        // Note: Balance reversal is attempted above, but can fail.
        // A production app should have a more robust refund mechanism.
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDetailsUpdated = () => {
    // Data is already updated via onSnapshot, just need to close the dialog.
    setEditing(false);
  }

  const handleOpenChange = (open: boolean) => {
    setEditing(open);
    if (!open && !recipient) {
      router.push('/dashboard');
    }
  }

  if (loading) {
    return (
        <div className="flex justify-center items-start">
            <div className='w-full max-w-md'>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
  }

  return (
    <div className="flex justify-center items-start">
      <div className='w-full max-w-md'>
      {editing ? (
        <SendMoneyDialog 
            onBankDetailsSubmit={handleDetailsUpdated} 
            open={editing} 
            onOpenChange={handleOpenChange} 
            isEditing={!!recipient}
            initialDetails={recipient}
        />
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send /> Withdraw Money
              </CardTitle>
              <CardDescription>
                Enter the amount to withdraw to your bank account.
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
                          <span>Withdrawal Amount</span>
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
                          <span>You will receive</span>
                          <span>
                            ₹{amountRecipientReceives.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <Separator className="bg-border/50" />
                        <div className='flex justify-between font-medium text-foreground'>
                          <span>Total Deduction</span>
                          <span>{totalOraAmount.toLocaleString()} ORA</span>
                        </div>
                      </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={!recipient || !hasSufficientBalance || amount === '' || amount <= 0 || isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Confirm & Withdraw'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
      </div>
    </div>
  );
}
