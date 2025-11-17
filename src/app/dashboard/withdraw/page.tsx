"use client";

import { createFundAndPayout } from "@/lib/razorpay";
import { useUser } from "@/firebase";

export default function WithdrawPage() {
  const { user } = useUser();

  async function handleWithdraw() {
    if (!user) {
      alert("You must be logged in to withdraw.");
      return;
    }
    
    try {
        const idToken = await user.getIdToken(true);

        const result = await createFundAndPayout({
            firebaseUid: user.uid,
            idToken,
            bankName: "Test User",
            ifsc: "HDFC0001234", // Example IFSC, use a real one for testing
            accountNumber: "123456789012", // Example account, use a real one for testing
            amount: 1, // ₹1, as Razorpay might have minimums
            purpose: "withdrawal"
        });

        console.log("Payout Result:", result);
        alert(JSON.stringify(result, null, 2));

    } catch (error: any) {
        console.error("Withdrawal Error:", error);
        alert(`Error: ${error.message}`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Test Withdraw</h1>
        <p className="text-muted-foreground mb-6">Click the button to test the payout function.</p>
        <button
        onClick={handleWithdraw}
        className="p-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
        Withdraw ₹1
        </button>
        <p className="text-xs text-muted-foreground mt-4 text-center max-w-md">
            Note: This page uses hardcoded values for testing purposes. The bank details are examples and will need to be replaced with real, testable information in a real environment.
        </p>
    </div>
  );
}
