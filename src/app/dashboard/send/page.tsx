'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, Pencil, Plus, Send, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { SendMoneyDialog } from '../components/send-money-dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type BankDetails = {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
};

export default function SendPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    if (user && firestore) {
      setIsLoading(true);
      const userDocRef = doc(firestore, 'Users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data.accountHolderName && data.accountNumber && data.ifscCode && data.bankName) {
            setBankDetails({
              accountHolderName: data.accountHolderName,
              accountNumber: data.accountNumber,
              ifscCode: data.ifscCode,
              bankName: data.bankName,
            });
          } else {
            setBankDetails(null);
          }
        }
        setIsLoading(false);
      }, (err) => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch your bank details."
        });
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else if (!user) {
      setIsLoading(false);
    }
  }, [user, firestore, toast]);

  const handleBankDetailsSubmitted = () => {
    // The onSnapshot listener will automatically update the UI.
    toast({
        title: "Success",
        description: "Your bank details have been saved."
    })
  }

  return (
    <>
    <div className="flex justify-center items-start">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send /> Withdraw Money
            </CardTitle>
            <CardDescription>
              Manage your bank account details for withdrawals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : bankDetails ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{bankDetails.accountHolderName}</h4>
                    <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)}>
                        <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                     <p>{bankDetails.bankName}</p>
                     <p>A/C: {bankDetails.accountNumber}</p>
                     <p>IFSC: {bankDetails.ifscCode}</p>
                  </div>
                </div>
                 <Button className="w-full" disabled>
                    <Landmark className="mr-2 h-4 w-4" /> Proceed to Withdraw
                 </Button>
              </div>
            ) : (
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed border-muted rounded-lg">
                    <p className='mb-4'>No bank account details found.</p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Bank Account
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>

    <SendMoneyDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onBankDetailsSubmit={handleBankDetailsSubmitted}
        isEditing={!!bankDetails}
        initialDetails={bankDetails}
    />
    </>
  );
}
