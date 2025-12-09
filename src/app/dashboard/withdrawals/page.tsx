'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Landmark } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
  
const withdrawalSchema = z.object({
    coins: z.coerce
        .number()
        .positive('Amount must be positive')
        .min(1000, 'Minimum withdrawal is 1000 coins'),
    upiId: z.string().min(3, 'Please enter a valid UPI ID'),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

export default function WithdrawalsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [userCoins, setUserCoins] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<WithdrawalFormValues>({
        resolver: zodResolver(withdrawalSchema),
        defaultValues: {
            coins: 1000,
            upiId: '',
        },
    });

    useEffect(() => {
        if (user && firestore) {
          const userDocRef = doc(firestore, 'users', user.uid);
          const unsubscribe = onSnapshot(
            userDocRef,
            (doc) => {
              if (doc.exists()) {
                setUserCoins(doc.data().oraBalance || 0);
              }
            },
            async (err) => {
              const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'get',
              });
              errorEmitter.emit('permission-error', permissionError);
            }
          );
          return () => unsubscribe();
        }
    }, [user, firestore]);

    const onSubmit = async (data: WithdrawalFormValues) => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
            return;
        }

        if (data.coins > userCoins) {
            form.setError('coins', { message: 'Insufficient coin balance.' });
            return;
        }

        setIsSubmitting(true);

        const withdrawalData = {
            userId: user.uid,
            coins: data.coins,
            upiId: data.upiId,
            status: 'pending',
            requestedAt: serverTimestamp(),
        };

        // This would be a new collection `withdrawals` or similar
        // For now, let's log it to console and show a toast
        console.log("Withdrawal Request:", withdrawalData);

        toast({
            title: 'Withdrawal Request Submitted (Simulation)',
            description: `Your request to withdraw ${data.coins.toLocaleString()} coins has been logged.`,
        });
        form.reset();
        setIsSubmitting(false);

        // Example of how you would write to a 'withdrawals' collection
        /*
        const withdrawalsColRef = collection(firestore, 'withdrawals');
        
        addDoc(withdrawalsColRef, withdrawalData)
        .then(() => {
            toast({
                title: 'Withdrawal Request Submitted',
                description: `Your request to withdraw ${data.coins.toLocaleString()} coins has been submitted.`,
            });
            form.reset();
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: withdrawalsColRef.path,
                operation: 'create',
                requestResourceData: withdrawalData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: 'Could not submit your withdrawal request.',
            });
        }).finally(() => {
            setIsSubmitting(false);
        });
        */
    };

    const conversionRate = 0.001; // 1000 coins = 1 INR
    const coinAmount = form.watch('coins');
    const inrAmount = coinAmount * conversionRate;

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Landmark />
                    Withdraw Coins
                </CardTitle>
                <CardDescription>
                    Convert your ORA coins to INR and withdraw to your UPI ID.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="coins"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount to Withdraw (ORA Coins)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 1000" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Available balance: {userCoins.toLocaleString()} ORA
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="text-sm text-center text-muted-foreground font-medium">
                            {coinAmount.toLocaleString()} ORA ≈ ₹{inrAmount.toFixed(2)} INR
                        </div>
                        <FormField
                            control={form.control}
                            name="upiId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>UPI ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="yourname@bank" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The money will be sent to this UPI ID.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting || form.watch('coins') > userCoins}>
                            {isSubmitting ? 'Submitting Request...' : 'Request Withdrawal'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
