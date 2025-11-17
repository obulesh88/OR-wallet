
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(
      "https://nwxgjyamiborsgfnzqcj.supabase.co/functions/v1/create-razorpay-fund-and-payout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // optional: idempotency key
          "idempotency-key": crypto.randomUUID(),
           "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
           "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
        },
        body: JSON.stringify({
          firebase_id_token: body.idToken,
          bank: {
            name: body.bankName,
            ifsc: body.ifsc,
            account_number: body.accountNumber
          },
          amount: body.amount,
          currency: "INR",
          purpose: "payout"
        })
      }
    );

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (e: any) {
    return Response.json({ error: e.message || e }, { status: 500 });
  }
}
