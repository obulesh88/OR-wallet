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

export default function SendPage() {
  const { toast } = useToast();
  const router = useRouter();

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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send /> Send Coins
          </CardTitle>
          <CardDescription>
            Your bank details are saved. Enter the amount to send.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
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
              <div className="p-4 bg-muted rounded-md text-sm">
                  <p className="font-semibold">Recipient Details:</p>
                  <p className="text-muted-foreground">John Doe</p>
                  <p className="text-muted-foreground">XXXXXXXXXX1234</p>
                  <p className="text-muted-foreground">State Bank of India (SBI)</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Confirm & Send
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
