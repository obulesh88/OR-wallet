
import { admin } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, contact, email, name } = body;

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    // Call Supabase function to create Razorpay contact
    const res = await fetch(
      "https://nwxgjyamiborsgfnzqcj.supabase.co/functions/v1/create-razorpay-contact",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
        },
        body: JSON.stringify({ userId, contact, email, name }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      // Forward the error from the Supabase function
      return Response.json({ error: data.error || 'Failed to create Razorpay contact' }, { status: res.status });
    }

    // If contact is created successfully, update Firestore with the contact ID
    if (data.id) {
      const userRef = admin.firestore().collection('users').doc(userId);
      await userRef.update({
        razorpayContactId: data.id,
      });
    }

    return Response.json(data, { status: res.status });
  } catch (e: any) {
    console.error("Error in /api/create-contact:", e);
    return Response.json({ error: e.message || 'An internal server error occurred' }, { status: 500 });
  }
}
