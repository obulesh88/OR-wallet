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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase URL or Anon Key is not configured in environment variables.');
    }

    const res = await fetch(
      `${supabaseUrl}/functions/v1/create-razorpay-fund-and-payout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseAnonKey,
          "Authorization": `Bearer ${supabaseAnonKey}`
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
