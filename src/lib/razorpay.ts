
type CreateFundAndPayoutParams = {
  firebaseUid: string;
  idToken: string;
  bankName: string;
  ifsc: string;
  accountNumber: string;
  amount: number;
  purpose: string;
};

export async function createFundAndPayout({
  idToken,
  bankName,
  ifsc,
  accountNumber,
  amount,
}: Omit<CreateFundAndPayoutParams, 'firebaseUid' | 'purpose'>) {
  try {
    const res = await fetch('/api/payout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken,
        bankName,
        ifsc,
        accountNumber,
        amount, // This should be in the smallest currency unit (e.g., paise)
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Payout request failed');
    }

    return data;
  } catch (err: any) {
    console.error("Payout error:", err);
    return { error: true, message: err.message };
  }
}
