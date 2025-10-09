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
import { Edit, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { SendMoneyDialog } from '../components/send-money-dialog';

type BankDetails = {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export default function SendPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [recipient, setRecipient] = useState<BankDetails | null>(null);
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(0);

  const conversionRate = 1 / 1000; // 1 ORA = 0.001 INR
  const fee = amount > 0 ? 20 : 0;
  const total = amount + fee;
  const rupeeAmount = total * conversionRate;

  useEffect(() => {
    const savedBankDetails = localStorage.getItem('bankDetails');
    if (savedBankDetails) {
      setRecipient(JSON.parse(savedBankDetails));
    } else {
        // If no bank details, open the dialog to add them
        setEditing(true);
    }
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: 'Please enter an amount greater than 0.',
      });
      return;
    }
    
    toast({
      title: 'Transfer initiated',
      description: `Sending ${amount} Ora Coins.`,
    });

    router.push('/dashboard');
  };

  const handleDetailsUpdated = () => {
    const savedBankDetails = localStorage.getItem('bankDetails');
    if (savedBankDetails) {
      setRecipient(JSON.parse(savedBankDetails));
    }
    setEditing(false);
  }

  const handleOpenChange = (open: boolean) => {
    // if user closes the dialog without adding details and there were no details before
    if (!open && !recipient) {
      router.push('/dashboard');
    }
    setEditing(open);
  }

  if (!recipient && !editing) {
    return null; // Or a loading state
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
                <Send /> Send Ora Coins
              </CardTitle>
              <CardDescription>
                Your bank details are saved. Enter the amount to send.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="Enter amount of Ora Coins"
                    required
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>
                {recipient && (
                  <div className="p-4 bg-muted rounded-md text-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">Recipient Details:</p>
                        <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
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
                <div className="p-4 bg-muted rounded-md text-sm space-y-4">
                    <p className="font-semibold">Transaction Summary</p>
                    <div className='space-y-2 text-muted-foreground'>
                      <div className='flex justify-between'>
                        <span>Amount</span>
                        <span>{amount.toLocaleString()}</span>
                      </div>
                       <div className='flex justify-between'>
                        <span>Fee</span>
                        <span>{fee.toLocaleString()}</span>
                      </div>
                      <Separator className="bg-border/50" />
                       <div className='flex justify-between font-medium text-foreground'>
                        <span>Total Ora Coins</span>
                        <span>{total.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between font-medium text-foreground'>
                        <span>Total Rupees</span>
                        <span>
                          ₹{rupeeAmount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Confirm & Send
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
      </div>
    </div>
  );
}
