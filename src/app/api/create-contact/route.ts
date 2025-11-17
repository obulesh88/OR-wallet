export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(
      "https://nwxgjyamiborsgfnzqcj.supabase.co/functions/v1/create-razorpay-contact",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (e: any) {
    return Response.json({ error: e.message || e }, { status: 500 });
  }
}
