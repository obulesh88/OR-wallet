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
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
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

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'An error occurred with the payout service.');
    }
    
    // Assuming the Supabase function returns the payout object on success
    return { success: true, payout: data };

  } catch (error: any) {
    console.error('Payout Error:', error);
    return { success: false, error: error.message || 'An unknown error occurred with the payout service.' };
  }
}
