'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SendPage() {
  const router = useRouter();

  return (
    <div className="flex justify-center items-start">
      <div className='w-full max-w-md'>
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
            <div className="text-center text-muted-foreground p-8">
                <p>The withdrawal feature is currently under maintenance.</p>
                <p>We are working hard to get it back online. Please check back later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
