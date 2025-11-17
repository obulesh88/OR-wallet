
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
  firebaseUid,
  idToken,
  bankName,
  ifsc,
  accountNumber,
  amount,
  purpose
}: CreateFundAndPayoutParams) {
  try {
    const res = await fetch(
      "https://nwxgjyamiborsgfnzqcj.supabase.co/functions/v1/create-razorpay-fund-and-payout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // OPTIONAL — prevents duplicate payouts if user clicks twice
          "Idempotency-Key": `${firebaseUid}-${Date.now()}`
        },
        body: JSON.stringify({
          firebase_uid: firebaseUid,
          firebase_id_token: idToken,
          amount: amount * 100,   // Razorpay requires paise
          purpose,
          bank: {
            name: bankName,
            ifsc,
            account_number: accountNumber
          }
        })
      }
    );

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("Payout error:", err);
    return { error: true, message: err.message };
  }
}
