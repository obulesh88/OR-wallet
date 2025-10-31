'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  accountHolder: z.string().min(1, 'Account holder name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  ifscCode: z.string().min(1, 'IFSC code is required'),
  bankName: z.string().min(1, 'Bank name is required'),
});

type SendMoneyFormValues = z.infer<typeof formSchema>;

const indianBanks = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'RBL Bank',
  'Bank of Baroda',
  'Punjab National Bank',
  'Union Bank of India',
  'Canara Bank',
  'Bank of India',
  'Indian Overseas Bank',
];

type SendMoneyDialogProps = {
  onBankDetailsSubmit: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing?: boolean;
  initialDetails?: SendMoneyFormValues | null;
};

export function SendMoneyDialog({ onBankDetailsSubmit, open, onOpenChange, isEditing = false, initialDetails }: SendMoneyDialogProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const form = useForm<SendMoneyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialDetails || {
      accountHolder: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
    },
  });

  useEffect(() => {
    if (open && initialDetails) {
      form.reset(initialDetails);
    } else if (open) {
      form.reset({
        accountHolder: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
      });
    }
  }, [open, initialDetails, form]);

  const onSubmit = async (data: SendMoneyFormValues) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Error", description: "User not authenticated."});
      return;
    }

    const userDocRef = doc(firestore, 'users', user.uid);
    const bankDetails = {
      bankDetails: data
    }
    updateDoc(userDocRef, bankDetails).then(() => {
      toast({
        title: isEditing ? 'Bank details updated' : 'Bank details saved',
        description: `Your bank account details have been saved successfully.`,
      });
      onBankDetailsSubmit();
      onOpenChange(false);
    }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'update',
        requestResourceData: bankDetails,
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({ variant: "destructive", title: "Save Failed", description: "Could not save bank details."});
    });
  };
  
  const dialogTitle = isEditing ? 'Edit Bank Details' : 'Add Bank Details';
  const dialogDescription = isEditing ? "Update the recipient's bank details." : "Enter the recipient's bank details to send Ora Coins. These details will be saved for future use.";


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="accountHolder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Holder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="ifscCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IFSC Code</FormLabel>
                  <FormControl>
                    <Input placeholder="SBIN0001234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a bank" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {indianBanks.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="submit">Save Details</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
