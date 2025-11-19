'use server';

import { z } from 'zod';

const PayoutSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.literal('INR'),
  accountHolderName: z.string().min(1, 'Account holder name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  ifsc: z.string().min(1, 'IFSC code is required'),
  userEmail: z.string().email(),
  userName: z.string(),
  userId: z.string(),
});

type PayoutInput = z.infer<typeof PayoutSchema>;

export async function processPayout(input: PayoutInput) {
  try {
    const validation = PayoutSchema.safeParse(input);
    if (!validation.success) {
      throw new Error(`Invalid input: ${validation.error.flatten().fieldErrors}`);
    }

    const {
      amount,
      accountHolderName,
      accountNumber,
      ifsc,
      userId,
    } = validation.data;

    // The Supabase function expects the amount in paise.
    const amountInPaise = Math.round(amount * 100);

    const res = await fetch(
      "https://nwxgjyamiborsgfnzqcj.supabase.co/functions/v1/create-razorpay-fund-and-payout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53eGdqeWFtaWJvcnNnZm56cWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY0NTg0MDAsImV4cCI6MjAzMjAzNDQwMH0.Pczifn_iyRT616sB0N_aQENY1EC2i3F2AFpaBvT1S8w",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53eGdqeWFtaWJvcnNnZm56cWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY0NTg0MDAsImV4cCI6MjAzMjAzNDQwMH0.Pczifn_iyRT616sB0N_aQENY1EC2i3F2AFpaBvT1S8w"
        },
        body: JSON.stringify({
          firebase_uid: userId,
          amount: amountInPaise,
          purpose: "withdrawal",
          bank: {
            name: accountHolderName,
            ifsc: ifsc,
            account_number: accountNumber
          }
        })
      }
    );

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'An error occurred with the payout service.');
    }
    
    const data = await res.json();
    
    // Assuming the Supabase function returns the payout object on success
    return { success: true, payout: data };

  } catch (error: any) {
    console.error('Payout Error:', error);
    return { success: false, error: error.message || 'An unknown error occurred with the payout service.' };
  }
}
