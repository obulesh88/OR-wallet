'use server';

import Razorpay from 'razorpay';
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

// Initialize Razorpay with credentials from environment variables
// IMPORTANT: You must add these to your .env or hosting environment
const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function processPayout(input: PayoutInput) {
  try {
    const validation = PayoutSchema.safeParse(input);
    if (!validation.success) {
      throw new Error(`Invalid input: ${validation.error.flatten().fieldErrors}`);
    }

    const {
      amount,
      currency,
      accountHolderName,
      accountNumber,
      ifsc,
      userEmail,
      userName,
      userId,
    } = validation.data;

    // Razorpay requires amount in paise (smallest currency unit)
    const amountInPaise = Math.round(amount * 100);
    
    // Step 1: Create a Contact in RazorpayX
    // We use the userId as a reference to avoid creating duplicate contacts.
    let contact;
    try {
        const existingContacts = await rzp.contacts.fetchAll({ email: userEmail });
        if (existingContacts.count > 0) {
            contact = existingContacts.items.find(c => c.reference_id === userId);
        }
        if (!contact) {
            contact = await rzp.contacts.create({
                name: userName,
                email: userEmail,
                contact: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`, // Dummy phone
                type: 'customer',
                reference_id: userId,
            });
        }
    } catch (error: any) {
        // If contact creation fails, it's often due to duplicates not found by email alone.
        // We log it but can proceed if we have a contact ID from a previous attempt.
        console.warn('Could not create or fetch contact, might already exist:', error.message);
        if (!contact && error.error?.field === 'reference_id') {
             throw new Error('A contact with this user ID already exists under a different email.');
        }
    }

    // Ensure we have a contact to proceed
    if (!contact?.id) {
      throw new Error('Failed to create or find a Razorpay contact for the user.');
    }

    // Step 2: Create a Fund Account (the user's bank account)
    const fundAccount = await rzp.fundAccount.create({
        contact_id: contact.id,
        account_type: 'bank_account',
        bank_account: {
            name: accountHolderName,
            ifsc: ifsc,
            account_number: accountNumber,
        },
    });

    if (!fundAccount) {
        throw new Error('Failed to create fund account on Razorpay.');
    }

    // Step 3: Create the Payout
    const payout = await rzp.payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER!, // Your business account number
      fund_account_id: fundAccount.id,
      amount: amountInPaise,
      currency: currency,
      mode: 'IMPS', // Or 'NEFT', 'RTGS'
      purpose: 'payout',
      queue_if_low_balance: true, // Important for production
      narration: `OR Wallet withdrawal for ${userName}`,
    });

    return { success: true, payout };

  } catch (error: any) {
    console.error('Razorpay Payout Error:', error);
    return { success: false, error: error.message || 'An unknown error occurred with Razorpay.' };
  }
}
