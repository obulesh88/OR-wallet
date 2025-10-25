'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { IndianRupee, Wallet } from 'lucide-react';
import { useState } from 'react';

export default function AddMoneyPage() {
  const { toast } = useToast();
  const [amount, setAmount] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (amount === '' || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: 'Please enter an amount greater than 0.',
      });
      return;
    }
    setIsSubmitting(true);
    // TODO: Implement Razorpay integration
    console.log(`Proceeding to pay ₹${amount}`);
    toast({
      title: 'Coming Soon!',
      description: 'Razorpay integration is not yet implemented.',
    });
    setIsSubmitting(false);
  };

  return (
    <div className="flex justify-center items-start">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet /> Add Money
            </CardTitle>
            <CardDescription>
              Enter the amount you want to add to your wallet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (INR)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="Enter amount"
                  required
                  className="pl-8"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || amount === '' || amount <= 0}
            >
              {isSubmitting ? 'Processing...' : 'Proceed to Add Money'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
