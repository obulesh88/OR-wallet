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
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    const savedBankDetails = localStorage.getItem('bankDetails');
    if (savedBankDetails) {
      setRecipient(JSON.parse(savedBankDetails));
    }
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = formData.get('amount');
    
    toast({
      title: 'Transfer initiated',
      description: `Sending ${amount} coins.`,
    });

    // Optionally, redirect after submission
    router.push('/dashboard');
  };

  return (
    <div className="flex justify-center items-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send /> Send Coins
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
                  placeholder="Enter amount of coins"
                  required
                />
              </div>
              {recipient && (
                <div className="p-4 bg-muted rounded-md text-sm space-y-2">
                    <p className="font-semibold">Recipient Details:</p>
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
                      <span>1,000</span>
                    </div>
                     <div className='flex justify-between'>
                      <span>Fee</span>
                      <span>20</span>
                    </div>
                    <Separator className="bg-border/50" />
                     <div className='flex justify-between font-medium text-foreground'>
                      <span>Total</span>
                      <span>1,020</span>
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
    </div>
  );
}
